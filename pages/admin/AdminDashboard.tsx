import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { store } from '../../utils/store';
import { Users, Briefcase, CalendarOff, CheckSquare, Clock, TrendingUp, ChevronRight, AlertTriangle } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState({ totalEmployees: 0, totalHR: 0, pendingLeaves: 0, pendingTasks: 0, todayAttendance: 0, avgHours: 0 });
    const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);

    const loadData = () => {
        store.init();
        const a = store.getAnalytics();
        setAnalytics(a);
        setPendingLeaves(store.getLeaves().filter(l => l.status === 'pending').slice(0, 5));
    };

    useEffect(() => { loadData(); }, []);

    const stats = [
        { label: 'Total Employees', value: analytics.totalEmployees, icon: Users, color: '#6366f1', desc: 'Active in system', path: '/admin/users' },
        { label: 'HR / Recruiters', value: analytics.totalHR, icon: Briefcase, color: '#1d4ed8', desc: 'Active users', path: '/admin/users' },
        { label: 'Pending Leaves', value: analytics.pendingLeaves, icon: CalendarOff, color: '#f59e0b', desc: 'Requires approval', path: '/admin/leaves' },
        { label: 'Open Tasks', value: analytics.pendingTasks, icon: CheckSquare, color: '#10b981', desc: 'Across all employees', path: '/admin/tasks' },
        { label: "Today's Attendance", value: analytics.todayAttendance, icon: Clock, color: '#0ea5e9', desc: `of ${analytics.totalEmployees} employees`, path: '/admin/analytics' },
        { label: 'Avg Work Hours', value: `${analytics.avgHours}h`, icon: TrendingUp, color: '#8b5cf6', desc: 'Per day (this month)', path: '/admin/analytics' },
    ];

    const quickActions = [
        { label: 'Manage Users', desc: 'Add/edit HR & employee accounts', path: '/admin/users' },
        { label: 'Leave Approvals', desc: `${analytics.pendingLeaves} pending request(s)`, path: '/admin/leaves', urgent: analytics.pendingLeaves > 0 },
        { label: 'Analytics', desc: 'View workforce performance reports', path: '/admin/analytics' },
        { label: 'Org Chart', desc: 'Company department structure', path: '/admin/org-chart' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-500 font-medium mt-1">Welcome back, <span className="text-blue-600 font-black">System Admin</span>. Here's your system overview.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map(s => (
                    <div key={s.label} onClick={() => navigate(s.path)} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}15` }}>
                            <s.icon size={22} style={{ color: s.color }} />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-gray-900">{s.value}</p>
                            <p className="text-sm font-bold text-gray-700">{s.label}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="font-black text-gray-900 mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                        {quickActions.map(a => (
                            <button key={a.label} onClick={() => navigate(a.path)} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-gray-100 transition-all group text-left">
                                <div>
                                    <p className="font-bold text-sm text-gray-900 flex items-center gap-2">
                                        {a.urgent && <AlertTriangle size={13} className="text-amber-500" />}
                                        {a.label}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">{a.desc}</p>
                                </div>
                                <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                        <AlertTriangle size={16} className="text-amber-500" />Pending Leave Requests
                    </h2>
                    {pendingLeaves.length === 0 ? (
                        <div className="text-center py-8">
                            <CalendarOff size={32} className="text-gray-200 mx-auto mb-2" />
                            <p className="text-gray-400 text-sm font-medium">No pending requests.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pendingLeaves.map(l => (
                                <div key={l.id} className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100">
                                    <div>
                                        <p className="font-bold text-sm text-gray-900">{l.employeeName}</p>
                                        <p className="text-xs text-gray-500">{l.type} · {l.days} day(s) · {l.startDate}</p>
                                    </div>
                                    <span className="text-xs font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Pending</span>
                                </div>
                            ))}
                            <button onClick={() => navigate('/admin/leaves')} className="w-full text-center text-xs font-bold text-blue-600 hover:text-blue-700 pt-1">View all →</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};