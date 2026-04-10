
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  Home, Search, LayoutDashboard, MessageSquare, 
  BarChart2, User, LogIn, UserPlus, Shield, ChevronRight, Menu, X,
  ArrowRightLeft
} from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Browse from './pages/Browse';
import PlanDetails from './pages/PlanDetails';
import Compare from './pages/Compare';
import AIChatbot from './pages/AIChatbot';
import Profile from './pages/Profile';
import Auth from './pages/Auth';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Browse Plans', path: '/browse', icon: Search },
    { name: 'Compare', path: '/compare', icon: ArrowRightLeft },
    { name: 'AI Assistant', path: '/chatbot', icon: MessageSquare },
  ];

  return (
    <nav className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-blue-500" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                InsurePlan
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
                  location.pathname === item.path ? 'text-blue-400' : 'text-slate-300 hover:text-white'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
            <div className="border-l border-slate-800 h-6 mx-4"></div>
            <Link to="/profile" className="text-slate-300 hover:text-white transition-colors">
              <User className="w-5 h-5" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-300 hover:text-white focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 py-4 animate-in fade-in slide-in-from-top-1">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              My Profile
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Auth type="login" />} />
              <Route path="/signup" element={<Auth type="signup" />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/browse" element={<ProtectedRoute><Browse /></ProtectedRoute>} />
              <Route path="/plan/:id" element={<ProtectedRoute><PlanDetails /></ProtectedRoute>} />
              <Route path="/compare" element={<ProtectedRoute><Compare /></ProtectedRoute>} />
              <Route path="/chatbot" element={<ProtectedRoute><AIChatbot /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            </Routes>
          </main>
        
        <footer className="bg-slate-950 border-t border-slate-800 py-12 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div>
                <div className="flex items-center space-x-2 mb-6">
                  <Shield className="w-7 h-7 text-blue-500" />
                  <span className="text-xl font-bold text-white tracking-tight">InsurePlan</span>
                </div>
                <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
                  The definitive technical explorer for 2026 insurance plan specifications and multi-dimensional analytics.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-6 text-white uppercase text-xs tracking-widest">Navigation</h4>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li><Link to="/browse" className="hover:text-blue-400 transition-colors">Browse Plans</Link></li>
                  <li><Link to="/dashboard" className="hover:text-blue-400 transition-colors">Platform Metrics</Link></li>
                  <li><Link to="/compare" className="hover:text-blue-400 transition-colors">Compare Tool</Link></li>
                  <li><Link to="/chatbot" className="hover:text-blue-400 transition-colors">AI Advisor</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-6 text-white uppercase text-xs tracking-widest">Compliance</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Data derived from primary HIOS registry source code. Verification against local 2026 dataset is performed using deterministic logic.
                </p>
                <div className="mt-6 flex gap-4">
                  <div className="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center">
                    <Search className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              </div>
            </div>
            {/* Added white line separator and updated copyright text */}
            <div className="border-t border-white/20 mt-12 pt-8 text-center">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                © 2026 INSUREPLAN EXPLORER. ALL RIGHTS RESERVED.
              </p>
            </div>
          </div>
        </footer>
      </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
