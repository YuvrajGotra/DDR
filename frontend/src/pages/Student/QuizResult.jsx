import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { Trophy, Target, Clock, ArrowRight, Activity } from 'lucide-react';

const QuizResult = () => {
  const { quizId, attemptId } = useParams();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const terminated = new URLSearchParams(window.location.search).get('terminated') === '1';

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await API.get(`/leaderboard/${quizId}`);
        setLeaderboard(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [quizId]);

  const myResult = leaderboard.find(entry => entry.attemptId === attemptId);

  return (
    <div className="flex-1 bg-drr-navy py-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <div className="glass-card p-8 text-center mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-drr-cyan to-blue-500"></div>
          <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-2">{terminated ? 'Quiz Terminated' : 'Quiz Completed!'}</h1>
          <p className="text-drr-gray text-lg mb-8">
            {terminated ? 'This attempt ended because the quiz was left fullscreen or focus was lost multiple times.' : 'Thank you for participating.'}
          </p>

          {loading ? (
            <div className="flex justify-center p-4">
              <div className="w-8 h-8 border-4 border-drr-cyan rounded-full border-t-transparent animate-spin"></div>
            </div>
          ) : myResult ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-drr-navy/50 p-4 rounded-xl border border-drr-blue/30">
                <p className="text-drr-gray text-sm mb-1">Total Score</p>
                <p className="text-3xl font-bold text-drr-cyan">{myResult.totalScore}</p>
              </div>
              <div className="bg-drr-navy/50 p-4 rounded-xl border border-drr-blue/30">
                <p className="text-drr-gray text-sm mb-1 flex items-center justify-center gap-1"><Target size={14}/> Correct</p>
                <p className="text-3xl font-bold text-green-400">{myResult.correctAnswers}</p>
              </div>
              <div className="bg-drr-navy/50 p-4 rounded-xl border border-drr-blue/30">
                <p className="text-drr-gray text-sm mb-1 flex items-center justify-center gap-1"><Activity size={14}/> Accuracy</p>
                <p className="text-3xl font-bold text-blue-400">{myResult.accuracy.toFixed(0)}%</p>
              </div>
              <div className="bg-drr-navy/50 p-4 rounded-xl border border-drr-blue/30">
                <p className="text-drr-gray text-sm mb-1 flex items-center justify-center gap-1"><Clock size={14}/> Time</p>
                <p className="text-3xl font-bold text-drr-orange">{myResult.totalResponseTime}s</p>
              </div>
            </div>
          ) : (
            <div className="text-drr-orange p-4 bg-drr-orange/10 rounded-lg">
              Results are hidden until the quiz closes. Please check the leaderboard later.
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4">
          <button onClick={() => navigate('/')} className="btn-secondary">
            Back to Home
          </button>
          <button onClick={() => navigate(`/quiz/${quizId}/leaderboard`)} className="btn-primary flex items-center gap-2">
            View Leaderboard <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;
