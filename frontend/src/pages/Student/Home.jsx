import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { Clock, ShieldAlert, ArrowRight, Activity } from 'lucide-react';
import { formatDistanceToNow, isPast, isFuture } from 'date-fns';

const Home = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const { data } = await API.get('/quizzes/active');
        setQuizzes(data);
      } catch (error) {
        console.error('Failed to load quizzes', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  return (
    <div className="flex-1 bg-drr-navy relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-drr-blue/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-drr-cyan/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <header className="text-center mb-16 mt-8">
          <div className="flex justify-center mb-6">
            <ShieldAlert size={64} className="text-drr-orange animate-pulse-slow" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-drr-cyan to-drr-white">
            DRR Club Quiz Platform
          </h1>
          <p className="text-xl text-drr-gray max-w-2xl mx-auto">
            Test your knowledge on disaster management, safety protocols, and risk reduction. Prepare to save lives.
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Activity className="text-drr-cyan" /> Available Challenges
          </h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-drr-cyan/30 border-t-drr-cyan rounded-full animate-spin"></div>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="glass-card p-8 text-center text-drr-gray">
              No active or upcoming quizzes at the moment. Please check back later.
            </div>
          ) : (
            <div className="grid gap-6">
              {quizzes.map((quiz) => {
                const opens = new Date(quiz.openingTime);
                const closes = new Date(quiz.closingTime);
                const future = isFuture(opens);
                const past = isPast(closes);

                return (
                  <div key={quiz._id} className="glass-card p-6 md:p-8 hover:shadow-cyan-500/10 transition-all">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2">{quiz.title}</h3>
                        <p className="text-drr-gray mb-4">{quiz.description}</p>
                        
                        <div className="flex flex-wrap gap-4 text-sm font-medium">
                          <span className="flex items-center gap-1 bg-drr-lightNavy px-3 py-1 rounded-full border border-drr-blue/30">
                            <Clock size={14} className="text-drr-cyan" />
                            {future ? `Opens ${formatDistanceToNow(opens, { addSuffix: true })}` : 
                             past ? `Closed ${formatDistanceToNow(closes, { addSuffix: true })}` :
                             `Closes ${formatDistanceToNow(closes, { addSuffix: true })}`}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-3 min-w-[140px]">
                        {quiz.isLive ? (
                          <button 
                            onClick={() => navigate(`/quiz/${quiz._id}/register`)}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                          >
                            Participate <ArrowRight size={18} />
                          </button>
                        ) : (
                          <button className="btn-secondary w-full opacity-50 cursor-not-allowed">
                            {future ? 'Not Started' : 'Closed'}
                          </button>
                        )}
                        <button 
                          onClick={() => navigate(`/quiz/${quiz._id}/leaderboard`)}
                          className="btn-secondary w-full"
                        >
                          Leaderboard
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
