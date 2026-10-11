import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { ShieldCheck, Clock, AlertTriangle, PlayCircle } from 'lucide-react';

const QuizStart = () => {
  const { quizId, attemptId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { data } = await API.get(`/quizzes/${quizId}/public`);
        setQuiz(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  const handleStart = async () => {
    try {
      await API.post(`/attempts/${attemptId}/start`);
      navigate(`/quiz/${quizId}/active/${attemptId}`);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to start quiz');
    }
  };

  if (loading) return (
    <div className="flex-1 bg-drr-navy flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-drr-cyan rounded-full border-t-transparent animate-spin"></div>
    </div>
  );

  return (
    <div className="flex-1 bg-drr-navy py-12 px-4">
      <div className="max-w-3xl mx-auto glass-card overflow-hidden">
        <div className="bg-drr-lightNavy p-8 border-b border-drr-blue/50 text-center">
          <ShieldCheck className="w-16 h-16 text-drr-cyan mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Ready to Start?</h1>
          <p className="text-drr-cyan text-lg">{quiz?.title}</p>
        </div>
        
        <div className="p-8">
          <h2 className="text-xl font-semibold mb-4 border-b border-drr-blue/30 pb-2">Quiz Instructions & Rules</h2>
          <ul className="space-y-4 mb-8 text-drr-gray">
            <li className="flex items-start gap-3">
              <Clock className="text-drr-orange shrink-0 mt-1" size={20} />
              <span>Each question has its own timer. Once the timer reaches zero, the answer is locked automatically.</span>
            </li>
            <li className="flex items-start gap-3">
              <AlertTriangle className="text-red-400 shrink-0 mt-1" size={20} />
              <span><strong>Do not refresh the page.</strong> If you refresh or lose connection, you will resume from your current question, but you might lose precious time.</span>
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck className="text-green-400 shrink-0 mt-1" size={20} />
              <span>You receive points based on <strong>correctness</strong> and a bonus for <strong>speed</strong>.</span>
            </li>
            <li className="flex items-start gap-3">
              <AlertTriangle className="text-drr-orange shrink-0 mt-1" size={20} />
              <span>You can only attempt this quiz once. Multiple submissions will be disqualified.</span>
            </li>
          </ul>

          <div className="bg-drr-navy/50 p-6 rounded-lg border border-drr-blue/30 mb-8">
            <p className="text-center font-medium">
              By clicking "Start Quiz", you agree to follow the rules and maintain the integrity of the assessment.
            </p>
          </div>

          <div className="flex justify-center">
            <button onClick={handleStart} className="btn-primary text-lg px-12 py-3 flex items-center gap-2">
              <PlayCircle size={24} /> Start Quiz Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizStart;
