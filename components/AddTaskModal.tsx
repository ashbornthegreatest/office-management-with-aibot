import React, { useState } from 'react';
import { Task, TaskPriority, TaskType } from '../types';
import { X, Users } from 'lucide-react';

interface Props {
  onClose: () => void;
  onAdd: (task: Omit<Task, 'id' | 'createdAt' | 'notes' | 'files' | 'status' | 'progress' | 'assignedToId' | 'groupAssigneeIds'>) => void;
}

export const AddTaskModal: React.FC<Props> = ({ onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [type, setType] = useState<TaskType>(TaskType.OPEN);
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [estimatedHours, setEstimatedHours] = useState(4);
  const [requiredSkills, setRequiredSkills] = useState('');
  
  // Group Task State
  const [isGroupTask, setIsGroupTask] = useState(false);
  const [requiredPeople, setRequiredPeople] = useState(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      title,
      description,
      longDescription: longDescription || description,
      type,
      priority,
      estimatedHours,
      requiredSkills: requiredSkills.split(',').map(s => s.trim()).filter(s => s),
      isGroupTask,
      requiredPeople: isGroupTask ? requiredPeople : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Create New Task</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
            <input 
              required
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Q4 Analysis"
            />
          </div>

          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
             <div className="flex items-center gap-2 mb-3">
                 <input 
                    type="checkbox" 
                    id="isGroup"
                    checked={isGroupTask} 
                    onChange={e => setIsGroupTask(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                 />
                 <label htmlFor="isGroup" className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                    <Users size={16} />
                    This is a Group Project
                 </label>
             </div>
             
             {isGroupTask && (
                 <div className="ml-6">
                    <label className="block text-xs font-bold text-indigo-400 uppercase mb-1">Required Team Size</label>
                    <input 
                        type="number" 
                        min="2" 
                        max="20"
                        value={requiredPeople}
                        onChange={e => setRequiredPeople(Number(e.target.value))}
                        className="w-full border border-indigo-200 rounded-lg p-2 text-sm focus:outline-none focus:border-indigo-500"
                    />
                 </div>
             )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                <select 
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={type}
                    onChange={e => setType(e.target.value as TaskType)}
                >
                    <option value={TaskType.OPEN}>Open / Voluntary</option>
                    <option value={TaskType.MANDATORY}>Mandatory</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Priority</label>
                <select 
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={priority}
                    onChange={e => setPriority(e.target.value as TaskPriority)}
                >
                    {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Short Description</label>
             <input 
                required
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Brief summary for the card view"
            />
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Detailed Description</label>
             <textarea 
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                rows={3}
                value={longDescription}
                onChange={e => setLongDescription(e.target.value)}
                placeholder="Full details, goals, and context..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Est. Hours</label>
                <input 
                    type="number"
                    min="1"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={estimatedHours}
                    onChange={e => setEstimatedHours(Number(e.target.value))}
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Skills (comma separated)</label>
                <input 
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={requiredSkills}
                    onChange={e => setRequiredSkills(e.target.value)}
                    placeholder="React, Design, Excel..."
                />
            </div>
          </div>

          <div className="pt-4">
             <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl shadow hover:bg-indigo-700 transition">
                Create {isGroupTask ? 'Team Project' : 'Task'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};