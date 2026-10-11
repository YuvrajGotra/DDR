import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { ArrowLeft, Save } from 'lucide-react';
import { format } from 'date-fns';

const QuizEditor = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    openingTime: '',
    closingTime: '',
    scoringRules: {
      basePoints: 100,
      maxTimeBonus: 20,
      negativeMarking: 0
    },
    status: 'Draft'
  });

  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      const fetchQuiz = async () => {
        try {
          const { data } = await API.get(`/admin/quizzes/${id}`);
          
          const ot = new Date(data.quiz.openingTime);
          const ct = new Date(data.quiz.closingTime);
          
          // Format for datetime-local input YYYY-MM-DDThh:mm
          const formatDateTimeLocal = (date) => {
            const pad = (n) => n.toString().padStart(2, '0');
            return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
          };

          setFormData({
            title: data.quiz.title,
            description: data.quiz.description,
            openingTime: formatDateTimeLocal(ot),
            closingTime: formatDateTimeLocal(ct),
            status: data.quiz.status,
            scoringRules: data.quiz.scoringRules
          });
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchQuiz();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('scoring.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        scoringRules: { ...prev.scoringRules, [field]: Number(value) }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await API.put(`/admin/quizzes/${id}`, formData);
        navigate(`/admin/quiz/${id}`);
      } else {
        const { data } = await API.post('/admin/quizzes', formData);
        navigate(`/admin/quiz/${data._id}`);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to save quiz');
    }
  };

  if (loading) return <div className="text-center p-12">Loading...</div>;

  return (
    <div className="flex-1 bg-drr-navy">
      <nav className="bg-drr-lightNavy border-b border-drr-blue/30 px-6 py-4">
        <button onClick={() => navigate('/admin/dashboard')} className="flex items-center gap-2 text-drr-cyan hover:text-white">
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto glass-card p-8">
          <h2 className="text-3xl font-bold mb-6">{isEditing ? 'Edit Quiz' : 'Create New Quiz'}</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-drr-gray mb-1">Title</label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange} className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-medium text-drr-gray mb-1">Description</label>
              <textarea name="description" required rows="3" value={formData.description} onChange={handleChange} className="input-field"></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-drr-gray mb-1">Opening Time</label>
                <input type="datetime-local" name="openingTime" required value={formData.openingTime} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-drr-gray mb-1">Closing Time</label>
                <input type="datetime-local" name="closingTime" required value={formData.closingTime} onChange={handleChange} className="input-field" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-drr-gray mb-1">Base Points</label>
                <input type="number" name="scoring.basePoints" required value={formData.scoringRules.basePoints} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-drr-gray mb-1">Max Time Bonus</label>
                <input type="number" name="scoring.maxTimeBonus" required value={formData.scoringRules.maxTimeBonus} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-drr-gray mb-1">Negative Marking</label>
                <input type="number" name="scoring.negativeMarking" required value={formData.scoringRules.negativeMarking} onChange={handleChange} className="input-field" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-drr-gray mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="input-field bg-drr-navy">
                <option value="Draft">Draft</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Live">Live</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="pt-4 border-t border-drr-blue/30">
              <button type="submit" className="btn-primary w-full flex justify-center items-center gap-2">
                <Save size={18} /> Save Quiz
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuizEditor;
