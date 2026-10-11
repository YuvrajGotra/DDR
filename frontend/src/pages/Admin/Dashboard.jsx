import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import { LogOut, Plus, List, Edit, Trash2, Eye, LayoutDashboard, Users, CheckCircle, BarChart } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminQuizzes = async () => {
      try {
        const [quizData, statsData] = await Promise.all([
          API.get('/admin/quizzes'),
          API.get('/admin/stats')
        ]);
        setQuizzes(quizData.data);
        setStats(statsData.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminQuizzes();
  }, []);

  const handlePublishToggle = async (quizId, currentStatus) => {
    try {
      await API.put(`/admin/quizzes/${quizId}`, { resultsPublished: !currentStatus });
      setQuizzes(quizzes.map(q => q._id === quizId ? { ...q, resultsPublished: !currentStatus } : q));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Delete this quiz?')) return;
    try {
      await API.delete(`/admin/quizzes/${quizId}`);
      setQuizzes(quizzes.filter(q => q._id !== quizId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 bg-drr-navy">
      {/* Navbar */}
      <nav className="bg-drr-lightNavy border-b border-drr-blue/30 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-drr-cyan">DRR Admin</h1>
        <button onClick={logout} className="btn-secondary flex items-center gap-2 px-4 py-2">
          <LogOut size={18} /> Logout
        </button>
      </nav>

      <div className="container mx-auto px-4 py-8">
        
        {/* Overview Stats */}
        {!loading && stats && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
              <LayoutDashboard className="text-drr-cyan" /> Overview
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card p-4 text-center">
                <p className="text-drr-gray text-sm mb-1">Total Quizzes</p>
                <p className="text-3xl font-bold text-drr-cyan">{stats.totalQuizzes}</p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-drr-gray text-sm mb-1">Live Quizzes</p>
                <p className="text-3xl font-bold text-green-400">{stats.liveQuizzes}</p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-drr-gray text-sm mb-1 flex items-center justify-center gap-1"><Users size={14} /> Total Registrations</p>
                <p className="text-3xl font-bold text-blue-400">{stats.totalRegistrations}</p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-drr-gray text-sm mb-1 flex items-center justify-center gap-1"><CheckCircle size={14} /> Completed Attempts</p>
                <p className="text-3xl font-bold text-drr-orange">{stats.totalCompletedAttempts}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <List className="text-drr-cyan" /> Quiz Management
          </h2>
          <button onClick={() => navigate('/admin/quiz/new')} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Create Quiz
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-12 h-12 border-4 border-drr-cyan rounded-full border-t-transparent animate-spin"></div>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-drr-lightNavy border-b border-drr-blue/50">
                    <th className="p-4 font-semibold">Title</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Schedule</th>
                    <th className="p-4 font-semibold text-center">Results</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map((quiz) => (
                    <tr key={quiz._id} className="border-b border-drr-blue/20 hover:bg-drr-blue/10">
                      <td className="p-4 font-medium">{quiz.title}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          quiz.status === 'Live' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          quiz.status === 'Scheduled' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {quiz.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-drr-gray">
                        {format(new Date(quiz.openingTime), 'MMM d, HH:mm')} - {format(new Date(quiz.closingTime), 'MMM d, HH:mm')}
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => handlePublishToggle(quiz._id, quiz.resultsPublished)}
                          className={`text-xs px-3 py-1 rounded-md border ${
                            quiz.resultsPublished 
                              ? 'bg-green-500/10 text-green-400 border-green-500/50 hover:bg-green-500/20' 
                              : 'bg-red-500/10 text-red-400 border-red-500/50 hover:bg-red-500/20'
                          }`}
                        >
                          {quiz.resultsPublished ? 'Published' : 'Hidden'}
                        </button>
                      </td>
                      <td className="p-4 flex justify-end gap-2">
                        <button onClick={() => navigate(`/admin/quiz/${quiz._id}`)} className="p-2 text-drr-cyan hover:bg-drr-cyan/10 rounded transition-colors" title="View Details">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => navigate(`/admin/quiz/${quiz._id}/edit`)} className="p-2 text-drr-blue hover:bg-drr-blue/20 rounded transition-colors" title="Edit">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDeleteQuiz(quiz._id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded transition-colors" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {quizzes.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-drr-gray">
                        No quizzes found. Create one to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
