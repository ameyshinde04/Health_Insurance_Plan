
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, Zap, Target, Search } from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-40">
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" 
            alt="Professional Background"
            className="w-full h-full object-cover opacity-[0.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white"></div>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full text-xs font-bold bg-blue-50 text-blue-600 mb-8 border border-blue-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-700">
              <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
              NEW: 2026 TECHNICAL DATASET NOW LIVE
            </div>
            
            <h1 className="text-6xl md:text-7xl font-black tracking-tight text-slate-900 mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-1000">
              Insurance Intelligence for <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Professional Users</span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-12 leading-relaxed max-w-2xl mx-auto font-medium animate-in fade-in slide-in-from-bottom-6 duration-1000">
              Navigate complex insurance plan datasets with precision. Enterprise-grade tools for exploration, technical comparison, and 2026 offering analysis.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <Link
                to="/browse"
                className="w-full sm:w-auto px-10 py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center space-x-3 shadow-xl shadow-blue-200 active:scale-95"
              >
                <span className="text-lg">Explore Registry</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/chatbot"
                className="w-full sm:w-auto px-10 py-5 bg-white text-slate-900 border border-slate-200 font-black rounded-2xl hover:border-slate-300 hover:bg-slate-50 transition-all shadow-lg shadow-slate-100 active:scale-95"
              >
                Launch AI Assistant
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid with Modern Cards */}
      <section className="py-32 bg-slate-50 relative border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="group bg-white p-10 rounded-[40px] shadow-sm border border-slate-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                <Search className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors duration-500" />
              </div>
              <h3 className="text-2xl font-black mb-4 text-slate-900">Advanced Filtering</h3>
              <p className="text-slate-500 text-base leading-relaxed font-medium">
                Drill through thousands of records using technical identifiers. Filter by Metal Level, Plan Type, and unique StateCode specifications.
              </p>
            </div>
            
            <div className="group bg-white p-10 rounded-[40px] shadow-sm border border-slate-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
                <Target className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors duration-500" />
              </div>
              <h3 className="text-2xl font-black mb-4 text-slate-900">Technical Comparison</h3>
              <p className="text-slate-500 text-base leading-relaxed font-medium">
                Side-by-side analysis of up to 4 plans. Review MOOP, Deductibles, and Benefit Counts with standard-compliant precision.
              </p>
            </div>
            
            <div className="group bg-white p-10 rounded-[40px] shadow-sm border border-slate-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-500">
                <Zap className="w-8 h-8 text-emerald-600 group-hover:text-white transition-colors duration-500" />
              </div>
              <h3 className="text-2xl font-black mb-4 text-slate-900">Dataset Intelligence</h3>
              <p className="text-slate-500 text-base leading-relaxed font-medium">
                Leverage Gemini-powered AI grounded directly in the 2026 registry. Ask complex technical questions and get instant, accurate responses.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
