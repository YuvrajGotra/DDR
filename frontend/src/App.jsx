import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Student Pages
import Home from './pages/Student/Home';
import Registration from './pages/Student/Registration';
import QuizStart from './pages/Student/QuizStart';
import ActiveQuiz from './pages/Student/ActiveQuiz';
import QuizResult from './pages/Student/QuizResult';
import Leaderboard from './pages/Student/Leaderboard';

// Admin Pages
import Login from './pages/Admin/Login';
import Dashboard from './pages/Admin/Dashboard';
import QuizEditor from './pages/Admin/QuizEditor';
import QuizDetails from './pages/Admin/QuizDetails';

const ProtectedRoute = ({ children }) => {
  const { admin } = React.useContext(AuthContext);
  return admin ? children : <Navigate to="/admin/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Routes>
            {/* Student Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/quiz/:quizId/register" element={<Registration />} />
            <Route path="/quiz/:quizId/start/:attemptId" element={<QuizStart />} />
            <Route path="/quiz/:quizId/active/:attemptId" element={<ActiveQuiz />} />
            <Route path="/quiz/:quizId/result/:attemptId" element={<QuizResult />} />
            <Route path="/quiz/:quizId/leaderboard" element={<Leaderboard />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/quiz/new" element={
              <ProtectedRoute>
                <QuizEditor />
              </ProtectedRoute>
            } />
            <Route path="/admin/quiz/:id/edit" element={
              <ProtectedRoute>
                <QuizEditor />
              </ProtectedRoute>
            } />
            <Route path="/admin/quiz/:id" element={
              <ProtectedRoute>
                <QuizDetails />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
