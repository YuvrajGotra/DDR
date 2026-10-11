import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { Trophy, Medal, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';

const Leaderboard = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await API.get(`/leaderboard/${quizId}`);
        setLeaderboard(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Leaderboard is not available yet.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [quizId]);

  if (loading) return (
    <div className="flex-1 bg-drr-navy flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-drr-cyan rounded-full border-t-transparent animate-spin"></div>
    </div>
  );

  return (
    <div className="flex-1 bg-drr-navy py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-drr-gray hover:text-white mb-6 transition-colors">
          <ArrowLeft size={20} /> Back to Home
        </button>

        <div className="text-center mb-12">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Quiz Leaderboard</h1>
          <p className="text-drr-gray">Top performers of the DRR Club Quiz</p>
        </div>

        {error ? (
          <div className="glass-card p-8 text-center text-drr-orange max-w-2xl mx-auto">
            {error}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="glass-card p-8 text-center text-drr-gray max-w-2xl mx-auto">
            No completed attempts yet. Check back later!
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-drr-lightNavy border-b border-drr-blue/50">
                    <th className="p-4 font-semibold text-drr-cyan">Rank</th>
                    <th className="p-4 font-semibold text-drr-cyan">Name</th>
                    <th className="p-4 font-semibold text-drr-cyan">Roll No</th>
                    <th className="p-4 font-semibold text-drr-cyan text-right">Score</th>
                    <th className="p-4 font-semibold text-drr-cyan text-right hidden md:table-cell">Accuracy</th>
                    <th className="p-4 font-semibold text-drr-cyan text-right hidden sm:table-cell">Time (s)</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, idx) => (
                    <tr 
                      key={entry.attemptId} 
                      className={clsx(
                        "border-b border-drr-blue/20 hover:bg-drr-blue/10 transition-colors",
                        entry.rank === 1 && "bg-yellow-500/10",
                        entry.rank === 2 && "bg-gray-300/10",
                        entry.rank === 3 && "bg-orange-600/10"
                      )}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2 font-bold">
                          {entry.rank === 1 && <Medal className="text-yellow-400" size={20} />}
                          {entry.rank === 2 && <Medal className="text-gray-300" size={20} />}
                          {entry.rank === 3 && <Medal className="text-orange-600" size={20} />}
                          <span className={clsx(
                            entry.rank === 1 && "text-yellow-400",
                            entry.rank === 2 && "text-gray-300",
                            entry.rank === 3 && "text-orange-600",
                            entry.rank > 3 && "text-drr-gray"
                          )}>#{entry.rank}</span>
                        </div>
                      </td>
                      <td className="p-4 font-medium">{entry.fullName}</td>
                      <td className="p-4 text-drr-gray">{entry.rollNumber}</td>
                      <td className="p-4 text-right font-bold text-drr-cyan">{entry.totalScore}</td>
                      <td className="p-4 text-right text-drr-gray hidden md:table-cell">{entry.accuracy.toFixed(0)}%</td>
                      <td className="p-4 text-right text-drr-gray hidden sm:table-cell">{entry.totalResponseTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
