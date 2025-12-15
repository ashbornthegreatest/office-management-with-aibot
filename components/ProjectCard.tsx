import React from 'react';
import { Task, TaskPriority, TaskType, Employee } from '../types';
import { Users, UserPlus, UserMinus, Clock, Briefcase } from 'lucide-react';

interface Props {
  task: Task;
  employees: Employee[];
  currentUserId: string; // To check if joined
  userRole: 'admin' | 'employee';
  onToggleMembership: (taskId: string) => void;
  onClick: (task: Task) => void;
}

export const ProjectCard: React.FC<Props> = ({ task, employees, currentUserId, userRole, onToggleMembership, onClick }) => {
  const currentMembers = task.groupAssigneeIds || [];
  const required = task.requiredPeople || 1;
  const isMember = currentMembers.includes(currentUserId);
  const isFull = currentMembers.length >= required;
  const isMandatory = task.type === TaskType.MANDATORY;

  const priorityColor = {
    [TaskPriority.LOW]: 'text-gray-500 bg-gray-100',
    [TaskPriority.MEDIUM]: 'text-blue-600 bg-blue-100',
    [TaskPriority.HIGH]: 'text-orange-600 bg-orange-100',
    [TaskPriority.CRITICAL]: 'text-red-600 bg-red-100',
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    onClick(task);
  };

  return (
    <div 
        onClick={handleCardClick}
        className={`p-5 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition cursor-pointer relative overflow-hidden group`}
    >
      {/* Background Accent */}
      <div className={`absolute top-0 left-0 w-1 h-full ${isMandatory ? 'bg-indigo-500' : 'bg-teal-400'}`}></div>

      <div className="flex justify-between items-start mb-3 pl-2">
        <div className="flex gap-2">
            <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide ${isMandatory ? 'bg-indigo-50 text-indigo-700' : 'bg-teal-50 text-teal-700'}`}>
            {isMandatory ? 'Mandatory Team' : 'Voluntary Squad'}
            </span>
            <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${priorityColor[task.priority]}`}>
            {task.priority}
            </span>
        </div>
        <div className="flex items-center gap-1 text-gray-400 text-xs">
            <Clock size={12} />
            <span>{task.estimatedHours}h Total</span>
        </div>
      </div>

      <div className="pl-2 mb-4">
        <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <Briefcase size={18} className="text-gray-400" />
            {task.title}
        </h3>
        <p className="text-gray-500 text-sm mt-1 line-clamp-2">{task.description}</p>
      </div>

      {/* Progress & Members */}
      <div className="bg-gray-50 rounded-lg p-3 ml-2">
        <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Team Composition</span>
            <span className={`text-xs font-bold ${currentMembers.length >= required ? 'text-green-600' : 'text-indigo-600'}`}>
                {currentMembers.length} / {required} Members
            </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
            <div 
                className={`h-1.5 rounded-full transition-all duration-500 ${isFull ? 'bg-green-500' : 'bg-indigo-500'}`} 
                style={{ width: `${Math.min(100, (currentMembers.length / required) * 100)}%` }}
            ></div>
        </div>

        <div className="flex items-center justify-between">
            <div className="flex -space-x-2 overflow-hidden">
                {currentMembers.map((memberId, i) => {
                    const emp = employees.find(e => e.id === memberId);
                    if (!emp) return null;
                    return (
                        <img 
                            key={memberId} 
                            src={emp.avatar} 
                            alt={emp.name} 
                            title={emp.name}
                            className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover" 
                        />
                    );
                })}
                {Array.from({ length: Math.max(0, required - currentMembers.length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <Users size={10} className="text-gray-400" />
                    </div>
                ))}
            </div>

            {userRole === 'employee' && (
                <button
                    onClick={() => onToggleMembership(task.id)}
                    disabled={!isMember && isFull}
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition ${
                        isMember 
                            ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                            : isFull 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                >
                    {isMember ? (
                        <>
                            <UserMinus size={12} /> Leave
                        </>
                    ) : isFull ? (
                        <span>Full</span>
                    ) : (
                        <>
                            <UserPlus size={12} /> Join
                        </>
                    )}
                </button>
            )}
        </div>
      </div>
    </div>
  );
};