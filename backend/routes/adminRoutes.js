const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getQuizzes, createQuiz, getQuizDetails, updateQuiz, deleteQuiz, addQuestion, deleteQuestion, getStats } = require('../controllers/adminController');
const { getLeaderboard } = require('../controllers/leaderboardController');

router.get('/stats', protect, getStats);

router.route('/')
  .get(protect, getQuizzes)
  .post(protect, createQuiz);

router.route('/:id')
  .get(protect, getQuizDetails)
  .put(protect, updateQuiz)
  .delete(protect, deleteQuiz);

router.route('/:id/questions')
  .post(protect, addQuestion);

router.route('/questions/:questionId')
  .delete(protect, deleteQuestion);

router.get('/:quizId/leaderboard', protect, getLeaderboard);

module.exports = router;
