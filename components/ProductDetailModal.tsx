import React, { useState } from 'react';
import { Product, ProductComment, ServerStatusLog, BugReport, AIProductAnalysis } from '../types';
import { analyzeProduct } from '../services/geminiService';
import { X, Save, TrendingUp, DollarSign, Server, Users, Activity, Edit2, MessageSquare, AlertTriangle, Bug, Calendar, Send, Sparkles, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

interface Props {
  product: Product;
  role: 'admin' | 'employee';
  onClose: () => void;
  onUpdate: (product: Product) => void;
}

export const ProductDetailModal: React.FC<Props> = ({ product, role, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'dev'>('overview');
  const [description, setDescription] = useState(product.description);
  const [isEditing, setIsEditing] = useState(false);
  const [newComment, setNewComment] = useState('');
  
  // New entry states
  const [showLogForm, setShowLogForm] = useState(false);
  const [newLogType, setNewLogType] = useState<'MAINTENANCE' | 'OUTAGE'>('MAINTENANCE');
  const [newLogDesc, setNewLogDesc] = useState('');

  // AI State
  const [aiAnalysis, setAiAnalysis] = useState<AIProductAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSave = () => {
    onUpdate({ ...product, description });
    setIsEditing(false);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const comment: ProductComment = {
        id: `c_${Date.now()}`,
        author: role === 'admin' ? 'Administrator' : 'Mike Ross', // Simulating current user
        text: newComment,
        timestamp: new Date()
    };
    onUpdate({
        ...product,
        devComments: [comment, ...product.devComments]
    });
    setNewComment('');
  };

  const handleAddLog = () => {
      if(!newLogDesc.trim()) return;
      const log: ServerStatusLog = {
          id: `l_${Date.now()}`,
          type: newLogType,
          description: newLogDesc,
          date: new Date(),
          durationMinutes: 60 // Default
      };
      onUpdate({
          ...product,
          serverLogs: [log, ...product.serverLogs]
      });
      setShowLogForm(false);
      setNewLogDesc('');
  };

  const toggleBugStatus = (bugId: string) => {
      const updatedBugs = product.bugReports.map(b => 
          b.id === bugId ? { ...b, status: b.status === 'OPEN' ? 'RESOLVED' : 'OPEN' } : b
      ) as BugReport[];
      onUpdate({ ...product, bugReports: updatedBugs });
  };

  const handleRunAnalysis = async () => {
      setIsAnalyzing(true);
      const result = await analyzeProduct(product);
      setAiAnalysis(result);
      setIsAnalyzing(false);
  };

  const latest = product.history[product.history.length - 1];
  const totalRevenue = product.history.reduce((sum, item) => sum + item.profit + item.serverCost + item.inputCost, 0); // Approx
  
  // Calculate net profit margin for latest month
  const revenue = latest.profit + latest.serverCost + latest.inputCost;
  const margin = ((latest.profit / revenue) * 100).toFixed(1);

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 overflow-y-auto animate-in slide-in-from-bottom duration-300">
      {/* Top Navigation Bar mimicking a browser window/tab header */}
      <div className="bg-slate-900 text-white px-6 py-4 shadow-md sticky top-0 z-10">
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${product.logoColor} flex items-center justify-center shadow-lg`}>
                    <Activity size={20} className="text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold leading-tight">{product.name} <span className="text-slate-400 font-normal text-sm">| Product Dashboard</span></h1>
                    <p className="text-xs text-slate-400">{product.tagline}</p>
                </div>
            </div>
            <button 
                onClick={onClose}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2 border border-slate-700"
            >
                <X size={18} /> Close Window
            </button>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg inline-flex">
            <button 
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
                Overview & Analytics
            </button>
            <button 
                onClick={() => setActiveTab('dev')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition flex items-center gap-2 ${activeTab === 'dev' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
                <Server size={14} /> Dev & Operations Zone
            </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8 space-y-8">
        
        {activeTab === 'overview' ? (
            <>
                {/* KPI Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase mb-2">
                            <DollarSign size={16} className="text-green-600" /> Net Profit (Latest)
                        </div>
                        <div className="text-3xl font-bold text-gray-800">${latest.profit.toLocaleString()}</div>
                        <div className={`text-xs mt-2 ${latest.profit > 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {margin}% Margin
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase mb-2">
                            <Users size={16} className="text-blue-600" /> Active Users
                        </div>
                        <div className="text-3xl font-bold text-gray-800">{latest.traffic.toLocaleString()}</div>
                        <div className="text-xs text-green-600 mt-2">↑ 12% vs last month</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase mb-2">
                            <Server size={16} className="text-orange-600" /> Infra Costs
                        </div>
                        <div className="text-3xl font-bold text-gray-800">${latest.serverCost.toLocaleString()}</div>
                        <div className="text-xs text-gray-400 mt-2">Server & Cloud Compute</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase mb-2">
                            <TrendingUp size={16} className="text-purple-600" /> Total 6-Mo Revenue
                        </div>
                        <div className="text-3xl font-bold text-gray-800">${totalRevenue.toLocaleString()}</div>
                        <div className="text-xs text-gray-400 mt-2">Gross Revenue</div>
                    </div>
                </div>

                {/* Main Chart Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-6">Performance Trends (6 Months)</h3>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={product.history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" name="Net Profit ($)" />
                                    <Area type="monotone" dataKey="traffic" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTraffic)" name="Traffic" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
                        <h3 className="text-lg font-bold text-gray-800 mb-6">Cost Breakdown (Latest)</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[latest]}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="serverCost" fill="#f97316" name="Server Cost" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="inputCost" fill="#6366f1" name="Dev/Input Cost" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-6 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Server Overhead</span>
                                <span className="font-bold text-gray-800">${latest.serverCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Development Input</span>
                                <span className="font-bold text-gray-800">${latest.inputCost.toLocaleString()}</span>
                            </div>
                            <div className="h-px bg-gray-100 my-2"></div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">Total Monthly Burn</span>
                                <span className="font-bold text-red-500">${(latest.serverCost + latest.inputCost).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* AI & Description Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* AI Analysis Section */}
                    <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Sparkles size={100} className="text-indigo-600" />
                        </div>
                        <div className="flex justify-between items-center mb-4 relative z-10">
                            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                                <Sparkles size={20} className="text-indigo-500" />
                                AI Strategic Analysis
                            </h3>
                            {!aiAnalysis && !isAnalyzing && (
                                <button 
                                    onClick={handleRunAnalysis}
                                    className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-700 transition"
                                >
                                    Generate Report
                                </button>
                            )}
                        </div>

                        {isAnalyzing ? (
                            <div className="py-12 text-center">
                                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                <p className="text-indigo-600 text-sm font-medium animate-pulse">Analyzing market trends & performance...</p>
                            </div>
                        ) : aiAnalysis ? (
                            <div className="space-y-4 animate-in fade-in relative z-10">
                                <div className="bg-white/60 p-3 rounded-lg border border-indigo-100">
                                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Performance Summary</p>
                                    <p className="text-sm text-indigo-900 leading-relaxed">{aiAnalysis.summary}</p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white/60 p-3 rounded-lg border border-indigo-100">
                                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Future Outlook</p>
                                        <p className="text-sm text-indigo-900 leading-relaxed">{aiAnalysis.futureOutlook}</p>
                                    </div>
                                    <div className="bg-white/60 p-3 rounded-lg border border-indigo-100">
                                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Projected Growth</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className={`text-2xl font-bold ${aiAnalysis.predictedGrowth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                {aiAnalysis.predictedGrowth > 0 ? '+' : ''}{aiAnalysis.predictedGrowth}%
                                            </span>
                                            <span className="text-xs text-gray-500">Next Month</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-red-50/60 p-3 rounded-lg border border-red-100">
                                    <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Potential Risks</p>
                                    <ul className="space-y-1">
                                        {aiAnalysis.keyRisks.map((risk, i) => (
                                            <li key={i} className="text-xs text-red-800 flex items-start gap-2">
                                                <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
                                                {risk}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="flex justify-end">
                                    <button onClick={handleRunAnalysis} className="text-xs text-indigo-400 hover:text-indigo-600 underline">Refresh Analysis</button>
                                </div>
                            </div>
                        ) : (
                            <div className="py-8 text-center text-indigo-300">
                                <p>Click generate to receive an AI-powered forecast.</p>
                            </div>
                        )}
                    </div>

                    {/* Product Description */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Product Description</h3>
                            {role === 'admin' && !isEditing && (
                                <button onClick={() => setIsEditing(true)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1">
                                    <Edit2 size={14} /> Edit
                                </button>
                            )}
                        </div>
                        
                        {isEditing ? (
                            <div className="space-y-4 animate-in fade-in">
                                <textarea 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full h-32 p-3 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                    <button onClick={handleSave} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                                        <Save size={16} /> Save Changes
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Top Customers */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Top Customers</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {product.topCustomers.map((customer, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div>
                                    <h4 className="font-bold text-gray-800">{customer.name}</h4>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide border ${
                                        customer.type === 'Company' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                        customer.type === 'School' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                        customer.type === 'Organization' ? 'bg-green-50 text-green-700 border-green-100' :
                                        'bg-purple-50 text-purple-700 border-purple-100'
                                    }`}>
                                        {customer.type}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-gray-800">${customer.revenueContribution.toLocaleString()}</div>
                                    <span className="text-xs text-gray-400">Total Contract</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        ) : (
            /* DEV ZONE CONTENT (Unchanged) */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* 1. Bug Reports */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
                    <div className="p-4 border-b border-gray-100 bg-red-50 rounded-t-xl flex justify-between items-center">
                        <h3 className="font-bold text-red-900 flex items-center gap-2">
                            <Bug size={18} /> User Bug Reports
                        </h3>
                        <span className="bg-white text-red-600 text-xs font-bold px-2 py-0.5 rounded-full border border-red-100">
                            {product.bugReports.filter(b => b.status === 'OPEN').length} Open
                        </span>
                    </div>
                    <div className="p-4 overflow-y-auto flex-1 space-y-3">
                        {product.bugReports.length === 0 && (
                            <p className="text-center text-gray-400 text-sm mt-10">No bugs reported. Great job!</p>
                        )}
                        {product.bugReports.map(bug => (
                            <div key={bug.id} className="p-3 border rounded-lg border-gray-100 hover:shadow-md transition bg-white group relative">
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                        bug.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                                        bug.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                        {bug.severity}
                                    </span>
                                    <span className="text-[10px] text-gray-400">{new Date(bug.date).toLocaleDateString()}</span>
                                </div>
                                <h4 className={`font-bold text-sm ${bug.status === 'RESOLVED' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{bug.title}</h4>
                                <p className="text-xs text-gray-500 mt-1">{bug.description}</p>
                                <div className="mt-3 flex justify-between items-center">
                                    <span className="text-[10px] text-gray-400 font-medium">By: {bug.reportedBy}</span>
                                    <button 
                                        onClick={() => toggleBugStatus(bug.id)}
                                        className={`text-xs px-2 py-1 rounded font-bold transition ${
                                            bug.status === 'OPEN' 
                                            ? 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700' 
                                            : 'bg-green-100 text-green-700'
                                        }`}
                                    >
                                        {bug.status === 'OPEN' ? 'Mark Resolved' : 'Resolved'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Server Status Log */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
                    <div className="p-4 border-b border-gray-100 bg-orange-50 rounded-t-xl flex justify-between items-center">
                        <h3 className="font-bold text-orange-900 flex items-center gap-2">
                            <Calendar size={18} /> Server Maintenance Log
                        </h3>
                        <button 
                            onClick={() => setShowLogForm(!showLogForm)}
                            className="text-xs bg-white border border-orange-200 text-orange-700 px-2 py-1 rounded hover:bg-orange-100 transition"
                        >
                            + Log Event
                        </button>
                    </div>
                    
                    {showLogForm && (
                        <div className="p-4 bg-orange-50/50 border-b border-orange-100 animate-in fade-in">
                            <div className="space-y-2">
                                <select 
                                    className="w-full text-xs p-2 border border-gray-200 rounded"
                                    value={newLogType}
                                    onChange={(e) => setNewLogType(e.target.value as any)}
                                >
                                    <option value="MAINTENANCE">Scheduled Maintenance</option>
                                    <option value="OUTAGE">Unexpected Outage</option>
                                </select>
                                <input 
                                    type="text" 
                                    className="w-full text-xs p-2 border border-gray-200 rounded"
                                    placeholder="Description..."
                                    value={newLogDesc}
                                    onChange={(e) => setNewLogDesc(e.target.value)}
                                />
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setShowLogForm(false)} className="text-xs text-gray-500">Cancel</button>
                                    <button onClick={handleAddLog} className="text-xs bg-orange-600 text-white px-3 py-1 rounded">Save Log</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="p-4 overflow-y-auto flex-1 space-y-4 relative">
                        {/* Timeline Line */}
                        <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gray-100"></div>

                        {product.serverLogs.length === 0 && (
                            <p className="text-center text-gray-400 text-sm mt-10 pl-4">System has been 100% operational.</p>
                        )}

                        {product.serverLogs.map(log => (
                            <div key={log.id} className="relative pl-8">
                                <div className={`absolute left-[1.15rem] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm ${log.type === 'OUTAGE' ? 'bg-red-500' : 'bg-orange-400'}`}></div>
                                <div className="text-xs text-gray-400 mb-0.5">{new Date(log.date).toLocaleDateString()}</div>
                                <h4 className="text-sm font-bold text-gray-800">{log.type === 'OUTAGE' ? 'System Outage' : 'Maintenance'}</h4>
                                <p className="text-xs text-gray-600 mt-1">{log.description}</p>
                                <span className="text-[10px] text-gray-400 mt-1 block font-mono">Duration: {log.durationMinutes}m</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. Dev Comments */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
                    <div className="p-4 border-b border-gray-100 bg-indigo-50 rounded-t-xl">
                        <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                            <MessageSquare size={18} /> Developer Comments
                        </h3>
                    </div>
                    <div className="p-4 overflow-y-auto flex-1 space-y-4">
                        {product.devComments.length === 0 && (
                            <p className="text-center text-gray-400 text-sm mt-10">No comments yet. Start the discussion.</p>
                        )}
                        {product.devComments.map(comment => (
                            <div key={comment.id} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs flex-shrink-0">
                                    {comment.author.charAt(0)}
                                </div>
                                <div className="bg-gray-50 p-3 rounded-2xl rounded-tl-none">
                                    <div className="flex justify-between items-baseline mb-1 gap-2">
                                        <span className="text-xs font-bold text-gray-900">{comment.author}</span>
                                        <span className="text-[10px] text-gray-400">{new Date(comment.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-700 leading-snug">{comment.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-3 border-t border-gray-100">
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                                placeholder="Write a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                            />
                            <button onClick={handleAddComment} className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700">
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        )}

      </div>
    </div>
  );
};