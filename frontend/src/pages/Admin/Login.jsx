import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reach the server. Please try again.');
    }
  };

  return (
    <div className="flex-1 bg-drr-navy flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-drr-blue/10 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-md glass-card overflow-hidden z-10">
        <div className="bg-gradient-to-r from-drr-blue to-drr-lightNavy p-8 text-center border-b border-drr-blue/50">
          <Shield className="w-16 h-16 text-drr-cyan mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Admin Portal</h1>
          <p className="text-drr-cyan">DRR Club Quizzes</p>
        </div>
        
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-center text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-drr-gray mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-drr-gray" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="admin@drrclub.edu"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-drr-gray mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-drr-gray" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full flex justify-center items-center gap-2">
              Secure Login <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
