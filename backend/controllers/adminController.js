const Quiz = require('../models/Quiz');
const Question = require('../models/Question');

const validateQuizPayload = (payload, { requireAllFields = true } = {}) => {
  const errors = [];
  const title = typeof payload.title === 'string' ? payload.title.trim() : '';
  const description = typeof payload.description === 'string' ? payload.description.trim() : '';

  if ((requireAllFields || payload.title !== undefined) && (!title || title.length < 3)) {
    errors.push('Title must be at least 3 characters long.');
  }

  if ((requireAllFields || payload.description !== undefined) && (!description || description.length < 10)) {
    errors.push('Description must be at least 10 characters long.');
  }

  if ((requireAllFields || payload.openingTime !== undefined) && !payload.openingTime) {
    errors.push('Opening time is required.');
  }

  if ((requireAllFields || payload.closingTime !== undefined) && !payload.closingTime) {
    errors.push('Closing time is required.');
  }

  if (payload.openingTime && payload.closingTime) {
    const opening = new Date(payload.openingTime);
    const closing = new Date(payload.closingTime);

    if (Number.isNaN(opening.getTime())) {
      errors.push('Opening time is invalid.');
    }

    if (Number.isNaN(closing.getTime())) {
      errors.push('Closing time is invalid.');
    }

    if (!Number.isNaN(opening.getTime()) && !Number.isNaN(closing.getTime()) && opening >= closing) {
      errors.push('Closing time must be after opening time.');
    }
  }

  const scoringRules = payload.scoringRules || {};
  if (scoringRules.basePoints !== undefined) {
    const basePoints = Number(scoringRules.basePoints);
    if (!Number.isFinite(basePoints) || basePoints < 0) {
      errors.push('Base points must be a non-negative number.');
    }
  }

  if (scoringRules.maxTimeBonus !== undefined) {
    const maxTimeBonus = Number(scoringRules.maxTimeBonus);
    if (!Number.isFinite(maxTimeBonus) || maxTimeBonus < 0) {
      errors.push('Max time bonus must be a non-negative number.');
    }
  }

  if (scoringRules.negativeMarking !== undefined) {
    const negativeMarking = Number(scoringRules.negativeMarking);
    if (!Number.isFinite(negativeMarking) || negativeMarking < 0) {
      errors.push('Negative marking must be a non-negative number.');
    }
  }

  return errors;
};

const getQuizzes = async (req, res) => {
  const quizzes = await Quiz.find({}).sort({ createdAt: -1 });
  res.json(quizzes);
};

const createQuiz = async (req, res) => {
  const validationErrors = validateQuizPayload(req.body, { requireAllFields: true });
  if (validationErrors.length) {
    return res.status(400).json({ message: 'Invalid quiz data', errors: validationErrors });
  }

  const { title, description, openingTime, closingTime, scoringRules } = req.body;
  const now = new Date();
  const normalizedStatus = now < new Date(openingTime) ? 'Scheduled' : now <= new Date(closingTime) ? 'Live' : 'Completed';

  const quiz = await Quiz.create({
    title: title.trim(),
    description: description.trim(),
    openingTime,
    closingTime,
    scoringRules: {
      basePoints: Number(scoringRules?.basePoints ?? 100),
      maxTimeBonus: Number(scoringRules?.maxTimeBonus ?? 20),
      negativeMarking: Number(scoringRules?.negativeMarking ?? 0),
    },
    status: normalizedStatus,
    createdBy: req.admin._id,
  });

  return res.status(201).json(quiz);
};

const getQuizDetails = async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
  const questions = await Question.find({ quizId: req.params.id }).sort({ order: 1 });
  res.json({ quiz, questions });
};

const updateQuiz = async (req, res) => {
  const validationErrors = validateQuizPayload(req.body, { requireAllFields: false });
  if (validationErrors.length) {
    return res.status(400).json({ message: 'Invalid quiz update data', errors: validationErrors });
  }

  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

  const payload = { ...req.body };
  if (payload.title !== undefined) payload.title = payload.title.trim();
  if (payload.description !== undefined) payload.description = payload.description.trim();

  if (payload.openingTime && payload.closingTime) {
    const opening = new Date(payload.openingTime);
    const closing = new Date(payload.closingTime);
    payload.status = opening <= new Date() && new Date() <= closing ? 'Live' : opening > new Date() ? 'Scheduled' : 'Completed';
  }

  if (payload.scoringRules) {
    payload.scoringRules = {
      ...quiz.scoringRules.toObject(),
      ...payload.scoringRules,
      basePoints: Number(payload.scoringRules.basePoints ?? quiz.scoringRules.basePoints),
      maxTimeBonus: Number(payload.scoringRules.maxTimeBonus ?? quiz.scoringRules.maxTimeBonus),
      negativeMarking: Number(payload.scoringRules.negativeMarking ?? quiz.scoringRules.negativeMarking),
    };
  }

  const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.id, payload, { new: true });
  return res.json(updatedQuiz);
};

const deleteQuiz = async (req, res) => {
  await Quiz.findByIdAndDelete(req.params.id);
  await Question.deleteMany({ quizId: req.params.id });
  res.json({ message: 'Quiz removed' });
};

const addQuestion = async (req, res) => {
  const { text, options, correctAnswer, timeLimit, order } = req.body;

  if (!text || typeof text !== 'string' || text.trim().length < 5) {
    return res.status(400).json({ message: 'Question text must be at least 5 characters long.' });
  }

  if (!Array.isArray(options) || options.length < 2 || options.some(option => typeof option !== 'string' || !option.trim())) {
    return res.status(400).json({ message: 'Question must include at least 2 valid options.' });
  }

  if (!correctAnswer || typeof correctAnswer !== 'string' || !options.includes(correctAnswer)) {
    return res.status(400).json({ message: 'Correct answer must match one of the provided options.' });
  }

  const parsedTimeLimit = Number(timeLimit);
  if (!Number.isFinite(parsedTimeLimit) || parsedTimeLimit <= 0) {
    return res.status(400).json({ message: 'Time limit must be a positive number.' });
  }

  const parsedOrder = Number(order);
  if (!Number.isInteger(parsedOrder) || parsedOrder < 1) {
    return res.status(400).json({ message: 'Order must be a positive integer.' });
  }

  const question = await Question.create({
    quizId: req.params.id,
    text: text.trim(),
    options: options.map(option => option.trim()),
    correctAnswer: correctAnswer.trim(),
    timeLimit: parsedTimeLimit,
    order: parsedOrder,
  });

  return res.status(201).json(question);
};

const deleteQuestion = async (req, res) => {
  await Question.findByIdAndDelete(req.params.questionId);
  res.json({ message: 'Question removed' });
};

const getStats = async (req, res) => {
  try {
    const totalQuizzes = await Quiz.countDocuments();
    const scheduledQuizzes = await Quiz.countDocuments({ status: 'Scheduled' });
    const liveQuizzes = await Quiz.countDocuments({ status: 'Live' });
    const completedQuizzes = await Quiz.countDocuments({ status: 'Completed' });

    const totalRegistrations = await require('../models/Attempt').countDocuments();
    const totalCompletedAttempts = await require('../models/Attempt').countDocuments({ status: 'Completed' });

    res.json({
      totalQuizzes,
      scheduledQuizzes,
      liveQuizzes,
      completedQuizzes,
      totalRegistrations,
      totalCompletedAttempts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getQuizzes, createQuiz, getQuizDetails, updateQuiz, deleteQuiz, addQuestion, deleteQuestion, getStats
};
