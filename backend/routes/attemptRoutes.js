const express = require('express');
const router = express.Router();
const { registerForQuiz, startQuiz, getQuestionsForAttempt, submitAnswer, finishAttempt, terminateAttempt } = require('../controllers/attemptController');

router.post('/quiz/:quizId/register', registerForQuiz);
router.post('/:attemptId/start', startQuiz);
router.get('/:attemptId/questions', getQuestionsForAttempt);
router.post('/:attemptId/answer', submitAnswer);
router.post('/:attemptId/submit', finishAttempt);
router.post('/:attemptId/terminate', terminateAttempt);

module.exports = router;
