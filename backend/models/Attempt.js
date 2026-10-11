const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  selectedOption: { type: String },
  isCorrect: { type: Boolean },
  score: { type: Number, default: 0 },
  timeTaken: { type: Number, default: 0 },
  startedAt: { type: Date },
  submittedAt: { type: Date }
});

const attemptSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: { type: String, required: true }, // Normalized for compound index
  status: { type: String, enum: ['InProgress', 'Completed'], default: 'InProgress' },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  isTerminated: { type: Boolean, default: false },
  terminationReason: { type: String, default: '' },
  violationCount: { type: Number, default: 0 },
  answers: [answerSchema],
  totalScore: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  incorrectAnswers: { type: Number, default: 0 },
  unanswered: { type: Number, default: 0 },
  totalResponseTime: { type: Number, default: 0 }, // in seconds
  accuracy: { type: Number, default: 0 }
}, { timestamps: true });

// Each Gmail address can participate in only one quiz
attemptSchema.index({ userEmail: 1 }, { unique: true });

module.exports = mongoose.model('Attempt', attemptSchema);
