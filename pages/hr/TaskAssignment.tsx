import React, { useState, useEffect } from 'react';
import { store, Task, Employee, HRMSUser } from '../../utils/store';
import { useAuth } from '../../context/AuthContext';
import { CheckSquare, Plus, Trash2, Clock, AlertCircle, CheckCircle2, X } from 'lucide-react';

const PRIORITY_COLORS: Record<string, string> = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };
const STATUS_COLORS: Record<string, string> = { pending: '#6366f1', in_progress: '#f59e0b', completed: '#10b981' };

export const TaskAssignment: React.FC = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [users, setUsers] = useState<HRMSUser[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [deadline, setDeadline] = useState('');
    const [success, setSuccess] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const loadData = () => {
        store.init();
        setTasks(store.getTasks());
        setEmployees(store.getEmployees());
        setUsers(store.getUsers());
    };

    useEffect(() => { loadData(); }, []);

    const getEmployeeName = (empId: string) => employees.find(e => e.id === empId)?.name ?? users.find(u => u.id === empId)?.name ?? 'Unknown';

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !assignedTo || !deadline) return;
        const emp = employees.find(e => e.id === assignedTo);
        store.createTask({
            title: title.trim(),
            description,
            assignedTo,
            assignedToName: emp?.name ?? getEmployeeName(assignedTo),
            assignedBy: user?.name ?? 'HR',
            priority,
            deadline,
            status: 'pending',
        });
        setTitle(''); setDescription(''); setAssignedTo(''); setDeadline('');
        setSuccess('Task assigned successfully!');
        setShowForm(false);
        loadData();
        setTimeout(() => setSuccess(null), 3000);
    };

    const handleStatusUpdate = (id: string, status: Task['status']) => {
        store.updateTaskStatus(id, status);
        loadData();
    };

    const handleDelete = (id: string) => {
        store.deleteTask(id);
        loadData();
    };

    const filteredTasks = filterStatus === 'all' ? tasks : tasks.filter(t => t.status === filterStatus);
    const assignableUsers = [
        ...employees.map(e => ({ id: e.id, name: e.name })),
        ...users.filter(u => u.role === 'employee' && !employees.find(e => e.userId === u.id)).map(u => ({ id: u.id, name: u.name }))
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div><h1 className="text-3xl font-black text-gray-900">Task Assignment</h1><p className="text-gray-500 font-medium mt-1">Assign and track tasks for employees.</p></div>
                <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-black hover:shadow-lg transition-all" style={{ background: 'linear-gradient(135deg,#1d4ed8,#6366f1)' }}>
                    <Plus size={15} />Assign Task
                </button>
            </div>

            {success && <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl"><CheckCircle2 size={15} className="text-emerald-500" /><p className="text-sm font-bold text-emerald-700">{success}</p></div>}

            {showForm && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4"><h2 className="font-black text-gray-900">New Task</h2><button onClick={() => setShowForm(false)}><X size={16} className="text-gray-400" /></button></div>
                    {assignableUsers.length === 0 ? (
                        <div className="text-center py-6"><AlertCircle size={28} className="text-amber-400 mx-auto mb-2" /><p className="text-gray-600 font-medium text-sm">No employees found.</p><p className="text-gray-400 text-xs mt-1">Create employee users first from Admin → User Management.</p></div>
                    ) : (
                        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Task Title *</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Complete onboarding documentation" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-400" required /></div>
                            <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Task details..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-400 resize-none" /></div>
                            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Assign To *</label>
                                <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-400" required>
                                    <option value="">Select employee</option>
                                    {assignableUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>
                            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Priority</label>
                                <select value={priority} onChange={e => setPriority(e.target.value as any)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-400">
                                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                                </select>
                            </div>
                            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Deadline *</label><input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-400" required /></div>
                            <div className="flex items-end"><button type="submit" className="w-full py-2.5 rounded-xl text-white text-sm font-black hover:shadow-lg transition-all" style={{ background: 'linear-gradient(135deg,#1d4ed8,#6366f1)' }}>Assign Task</button></div>
                        </form>
                    )}
                </div>
            )}

            <div className="flex gap-2">
                {['all', 'pending', 'in_progress', 'completed'].map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)} className={`px-4 py-1.5 rounded-full text-xs font-black uppercase transition-all ${filterStatus === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s.replace('_', ' ')} ({s === 'all' ? tasks.length : tasks.filter(t => t.status === s).length})</button>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {filteredTasks.length === 0 ? (
                    <div className="text-center py-16"><CheckSquare size={36} className="text-gray-200 mx-auto mb-2" /><p className="text-gray-400 font-medium">No tasks found.</p><p className="text-gray-400 text-sm mt-1">Click "Assign Task" to get started</p></div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {filteredTasks.map(t => (
                            <div key={t.id} className="p-4 flex items-center justify-between gap-4 flex-wrap">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${PRIORITY_COLORS[t.priority]}15` }}>
                                        <CheckSquare size={16} style={{ color: PRIORITY_COLORS[t.priority] }} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-sm text-gray-900 truncate">{t.title}</p>
                                        <p className="text-xs text-gray-500">→ {t.assignedToName} · Due: {t.deadline}</p>
                                        <div className="flex gap-2 mt-1">
                                            <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded-full" style={{ background: `${PRIORITY_COLORS[t.priority]}15`, color: PRIORITY_COLORS[t.priority] }}>{t.priority}</span>
                                            <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded-full" style={{ background: `${STATUS_COLORS[t.status]}15`, color: STATUS_COLORS[t.status] }}>{t.status.replace('_',' ')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <select value={t.status} onChange={e => handleStatusUpdate(t.id, e.target.value as any)} className="text-xs font-bold bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-400">
                                        <option value="pending">Pending</option><option value="in_progress">In Progress</option><option value="completed">Completed</option>
                                    </select>
                                    <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"><Trash2 size={13} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};