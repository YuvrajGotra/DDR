const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  timeLimit: { type: Number, required: true, default: 20 }, // in seconds
  order: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
