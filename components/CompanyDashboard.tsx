import React, { useState } from 'react';
import { Product, AIProductAnalysis, Employee } from '../types';
import { analyzeCompany } from '../services/geminiService';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, DollarSign, Server, Sparkles, AlertTriangle, ArrowUpRight, Crown, Shield, User } from 'lucide-react';

interface Props {
  products: Product[];
  employees: Employee[];
  onViewProfile: (employee: Employee) => void;
}

export const CompanyDashboard: React.FC<Props> = ({ products, employees, onViewProfile }) => {
  const [aiAnalysis, setAiAnalysis] = useState<AIProductAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Aggregate data for the last 6 months
  const aggregatedHistory = products.length > 0 ? products[0].history.map((_, index) => {
      const month = products[0].history[index].month;
      let totalProfit = 0;
      let totalServerCost = 0;
      let totalInputCost = 0;
      let totalRevenue = 0;

      products.forEach(p => {
          const point = p.history[index];
          if(point) {
              totalProfit += point.profit;
              totalServerCost += point.serverCost;
              totalInputCost += point.inputCost;
              totalRevenue += (point.profit + point.serverCost + point.inputCost);
          }
      });

      return {
          month,
          profit: totalProfit,
          cost: totalServerCost + totalInputCost,
          revenue: totalRevenue
      };
  }) : [];

  const totals = aggregatedHistory.reduce((acc, curr) => ({
      revenue: acc.revenue + curr.revenue,
      profit: acc.profit + curr.profit,
      cost: acc.cost + curr.cost
  }), { revenue: 0, profit: 0, cost: 0 });

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await analyzeCompany(products);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  // Sort employees: CEO -> Manager -> Employee
  const sortedTeam = [...employees].sort((a, b) => {
      const order = { 'ceo': 0, 'manager': 1, 'employee': 2 };
      return order[a.accessLevel] - order[b.accessLevel];
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase mb-2">
                    <DollarSign size={16} className="text-green-600" /> Total Revenue (6 Mo)
                </div>
                <div className="text-4xl font-bold text-gray-800">${totals.revenue.toLocaleString()}</div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase mb-2">
                    <TrendingUp size={16} className="text-blue-600" /> Total Profit
                </div>
                <div className="text-4xl font-bold text-gray-800">${totals.profit.toLocaleString()}</div>
                <div className="text-xs text-green-600 mt-2 font-bold">
                    {((totals.profit / totals.revenue) * 100).toFixed(1)}% Margin
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase mb-2">
                    <Server size={16} className="text-orange-600" /> Total OpEx
                </div>
                <div className="text-4xl font-bold text-gray-800">${totals.cost.toLocaleString()}</div>
                <div className="text-xs text-gray-400 mt-2">Server + Dev Costs</div>
            </div>
        </div>

        {/* Leadership & Team Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
                <h3 className="font-bold text-gray-800">Leadership & Team Roster</h3>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedTeam.map(emp => (
                        <div 
                            key={emp.id} 
                            onClick={() => onViewProfile(emp)}
                            className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer hover:shadow-md transition ${emp.accessLevel === 'ceo' ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200'}`}
                        >
                            <img src={emp.avatar} alt={emp.name} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                            <div>
                                <h4 className="font-bold text-gray-900 flex items-center gap-1">
                                    {emp.name}
                                    {emp.accessLevel === 'ceo' && <Crown size={14} className="text-yellow-500 fill-yellow-500" />}
                                    {emp.accessLevel === 'manager' && <Shield size={14} className="text-indigo-500" />}
                                </h4>
                                <p className="text-xs text-gray-500">{emp.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-6">Revenue vs Cost Trend</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={aggregatedHistory}>
                            <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
                            <Area type="monotone" dataKey="cost" stroke="#f97316" fillOpacity={0} strokeDasharray="5 5" name="Costs" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-6">Profitability Trend</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={aggregatedHistory}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="profit" fill="#10b981" name="Net Profit" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* AI Company Analysis */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-2xl shadow-xl overflow-hidden relative">
             <div className="absolute top-0 right-0 p-8 opacity-20">
                <Sparkles size={150} className="text-white" />
            </div>
            
            <div className="p-8 relative z-10 text-white">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <Sparkles className="text-indigo-400" />
                            Company-Wide Strategic Intelligence
                        </h2>
                        <p className="text-indigo-200 text-sm mt-1">Holistic analysis of all product lines and financial health.</p>
                    </div>
                    {!aiAnalysis && !isAnalyzing && (
                        <button 
                            onClick={handleRunAnalysis}
                            className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition shadow-lg flex items-center gap-2"
                        >
                            Run Global Analysis <ArrowUpRight size={18} />
                        </button>
                    )}
                </div>

                {isAnalyzing ? (
                     <div className="py-12 text-center">
                        <div className="w-10 h-10 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-indigo-200 text-lg animate-pulse">Aggregating data points & predicting market trajectory...</p>
                    </div>
                ) : aiAnalysis ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in">
                        <div className="space-y-6">
                            <div className="bg-white/10 p-5 rounded-xl border border-white/10 backdrop-blur-sm">
                                <h4 className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">Executive Summary</h4>
                                <p className="leading-relaxed text-lg">{aiAnalysis.summary}</p>
                            </div>
                            <div className="bg-white/10 p-5 rounded-xl border border-white/10 backdrop-blur-sm">
                                <h4 className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">Future Outlook</h4>
                                <p className="leading-relaxed text-indigo-100">{aiAnalysis.futureOutlook}</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                             <div className="bg-white/10 p-5 rounded-xl border border-white/10 backdrop-blur-sm flex items-center justify-between">
                                <div>
                                    <h4 className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">Projected Total Growth</h4>
                                    <p className="text-xs text-indigo-400">Next Fiscal Month</p>
                                </div>
                                <div className={`text-5xl font-bold ${aiAnalysis.predictedGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {aiAnalysis.predictedGrowth > 0 ? '+' : ''}{aiAnalysis.predictedGrowth}%
                                </div>
                             </div>

                             <div className="bg-red-500/20 p-5 rounded-xl border border-red-500/30 backdrop-blur-sm">
                                <h4 className="text-red-300 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <AlertTriangle size={14} /> Critical Corporate Risks
                                </h4>
                                <ul className="space-y-2">
                                    {aiAnalysis.keyRisks.map((risk, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-red-100">
                                            <span className="text-red-400 font-bold">•</span>
                                            {risk}
                                        </li>
                                    ))}
                                </ul>
                             </div>
                             
                             <div className="flex justify-end">
                                <button onClick={handleRunAnalysis} className="text-sm text-indigo-300 hover:text-white underline">Regenerate Report</button>
                             </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-12 border-2 border-dashed border-indigo-700/50 rounded-xl text-center text-indigo-300">
                        <p>Generate a report to see how the company is performing as a whole.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};