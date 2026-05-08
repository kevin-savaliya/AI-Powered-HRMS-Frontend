import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { store } from '../utils/store';
import {
    LayoutDashboard, Clock, CalendarOff, ClipboardList, FileText,
    User, TrendingUp, CheckSquare, Briefcase
} from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const employee = user ? store.getEmployeeByUserId(user.id) : undefined;
    const tasks = employee ? store.getTasksByEmployee(employee.id) : [];
    const attendance = employee ? store.getAttendanceByEmployee(employee.id) : [];
    const balance = employee ? store.getLeaveBalance(employee.id) : { sick: 0, casual: 0, earned: 0 };
    const todayStr = new Date().toISOString().split('T')[0];
    const todayAtt = attendance.find(a => a.date === todayStr);

    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const presentDays = attendance.filter(a => a.status === 'present').length;

    const quickNav = [
        { label: 'Attendance', icon: Clock, to: '/employee/attendance', color: '#1d4ed8', desc: todayAtt?.clockIn ? `Clocked in at ${new Date(todayAtt.clockIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : 'Not yet clocked in' },
        { label: 'Leave Portal', icon: CalendarOff, to: '/employee/leave', color: '#f59e0b', desc: `${balance.casual} casual days remaining` },
        { label: 'My Tasks', icon: ClipboardList, to: '/employee/tasks', color: '#8b5cf6', desc: `${pendingTasks} pending, ${inProgressTasks} in progress` },
        { label: 'Documents', icon: FileText, to: '/employee/documents', color: '#10b981', desc: 'Payslips, offer letter, KYC' },
        { label: 'My Profile', icon: User, to: '/employee/profile', color: '#0ea5e9', desc: 'Update skills and bio' },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex items-center justify-between overflow-hidden relative">
                <div className="absolute right-0 top-0 w-64 h-64 rounded-full opacity-5" style={{ background: 'radial-gradient(circle,#1d4ed8,transparent)', transform: 'translate(30%,-30%)' }} />
                <div>
                    <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-1">Employee Portal</p>
                    <h1 className="text-3xl font-black text-gray-900">Hello, {employee?.name?.split(' ')[0] || user?.name} 👋</h1>
                    <p className="text-gray-500 font-medium mt-1">{employee?.designation} · {employee?.department}</p>
                    <div className="flex items-center gap-4 mt-3">
                        <span className="text-xs font-bold px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">✓ Active Employee</span>
                        <span className="text-xs text-gray-500 font-medium">Joined: {employee?.joinDate}</span>
                    </div>
                </div>
                <div className="hidden md:flex w-20 h-20 rounded-3xl items-center justify-center text-white text-3xl font-black shadow-xl" style={{ background: 'linear-gradient(135deg,#1d4ed8,#6366f1)' }}>
                    {employee?.name?.[0] || user?.name?.[0] || '?'}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Days Present', value: presentDays, icon: Clock, color: '#1d4ed8' },
                    { label: 'Pending Tasks', value: pendingTasks, icon: ClipboardList, color: '#f59e0b' },
                    { label: 'In Progress', value: inProgressTasks, icon: TrendingUp, color: '#8b5cf6' },
                    { label: 'Tasks Completed', value: tasks.filter(t => t.status === 'completed').length, icon: CheckSquare, color: '#10b981' },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15` }}><s.icon size={19} style={{ color: s.color }} /></div>
                        <div><p className="text-2xl font-black text-gray-900">{s.value}</p><p className="text-xs font-bold text-gray-500">{s.label}</p></div>
                    </div>
                ))}
            </div>

            {/* Quick nav cards */}
            <div>
                <h2 className="font-black text-gray-800 mb-4">Quick Access</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quickNav.map(n => {
                        const Icon = n.icon;
                        return (
                            <button key={n.label} onClick={() => navigate(n.to)} className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:border-blue-200 hover:shadow-md transition-all text-left group">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${n.color}12` }}><Icon size={22} style={{ color: n.color }} /></div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">{n.label}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{n.desc}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Recent tasks */}
            {tasks.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                        <h2 className="font-black text-gray-900">Recent Tasks</h2>
                        <button onClick={() => navigate('/employee/tasks')} className="text-xs font-bold text-blue-600 hover:underline">View All</button>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {tasks.slice(0, 4).map(t => (
                            <div key={t.id} className="px-6 py-4 flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-sm text-gray-900">{t.title}</p>
                                    <p className="text-xs text-gray-500">Deadline: {t.deadline} · Assigned by {t.assignedBy}</p>
                                </div>
                                <span className="text-xs font-black px-3 py-1 rounded-full" style={{
                                    background: t.status === 'completed' ? '#ecfdf5' : t.status === 'in_progress' ? '#eff6ff' : '#fffbeb',
                                    color: t.status === 'completed' ? '#059669' : t.status === 'in_progress' ? '#2563eb' : '#d97706'
                                }}>{t.status.replace('_', ' ')}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
