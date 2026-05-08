import React, { useState } from 'react';
import { store, LeaveRequest } from '../utils/store';
import { employeeApi } from '../src/api/employee';
import { useAuth } from '../context/AuthContext';
import { CalendarOff, Send, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const TYPE_LABELS = { sick: 'Sick Leave', casual: 'Casual Leave', earned: 'Earned Leave', unpaid: 'Unpaid' };
const STATUS_COLORS = { pending: '#f59e0b', approved: '#10b981', rejected: '#ef4444' };

export const LeavePortal: React.FC = () => {
    const { user } = useAuth();
    const employee = user ? store.getEmployeeByUserId(user.id) : undefined;

    const [leaveType, setLeaveType] = useState<'sick' | 'casual' | 'earned' | 'unpaid'>('casual');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [leaves, setLeaves] = useState<LeaveRequest[]>(employee ? store.getLeavesByEmployee(employee.id) : []);

    const refresh = () => { if (employee) setLeaves(store.getLeavesByEmployee(employee.id)); };

    const balance = employee ? store.getLeaveBalance(employee.id) : { sick: 12, casual: 12, earned: 15 };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null); setSuccess(null);
        if (!startDate || !endDate || !reason.trim()) { setError('All fields are required.'); return; }
        if (new Date(endDate) < new Date(startDate)) { setError('End date cannot be before start date.'); return; }

        const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1;
        if (!employee) return;

        const result = store.applyLeave({ employeeId: employee.id, employeeName: employee.name, type: leaveType, startDate, endDate, days, reason });
        if ('error' in result) { setError(result.error); return; }
        setSuccess(`Leave applied for ${days} day(s). Awaiting manager approval.`);
        setStartDate(''); setEndDate(''); setReason('');
        refresh();
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-gray-900">Leave Portal</h1>
                <p className="text-gray-500 font-medium mt-1">Apply for leave and track your balance.</p>
            </div>

            {/* Leave Balance */}
            <div className="grid grid-cols-3 gap-4">
                {[{ label: 'Sick Leave', bal: balance.sick, color: '#ef4444' }, { label: 'Casual Leave', bal: balance.casual, color: '#f59e0b' }, { label: 'Earned Leave', bal: balance.earned, color: '#10b981' }].map(b => (
                    <div key={b.label} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-center">
                        <div className="text-4xl font-black mb-1" style={{ color: b.color }}>{b.bal}</div>
                        <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">{b.label}</div>
                        <div className="text-xs text-gray-400 font-medium mt-0.5">days remaining</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Apply form */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="font-black text-gray-900 mb-5 flex items-center gap-2"><Send size={17} className="text-blue-600" />Apply for Leave</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Leave Type</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(['sick', 'casual', 'earned', 'unpaid'] as const).map(t => (
                                    <button key={t} type="button" onClick={() => setLeaveType(t)}
                                        className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${leaveType === t ? 'bg-blue-700 text-white border-blue-700' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                                        {TYPE_LABELS[t]}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Date</label>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">End Date</label>
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Reason</label>
                            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} placeholder="Brief reason for leave..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" />
                        </div>
                        {error && <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-bold"><AlertCircle size={13} />{error}</div>}
                        {success && <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-bold"><CheckCircle size={13} />{success}</div>}
                        <button type="submit" className="w-full py-3 rounded-xl text-white text-sm font-black" style={{ background: 'linear-gradient(135deg,#1d4ed8,#6366f1)' }}>Submit Leave Request</button>
                    </form>
                </div>

                {/* Leave history */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="font-black text-gray-900 mb-5 flex items-center gap-2"><CalendarOff size={17} className="text-blue-600" />My Leave History</h2>
                    <div className="space-y-3 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
                        {leaves.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No leave requests yet.</p>}
                        {[...leaves].reverse().map(l => (
                            <div key={l.id} className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-black px-2.5 py-1 rounded-full" style={{ background: `${STATUS_COLORS[l.status]}15`, color: STATUS_COLORS[l.status] }}>
                                        {l.status.toUpperCase()}
                                    </span>
                                    <span className="text-xs text-gray-500 font-medium">{l.days} day(s)</span>
                                </div>
                                <p className="font-bold text-sm text-gray-900">{TYPE_LABELS[l.type]}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{l.startDate} → {l.endDate}</p>
                                <p className="text-xs text-gray-400 italic mt-1">"{l.reason}"</p>
                                {l.approvedBy && <p className="text-xs font-semibold text-emerald-600 mt-1">✓ By {l.approvedBy}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

