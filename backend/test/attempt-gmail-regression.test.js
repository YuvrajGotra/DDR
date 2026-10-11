const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const Attempt = require('../models/Attempt');
const { registerForQuiz, terminateAttempt } = require('../controllers/attemptController');

function createMockRes() {
  const res = {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };

  return res;
}

test('registerForQuiz blocks duplicate student-email registrations across multiple quizzes', async () => {
  const email = `student-rule-${Date.now()}@chitkarauniversity.edu.in`;

  await mongoose.connect(process.env.MONGODB_URI);

  await User.deleteMany({ email: { $regex: /^student-rule-/i } });
  await Attempt.deleteMany({ userEmail: { $regex: /^student-rule-/i } });
  await Quiz.deleteMany({ title: { $regex: /^Student Rule Quiz/i } });

  const quizOne = await Quiz.create({
    title: 'Student Rule Quiz 1',
    description: 'Ensures one student email can only register once.',
    openingTime: new Date(Date.now() - 60_000),
    closingTime: new Date(Date.now() + 3_600_000),
    scoringRules: { basePoints: 100, maxTimeBonus: 20, negativeMarking: 0 },
  });

  const quizTwo = await Quiz.create({
    title: 'Student Rule Quiz 2',
    description: 'Verifies the second registration is rejected.',
    openingTime: new Date(Date.now() - 60_000),
    closingTime: new Date(Date.now() + 3_600_000),
    scoringRules: { basePoints: 100, maxTimeBonus: 20, negativeMarking: 0 },
  });

  const firstReq = {
    params: { quizId: quizOne._id.toString() },
    body: {
      fullName: 'Primary Student User',
      email,
      rollNumber: 'REG-001',
      department: 'CS',
    },
  };

  const firstRes = createMockRes();
  await registerForQuiz(firstReq, firstRes);

  assert.equal(firstRes.statusCode, 201, 'The first student registration should succeed.');
  assert.match(firstRes.payload.message, /registration successful/i, 'The registration response should confirm success.');

  const secondReq = {
    params: { quizId: quizTwo._id.toString() },
    body: {
      fullName: 'Secondary Student User',
      email,
      rollNumber: 'REG-002',
      department: 'CS',
    },
  };

  const secondRes = createMockRes();
  await registerForQuiz(secondReq, secondRes);

  assert.equal(secondRes.statusCode, 400, 'A second registration with the same student email should be rejected.');
  assert.match(secondRes.payload.message, /already registered|one quiz/i, 'The duplicate-email message should explain the rule.');

  const attempts = await Attempt.find({ userEmail: email }).lean();
  assert.equal(attempts.length, 1, 'Only one attempt should exist for the same student email address.');

  await User.deleteMany({ email: { $regex: /^student-rule-/i } });
  await Attempt.deleteMany({ userEmail: { $regex: /^student-rule-/i } });
  await Quiz.deleteMany({ title: { $regex: /^Student Rule Quiz/i } });
  await mongoose.disconnect();
});

test('terminateAttempt marks a quiz as terminated after proctoring violations', async () => {
  const email = `student-terminate-${Date.now()}@chitkarauniversity.edu.in`;

  await mongoose.connect(process.env.MONGODB_URI);

  const quiz = await Quiz.create({
    title: 'Terminate Rule Quiz',
    description: 'Ensures repeated proctoring violations terminate the quiz.',
    openingTime: new Date(Date.now() - 60_000),
    closingTime: new Date(Date.now() + 3_600_000),
    scoringRules: { basePoints: 100, maxTimeBonus: 20, negativeMarking: 0 },
  });

  const user = await User.create({
    fullName: 'Terminate Test User',
    email,
    rollNumber: 'TERM-001',
    department: 'CS',
  });

  const attempt = await Attempt.create({
    quizId: quiz._id,
    userId: user._id,
    userEmail: email,
    status: 'InProgress',
    violationCount: 2,
  });

  const req = {
    params: { attemptId: attempt._id.toString() },
    body: { reason: 'User exited fullscreen multiple times.' },
  };

  const res = createMockRes();
  await terminateAttempt(req, res);

  assert.equal(res.statusCode, 200, 'Termination endpoint should succeed.');
  assert.equal(res.payload.message, 'Quiz terminated due to proctoring violation.', 'Termination message should be returned.');

  const updatedAttempt = await Attempt.findById(attempt._id).lean();
  assert.equal(updatedAttempt.isTerminated, true, 'The attempt should be marked terminated.');
  assert.equal(updatedAttempt.status, 'Completed', 'The attempt should be marked completed.');

  await User.deleteMany({ email: { $regex: /^student-terminate-/i } });
  await Attempt.deleteMany({ userEmail: { $regex: /^student-terminate-/i } });
  await Quiz.deleteMany({ title: { $regex: /^Terminate Rule Quiz/i } });
  await mongoose.disconnect();
});
