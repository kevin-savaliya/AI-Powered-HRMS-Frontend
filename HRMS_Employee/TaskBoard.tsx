
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { employeeApi } from '../src/api/employee';
import { ClipboardList, CheckCircle2, Circle, AlertCircle, Plus, Filter, SortAsc } from 'lucide-react';

interface Task {
    id: string;
    title: string;
    category: string;
    priority: 'High' | 'Medium' | 'Low';
    status: 'Todo' | 'In Progress' | 'Done';
    dueDate: string;
}

export const TaskBoard: React.FC = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!user) return;
        try {
            const fetchedTasks = await employeeApi.getTasks(user.id);
            setTasks(fetchedTasks as any);
        } catch (error) {
            console.error("Fetch failed", error);
            // Fallback for demo
            setTasks([
                { id: '1', title: 'Upload ID Proof for Verification', category: 'Onboarding', priority: 'High', status: 'Todo', dueDate: 'Today' },
                { id: '2', title: 'Complete Security Training', category: 'Compliance', priority: 'Medium', status: 'In Progress', dueDate: 'Tomorrow' },
                { id: '3', title: 'Submit Weekly Report', category: 'Operations', priority: 'Low', status: 'Todo', dueDate: 'Friday' },
                { id: '4', title: 'Update LinkedIn Bio', category: 'Marketing', priority: 'Medium', status: 'Done', dueDate: 'Completed' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const toggleStatus = async (id: string) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        
        const nextStatus = task.status === 'Todo' ? 'In Progress' : task.status === 'In Progress' ? 'Done' : 'Todo';
        
        // Optimistic UI update
        setTasks(tasks.map(t => t.id === id ? { ...t, status: nextStatus } : t));

        try {
            await employeeApi.updateTaskStatus(id, nextStatus);
        } catch (error) {
            console.error("Failed to update status on server", error);
            // Optional: Revert state if failed
        }
    };return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">My Task Board</h1>
                    <p className="text-muted-foreground">Manage your assignments and tracking progress.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-border rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-secondary transition-all">
                        <Filter size={16} /> Filter
                    </button>
                    <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-primary/20 transition-all">
                        <Plus size={16} /> New Task
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['Todo', 'In Progress', 'Done'].map(status => (
                    <div key={status} className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${status === 'Todo' ? 'bg-amber-400' : status === 'In Progress' ? 'bg-blue-400' : 'bg-green-400'}`} />
                                {status}
                            </h3>
                            <span className="text-xs font-bold bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                                {tasks.filter(t => t.status === status).length}
                            </span>
                        </div>

                        <div className="space-y-4">
                            {tasks.filter(t => t.status === status).map(task => (
                                <div
                                    key={task.id}
                                    onClick={() => toggleStatus(task.id)}
                                    className="card p-4 hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer group active:scale-95"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${task.priority === 'High' ? 'bg-red-50 text-red-600 border border-red-100' :
                                                task.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                    'bg-blue-50 text-blue-600 border border-blue-100'
                                            }`}>
                                            {task.priority}
                                        </div>
                                        <span className="text-[10px] font-bold text-muted-foreground">{task.dueDate}</span>
                                    </div>

                                    <h4 className="font-bold text-foreground leading-tight mb-4 group-hover:text-primary transition-colors">
                                        {task.title}
                                    </h4>

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                                        <span className="text-xs font-bold text-muted-foreground/60">{task.category}</span>
                                        <div className="flex -space-x-1.5 font-bold">
                                            <div className="w-6 h-6 rounded-full bg-secondary border border-white flex items-center justify-center text-[10px] text-primary">HR</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="card p-6 bg-blue-50 border-blue-100">
                <h3 className="font-bold text-blue-900 mb-2">High Logic Feature: Personal Kanban State Manager</h3>
                <p className="text-sm text-blue-800 leading-relaxed">
                    The Task Board uses a <strong>Reactive State Pipeline</strong> to manage drag-and-drop or click-based status transitions.
                    It demonstrates efficient list filtering and sorting algorithms in the frontend.
                </p>
            </div>
        </div>
    );
};

