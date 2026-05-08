import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { store } from '../../utils/store';
import { Users, Calendar, FileSearch, Send, ChevronRight, Briefcase, ClipboardList, Clock } from 'lucide-react';

export const HRDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const employees = store.getEmployees();
    const tasks = store.getTasks();
    const pendingLeaves = store.getLeaves().filter(l => l.status === 'pending');
    const todayInterviews = 3; // Simulated—real data would come from Scheduler

    const stats = [
        { label: 'Total Employees', value: employees.length, icon: Users, color: '#1d4ed8', to: '' },
        { label: 'Pending Leave Req.', value: pendingLeaves.length, icon: Calendar, color: '#f59e0b', to: '' },
        { label: 'Active Tasks', value: tasks.filter(t => t.status !== 'completed').length, icon: ClipboardList, color: '#8b5cf6', to: '/hr/tasks' },
        { label: "Today's Interviews", value: todayInterviews, icon: Clock, color: '#0ea5e9', to: '/scheduler' },
    ];

    const quickLinks = [
        { label: 'AI Candidate Scraper', desc: 'Source candidates using Apify', to: '/scraper', icon: FileSearch, color: '#1d4ed8' },
        { label: 'CRM Pipeline', desc: 'Manage and convert leads', to: '/leads', icon: Users, color: '#6366f1' },
        { label: 'Lemlist Campaigns', desc: 'Outreach automation', to: '/campaigns', icon: Send, color: '#0ea5e9' },
        { label: 'Resume Parser', desc: 'AI-powered skill extraction', to: '/resume-parser', icon: FileSearch, color: '#10b981' },
        { label: 'Interview Scheduler', desc: 'Book and manage interviews', to: '/scheduler', icon: Calendar, color: '#f59e0b' },
        { label: 'Assign Tasks', desc: 'Create tasks for employees', to: '/hr/tasks', icon: ClipboardList, color: '#8b5cf6' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-gray-900">HR Dashboard</h1>
                <p className="text-gray-500 font-medium mt-1">Welcome, <span className="text-blue-700 font-bold">{user?.name}</span>. Manage your recruitment pipeline.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(s => (
                    <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-3 cursor-pointer hover:border-blue-200 transition-all" onClick={() => s.to && navigate(s.to)}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15` }}><s.icon size={19} style={{ color: s.color }} /></div>
                        <div><p className="text-2xl font-black text-gray-900">{s.value}</p><p className="text-xs font-bold text-gray-500">{s.label}</p></div>
                    </div>
                ))}
            </div>

            <div>
                <h2 className="font-black text-gray-800 mb-4 flex items-center gap-2"><Briefcase size={17} className="text-blue-600" />Recruitment Tools</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quickLinks.map(l => {
                        const Icon = l.icon;
                        return (
                            <button key={l.label} onClick={() => navigate(l.to)}
                                className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:border-blue-200 hover:shadow-md transition-all group text-left">
                                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${l.color}12` }}><Icon size={20} style={{ color: l.color }} /></div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 text-sm">{l.label}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{l.desc}</p>
                                </div>
                                <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all shrink-0" />
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Recent employees */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100"><h2 className="font-black text-gray-900">Employee Directory (Read-Only)</h2></div>
                <div className="divide-y divide-gray-50">
                    {employees.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No employees yet. Hire a candidate from the CRM Pipeline.</p>}
                    {employees.map(emp => (
                        <div key={emp.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm" style={{ background: 'linear-gradient(135deg,#1d4ed8,#6366f1)' }}>{emp.name[0]}</div>
                                <div>
                                    <p className="font-bold text-sm text-gray-900">{emp.name}</p>
                                    <p className="text-xs text-gray-500">{emp.email}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-gray-700">{emp.designation}</p>
                                <p className="text-xs text-gray-500">{emp.department}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

