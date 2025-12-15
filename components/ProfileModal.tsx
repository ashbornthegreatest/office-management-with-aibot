import React, { useState } from 'react';
import { Employee, Task, TaskStatus } from '../types';
import { WorkloadBar } from './WorkloadBar';
import { X, Mail, Calendar, Briefcase, Link as LinkIcon, Save, Edit2, FileText, CheckCircle2, Crown, Flame } from 'lucide-react';

interface Props {
  employee: Employee;
  currentUser: Employee;
  allTasks: Task[];
  onClose: () => void;
  onUpdate: (updatedEmployee: Employee) => void;
}

export const ProfileModal: React.FC<Props> = ({ employee, currentUser, allTasks, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'work' | 'history'>('overview');
  
  // Edit State
  const canEdit = currentUser.id === employee.id || currentUser.accessLevel === 'ceo' || (currentUser.accessLevel === 'manager' && employee.accessLevel === 'employee');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
      bio: employee.bio || '',
      resumeLink: employee.resumeLink || '',
      portfolioLink: employee.portfolioLink || '',
      skills: employee.skills.join(', ')
  });

  const isCEO = employee.accessLevel === 'ceo';

  const handleSave = () => {
    onUpdate({
        ...employee,
        bio: formData.bio,
        resumeLink: formData.resumeLink,
        portfolioLink: formData.portfolioLink,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s)
    });
    setIsEditing(false);
  };

  const completedTasks = allTasks.filter(t => t.assignedToId === employee.id && t.status === 'COMPLETED');
  const activeTasks = allTasks.filter(t => t.assignedToId === employee.id && t.status !== 'COMPLETED');

  const PLACEHOLDER_TEXT = '{Suppose to be a link here!}';
  const isPlaceholder = (text: string) => text === PLACEHOLDER_TEXT;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
        <div className={`bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${isCEO ? 'border-4 border-yellow-400 shadow-[0_0_50px_rgba(234,179,8,0.3)]' : ''}`}>
            
            {/* Scrollable Area containing BOTH header and content to prevent clipping */}
            <div className="flex-1 overflow-y-auto">
                
                {/* Cover / Header */}
                <div className={`h-32 relative ${isCEO ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600' : 'bg-gradient-to-r from-slate-800 to-indigo-900'}`}>
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-black/20 text-white p-2 rounded-full hover:bg-black/40 transition z-10"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="px-8 pb-8">
                    {/* Profile Info Header */}
                    <div className="relative -top-12 flex justify-between items-end mb-6">
                        <div className="flex items-end gap-6 relative">
                            {isCEO && (
                                <div className="absolute -top-16 left-8 animate-bounce">
                                    <Crown size={64} className="text-yellow-400 fill-yellow-300 drop-shadow-lg" strokeWidth={1.5} />
                                </div>
                            )}
                            <img 
                                src={employee.avatar} 
                                alt={employee.name} 
                                className={`w-32 h-32 rounded-full border-4 shadow-lg bg-white ${isCEO ? 'border-yellow-400' : 'border-white'}`}
                            />
                            <div className="mb-2">
                                <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                                    {employee.name}
                                    {isCEO && <Crown className="text-yellow-500 fill-yellow-500" size={28} />}
                                </h2>
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Briefcase size={16} />
                                    <span>{employee.role}</span>
                                    {employee.accessLevel === 'ceo' && (
                                        <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-bold border border-indigo-200">FOUNDER</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {canEdit && !isEditing && (
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="mb-4 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-200 transition"
                            >
                                <Edit2 size={16} /> Edit Profile
                            </button>
                        )}
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex border-b border-gray-200 mb-6">
                        <button 
                            onClick={() => setActiveTab('overview')}
                            className={`px-6 py-3 font-medium text-sm transition border-b-2 ${activeTab === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Overview
                        </button>
                        <button 
                            onClick={() => setActiveTab('work')}
                            className={`px-6 py-3 font-medium text-sm transition border-b-2 ${activeTab === 'work' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Portfolio & Resume
                        </button>
                        <button 
                            onClick={() => setActiveTab('history')}
                            className={`px-6 py-3 font-medium text-sm transition border-b-2 ${activeTab === 'history' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Task History
                        </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="md:col-span-2 space-y-6">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">About</h3>
                                        {isEditing ? (
                                            <textarea 
                                                value={formData.bio}
                                                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500"
                                                rows={4}
                                            />
                                        ) : (
                                            <p className="text-gray-700 leading-relaxed">
                                                {employee.bio || "No bio available."}
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Skills</h3>
                                        {isEditing ? (
                                            <input 
                                                value={formData.skills}
                                                onChange={(e) => setFormData({...formData, skills: e.target.value})}
                                                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500"
                                            />
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {employee.skills.map(skill => (
                                                    <span key={skill} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium border border-gray-200">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="space-y-6">
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <h3 className="text-sm font-bold text-gray-800 mb-4">Contact Info</h3>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex items-center gap-3 text-gray-600">
                                                <Mail size={16} />
                                                <span>{employee.email}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-600">
                                                <Calendar size={16} />
                                                <span>Joined {new Date(employee.joinedDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`p-4 rounded-xl border ${isCEO ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' : 'bg-indigo-50 border-indigo-100'}`}>
                                        <h3 className={`text-sm font-bold mb-2 ${isCEO ? 'text-yellow-800' : 'text-indigo-900'}`}>Current Load</h3>
                                        <div className={`font-bold ${isCEO ? 'text-5xl text-red-600 drop-shadow-sm flex items-center gap-2' : 'text-3xl text-indigo-700'}`}>
                                            {isCEO ? '1000%' : `${employee.workloadScore}%`}
                                            {isCEO && <Flame className="text-orange-500 animate-pulse" size={32} />}
                                        </div>
                                        <p className={`text-xs mt-2 font-medium ${isCEO ? 'text-orange-700 text-sm' : 'text-indigo-600'}`}>
                                            {isCEO ? "The WHOLE DAMN COMPANY" : `${activeTasks.length} Active Tasks`}
                                        </p>
                                        
                                        {/* CEO Real Workload Meter */}
                                        {isCEO && (
                                            <div className="mt-4 bg-white/60 p-3 rounded-lg border border-orange-100">
                                                <div className="flex justify-between items-center text-xs font-bold text-gray-600 mb-1">
                                                    <span>Real Workload Score</span>
                                                    <span>{employee.workloadScore}%</span>
                                                </div>
                                                <WorkloadBar score={employee.workloadScore} isCEO={false} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'work' && (
                            <div className="space-y-6">
                                <div className="bg-white border border-gray-200 rounded-xl p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                                                <LinkIcon size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-800">Portfolio / Personal Site</h3>
                                                <p className="text-sm text-gray-500">Showcase of past work and projects.</p>
                                            </div>
                                        </div>
                                        {isEditing && (
                                            <input 
                                                value={formData.portfolioLink}
                                                onChange={(e) => setFormData({...formData, portfolioLink: e.target.value})}
                                                className="border border-gray-200 rounded px-3 py-1 text-sm w-64"
                                                placeholder="https://..."
                                            />
                                        )}
                                    </div>
                                    {!isEditing && employee.portfolioLink && (
                                        isPlaceholder(employee.portfolioLink) ? (
                                            <span className="text-gray-400 italic text-sm font-medium">{employee.portfolioLink}</span>
                                        ) : (
                                            <a href={employee.portfolioLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm font-medium break-all">
                                                {employee.portfolioLink}
                                            </a>
                                        )
                                    )}
                                </div>

                                <div className="bg-white border border-gray-200 rounded-xl p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
                                                <FileText size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-800">Resume / CV</h3>
                                                <p className="text-sm text-gray-500">Document detailing professional history.</p>
                                            </div>
                                        </div>
                                        {isEditing && (
                                            <input 
                                                value={formData.resumeLink}
                                                onChange={(e) => setFormData({...formData, resumeLink: e.target.value})}
                                                className="border border-gray-200 rounded px-3 py-1 text-sm w-64"
                                                placeholder="https://..."
                                            />
                                        )}
                                    </div>
                                    {!isEditing && employee.resumeLink && (
                                        isPlaceholder(employee.resumeLink) ? (
                                            <span className="text-gray-400 italic text-sm font-medium">{employee.resumeLink}</span>
                                        ) : (
                                            <a href={employee.resumeLink} target="_blank" rel="noreferrer" className="text-orange-600 hover:underline text-sm font-medium break-all">
                                                {employee.resumeLink}
                                            </a>
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-gray-800">Completed Projects & Tasks</h3>
                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                                        {completedTasks.length} Completed
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {completedTasks.length === 0 && (
                                        <p className="text-center text-gray-400 py-10">No completed tasks yet.</p>
                                    )}
                                    {completedTasks.map(task => (
                                        <div key={task.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-gray-800">{task.title}</h4>
                                                    <p className="text-sm text-gray-500 line-clamp-1">{task.description}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(task.completedAt!).toLocaleDateString()}
                                                    </span>
                                                    <div className="flex items-center justify-end gap-1 text-green-600 text-xs font-bold mt-1">
                                                        <CheckCircle2 size={12} /> Done
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    {isEditing && (
                        <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
                            <button 
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition flex items-center gap-2"
                            >
                                <Save size={18} /> Save Profile
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};