import React from 'react';
import { Task } from '../types';
import { CheckCircle2, Calendar, User, Clock, ChevronRight } from 'lucide-react';

interface Props {
  completedTasks: Task[];
  employees: {id: string, name: string}[];
  onSelectTask: (task: Task) => void;
}

export const TaskLogView: React.FC<Props> = ({ completedTasks, employees, onSelectTask }) => {
  const getAssignee = (id: string | null) => employees.find(e => e.id === id)?.name || 'Unassigned';

  const formatDate = (date?: Date | string) => {
    if (!date) return '-';
    // Handle both Date objects and string dates (from JSON parse)
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <CheckCircle2 className="text-green-600" /> 
                Completed Task Logs
            </h2>
            <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                {completedTasks.length} Records
            </span>
        </div>
        
        {completedTasks.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
                <p>No tasks completed yet.</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4">Task Title</th>
                            <th className="px-6 py-4">Assignee</th>
                            <th className="px-6 py-4">Created At</th>
                            <th className="px-6 py-4">Completed At</th>
                            <th className="px-6 py-4">Duration (Est)</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {completedTasks.map(task => (
                            <tr 
                                key={task.id} 
                                onClick={() => onSelectTask(task)}
                                className="hover:bg-indigo-50 transition cursor-pointer group"
                            >
                                <td className="px-6 py-4 font-medium text-gray-900">{task.title}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <User size={14} className="text-indigo-400" />
                                        {getAssignee(task.assignedToId)}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-gray-400" />
                                        {formatDate(task.createdAt)}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-green-700 font-medium">
                                        <CheckCircle2 size={14} />
                                        {formatDate(task.completedAt)}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} className="text-gray-400" />
                                        {task.estimatedHours}h
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <ChevronRight size={16} className="text-gray-300 group-hover:text-indigo-500" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
  );
};