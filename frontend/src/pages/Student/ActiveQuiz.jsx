import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { Clock, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

const ActiveQuiz = () => {
  const { quizId, attemptId } = useParams();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fullscreenEnabled, setFullscreenEnabled] = useState(false);

  const timerRef = useRef(null);
  const violationCountRef = useRef(0);
  const terminationRef = useRef(false);

  const registerViolation = async (reason) => {
    if (terminationRef.current) return;

    violationCountRef.current += 1;

    if (violationCountRef.current >= 3) {
      terminationRef.current = true;
      setError('Quiz terminated because you left the full-screen quiz more than 3 times.');
      try {
        await API.post(`/attempts/${attemptId}/terminate`, { reason });
      } catch (err) {
        console.error('Failed to terminate quiz attempt:', err);
      }
      navigate(`/quiz/${quizId}/result/${attemptId}?terminated=1`);
      return;
    }

    setError(`Warning: ${reason}. ${3 - violationCountRef.current} more violation(s) will terminate the quiz.`);
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { data } = await API.get(`/attempts/${attemptId}/questions`);
        setQuestions(data.questions);
        setAnswers(data.answers);
        
        // Find first unanswered question
        const firstUnanswered = data.answers.findIndex(a => !a.submittedAt);
        if (firstUnanswered === -1) {
           navigate(`/quiz/${quizId}/result/${attemptId}`); // all answered
           return;
        }
        
        setCurrentIndex(firstUnanswered);
        setTimeLeft(data.questions[firstUnanswered].timeLimit);
        
      } catch (err) {
        setError('Failed to load quiz data');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [attemptId, quizId, navigate]);

  useEffect(() => {
    const activateFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
          setFullscreenEnabled(true);
        }
      } catch (err) {
        console.warn('Fullscreen could not be activated:', err);
      }
    };

    activateFullscreen();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        registerViolation('The quiz was left while in progress.');
      }
    };

    const handleBlur = () => {
      registerViolation('The quiz lost focus.');
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        registerViolation('Full-screen mode was exited.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [attemptId, quizId, navigate]);

  // Timer countdown effect
  useEffect(() => {
    if (loading || questions.length === 0 || submitting || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentIndex, loading, submitting]);

  // Time up effect
  useEffect(() => {
    if (timeLeft === 0 && !loading && !submitting && questions.length > 0) {
      handleNextQuestion(true);
    }
  }, [timeLeft, loading, submitting]);

  const handleNextQuestion = async (isTimeUp = false) => {
    if (submitting) return;
    setSubmitting(true);
    clearInterval(timerRef.current);

    const question = questions[currentIndex];
    const timeTaken = isTimeUp ? question.timeLimit : question.timeLimit - timeLeft;
    
    try {
      await API.post(`/attempts/${attemptId}/answer`, {
        questionId: question._id,
        selectedOption: isTimeUp ? null : selectedOption,
        timeTaken
      });

      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption('');
        setTimeLeft(questions[currentIndex + 1].timeLimit);
      } else {
        // Final submission
        await API.post(`/attempts/${attemptId}/submit`);
        navigate(`/quiz/${quizId}/result/${attemptId}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving answer');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex-1 bg-drr-navy flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-drr-cyan rounded-full border-t-transparent animate-spin"></div>
    </div>
  );

  if (error) return (
    <div className="flex-1 bg-drr-navy flex items-center justify-center">
       <div className="glass-card p-8 text-center text-red-400">
         <AlertCircle className="mx-auto mb-4 w-12 h-12" />
         {error}
       </div>
    </div>
  );

  const currentQuestion = questions[currentIndex];
  const progressPercentage = ((currentIndex) / questions.length) * 100;

  return (
    <div className="flex-1 bg-drr-navy py-8 px-4 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        {/* Progress and Timer Header */}
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-drr-cyan font-semibold mb-1">Question {currentIndex + 1} of {questions.length}</p>
            <div className="w-64 h-2 bg-drr-blue/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-drr-cyan to-blue-500 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className={clsx(
            "flex items-center gap-2 text-2xl font-bold bg-drr-lightNavy px-4 py-2 rounded-lg border",
            timeLeft <= 5 ? "text-red-500 border-red-500/50 animate-pulse" : "text-white border-drr-blue/50"
          )}>
            <Clock size={24} className={timeLeft <= 5 ? "text-red-500" : "text-drr-cyan"} />
            {timeLeft}s
          </div>
        </div>

        {/* Question Card */}
        <div className="glass-card p-6 md:p-10 mb-6">
          <h2 className="text-2xl md:text-3xl font-medium mb-8 leading-relaxed">
            {currentQuestion?.text}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion?.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedOption(option)}
                disabled={submitting}
                className={clsx(
                  "p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-3",
                  selectedOption === option 
                    ? "border-drr-cyan bg-drr-cyan/10 shadow-[0_0_15px_rgba(6,182,212,0.2)]" 
                    : "border-drr-blue/30 bg-drr-navy hover:border-drr-blue/80 hover:bg-drr-blue/10",
                  submitting && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className={clsx(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                  selectedOption === option ? "border-drr-cyan bg-drr-cyan" : "border-drr-gray"
                )}>
                  {selectedOption === option && <CheckCircle2 size={16} className="text-drr-navy" />}
                </div>
                <span className="text-lg">{option}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            onClick={() => handleNextQuestion(false)} 
            disabled={!selectedOption || submitting}
            className={clsx(
              "btn-primary flex items-center gap-2 text-lg py-3 px-8",
              (!selectedOption || submitting) && "opacity-50 cursor-not-allowed"
            )}
          >
            {submitting ? 'Saving...' : currentIndex === questions.length - 1 ? 'Submit Quiz' : 'Next Question'}
            {!submitting && <ChevronRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActiveQuiz;
