import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, BarChart3, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { Employee, Task, ChatMessage, AIAnalysisResult } from '../types';
import { chatWithAI, analyzeWorkload } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  employees: Employee[];
  tasks: Task[];
  currentUser: string; // 'admin' or 'employee'
  onClose: () => void;
}

export const AIPanel: React.FC<Props> = ({ employees, tasks, currentUser, onClose }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'insights'>('insights');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hello. I am NeuroWork. I'm analyzing ${employees.length} employees and ${tasks.length} tasks in real-time. How can I help optimize the organization today?`,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Prepare history for Gemini
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const responseText = await chatWithAI(userMsg.text, history, employees, tasks);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  const handleGenerateReport = async () => {
    setIsAnalyzing(true);
    const result = await analyzeWorkload(employees, tasks);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  // Prepare chart data
  const chartData = employees.map(e => ({
    name: e.name.split(' ')[0],
    load: e.workloadScore,
  }));

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
            <Bot className="w-6 h-6" />
            <div>
                <h2 className="font-bold text-lg leading-tight">NeuroWork</h2>
            </div>
            </div>
            <button 
                onClick={onClose}
                className="text-indigo-200 hover:text-white transition p-1 rounded-md hover:bg-indigo-700/50"
            >
                <X size={18} />
            </button>
        </div>
        <p className="text-xs text-indigo-200 opacity-90 mb-3">
            {currentUser === 'admin' ? 'Manager Access Level' : 'Employee Access Level'}
        </p>

        <div className="flex bg-indigo-900/50 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${activeTab === 'insights' ? 'bg-white text-indigo-900 shadow-sm' : 'text-indigo-200 hover:bg-indigo-800'}`}
          >
            Live Insights
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${activeTab === 'chat' ? 'bg-white text-indigo-900 shadow-sm' : 'text-indigo-200 hover:bg-indigo-800'}`}
          >
            AI Assistant
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'chat' ? (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide" ref={scrollRef}>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-1 text-gray-400 text-xs ml-2">
                  <Sparkles size={12} className="animate-spin" />
                  <span>Thinking...</span>
                </div>
              )}
            </div>
            <div className="p-3 border-t border-gray-100 bg-gray-50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask AI..."
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-4 space-y-6">
            {!analysis && !isAnalyzing ? (
              <div className="text-center mt-10">
                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-gray-600 font-medium">No Analysis Generated</h3>
                <p className="text-gray-400 text-xs mb-4">Run the AI engine to audit the current organization state.</p>
                <button 
                  onClick={handleGenerateReport}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center gap-2 mx-auto"
                >
                  <Sparkles size={16} />
                  Analyze Organization
                </button>
              </div>
            ) : isAnalyzing ? (
                <div className="flex flex-col items-center justify-center h-40 space-y-3">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-indigo-600 font-medium text-sm animate-pulse">Calculating optimal distribution...</p>
                </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* Efficiency Score */}
                <div className="bg-gradient-to-br from-indigo-50 to-white p-4 rounded-xl border border-indigo-100 text-center">
                    <p className="text-xs text-indigo-400 uppercase font-bold tracking-wider">Organizational Efficiency</p>
                    <div className="text-4xl font-bold text-indigo-900 mt-1">{analysis?.efficiencyScore}%</div>
                </div>

                {/* Chart */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Workload Distribution</h4>
                  <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            cursor={{fill: '#f3f4f6'}}
                        />
                        <Bar dataKey="load" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.load > 80 ? '#ef4444' : entry.load < 40 ? '#60a5fa' : '#22c55e'} />
                            ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Summary */}
                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Executive Summary</h4>
                    <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                        {analysis?.summary}
                    </p>
                </div>

                 {/* Risks */}
                 {analysis?.burnoutRisk && analysis.burnoutRisk.length > 0 && (
                     <div>
                        <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <AlertTriangle size={12} />
                            Burnout Risks
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {analysis.burnoutRisk.map((name, i) => (
                                <span key={i} className="px-2 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-md border border-red-100">
                                    {name}
                                </span>
                            ))}
                        </div>
                     </div>
                 )}

                {/* Recommendations */}
                <div>
                    <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        AI Recommendations
                    </h4>
                    <ul className="space-y-2">
                        {analysis?.recommendations.map((rec, i) => (
                            <li key={i} className="text-xs text-gray-600 flex gap-2">
                                <span className="text-emerald-500 font-bold">•</span>
                                {rec}
                            </li>
                        ))}
                    </ul>
                </div>

                <button 
                  onClick={handleGenerateReport}
                  className="w-full mt-4 text-xs text-indigo-500 hover:text-indigo-700 font-medium text-center"
                >
                  Refresh Analysis
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};