const Attempt = require('../models/Attempt');
const Quiz = require('../models/Quiz');

const getLeaderboard = async (req, res) => {
  const { quizId } = req.params;
  
  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // Ensure results are published for public view, unless admin
    if (!quiz.resultsPublished && !req.admin) {
      return res.status(403).json({ message: 'Results are not yet published for this quiz.' });
    }

    const attempts = await Attempt.find({ quizId, status: 'Completed' })
      .populate('userId', 'fullName rollNumber department email')
      .sort({ totalScore: -1, totalResponseTime: 1, completedAt: 1 });

    // Competition ranking logic
    const leaderboard = [];
    let currentRank = 1;

    for (let i = 0; i < attempts.length; i++) {
      if (i > 0) {
        const prev = attempts[i - 1];
        const curr = attempts[i];
        if (prev.totalScore === curr.totalScore && prev.totalResponseTime === curr.totalResponseTime) {
          // Same rank as previous
        } else {
          currentRank = i + 1;
        }
      }

      const attemptData = attempts[i].toObject();
      const user = attemptData.userId;
      
      const entry = {
        rank: currentRank,
        attemptId: attemptData._id,
        fullName: user.fullName,
        rollNumber: user.rollNumber,
        department: user.department,
        totalScore: attemptData.totalScore,
        correctAnswers: attemptData.correctAnswers,
        accuracy: attemptData.accuracy,
        totalResponseTime: attemptData.totalResponseTime,
      };

      // Only include email if admin requested it
      if (req.admin) {
        entry.email = user.email;
        entry.details = attemptData;
      }

      leaderboard.push(entry);
    }

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLeaderboard };
