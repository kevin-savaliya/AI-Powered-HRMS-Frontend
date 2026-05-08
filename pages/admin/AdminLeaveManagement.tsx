import React, { useState, useEffect } from 'react';
import { store, LeaveRequest } from '../../utils/store';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, XCircle, CalendarOff, Clock } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = { pending: '#f59e0b', approved: '#10b981', rejected: '#ef4444' };

export const AdminLeaveManagement: React.FC = () => {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

    const loadData = () => { store.init(); setLeaves(store.getLeaves()); };
    useEffect(() => { loadData(); }, []);

    const filtered = filter === 'all' ? leaves : leaves.filter(l => l.status === filter);

    const handleApprove = (id: string) => { store.updateLeaveStatus(id, 'approved', user?.name ?? 'Admin'); loadData(); };
    const handleReject = (id: string) => { store.updateLeaveStatus(id, 'rejected', user?.name ?? 'Admin'); loadData(); };

    const pending = leaves.filter(l => l.status === 'pending').length;

    return (
        <div className="space-y-6">
            <div><h1 className="text-3xl font-black text-gray-900">Leave Management</h1><p className="text-gray-500 font-medium mt-1">Review and approve employee leave requests.</p></div>
            <div className="grid grid-cols-3 gap-4">
                {[{ label: 'Pending', count: leaves.filter(l=>l.status==='pending').length, color:'#f59e0b' }, { label: 'Approved', count: leaves.filter(l=>l.status==='approved').length, color:'#10b981' }, { label: 'Rejected', count: leaves.filter(l=>l.status==='rejected').length, color:'#ef4444' }].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm text-center">
                        <p className="text-3xl font-black" style={{ color: s.color }}>{s.count}</p>
                        <p className="text-xs font-bold text-gray-500 mt-1">{s.label}</p>
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
                {(['all','pending','approved','rejected'] as const).map(s => (
                    <button key={s} onClick={() => setFilter(s)} className={`px-4 py-1.5 rounded-full text-xs font-black uppercase transition-all ${filter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s}</button>
                ))}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="text-center py-16"><CalendarOff size={36} className="text-gray-200 mx-auto mb-2" /><p className="text-gray-400 font-medium">No {filter} leave requests.</p></div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {filtered.map(l => (
                            <div key={l.id} className="p-4 flex items-center justify-between gap-4 flex-wrap">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm">{l.employeeName?.[0] ?? '?'}</div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-900">{l.employeeName}</p>
                                        <p className="text-xs text-gray-500">{l.type} leave · {l.days} day(s)</p>
                                        <p className="text-xs text-gray-400">{l.startDate} → {l.endDate}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <div className="max-w-[200px]"><p className="text-xs text-gray-600 font-medium truncate" title={l.reason}>{l.reason}</p></div>
                                    <span className="text-xs font-black uppercase px-2 py-0.5 rounded-full" style={{ background: `${STATUS_COLORS[l.status]}20`, color: STATUS_COLORS[l.status] }}>{l.status}</span>
                                    {l.status === 'pending' && (
                                        <div className="flex gap-1">
                                            <button onClick={() => handleApprove(l.id)} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-black rounded-lg hover:bg-emerald-100 transition-all"><CheckCircle size={13} />Approve</button>
                                            <button onClick={() => handleReject(l.id)} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-black rounded-lg hover:bg-red-100 transition-all"><XCircle size={13} />Reject</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};