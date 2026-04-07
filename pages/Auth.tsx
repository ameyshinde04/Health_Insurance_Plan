
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, User, ArrowRight, AlertCircle, Loader2, Info, Eye, EyeOff } from 'lucide-react';

const Auth: React.FC<{ type: 'login' | 'signup' }> = ({ type }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Proper Authentication Format Validation
    if (!validateEmail(email)) {
      setError("Please enter a valid professional email address (e.g., name@company.com).");
      return;
    }

    setIsLoading(true);

    // Simulate network delay for "Full Authentication" feel
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      if (type === 'signup') {
        // Name validation
        if (name.trim().length < 2) {
          throw new Error("Please enter your full name.");
        }
        
        // Basic password criteria: Minimum 6 characters
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters long.");
        }

        // Mock account creation
        const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
        if (users.find((u: any) => u.email === email)) {
          throw new Error("An account with this email already exists.");
        }

        const newUser = { name, email, password };
        users.push(newUser);
        localStorage.setItem('mock_users', JSON.stringify(users));
        localStorage.setItem('userName', name);
        localStorage.setItem('userEmail', email);
        
        navigate('/dashboard');
      } else {
        // Mock login check
        const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
        const user = users.find((u: any) => u.email === email && u.password === password);

        if (!user) {
          throw new Error("Invalid email or password. Please try again or create an account.");
        }

        localStorage.setItem('userName', user.name);
        localStorage.setItem('userEmail', user.email);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center px-4 py-24">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl mb-6 shadow-sm border border-blue-100">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {type === 'login' ? 'Welcome back' : 'Join InsurePlan'}
          </h2>
          <p className="mt-2 text-slate-500 font-medium">
            {type === 'login' 
              ? 'Enter your credentials to access the explorer' 
              : 'Create your account to start exploring the 2026 dataset'}
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-3 text-red-600 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {type === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${email && !validateEmail(email) ? 'text-red-400' : 'text-slate-400'}`} />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all font-medium ${
                    email && !validateEmail(email) 
                      ? 'border-red-200 focus:ring-red-500/10 focus:border-red-400' 
                      : 'border-slate-200 focus:ring-blue-500/10 focus:border-blue-500'
                  }`}
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {type === 'signup' && (
                <div className="mt-2 flex items-center space-x-1.5 text-[11px] text-slate-400 font-medium">
                  <span className="flex items-center space-x-1">
                    <Info className="w-3 h-3" />
                    <span>Minimum 6 characters required</span>
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>{type === 'login' ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-slate-500 font-medium">
                  {type === 'login' ? "Don't have an account?" : "Already have an account?"}
                  <Link
                    to={type === 'login' ? '/signup' : '/login'}
                    className="ml-1.5 text-blue-600 font-bold hover:text-blue-700 hover:underline decoration-2 underline-offset-4 transition-colors"
                  >
                    {type === 'login' ? 'Create one' : 'Log in here'}
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
