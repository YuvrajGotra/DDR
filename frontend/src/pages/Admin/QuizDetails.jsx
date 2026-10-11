import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { ArrowLeft, Edit, Plus, Trash2, Users } from 'lucide-react';
import { format } from 'date-fns';

const QuizDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Question Form State
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    text: '', options: ['', '', '', ''], correctAnswer: '', timeLimit: 20
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const { data } = await API.get(`/admin/quizzes/${id}`);
      setQuiz(data.quiz);
      setQuestions(data.questions);

      // Fetch participants via leaderboard (admin view)
      const lp = await API.get(`/admin/quizzes/${id}/leaderboard`);
      setParticipants(lp.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/admin/quizzes/${id}/questions`, {
        ...newQuestion,
        order: questions.length + 1
      });
      setShowQuestionForm(false);
      setNewQuestion({ text: '', options: ['', '', '', ''], correctAnswer: '', timeLimit: 20 });
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Error adding question');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await API.delete(`/admin/quizzes/questions/${questionId}`);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleExportCSV = () => {
    if (participants.length === 0) {
      alert("No participants to export.");
      return;
    }

    const headers = ["Rank", "Full Name", "Roll Number", "Department", "Email", "Total Score", "Accuracy", "Total Time (s)"];
    
    const rows = participants.map(p => [
      p.rank,
      `"${p.fullName}"`,
      `"${p.rollNumber}"`,
      `"${p.department || ''}"`,
      `"${p.email || ''}"`,
      p.totalScore,
      p.accuracy.toFixed(0),
      p.totalResponseTime
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${quiz.title.replace(/\s+/g, '_')}_results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-12 text-center text-drr-cyan">Loading...</div>;
  if (!quiz) return <div className="p-12 text-center text-red-500">Quiz not found</div>;

  return (
    <div className="flex-1 bg-drr-navy pb-12">
      <nav className="bg-drr-lightNavy border-b border-drr-blue/30 px-6 py-4 flex justify-between items-center">
        <button onClick={() => navigate('/admin/dashboard')} className="flex items-center gap-2 text-drr-cyan hover:text-white">
          <ArrowLeft size={20} /> Dashboard
        </button>
        <div className="flex items-center gap-4">
          <button onClick={handleExportCSV} className="btn-secondary text-sm py-1 px-3">
            Export CSV
          </button>
          <h1 className="text-xl font-bold">Manage Quiz</h1>
        </div>
      </nav>

      <div className="container mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Quiz Info */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">{quiz.title}</h2>
              <button onClick={() => navigate(`/admin/quiz/${id}/edit`)} className="p-2 bg-drr-blue/20 text-drr-cyan rounded hover:bg-drr-blue/40">
                <Edit size={18} />
              </button>
            </div>
            <p className="text-drr-gray mb-4 text-sm">{quiz.description}</p>
            <div className="space-y-2 text-sm">
              <p><span className="text-drr-gray">Status:</span> <span className="font-semibold text-drr-cyan">{quiz.status}</span></p>
              <p><span className="text-drr-gray">Opens:</span> {format(new Date(quiz.openingTime), 'PPp')}</p>
              <p><span className="text-drr-gray">Closes:</span> {format(new Date(quiz.closingTime), 'PPp')}</p>
              <p><span className="text-drr-gray">Base Points:</span> {quiz.scoringRules.basePoints}</p>
            </div>
          </div>
          
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Users size={20} className="text-drr-cyan" /> Participants ({participants.length})</h3>
            <div className="max-h-96 overflow-y-auto pr-2">
              {participants.map(p => (
                <div key={p.attemptId} className="bg-drr-lightNavy p-3 rounded mb-2 border border-drr-blue/30 text-sm">
                  <p className="font-bold">{p.fullName} <span className="text-drr-gray text-xs">({p.rollNumber})</span></p>
                  <p className="text-drr-gray text-xs mb-1">{p.email}</p>
                  <div className="flex justify-between">
                    <span className="text-drr-cyan font-semibold">Score: {p.totalScore}</span>
                    <span className="text-green-400">{p.accuracy.toFixed(0)}% Acc</span>
                  </div>
                </div>
              ))}
              {participants.length === 0 && <p className="text-drr-gray text-sm">No participants yet.</p>}
            </div>
          </div>
        </div>

        {/* Questions Manager */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Questions ({questions.length})</h2>
            <button onClick={() => setShowQuestionForm(!showQuestionForm)} className="btn-primary flex items-center gap-2 py-2 px-4">
              <Plus size={18} /> Add Question
            </button>
          </div>

          {showQuestionForm && (
            <div className="glass-card p-6 border-l-4 border-l-drr-cyan">
              <h3 className="text-lg font-bold mb-4">New Question</h3>
              <form onSubmit={handleAddQuestion} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-drr-gray mb-1">Question Text</label>
                  <input type="text" required value={newQuestion.text} onChange={e => setNewQuestion({...newQuestion, text: e.target.value})} className="input-field" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {[0, 1, 2, 3].map(i => (
                    <div key={i}>
                      <label className="block text-xs font-medium text-drr-gray mb-1">Option {i + 1}</label>
                      <input type="text" required value={newQuestion.options[i]} 
                        onChange={e => {
                          const newOpts = [...newQuestion.options];
                          newOpts[i] = e.target.value;
                          setNewQuestion({...newQuestion, options: newOpts});
                        }} 
                        className="input-field py-1" />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-drr-gray mb-1">Correct Answer</label>
                    <select required value={newQuestion.correctAnswer} onChange={e => setNewQuestion({...newQuestion, correctAnswer: e.target.value})} className="input-field py-2 bg-drr-navy">
                      <option value="">Select correct option...</option>
                      {newQuestion.options.map((opt, i) => opt && <option key={i} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-drr-gray mb-1">Time Limit (sec)</label>
                    <input type="number" required value={newQuestion.timeLimit} onChange={e => setNewQuestion({...newQuestion, timeLimit: Number(e.target.value)})} className="input-field py-2" />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowQuestionForm(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Save Question</button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q._id} className="glass-card p-5 border-l-4 border-l-drr-blue/50 hover:border-l-drr-cyan transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-lg font-medium"><span className="text-drr-gray mr-2">Q{idx + 1}.</span> {q.text}</h4>
                  <button onClick={() => handleDeleteQuestion(q._id)} className="text-red-400 hover:text-red-300 p-1 bg-red-400/10 rounded">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  {q.options.map((opt, i) => (
                    <div key={i} className={`p-2 rounded ${opt === q.correctAnswer ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-drr-lightNavy border border-drr-blue/20 text-drr-gray'}`}>
                      {opt}
                    </div>
                  ))}
                </div>
                <div className="text-xs text-drr-orange font-semibold flex justify-end">
                  Time Limit: {q.timeLimit}s
                </div>
              </div>
            ))}
            {questions.length === 0 && !showQuestionForm && (
              <div className="text-center p-8 text-drr-gray border-2 border-dashed border-drr-blue/30 rounded-xl">
                No questions added yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizDetails;
