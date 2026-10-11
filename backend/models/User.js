const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true }, // Not globally unique as they might register for different quizzes, handled via Attempt unique compound index
  rollNumber: { type: String, required: true },
  department: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
