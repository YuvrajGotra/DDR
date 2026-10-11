import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { AlertCircle, ArrowRight, User, Mail, Hash, BookOpen } from 'lucide-react';

const Registration = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    rollNumber: '',
    department: ''
  });

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { data } = await API.get(`/quizzes/${quizId}/public`);
        setQuiz(data);
      } catch (err) {
        setError('Quiz not found or unavailable.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = formData.email.trim();
    const studentEmailPattern = /^(?:[a-z0-9._%+-]+@gmail\.com|[a-z0-9._%+-]+@chitkarauniversity\.edu\.in)$/i;
    if (!studentEmailPattern.test(trimmedEmail)) {
      setError('Use a valid university email like tarun1581.be24@chitkarauniversity.edu.in or a Gmail address.');
      return;
    }

    const payload = {
      ...formData,
      email: trimmedEmail,
      fullName: formData.fullName.trim(),
      rollNumber: formData.rollNumber.trim(),
      department: formData.department.trim(),
    };

    try {
      const { data } = await API.post(`/attempts/quiz/${quizId}/register`, payload);
      navigate(`/quiz/${quizId}/start/${data.attemptId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-drr-navy flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-drr-cyan/30 border-t-drr-cyan rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="flex-1 bg-drr-navy flex items-center justify-center p-4">
        <div className="glass-card p-8 text-center max-w-md w-full">
          <AlertCircle className="text-red-500 w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Unavailable</h2>
          <p className="text-drr-gray">{error}</p>
          <button onClick={() => navigate('/')} className="btn-secondary mt-6">Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-drr-navy py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-xl glass-card overflow-hidden">
        <div className="bg-gradient-to-r from-drr-blue to-drr-lightNavy p-8 border-b border-drr-blue/50">
          <h1 className="text-3xl font-bold mb-2">Participant Registration</h1>
          <p className="text-drr-cyan">{quiz.title}</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3 text-red-200">
              <AlertCircle className="shrink-0 mt-0.5" size={20} />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-drr-gray mb-1">Full Name *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-drr-gray" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-drr-gray mb-1">College Email *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-drr-gray" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="tarun1581.be24@chitkarauniversity.edu.in"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-drr-gray mb-1">Roll Number *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash size={18} className="text-drr-gray" />
                  </div>
                  <input
                    type="text"
                    name="rollNumber"
                    required
                    value={formData.rollNumber}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="e.g. 21CS01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-drr-gray mb-1">Department</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BookOpen size={18} className="text-drr-gray" />
                  </div>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="Computer Science"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-drr-blue/30">
              <button type="submit" className="btn-primary w-full flex justify-center items-center gap-2">
                Register & Proceed <ArrowRight size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Registration;
