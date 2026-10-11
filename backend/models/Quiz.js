const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  openingTime: { type: Date, required: true },
  closingTime: { type: Date, required: true },
  status: { type: String, enum: ['Draft', 'Scheduled', 'Live', 'Completed'], default: 'Draft' },
  scoringRules: {
    basePoints: { type: Number, default: 100 },
    maxTimeBonus: { type: Number, default: 20 },
    negativeMarking: { type: Number, default: 0 },
  },
  resultsPublished: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
