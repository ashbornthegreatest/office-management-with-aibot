import React, { useState } from 'react';
import { Employee } from '../types';
import { BrainCircuit, Lock, Mail, ChevronRight, Sparkles } from 'lucide-react';

interface Props {
  employees: Employee[];
  onLogin: (employee: Employee) => void;
}

export const LoginPage: React.FC<Props> = ({ employees, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = employees.find(emp => emp.email === email && emp.password === password);
    
    if (user) {
        onLogin(user);
    } else {
        setError('Invalid credentials. Check the credential file.');
    }
  };

  const handleQuickLogin = (email: string) => {
      setEmail(email);
      setPassword('admin'); // Assuming default for quick fill
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-pulse"></div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl w-full max-w-md shadow-2xl relative z-10">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/50">
                    <BrainCircuit size={40} className="text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">NeuroWork</h1>
                <p className="text-indigo-200 text-sm">AI-Powered Organizational Intelligence</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-indigo-200 uppercase ml-1 mb-1 block">Work Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 text-indigo-400" size={18} />
                        <input 
                            type="email" 
                            className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition placeholder-slate-500"
                            placeholder="name@neurowork.ai"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <label className="text-xs font-bold text-indigo-200 uppercase ml-1 mb-1 block">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 text-indigo-400" size={18} />
                        <input 
                            type="password" 
                            className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition placeholder-slate-500"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-sm p-3 rounded-lg text-center">
                        {error}
                    </div>
                )}

                <button 
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 group"
                >
                    Sign In to Workspace
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-xs text-center text-slate-400 mb-4">Quick Fill for Demo</p>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => { setEmail('arshpreet@neurowork.ai'); setPassword('admin'); }}
                        className="bg-slate-800/50 hover:bg-slate-700 text-indigo-200 text-xs py-2 rounded-lg border border-slate-700 flex items-center justify-center gap-2"
                    >
                        <Sparkles size={12} className="text-yellow-400" /> Founder (CEO)
                    </button>
                    <button 
                        onClick={() => { setEmail('jessica@neurowork.ai'); setPassword('password123'); }}
                        className="bg-slate-800/50 hover:bg-slate-700 text-slate-300 text-xs py-2 rounded-lg border border-slate-700"
                    >
                        Manager
                    </button>
                    <button 
                        onClick={() => { setEmail('sarah@neurowork.ai'); setPassword('password123'); }}
                        className="bg-slate-800/50 hover:bg-slate-700 text-slate-300 text-xs py-2 rounded-lg border border-slate-700"
                    >
                        Employee (Sarah)
                    </button>
                    <button 
                        onClick={() => { setEmail('mike@neurowork.ai'); setPassword('password123'); }}
                        className="bg-slate-800/50 hover:bg-slate-700 text-slate-300 text-xs py-2 rounded-lg border border-slate-700"
                    >
                         Employee (Mike)
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};