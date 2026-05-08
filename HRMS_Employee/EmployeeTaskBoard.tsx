import React, { useState } from 'react';
import { store, Task } from '../utils/store';
import { useAuth } from '../context/AuthContext';
import { Clock } from 'lucide-react';

const STATUS_CONFIG = {
    pending: { label: 'Pending', color: '#f59e0b', next: 'in_progress' as Task['status'], nextLabel: 'Start Task' },
    in_progress: { label: 'In Progress', color: '#3b82f6', next: 'completed' as Task['status'], nextLabel: 'Mark Complete' },
    completed: { label: 'Completed', color: '#10b981', next: null, nextLabel: '' },
};
const PRIORITY_COLORS: Record<string, string> = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };

interface TaskCardProps {
    task: Task;
    onUpdateStatus: (id: string, status: Task['status']) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdateStatus }) => {
    const cfg = STATUS_CONFIG[task.status];
    const overdue = task.status !== 'completed' && new Date(task.deadline) < new Date();
    return (
        <div className={`rounded-2xl border p-4 ${overdue ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-white'} shadow-sm`}>
            <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-sm text-gray-900">{task.title}</h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white shrink-0" style={{ background: PRIORITY_COLORS[task.priority] }}>{task.priority.toUpperCase()}</span>
            </div>
            {task.description && <p className="text-xs text-gray-500 mb-2">{task.description}</p>}
            <div className="flex items-center gap-2 mb-3">
                <Clock size={11} className={overdue ? 'text-red-500' : 'text-gray-400'} />
                <span className={`text-xs font-semibold ${overdue ? 'text-red-600' : 'text-gray-500'}`}>
                    {overdue ? '⚠ OVERDUE · ' : ''}{task.deadline}
                </span>
            </div>
            <p className="text-xs text-gray-400 mb-3">Assigned by: {task.assignedBy}</p>
            {cfg.next && (
                <button onClick={() => onUpdateStatus(task.id, cfg.next!)} className="w-full py-2 rounded-xl text-xs font-black text-white transition-all hover:shadow-md" style={{ background: cfg.next === 'in_progress' ? '#3b82f6' : '#10b981' }}>
                    {cfg.nextLabel}
                </button>
            )}
        </div>
    );
};

export const EmployeeTaskBoard: React.FC = () => {
    const { user } = useAuth();
    const employee = user ? store.getEmployeeByUserId(user.id) : undefined;
    const [tasks, setTasks] = useState<Task[]>(employee ? store.getTasksByEmployee(employee.id) : []);

    const refresh = () => { if (employee) setTasks(store.getTasksByEmployee(employee.id)); };

    const updateStatus = (id: string, status: Task['status']) => {
        store.updateTaskStatus(id, status);
        refresh();
    };

    const isOverdue = (deadline: string, status: Task['status']) => status !== 'completed' && new Date(deadline) < new Date();

    const pending = tasks.filter(t => t.status === 'pending');
    const inProgress = tasks.filter(t => t.status === 'in_progress');
    const completed = tasks.filter(t => t.status === 'completed');


    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-gray-900">My Task Board</h1>
                <p className="text-gray-500 font-medium mt-1">View and update your assigned tasks.</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {[{ label: 'Pending', count: pending.length, color: '#f59e0b' }, { label: 'In Progress', count: inProgress.length, color: '#3b82f6' }, { label: 'Completed', count: completed.length, color: '#10b981' }].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
                        <div className="w-3 h-10 rounded-full" style={{ background: s.color }} />
                        <div><p className="text-2xl font-black text-gray-900">{s.count}</p><p className="text-xs font-bold text-gray-500">{s.label}</p></div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pending */}
                <div>
                    <h2 className="font-black text-gray-800 mb-3 flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />Pending ({pending.length})</h2>
                    <div className="space-y-3">
                        {pending.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No pending tasks</p>}
                        {pending.map(t => <TaskCard key={t.id} task={t} onUpdateStatus={updateStatus} />)}
                    </div>
                </div>
                {/* In Progress */}
                <div>
                    <h2 className="font-black text-gray-800 mb-3 flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />In Progress ({inProgress.length})</h2>
                    <div className="space-y-3">
                        {inProgress.length === 0 && <p className="text-xs text-gray-400 text-center py-4">Nothing in progress</p>}
                        {inProgress.map(t => <TaskCard key={t.id} task={t} onUpdateStatus={updateStatus} />)}
                    </div>
                </div>
                {/* Completed */}
                <div>
                    <h2 className="font-black text-gray-800 mb-3 flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />Completed ({completed.length})</h2>
                    <div className="space-y-3">
                        {completed.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No completed tasks</p>}
                        {completed.map(t => <TaskCard key={t.id} task={t} onUpdateStatus={updateStatus} />)}
                    </div>
                </div>
            </div>
        </div>
    );
};
