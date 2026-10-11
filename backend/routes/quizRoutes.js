const express = require('express');
const router = express.Router();
const { getActiveQuizzes, getPublicQuizDetails } = require('../controllers/quizController');

router.get('/active', getActiveQuizzes);
router.get('/:id/public', getPublicQuizDetails);

module.exports = router;
