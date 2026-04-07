import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SAMPLE_DATA } from '../data';
import { 
  Send, Bot, User, RefreshCcw, Copy, Check, 
  ExternalLink, ShieldCheck, Sparkles, ArrowRight
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  isError?: boolean;
}

const STORAGE_KEY = 'insureplan_chat_history';
const INITIAL_MESSAGE: Message = { 
  id: '1', 
  role: 'bot', 
  text: "Hello! I'm your **InsurePlan AI Advisor**. I'm here to help you navigate the 2026 insurance registry with ease.\n\nWhether you're looking for the most affordable plan in your state or need to understand how a plan handles a specific situation like 'having a baby', I've got the data ready for you.\n\nHow can I help you find the right coverage today?" 
};

const AIChatbot: React.FC = () => {
  // Load initial messages from sessionStorage
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [INITIAL_MESSAGE];
    } catch (e) {
      return [INITIAL_MESSAGE];
    }
  });
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "What's the best plan for me?",
    "Show me cheap plans in Texas",
    "How much does having a baby cost?",
    "Find Bronze plans with low MOOP"
  ];

  // Persist messages to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReset = () => {
    const resetMsg: Message = { 
      id: Date.now().toString(), 
      role: 'bot', 
      text: "Advisor session reset. How can I help you explore the 2026 plans?" 
    };
    setMessages([resetMsg]);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const handleSend = async (textOverride?: string) => {
    const textToUse = textOverride || input;
    if (!textToUse.trim() || isTyping) return;

    const userMsgId = Date.now().toString();
    const userMessage: Message = { id: userMsgId, role: 'user', text: textToUse };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const botMsgId = (Date.now() + 1).toString();
    let accumulatedText = "";

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const systemInstruction = `
        You are the InsurePlan AI Advisor. Your goal is to help users find the best 2026 insurance plans using human-friendly language.
        Dataset: ${JSON.stringify(SAMPLE_DATA)}.
        
        STRICT RULES:
        1. CLARIFICATION: If the user asks a vague question (e.g., "best plan", "cheap plan"), you MUST ask:
           - Which state?
           - Which metal level (Bronze, Silver, Gold, High, Low, Catastrophic)?
           - Preferred plan type (HMO, PPO, EPO, POS, Others)?
        
        2. DATA MATCHING: Translate intent into filters like stateCode, metalLevel, planType, deductible, MOOP.
        
        3. RESULT FORMAT: When showing plans, display:
           - Plan Name
           - Plan ID (StandardComponentId)
           - State
           - Metal Level
           - Plan Type
           - Individual Deductible
           - Individual MOOP
           - Reasoning: One short sentence explaining why it's recommended.
        
        4. CLICKABLE LINKS: For every plan mentioned, include a link using this format exactly: [[PLAN_LINK:PlanID]] (where PlanID is the StandardComponentId).
        
        5. LIMITS: Show a top 3 list only. Sort by user intent (e.g., lowest deductible).
        
        6. MEDICAL SCENARIOS: For "having a baby", "diabetes", or "fracture", explicitly show the scenario-specific Deductible, Copayment, and Coinsurance from the dataset (e.g., SBCHavingBabyDeductible).
        
        7. TONE: Friendly, simple, supportive. Avoid overly technical jargon.
        
        8. FOLLOW-UPS: End every response with 2 suggested follow-up questions starting with "Follow-up questions:".
        
        9. DATA ONLY: Never invent plans. Use provided dataset only.
      `;

      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: textToUse,
        config: { systemInstruction, temperature: 0.1 },
      });

      setMessages(prev => [...prev, { id: botMsgId, role: 'bot', text: "" }]);

      for await (const chunk of responseStream) {
        const chunkText = chunk.text;
        if (chunkText) {
          accumulatedText += chunkText;
          setMessages(prev => prev.map(m => 
            m.id === botMsgId ? { ...m, text: accumulatedText } : m
          ));
        }
      }
    } catch (error) {
      setMessages(prev => [
        ...prev, 
        { id: Date.now().toString(), role: 'bot', text: "I'm having trouble connecting to my registry right now. Please try again in a moment.", isError: true }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessageText = (text: string) => {
    const parts = text.split(/(\[\[PLAN_LINK:[^\]]+\]\])/g);
    return parts.map((part, index) => {
      const match = part.match(/\[\[PLAN_LINK:([^\]]+)\]\]/);
      if (match) {
        const planId = match[1];
        const plan = SAMPLE_DATA.find(p => p.PlanId === planId || p.StandardComponentId === planId);
        if (!plan) return null;
        
        return (
          <Link 
            key={index}
            to={`/plan/${plan.PlanId}`}
            className="block my-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:border-blue-400 hover:bg-white hover:shadow-md transition-all group animate-in zoom-in-95 duration-300"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-1.5">
                {plan.IsNewPlan === 'New' && (
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[9px] font-black uppercase tracking-tighter flex items-center gap-0.5 shadow-sm">
                    <Sparkles className="w-2.5 h-2.5" />
                    NEW
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${
                  plan.MetalLevel === 'Gold' ? 'bg-amber-100 text-amber-700' : 
                  plan.MetalLevel === 'Silver' ? 'bg-slate-200 text-slate-700' :
                  plan.MetalLevel === 'High' ? 'bg-purple-100 text-purple-700' :
                  plan.MetalLevel === 'Low' ? 'bg-slate-100 text-slate-500' :
                  plan.MetalLevel === 'Catastrophic' ? 'bg-red-100 text-red-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {plan.MetalLevel}
                </span>
              </div>
              <ExternalLink className="w-3 text-slate-300 group-hover:text-blue-500" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 truncate">{plan.PlanVariantMarketingName}</h4>
            <div className="mt-2 flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-400 uppercase tracking-widest">{plan.StateCode} REGISTRY</span>
              <span className="text-blue-600">{plan.TEHBDedInnTier1Individual} Ded.</span>
            </div>
            <div className="mt-3 flex items-center text-blue-600 text-[11px] font-black uppercase tracking-widest gap-1 group-hover:gap-2 transition-all">
              <span>View Full Technical Specs</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </Link>
        );
      }
      
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={index} className="whitespace-pre-wrap">
          {boldParts.map((bp, i) => {
            if (bp.startsWith('**') && bp.endsWith('**')) {
              return <strong key={i} className="font-black text-slate-900">{bp.slice(2, -2)}</strong>;
            }
            return bp;
          })}
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-6 py-2.5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <Bot className="text-white w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-[13px] font-extrabold text-slate-900 leading-none mb-1">InsurePlan AI Advisor</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Grounded in 2026 Dataset</span>
              </div>
            </div>
          </div>
          
          <div className="relative group">
            <button 
              onClick={handleReset}
              className="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-slate-100 rounded-full transition-all outline-none"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
            </button>
            <div className="absolute top-full right-0 mt-2 hidden group-hover:block animate-in fade-in slide-in-from-top-1 z-20">
              <div className="bg-slate-800 text-white text-[9px] font-black px-2 py-1 rounded shadow-xl uppercase tracking-[0.1em] whitespace-nowrap">
                Reset Session
              </div>
            </div>
          </div>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-grow overflow-y-auto px-4 py-8 scroll-smooth custom-scrollbar"
      >
        <div className="max-w-3xl mx-auto space-y-10">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-4 max-w-[90%] md:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-sm ${
                  msg.role === 'user' ? 'bg-blue-600 text-white border-blue-500' : 'bg-white text-slate-400 border-slate-200'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className="space-y-2">
                  <div className={`relative group px-5 py-4 rounded-2xl text-[14px] leading-relaxed transition-all shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white border border-blue-500 rounded-tr-none' 
                      : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
                  }`}>
                    <div className="prose prose-slate prose-sm max-w-none">
                      {renderMessageText(msg.text)}
                    </div>
                    {msg.role === 'bot' && msg.text && !msg.isError && (
                      <button 
                        onClick={() => copyToClipboard(msg.text, msg.id)}
                        className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-slate-100"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                  <p className={`text-[9px] font-bold uppercase tracking-widest px-1 ${msg.role === 'user' ? 'text-right text-slate-400' : 'text-slate-300'}`}>
                    {msg.role === 'user' ? 'Analysis Request' : 'Advisor Insight'}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start gap-4 animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-300 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white px-5 py-4 rounded-2xl rounded-tl-none border border-slate-200 flex gap-1.5 shadow-sm">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pb-8 px-4 bg-gradient-to-t from-slate-100/50 to-transparent">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s)}
                disabled={isTyping}
                className="px-4 py-2 bg-white border border-slate-200 rounded-full text-[11px] font-bold text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-white border border-slate-200 rounded-[28px] shadow-2xl shadow-slate-300/30 p-1.5 pr-2 pl-6 focus-within:ring-4 focus-within:ring-blue-500/5 focus-within:border-blue-400 transition-all">
            <input
              type="text"
              placeholder="Ask about states, metal levels, or health scenarios..."
              className="flex-grow bg-transparent border-none outline-none py-3 text-[14px] font-medium placeholder:text-slate-300"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isTyping}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className={`p-3 rounded-full transition-all active:scale-90 flex-shrink-0 ${
                !input.trim() || isTyping 
                  ? 'text-slate-200 bg-transparent' 
                  : 'text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between px-4 opacity-40">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Grounded Engine</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Gemini Intelligence</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;
