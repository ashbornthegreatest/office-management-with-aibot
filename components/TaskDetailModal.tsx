import React, { useState } from 'react';
import { Task, TaskPriority, TaskType, Employee } from '../types';
import { X, Calendar, Clock, Paperclip, CheckCircle, Trash2, Send, User, Users } from 'lucide-react';

interface Props {
  task: Task;
  role: 'admin' | 'employee';
  onClose: () => void;
  onUpdate: (updatedTask: Task) => void;
  onDelete: (taskId: string) => void;
  assigneeName?: string;
  allEmployees?: Employee[];
}

export const TaskDetailModal: React.FC<Props> = ({ task, role, onClose, onUpdate, onDelete, assigneeName, allEmployees }) => {
  const [notes, setNotes] = useState('');
  const [newFile, setNewFile] = useState('');
  
  // Local state for edits
  const [progress, setProgress] = useState(task.progress);
  const [longDesc, setLongDesc] = useState(task.longDescription || task.description);

  const handleAddNote = () => {
    if (!notes.trim()) return;
    const updated = {
      ...task,
      notes: [...task.notes, `${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}: ${notes}`]
    };
    onUpdate(updated);
    setNotes('');
  };

  const handleAddFile = () => {
    if (!newFile.trim()) return;
    const updated = {
      ...task,
      files: [...task.files, newFile]
    };
    onUpdate(updated);
    setNewFile('');
  };

  const handleSaveProgress = () => {
    const isCompleted = progress === 100;
    const updated = {
      ...task,
      progress: progress,
      longDescription: longDesc,
      status: isCompleted ? 'COMPLETED' : (progress > 0 ? 'IN_PROGRESS' : 'PENDING'),
      completedAt: isCompleted && !task.completedAt ? new Date() : (isCompleted ? task.completedAt : undefined)
    } as Task;
    onUpdate(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide ${task.type === TaskType.MANDATORY ? 'bg-indigo-50 text-indigo-700' : 'bg-teal-50 text-teal-700'}`}>
                    {task.type} {task.isGroupTask ? 'PROJECT' : 'TASK'}
                </span>
                <span className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-500 font-bold uppercase">
                    {task.priority} Priority
                </span>
                {task.status === 'COMPLETED' && (
                    <span className="text-[10px] px-2 py-1 rounded-full bg-green-100 text-green-700 font-bold uppercase flex items-center gap-1">
                        <CheckCircle size={10} /> Completed
                    </span>
                )}
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{task.title}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 bg-gray-50 rounded-full">
            <X size={24} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* Meta Info */}
            <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                    {task.isGroupTask ? (
                        <>
                            <Users size={16} className="text-indigo-500" />
                            <span className="font-medium text-gray-900">
                                {task.groupAssigneeIds?.length || 0} / {task.requiredPeople} Members
                            </span>
                        </>
                    ) : (
                        <>
                            <User size={16} className="text-indigo-500" />
                            <span className="font-medium text-gray-900">{assigneeName || 'Unassigned'}</span>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>Est: {task.estimatedHours}h</span>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                </div>
            </div>

            {/* Group Members List (If Group Task) */}
            {task.isGroupTask && task.groupAssigneeIds && task.groupAssigneeIds.length > 0 && allEmployees && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Active Team Members</h3>
                    <div className="flex flex-wrap gap-2">
                        {task.groupAssigneeIds.map(id => {
                            const emp = allEmployees.find(e => e.id === id);
                            if (!emp) return null;
                            return (
                                <div key={id} className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">
                                    <img src={emp.avatar} alt={emp.name} className="w-5 h-5 rounded-full" />
                                    <span className="text-xs font-medium text-gray-700">{emp.name}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Description */}
            <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Detailed Description</h3>
                {role === 'admin' ? (
                    <textarea 
                        className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        rows={4}
                        value={longDesc}
                        onChange={(e) => setLongDesc(e.target.value)}
                    />
                ) : (
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{longDesc}</p>
                )}
            </div>

            {/* Files & Resources */}
            <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Paperclip size={14} /> Attached Files
                </h3>
                <div className="flex flex-wrap gap-2 mb-2">
                    {task.files.length === 0 && <span className="text-xs text-gray-400 italic">No files attached</span>}
                    {task.files.map((file, i) => (
                        <span key={i} className="bg-indigo-50 text-indigo-700 text-xs px-3 py-1.5 rounded-lg border border-indigo-100 flex items-center gap-1">
                            {file}
                        </span>
                    ))}
                </div>
                {role === 'admin' && (
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Add file name..." 
                            className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none"
                            value={newFile}
                            onChange={(e) => setNewFile(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddFile()}
                        />
                        <button onClick={handleAddFile} className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">Add</button>
                    </div>
                )}
            </div>

            {/* Progress & Status */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-bold text-gray-700">Project Progress</h3>
                    <span className="text-sm font-bold text-indigo-600">{progress}%</span>
                </div>
                <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={progress} 
                    onChange={(e) => setProgress(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
            </div>

            {/* Logs / Notes */}
            <div>
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Project Log & Notes</h3>
                 <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-2">
                    {task.notes.length === 0 && <p className="text-xs text-gray-400">No logs yet.</p>}
                    {task.notes.map((note, idx) => (
                        <div key={idx} className="text-xs bg-white border border-gray-100 p-2 rounded text-gray-600">
                            {note}
                        </div>
                    ))}
                 </div>
                 <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                        placeholder="Add a log entry..."
                        className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <button onClick={handleAddNote} className="bg-gray-100 text-gray-600 p-2 rounded-lg hover:bg-gray-200">
                        <Send size={16} />
                    </button>
                 </div>
            </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 flex justify-between bg-gray-50 rounded-b-2xl">
            {role === 'admin' ? (
                <button 
                    onClick={() => { onDelete(task.id); onClose(); }}
                    className="text-red-500 text-sm font-medium flex items-center gap-1 hover:bg-red-50 px-3 py-2 rounded-lg transition"
                >
                    <Trash2 size={16} /> Delete Task
                </button>
            ) : <div></div>}
            
            <div className="flex gap-3">
                <button onClick={onClose} className="text-gray-600 text-sm font-medium px-4 py-2 hover:bg-gray-200 rounded-lg transition">
                    Cancel
                </button>
                <button 
                    onClick={handleSaveProgress}
                    className="bg-indigo-600 text-white text-sm font-bold px-6 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition flex items-center gap-2"
                >
                    {progress === 100 ? 'Mark Completed' : 'Save Changes'}
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};