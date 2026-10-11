const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Attempt = require('../models/Attempt');
const Question = require('../models/Question');

const isValidStudentEmail = (email) => {
  if (typeof email !== 'string') return false;

  const normalizedEmail = email.trim().toLowerCase();
  return /^(?:[a-z0-9._%+-]+@gmail\.com|[a-z0-9._%+-]+@chitkarauniversity\.edu\.in)$/i.test(normalizedEmail);
};

const registerForQuiz = async (req, res) => {
  const { fullName, email, rollNumber, department } = req.body;
  const { quizId } = req.params;

  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return res.status(400).json({ message: 'Full name is required.' });
    }

    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!normalizedEmail || !isValidStudentEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Only university or Gmail addresses are allowed for quiz registration.' });
    }

    if (!rollNumber || typeof rollNumber !== 'string' || rollNumber.trim().length < 2) {
      return res.status(400).json({ message: 'Roll number is required.' });
    }

    const now = new Date();
    if (now > quiz.closingTime) return res.status(400).json({ message: 'Quiz is closed.' });

    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      user = await User.create({
        fullName: fullName.trim(),
        email: normalizedEmail,
        rollNumber: rollNumber.trim(),
        department: department ? department.trim() : '',
      });
    }

    const existingAttempt = await Attempt.findOne({ userEmail: normalizedEmail });
    if (existingAttempt) {
      return res.status(400).json({ message: 'This Gmail ID has already registered for one quiz. Only one quiz is allowed per Gmail account.' });
    }

    const attempt = await Attempt.create({
      quizId,
      userId: user._id,
      userEmail: normalizedEmail,
    });

    res.status(201).json({ attemptId: attempt._id, message: 'Registration successful.' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'This Gmail ID has already registered for one quiz. Only one quiz is allowed per Gmail account.' });
    }
    res.status(500).json({ message: error.message });
  }
};

const startQuiz = async (req, res) => {
  const { attemptId } = req.params;
  const attempt = await Attempt.findById(attemptId).populate('quizId');
  if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
  if (attempt.status === 'Completed') return res.status(400).json({ message: 'Attempt already completed' });

  if (attempt.answers.length === 0) {
    const questions = await Question.find({ quizId: attempt.quizId._id }).sort({ order: 1 });
    attempt.answers = questions.map(q => ({ questionId: q._id }));
    attempt.startedAt = Date.now();
    await attempt.save();
  }

  res.json({ message: 'Quiz started', attempt });
};

const getQuestionsForAttempt = async (req, res) => {
  const { attemptId } = req.params;
  const attempt = await Attempt.findById(attemptId);
  if (!attempt || attempt.status === 'Completed') return res.status(400).json({ message: 'Invalid attempt' });

  const questions = await Question.find({ quizId: attempt.quizId }).select('-correctAnswer').sort({ order: 1 });
  res.json({ questions, answers: attempt.answers });
};

const submitAnswer = async (req, res) => {
  const { attemptId } = req.params;
  const { questionId, selectedOption, timeTaken } = req.body;

  if (!questionId) {
    return res.status(400).json({ message: 'Question ID is required.' });
  }

  if (typeof timeTaken !== 'number' || Number.isNaN(timeTaken) || timeTaken < 0) {
    return res.status(400).json({ message: 'Time taken must be a valid non-negative number.' });
  }

  const attempt = await Attempt.findById(attemptId).populate('quizId');
  if (!attempt || attempt.status === 'Completed') return res.status(400).json({ message: 'Invalid attempt' });

  const question = await Question.findById(questionId);
  if (!question) return res.status(404).json({ message: 'Question not found.' });

  const hasSelectedOption = typeof selectedOption === 'string' && selectedOption.trim().length > 0;
  const normalizedSelectedOption = hasSelectedOption ? selectedOption.trim() : null;

  if (normalizedSelectedOption && !question.options.includes(normalizedSelectedOption)) {
    return res.status(400).json({ message: 'A valid answer option must be selected.' });
  }

  const isCorrect = normalizedSelectedOption !== null && question.correctAnswer === normalizedSelectedOption;

  const answerIndex = attempt.answers.findIndex(a => a.questionId.toString() === questionId);
  if (answerIndex > -1) {
    if (attempt.answers[answerIndex].submittedAt) {
      return res.status(400).json({ message: 'Answer already submitted for this question' });
    }

    let score = 0;
    if (isCorrect) {
      const basePoints = attempt.quizId.scoringRules.basePoints;
      const maxTimeBonus = attempt.quizId.scoringRules.maxTimeBonus;
      const timeRemaining = Math.max(0, question.timeLimit - timeTaken);
      const timeBonus = maxTimeBonus * (timeRemaining / question.timeLimit);
      score = basePoints + timeBonus;
    } else if (normalizedSelectedOption) {
      score = -attempt.quizId.scoringRules.negativeMarking;
    }

    attempt.answers[answerIndex].selectedOption = normalizedSelectedOption;
    attempt.answers[answerIndex].isCorrect = isCorrect;
    attempt.answers[answerIndex].score = score;
    attempt.answers[answerIndex].timeTaken = timeTaken;
    attempt.answers[answerIndex].submittedAt = Date.now();

    await attempt.save();
    return res.json({ message: 'Answer saved' });
  }

  return res.status(404).json({ message: 'Question not part of this attempt' });
};

const finishAttempt = async (req, res) => {
  const { attemptId } = req.params;
  const attempt = await Attempt.findById(attemptId).populate('quizId');
  if (!attempt || attempt.status === 'Completed') return res.status(400).json({ message: 'Invalid attempt' });

  let totalScore = 0;
  let correctAnswers = 0;
  let incorrectAnswers = 0;
  let unanswered = 0;
  let totalResponseTime = 0;

  attempt.answers.forEach(a => {
    totalScore += a.score;
    totalResponseTime += a.timeTaken || 0;
    if (a.isCorrect === true) correctAnswers++;
    else if (a.isCorrect === false && a.selectedOption) incorrectAnswers++;
    else unanswered++;
  });

  attempt.totalScore = Math.round(totalScore * 100) / 100;
  attempt.correctAnswers = correctAnswers;
  attempt.incorrectAnswers = incorrectAnswers;
  attempt.unanswered = unanswered;
  attempt.totalResponseTime = totalResponseTime;
  attempt.accuracy = attempt.answers.length > 0 ? (correctAnswers / attempt.answers.length) * 100 : 0;
  attempt.status = 'Completed';
  attempt.completedAt = Date.now();

  await attempt.save();
  res.json({ message: 'Quiz completed successfully', attempt });
};

const terminateAttempt = async (req, res) => {
  const { attemptId } = req.params;
  const { reason } = req.body || {};

  try {
    const attempt = await Attempt.findById(attemptId).populate('quizId');
    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
    if (attempt.status === 'Completed') {
      return res.status(400).json({ message: 'Attempt already completed' });
    }

    attempt.status = 'Completed';
    attempt.isTerminated = true;
    attempt.terminationReason = reason || 'Quiz terminated due to proctoring violation.';
    attempt.completedAt = Date.now();
    attempt.violationCount = Math.max(attempt.violationCount || 0, 3);

    await attempt.save();
    return res.json({ message: 'Quiz terminated due to proctoring violation.', attempt });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerForQuiz, startQuiz, getQuestionsForAttempt, submitAnswer, finishAttempt, terminateAttempt
};
