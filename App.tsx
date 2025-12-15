import React, { useState, useEffect } from 'react';
import { INITIAL_EMPLOYEES, INITIAL_TASKS, INITIAL_PRODUCTS } from './constants';
import { Employee, Task, TaskType, Product } from './types';
import { TaskCard } from './components/TaskCard';
import { WorkloadBar } from './components/WorkloadBar';
import { AIPanel } from './components/AIPanel';
import { TaskDetailModal } from './components/TaskDetailModal';
import { AddTaskModal } from './components/AddTaskModal';
import { TaskLogView } from './components/TaskLogView';
import { ProjectCard } from './components/ProjectCard';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CompanyDashboard } from './components/CompanyDashboard';
import { LoginPage } from './components/LoginPage';
import { ProfileModal } from './components/ProfileModal';
import { 
    LayoutDashboard, 
    Users, 
    BrainCircuit, 
    ChevronLeft, 
    ChevronRight, 
    Settings, 
    X,
    Sparkles,
    Plus,
    ClipboardList,
    Briefcase,
    Bot,
    Package,
    PieChart,
    LogOut,
    User
} from 'lucide-react';

export default function App() {
  // --- STATE INITIALIZATION WITH LOCAL STORAGE ---
  const [employees, setEmployees] = useState<Employee[]>(() => {
      const saved = localStorage.getItem('neuroWork_employees');
      return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
      const saved = localStorage.getItem('neuroWork_tasks');
      if (saved) {
          const parsed = JSON.parse(saved);
          return parsed.map((t: any) => ({
              ...t,
              createdAt: new Date(t.createdAt),
              completedAt: t.completedAt ? new Date(t.completedAt) : undefined
          }));
      }
      return INITIAL_TASKS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
      const saved = localStorage.getItem('neuroWork_products');
      if (saved) {
          const parsed = JSON.parse(saved);
          return parsed.map((p: any) => ({
              ...p,
              devComments: p.devComments?.map((c: any) => ({ ...c, timestamp: new Date(c.timestamp) })) || [],
              serverLogs: p.serverLogs?.map((l: any) => ({ ...l, date: new Date(l.date) })) || [],
              bugReports: p.bugReports?.map((b: any) => ({ ...b, date: new Date(b.date) })) || []
          }));
      }
      return INITIAL_PRODUCTS;
  });

  // --- AUTH STATE ---
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);

  // --- PERSISTENCE EFFECTS ---
  useEffect(() => {
      localStorage.setItem('neuroWork_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
      localStorage.setItem('neuroWork_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
      localStorage.setItem('neuroWork_products', JSON.stringify(products));
  }, [products]);


  // --- VIEW STATE ---
  const [activeView, setActiveView] = useState<'board' | 'team' | 'logs' | 'projects' | 'products' | 'company'>('board');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(true);
  
  // Modal States
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Employee | null>(null);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  // --- HANDLERS ---

  const handleLogin = (employee: Employee) => {
      setCurrentUser(employee);
  };

  const handleLogout = () => {
      setCurrentUser(null);
      setActiveView('board');
  };

  const getAssigneeName = (id: string | null) => {
    if (!id) return undefined;
    return employees.find(e => e.id === id)?.name;
  };

  const handleAssignTask = (taskId: string) => {
    if (!currentUser) return;

    // CEO and Manager can't "Take" tasks via this button usually, but let's allow it for simplicity or restrict it
    // if (currentUser.accessLevel !== 'employee') return; 

    const task = tasks.find(t => t.id === taskId);
    
    if (task && !task.isGroupTask) {
      // Update Task
      const updatedTasks = tasks.map(t => 
        t.id === taskId ? { ...t, assignedToId: currentUser.id } : t
      );
      setTasks(updatedTasks);

      // Update Employee Workload
      updateEmployeeWorkload(currentUser.id, task.estimatedHours);
    }
  };

  const handleToggleGroupMembership = (taskId: string) => {
      if (!currentUser) return;
      const myId = currentUser.id;
      const task = tasks.find(t => t.id === taskId);
      
      if (task && task.isGroupTask) {
          const currentMembers = task.groupAssigneeIds || [];
          const isMember = currentMembers.includes(myId);
          let newMembers = [];

          if (isMember) {
              newMembers = currentMembers.filter(id => id !== myId);
          } else {
              if (currentMembers.length >= (task.requiredPeople || 1)) return;
              newMembers = [...currentMembers, myId];
              updateEmployeeWorkload(myId, task.estimatedHours / (task.requiredPeople || 1));
          }

          const updatedTasks = tasks.map(t => 
            t.id === taskId ? { ...t, groupAssigneeIds: newMembers } : t
          );
          setTasks(updatedTasks);
      }
  };

  const updateEmployeeWorkload = (empId: string, hoursToAdd: number) => {
    const updatedEmployees = employees.map(e => {
        if (e.id === empId) {
            // We do not cap updates anymore, real workload is tracked.
            const newScore = Math.min(100, e.workloadScore + (hoursToAdd * 2));
            const newStatus = newScore > 80 ? 'OVERLOADED' : 'OPTIMAL';
            
            // For CEO, keep the meme status if it's there, but update the score logic underneath
            const finalStatus = e.accessLevel === 'ceo' ? e.status : newStatus;

            return { 
                ...e, 
                workloadScore: newScore,
                status: finalStatus
            } as Employee;
        }
        return e;
    });
    setEmployees(updatedEmployees);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    if (selectedTask?.id === updatedTask.id) {
        setSelectedTask(updatedTask);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setSelectedTask(null);
  };

  const handleAddTask = (newTaskData: any) => {
    const newTask: Task = {
        id: `t_${Date.now()}`,
        ...newTaskData,
        assignedToId: null,
        groupAssigneeIds: [],
        status: 'PENDING',
        progress: 0,
        createdAt: new Date(),
        notes: [],
        files: []
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      if (selectedProduct?.id === updatedProduct.id) {
          setSelectedProduct(updatedProduct);
      }
  };

  const handleUpdateEmployee = (updatedEmployee: Employee) => {
      setEmployees(prev => prev.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
      if (selectedProfile?.id === updatedEmployee.id) {
          setSelectedProfile(updatedEmployee);
      }
      if (currentUser?.id === updatedEmployee.id) {
          setCurrentUser(updatedEmployee);
      }
  };

  // Filter tasks
  const activeTasks = tasks.filter(t => t.status !== 'COMPLETED');
  const individualTasks = activeTasks.filter(t => !t.isGroupTask);
  const groupTasks = activeTasks.filter(t => t.isGroupTask);
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').sort((a,b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0));

  // --- RENDER LOGIN IF NO USER ---
  if (!currentUser) {
      return <LoginPage employees={employees} onLogin={handleLogin} />;
  }

  // --- RENDER APP ---
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-900 font-sans">
      
      {/* Sidebar Navigation */}
      <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 transition-all duration-300 relative`}>
        <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-3 top-8 bg-indigo-600 text-white p-1 rounded-full shadow-lg border border-slate-800 z-10 hover:bg-indigo-500"
        >
            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className={`p-6 flex items-center gap-3 text-white ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}>
          <div className="bg-indigo-600 p-2 rounded-lg flex-shrink-0">
             <BrainCircuit size={24} />
          </div>
          {!isSidebarCollapsed && (
             <span className="font-bold text-xl tracking-tight whitespace-nowrap overflow-hidden">NeuroWork</span>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button 
            onClick={() => setActiveView('board')}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition ${activeView === 'board' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
            title="Task Board"
          >
            <LayoutDashboard size={18} />
            {!isSidebarCollapsed && <span>Task Board</span>}
          </button>
          
          <button 
             onClick={() => setActiveView('projects')}
             className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition ${activeView === 'projects' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
             title="Team Projects"
          >
            <Briefcase size={18} />
            {!isSidebarCollapsed && <span>Team Projects</span>}
          </button>

          <button 
             onClick={() => setActiveView('products')}
             className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition ${activeView === 'products' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
             title="Products & Analytics"
          >
            <Package size={18} />
            {!isSidebarCollapsed && <span>Products</span>}
          </button>
          
          <button 
             onClick={() => setActiveView('company')}
             className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition ${activeView === 'company' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
             title="Company Stats"
          >
            <PieChart size={18} />
            {!isSidebarCollapsed && <span>Company Stats</span>}
          </button>

          <button 
             onClick={() => setActiveView('team')}
             className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition ${activeView === 'team' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
             title="Team Capacity"
          >
            <Users size={18} />
            {!isSidebarCollapsed && <span>Team Capacity</span>}
          </button>
          
          <button 
             onClick={() => setActiveView('logs')}
             className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition ${activeView === 'logs' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
             title="Task Logs"
          >
            <ClipboardList size={18} />
            {!isSidebarCollapsed && <span>Task Logs</span>}
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
             <button 
                onClick={() => setIsSettingsOpen(true)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition hover:bg-slate-800 text-slate-400 ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                title="Settings"
             >
                <Settings size={18} />
                {!isSidebarCollapsed && <span>Settings</span>}
             </button>
             <button 
                onClick={handleLogout}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition hover:bg-red-900/30 text-red-400 ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                title="Logout"
             >
                <LogOut size={18} />
                {!isSidebarCollapsed && <span>Logout</span>}
             </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10">
          <h1 className="text-xl font-bold text-gray-800">
            {activeView === 'board' ? 'Task Distribution Center' : 
             activeView === 'projects' ? 'Team Projects & Squads' : 
             activeView === 'products' ? 'Product Portfolio' :
             activeView === 'company' ? 'Company Performance' :
             activeView === 'team' ? 'Workforce Analytics' : 'System Logs'}
          </h1>
          <div className="flex items-center gap-4">
            
            {(currentUser.accessLevel === 'ceo' || currentUser.accessLevel === 'manager') && (activeView === 'board' || activeView === 'projects') && (
                <button 
                    onClick={() => setIsAddTaskOpen(true)}
                    className="flex items-center gap-2 text-sm font-bold text-white bg-indigo-600 px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition shadow-sm"
                >
                    <Plus size={16} />
                    New {activeView === 'projects' ? 'Project' : 'Task'}
                </button>
            )}

            <div 
                onClick={() => setSelectedProfile(currentUser)}
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition"
            >
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-gray-800">{currentUser.name}</p>
                    <p className="text-xs text-gray-500 uppercase font-bold">{currentUser.role}</p>
                </div>
                <img 
                    src={currentUser.avatar} 
                    alt="User" 
                    className="w-10 h-10 rounded-full border-2 border-indigo-100"
                />
            </div>
          </div>
        </header>

        {/* Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto p-8">
            {activeView === 'board' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
                    {/* Mandatory Tasks Column */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-8 bg-indigo-500 rounded-full"></div>
                            <h2 className="text-lg font-bold text-gray-700">Mandatory Assignments</h2>
                            <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
                                AI Assigned
                            </span>
                        </div>
                        <div className="space-y-4">
                            {individualTasks.filter(t => t.type === TaskType.MANDATORY).map(task => (
                                <TaskCard 
                                    key={task.id} 
                                    task={task} 
                                    assigneeName={getAssigneeName(task.assignedToId)} 
                                    showActions={false}
                                    onClick={(t) => setSelectedTask(t)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Open Tasks Column */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-8 bg-teal-400 rounded-full"></div>
                            <h2 className="text-lg font-bold text-gray-700">Open / Voluntary</h2>
                            <span className="text-xs bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full font-bold">
                                Free to take
                            </span>
                        </div>
                        <div className="space-y-4">
                            {individualTasks.filter(t => t.type === TaskType.OPEN).map(task => (
                                <TaskCard 
                                    key={task.id} 
                                    task={task} 
                                    assigneeName={getAssigneeName(task.assignedToId)} 
                                    onAssign={handleAssignTask}
                                    showActions={currentUser.accessLevel === 'employee'}
                                    onClick={(t) => setSelectedTask(t)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeView === 'projects' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {groupTasks.map(task => (
                        <ProjectCard 
                            key={task.id}
                            task={task}
                            employees={employees}
                            currentUserId={currentUser.id}
                            userRole={currentUser.accessLevel === 'employee' ? 'employee' : 'admin'}
                            onToggleMembership={handleToggleGroupMembership}
                            onClick={(t) => setSelectedTask(t)}
                        />
                    ))}
                    {groupTasks.length === 0 && (
                        <div className="col-span-full text-center py-20 text-gray-400">
                            <Briefcase size={48} className="mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No active team projects.</p>
                            {(currentUser.accessLevel === 'ceo' || currentUser.accessLevel === 'manager') && <p className="text-sm">Create one to get started.</p>}
                        </div>
                    )}
                </div>
            )}

            {activeView === 'products' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {products.map(product => (
                        <ProductCard 
                            key={product.id}
                            product={product}
                            onClick={(p) => setSelectedProduct(p)}
                        />
                    ))}
                </div>
            )}

            {activeView === 'company' && (
                <CompanyDashboard 
                    products={products} 
                    employees={employees}
                    onViewProfile={(emp) => setSelectedProfile(emp)}
                />
            )}

            {activeView === 'team' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {employees.map(emp => (
                        <div 
                            key={emp.id} 
                            onClick={() => setSelectedProfile(emp)}
                            className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start gap-4 cursor-pointer hover:shadow-md transition group"
                        >
                            <img src={emp.avatar} alt={emp.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <h3 className="font-bold text-gray-800 group-hover:text-indigo-600 transition">{emp.name}</h3>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                                        emp.status === 'OVERLOADED' ? 'bg-red-50 text-red-600' : 
                                        emp.status === 'UNDERUTILIZED' ? 'bg-blue-50 text-blue-600' : 
                                        emp.accessLevel === 'ceo' ? 'bg-yellow-100 text-yellow-700 animate-pulse' :
                                        'bg-green-50 text-green-600'
                                    }`}>
                                        {emp.status}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mb-3">{emp.role}</p>
                                
                                <div className="mb-2 flex justify-between text-xs font-medium text-gray-600">
                                    <span>Current Load</span>
                                    <span>{emp.accessLevel === 'ceo' ? 'MAX' : `${emp.workloadScore}%`}</span>
                                </div>
                                <WorkloadBar score={emp.workloadScore} isCEO={emp.accessLevel === 'ceo'} />

                                <div className="mt-4">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Skills</p>
                                    <div className="flex flex-wrap gap-1">
                                        {emp.skills.map(skill => (
                                            <span key={skill} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeView === 'logs' && (
                <TaskLogView 
                    completedTasks={completedTasks} 
                    employees={employees} 
                    onSelectTask={(t) => setSelectedTask(t)}
                />
            )}
        </div>

        {/* Floating Action Button for AI Assistant */}
        <button
            onClick={() => setIsAIPanelOpen(!isAIPanelOpen)}
            className={`absolute bottom-6 right-6 p-4 rounded-full shadow-2xl z-40 transition-all duration-300 hover:scale-110 ${
                isAIPanelOpen ? 'bg-gray-200 text-gray-600 rotate-90 opacity-0 pointer-events-none' : 'bg-indigo-600 text-white opacity-100'
            }`}
            title="Open AI Assistant"
        >
            <Bot size={28} />
        </button>

        {/* Settings Modal Overlay */}
        {isSettingsOpen && (
            <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <div className="flex items-center gap-2">
                            <Settings className="text-gray-500" size={18} />
                            <h3 className="font-bold text-gray-800">System Settings</h3>
                        </div>
                        <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="p-6">
                         <div className="mb-6">
                            <label className="text-xs uppercase font-bold text-gray-400 mb-3 block">Data Management</label>
                            <button 
                                onClick={() => {
                                    if(window.confirm('Are you sure? This will delete all local changes and reset to default.')) {
                                        localStorage.clear();
                                        window.location.reload();
                                    }
                                }}
                                className="w-full border border-red-200 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition"
                            >
                                Reset All Data
                            </button>
                         </div>
                        
                        <div className="pt-4 border-t border-gray-100 flex justify-end">
                            <button 
                                onClick={() => setIsSettingsOpen(false)}
                                className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Task Detail Modal */}
        {selectedTask && (
            <TaskDetailModal 
                task={selectedTask}
                role={currentUser.accessLevel === 'employee' ? 'employee' : 'admin'}
                assigneeName={getAssigneeName(selectedTask.assignedToId)}
                allEmployees={employees}
                onClose={() => setSelectedTask(null)}
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
            />
        )}

        {/* Product Detail Modal (Full Screen) */}
        {selectedProduct && (
            <ProductDetailModal 
                product={selectedProduct}
                role={currentUser.accessLevel === 'employee' ? 'employee' : 'admin'}
                onClose={() => setSelectedProduct(null)}
                onUpdate={handleUpdateProduct}
            />
        )}

        {/* Profile Modal */}
        {selectedProfile && (
            <ProfileModal 
                employee={selectedProfile}
                currentUser={currentUser}
                allTasks={tasks}
                onClose={() => setSelectedProfile(null)}
                onUpdate={handleUpdateEmployee}
            />
        )}

        {/* Add Task Modal */}
        {isAddTaskOpen && (
            <AddTaskModal 
                onClose={() => setIsAddTaskOpen(false)}
                onAdd={handleAddTask}
            />
        )}

      </main>

      {/* Right AI Panel */}
      {isAIPanelOpen && (
        <aside className="w-80 lg:w-96 flex-shrink-0 shadow-xl z-20 animate-in slide-in-from-right duration-300">
            <AIPanel 
                employees={employees} 
                tasks={activeTasks} // Feed all active tasks (including projects) to AI
                currentUser={currentUser.accessLevel === 'employee' ? 'employee' : 'admin'} 
                onClose={() => setIsAIPanelOpen(false)}
            />
        </aside>
      )}
    </div>
  );
}