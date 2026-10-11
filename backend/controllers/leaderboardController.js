const Attempt = require('../models/Attempt');
const Quiz = require('../models/Quiz');

const getCompletionTime = (attempt) => new Date(attempt.completedAt || attempt.createdAt || 0).getTime();

const compareAttempts = (left, right) => {
  const correctAnswerDifference = (right.correctAnswers || 0) - (left.correctAnswers || 0);
  if (correctAnswerDifference !== 0) return correctAnswerDifference;

  const completionDifference = getCompletionTime(left) - getCompletionTime(right);
  if (completionDifference !== 0) return completionDifference;

  const responseTimeDifference = (left.totalResponseTime || 0) - (right.totalResponseTime || 0);
  if (responseTimeDifference !== 0) return responseTimeDifference;

  return String(left._id).localeCompare(String(right._id));
};

const haveSameRank = (left, right) => (
  (left.correctAnswers || 0) === (right.correctAnswers || 0)
  && getCompletionTime(left) === getCompletionTime(right)
);

const rankAttempts = (attempts) => {
  let currentRank = 0;

  return [...attempts].sort(compareAttempts).map((attempt, index, sortedAttempts) => {
    if (index === 0 || !haveSameRank(sortedAttempts[index - 1], attempt)) {
      currentRank = index + 1;
    }

    return { ...attempt, rank: currentRank };
  });
};

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
      .populate('userId', 'fullName rollNumber department email');

    const leaderboard = [];
    const rankedAttempts = rankAttempts(attempts.map((attempt) => attempt.toObject()));

    for (const attemptData of rankedAttempts) {
      const user = attemptData.userId;
      
      const entry = {
        rank: attemptData.rank,
        attemptId: attemptData._id,
        fullName: user.fullName,
        rollNumber: user.rollNumber,
        department: user.department,
        totalScore: attemptData.totalScore,
        correctAnswers: attemptData.correctAnswers,
        accuracy: attemptData.accuracy,
        totalResponseTime: attemptData.totalResponseTime,
        completedAt: attemptData.completedAt,
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

module.exports = { getLeaderboard, rankAttempts };
