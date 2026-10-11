const Quiz = require('../models/Quiz');

const getActiveQuizzes = async (req, res) => {
  const now = new Date();
  const quizzes = await Quiz.find({
    status: { $in: ['Scheduled', 'Live'] },
  }).select('-createdBy'); // Exclude admin ref

  // Determine which are active vs upcoming
  const activeQuizzes = quizzes.map(quiz => {
    const isLive = now >= quiz.openingTime && now <= quiz.closingTime;
    return {
      ...quiz._doc,
      isLive,
    };
  });

  res.json(activeQuizzes);
};

const getPublicQuizDetails = async (req, res) => {
  const quiz = await Quiz.findById(req.params.id).select('-createdBy');
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
  res.json(quiz);
};

module.exports = {
  getActiveQuizzes, getPublicQuizDetails
};
