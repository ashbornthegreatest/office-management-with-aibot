import React from 'react';
import { Task, TaskType, TaskPriority } from '../types';
import { Clock, User } from 'lucide-react';

interface Props {
  task: Task;
  assigneeName?: string;
  onAssign?: (taskId: string) => void;
  onClick?: (task: Task) => void;
  showActions: boolean;
}

export const TaskCard: React.FC<Props> = ({ task, assigneeName, onAssign, onClick, showActions }) => {
  const isMandatory = task.type === TaskType.MANDATORY;

  const priorityColor = {
    [TaskPriority.LOW]: 'text-gray-500 bg-gray-100',
    [TaskPriority.MEDIUM]: 'text-blue-600 bg-blue-100',
    [TaskPriority.HIGH]: 'text-orange-600 bg-orange-100',
    [TaskPriority.CRITICAL]: 'text-red-600 bg-red-100',
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent click when clicking buttons inside the card
    if ((e.target as HTMLElement).closest('button')) return;
    onClick && onClick(task);
  };

  return (
    <div 
        onClick={handleCardClick}
        className={`p-4 rounded-lg border-l-4 shadow-sm bg-white mb-3 transition hover:shadow-md cursor-pointer group ${isMandatory ? 'border-l-indigo-500' : 'border-l-teal-400'}`}
    >
      <div className="flex justify-between items-start">
        <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide ${isMandatory ? 'bg-indigo-50 text-indigo-700' : 'bg-teal-50 text-teal-700'}`}>
          {isMandatory ? 'Mandatory' : 'Open / Voluntary'}
        </span>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColor[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      <h3 className="font-semibold text-gray-800 mt-2 text-lg group-hover:text-indigo-600 transition-colors">{task.title}</h3>
      <p className="text-gray-500 text-sm mt-1 line-clamp-2">{task.description}</p>
      
      {/* Progress Bar Mini */}
      {task.progress > 0 && (
        <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${task.progress}%` }}></div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <div className="flex gap-3">
            <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{task.estimatedHours}h</span>
            </div>
            {assigneeName ? (
                 <div className="flex items-center gap-1 text-indigo-600 font-medium">
                 <User size={14} />
                 <span>{assigneeName}</span>
             </div>
            ) : (
                <div className="flex items-center gap-1 text-teal-600 italic">
                    <User size={14} />
                    <span>Unassigned</span>
                </div>
            )}
        </div>
        
        {showActions && !assigneeName && (
            <button 
                onClick={() => onAssign && onAssign(task.id)}
                className="bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700 transition"
            >
                Take Task
            </button>
        )}
      </div>
      
      <div className="mt-2 flex flex-wrap gap-1">
          {task.requiredSkills.map(skill => (
              <span key={skill} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                  {skill}
              </span>
          ))}
      </div>
    </div>
  );
};