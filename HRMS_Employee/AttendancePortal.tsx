import React, { useState, useEffect, useCallback } from 'react';
import { store, AttendanceRecord } from '../utils/store';
import { useAuth } from '../context/AuthContext';
import { Clock, LogIn, LogOut, Calendar, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

export const AttendancePortal: React.FC = () => {
    const { user } = useAuth();
    const employee = user ? store.getEmployeeByUserId(user.id) : undefined;

    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [today, setToday] = useState<AttendanceRecord | undefined>(undefined);
    const [now, setNow] = useState(() => new Date());
    const [actionFeedback, setActionFeedback] = useState<string | null>(null);

    // ── Load attendance data ───────────────────────────────────────────────────
    const loadData = useCallback(() => {
        if (!employee) return;
        const att = store.getAttendanceByEmployee(employee.id);
        setRecords(att);
        const todayStr = new Date().toISOString().split('T')[0];
        setToday(att.find(a => a.date === todayStr));
    }, [employee?.id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // ── Live clock — updates every second ─────────────────────────────────────
    // Using a separate lightweight effect that ONLY updates the clock state.
    // This does NOT re-run loadData, keeping navigation snappy.
    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date());
        }, 1000);
        return () => {
            clearInterval(timer); // always cleared on unmount / route change
        };
    }, []); // empty dep array: starts once, cleaned up on unmount

    // ── Actions ────────────────────────────────────────────────────────────────
    const handleClockIn = () => {
        if (!employee) return;
        store.clockIn(employee.id);
        loadData();
        setActionFeedback('Clocked in successfully!');
        setTimeout(() => setActionFeedback(null), 3000);
    };

    const handleClockOut = () => {
        if (!employee) return;
        store.clockOut(employee.id);
        loadData();
        setActionFeedback('Clocked out. Have a great evening!');
        setTimeout(() => setActionFeedback(null), 3000);
    };

    // ── Derived stats ──────────────────────────────────────────────────────────
    const totalHours = records.filter(r => r.hoursWorked != null).reduce((s, r) => s + (r.hoursWorked || 0), 0);
    const presentDays = records.filter(r => r.status === 'present').length;
    const avgHours = presentDays > 0 ? totalHours / presentDays : 0;

    // Format decimal hours → HH:MM:SS
    const formatHours = (decimalHours: number): string => {
        const totalSeconds = Math.round(decimalHours * 3600);
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    // Format decimal hours → HH:MM (for stat cards)
    const formatHoursShort = (decimalHours: number): string => {
        const totalMinutes = Math.round(decimalHours * 60);
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const formatTime = (iso?: string) =>
        iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';

    const getLiveWorkingDuration = () => {
        if (!today?.clockIn || today?.clockOut) return null;
        const diffMs = now.getTime() - new Date(today.clockIn).getTime();
        const totalSec = Math.floor(diffMs / 1000);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    // ── No employee profile guard ──────────────────────────────────────────────
    if (!employee) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <AlertCircle size={48} className="text-amber-400 mb-4" />
                <h2 className="text-xl font-black text-gray-800 mb-2">Employee Profile Not Found</h2>
                <p className="text-gray-500 text-sm max-w-xs">
                    Your employee profile hasn't been set up yet. Please ask your Admin or HR to complete your onboarding.
                </p>
            </div>
        );
    }

    const liveDuration = getLiveWorkingDuration();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-gray-900">Attendance</h1>
                <p className="text-gray-500 font-medium mt-1">Track your daily attendance and work hours.</p>
            </div>

            {/* Feedback toast */}
            {actionFeedback && (
                <div className="flex items-center gap-3 px-5 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                    <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                    <p className="text-sm font-bold text-emerald-700">{actionFeedback}</p>
                </div>
            )}

            {/* Clock widget */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-8 text-center max-w-sm mx-auto">
                {/* Live digital clock */}
                <p className="text-4xl font-black text-gray-900 font-mono tracking-wider tabular-nums">
                    {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
                <p className="text-gray-500 text-sm font-medium mt-1">
                    {now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>

                {/* Status info */}
                <div className="mt-5 space-y-1.5">
                    {today?.clockIn && (
                        <div className="flex items-center justify-center gap-2 text-sm font-bold text-emerald-600">
                            <LogIn size={15} /> Clocked In: {formatTime(today.clockIn)}
                        </div>
                    )}
                    {today?.clockOut && (
                        <div className="flex items-center justify-center gap-2 text-sm font-bold text-blue-600">
                            <LogOut size={15} /> Clocked Out: {formatTime(today.clockOut)}
                        </div>
                    )}
                    {liveDuration && (
                        <div className="flex items-center justify-center gap-2 text-sm font-bold text-orange-600">
                            <Clock size={15} /> Working for: {liveDuration}
                        </div>
                    )}
                    {today?.hoursWorked ? (
                        <div className="flex items-center justify-center gap-2 text-sm font-bold text-indigo-600">
                            <CheckCircle size={15} /> Total Today: {today.hoursWorked}h
                        </div>
                    ) : null}
                </div>

                {/* Action buttons */}
                <div className="mt-6 flex gap-3 justify-center">
                    {!today?.clockIn && (
                        <button
                            onClick={handleClockIn}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-black text-sm hover:shadow-lg hover:scale-105 transition-all active:scale-95"
                            style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}
                        >
                            <LogIn size={18} /> Clock In
                        </button>
                    )}
                    {today?.clockIn && !today?.clockOut && (
                        <button
                            onClick={handleClockOut}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-black text-sm hover:shadow-lg hover:scale-105 transition-all active:scale-95"
                            style={{ background: 'linear-gradient(135deg,#dc2626,#ef4444)' }}
                        >
                            <LogOut size={18} /> Clock Out
                        </button>
                    )}
                    {today?.clockOut && (
                        <span className="px-6 py-3 bg-emerald-50 text-emerald-700 font-black text-sm rounded-2xl border border-emerald-200">
                            ✓ Day Complete
                        </span>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Days Present', value: String(presentDays), icon: Calendar, color: '#1d4ed8' },
                    { label: 'Total Hours', value: formatHoursShort(totalHours), icon: Clock, color: '#6366f1' },
                    { label: 'Avg Hours/Day', value: formatHoursShort(avgHours), icon: TrendingUp, color: '#10b981' },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-3 shadow-sm">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15` }}>
                            <s.icon size={19} style={{ color: s.color }} />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-gray-900">{s.value}</p>
                            <p className="text-xs font-bold text-gray-500">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* History Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50">
                    <h2 className="font-black text-gray-900">Attendance History</h2>
                </div>
                {records.length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar size={36} className="text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-400 font-medium text-sm">No attendance records yet. Clock in to get started!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                                <tr>
                                    <th className="px-6 py-3 text-left">Date</th>
                                    <th className="px-6 py-3 text-left">Clock In</th>
                                    <th className="px-6 py-3 text-left">Clock Out</th>
                                    <th className="px-6 py-3 text-left">Hours</th>
                                    <th className="px-6 py-3 text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {[...records].reverse().slice(0, 20).map(r => (
                                    <tr key={r.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 text-sm font-semibold text-gray-900">{r.date}</td>
                                        <td className="px-6 py-3 text-sm text-gray-600">{formatTime(r.clockIn)}</td>
                                        <td className="px-6 py-3 text-sm text-gray-600">{formatTime(r.clockOut)}</td>
                                        <td className="px-6 py-3 text-sm font-bold text-gray-900">{r.hoursWorked ? `${r.hoursWorked}h` : '—'}</td>
                                        <td className="px-6 py-3">
                                            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">Present</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
