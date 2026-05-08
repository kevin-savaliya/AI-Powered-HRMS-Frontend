import React from 'react';
import { store } from '../../utils/store';
import { BarChart3, TrendingUp, Users, Clock, CalendarOff, CheckSquare, Info } from 'lucide-react';

// ── Mini bar-chart row ─────────────────────────────────────────────────────────
const BarRow = ({ label, value, displayValue, pct, color }: { label: string; value: number; displayValue: string; pct: number; color: string }) => (
    <div>
        <div className="flex justify-between text-sm font-semibold text-gray-700 mb-1">
            <span>{label}</span>
            <span className="text-gray-500">{displayValue}</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.max(pct, value > 0 ? 4 : 0)}%`, background: color }}
            />
        </div>
    </div>
);

const EmptyState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
        <Info size={28} className="text-gray-300 mb-2" />
        <p className="text-sm text-gray-400 font-medium">{message}</p>
    </div>
);

export const AdminAnalytics: React.FC = () => {
    const employees = store.getEmployees();
    const attendance = store.getAttendance();
    const leaves = store.getLeaves();
    const tasks = store.getTasks();
    const users = store.getUsers();
    const departments = store.getDepartments();

    // Department headcount (from employees table, fallback to dept list)
    const deptCount = employees.reduce((acc, e) => {
        acc[e.department] = (acc[e.department] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // If no employees, show department names with 0
    const deptEntries: [string, number][] = employees.length > 0
        ? Object.entries(deptCount)
        : departments.map(d => [d.name, 0]);

    const maxDeptCount = Math.max(...deptEntries.map(([, c]) => c), 1);

    // Leave by type
    const leaveByType = leaves.reduce((acc, l) => {
        acc[l.type] = (acc[l.type] || 0) + l.days;
        return acc;
    }, {} as Record<string, number>);
    const maxLeave = Math.max(...Object.values(leaveByType), 1);

    // Task by status
    const taskByStatus = tasks.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Avg hours per employee
    const avgHoursPerEmp: [string, number][] = employees.map(e => {
        const empAtt = attendance.filter(a => a.employeeId === e.id && a.hoursWorked);
        const avg = empAtt.length > 0
            ? Math.round((empAtt.reduce((s, a) => s + (a.hoursWorked || 0), 0) / empAtt.length) * 10) / 10
            : 0;
        return [e.name, avg];
    });
    const maxHours = Math.max(...avgHoursPerEmp.map(([, h]) => h), 1);

    // Role distribution
    const roleCount = users.reduce((acc, u) => {
        acc[u.role] = (acc[u.role] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const roleColors: Record<string, string> = { admin: '#6366f1', hr: '#1d4ed8', employee: '#10b981' };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-gray-900">Analytics & Reports</h1>
                <p className="text-gray-500 font-medium mt-1">System-wide insights and performance metrics.</p>
            </div>

            {/* KPI Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Users', value: users.length, icon: Users, color: '#1d4ed8' },
                    { label: 'Employees', value: employees.length, icon: Users, color: '#0ea5e9' },
                    { label: 'Leave Requests', value: leaves.length, icon: CalendarOff, color: '#f59e0b' },
                    { label: 'Total Tasks', value: tasks.length, icon: CheckSquare, color: '#10b981' },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-3">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Department Distribution */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="font-black text-gray-900 mb-5 flex items-center gap-2">
                        <BarChart3 size={18} className="text-blue-600" /> Employees by Department
                    </h2>
                    <div className="space-y-3">
                        {deptEntries.length === 0
                            ? <EmptyState message="No departments found. Create departments in Org Chart." />
                            : deptEntries.map(([dept, count]) => (
                                <BarRow
                                    key={dept}
                                    label={dept}
                                    value={count}
                                    displayValue={count === 0 ? 'No employees yet' : `${count} emp`}
                                    pct={(count / maxDeptCount) * 100}
                                    color="linear-gradient(90deg,#1d4ed8,#6366f1)"
                                />
                            ))
                        }
                    </div>
                </div>

                {/* User Role Distribution */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="font-black text-gray-900 mb-5 flex items-center gap-2">
                        <Users size={18} className="text-purple-600" /> Users by Role
                    </h2>
                    <div className="space-y-3">
                        {users.length === 0
                            ? <EmptyState message="No users yet." />
                            : Object.entries(roleCount).map(([role, count]) => (
                                <BarRow
                                    key={role}
                                    label={role.charAt(0).toUpperCase() + role.slice(1)}
                                    value={count}
                                    displayValue={`${count} user${count !== 1 ? 's' : ''}`}
                                    pct={(count / users.length) * 100}
                                    color={roleColors[role] || '#94a3b8'}
                                />
                            ))
                        }
                    </div>
                </div>

                {/* Task Status */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="font-black text-gray-900 mb-5 flex items-center gap-2">
                        <CheckSquare size={18} className="text-emerald-600" /> Task Status Distribution
                    </h2>
                    <div className="space-y-3">
                        {tasks.length === 0
                            ? <EmptyState message="No tasks yet. HR can assign tasks to employees." />
                            : [
                                { key: 'pending', label: 'Pending', color: '#f59e0b' },
                                { key: 'in_progress', label: 'In Progress', color: '#3b82f6' },
                                { key: 'completed', label: 'Completed', color: '#10b981' },
                            ].map(s => {
                                const cnt = taskByStatus[s.key] || 0;
                                const pct = tasks.length > 0 ? (cnt / tasks.length) * 100 : 0;
                                return (
                                    <BarRow
                                        key={s.key}
                                        label={s.label}
                                        value={cnt}
                                        displayValue={`${cnt} (${Math.round(pct)}%)`}
                                        pct={pct}
                                        color={s.color}
                                    />
                                );
                            })
                        }
                    </div>
                </div>

                {/* Avg Hours per Employee */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="font-black text-gray-900 mb-5 flex items-center gap-2">
                        <TrendingUp size={18} className="text-indigo-600" /> Avg Daily Work Hours
                    </h2>
                    <div className="space-y-3">
                        {avgHoursPerEmp.length === 0
                            ? <EmptyState message="No attendance data yet. Employees must clock in to generate data." />
                            : avgHoursPerEmp.map(([name, hrs]) => (
                                <BarRow
                                    key={name}
                                    label={name}
                                    value={hrs}
                                    displayValue={`${hrs}h / day`}
                                    pct={(hrs / maxHours) * 100}
                                    color="linear-gradient(90deg,#6366f1,#8b5cf6)"
                                />
                            ))
                        }
                    </div>
                </div>

                {/* Leave by type */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm lg:col-span-2">
                    <h2 className="font-black text-gray-900 mb-5 flex items-center gap-2">
                        <CalendarOff size={18} className="text-amber-600" /> Leave Days by Type (All Requests)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { key: 'sick', label: 'Sick Leave', color: '#ef4444' },
                            { key: 'casual', label: 'Casual Leave', color: '#f59e0b' },
                            { key: 'earned', label: 'Earned Leave', color: '#10b981' },
                        ].map(s => {
                            const days = leaveByType[s.key] || 0;
                            return (
                                <div key={s.key} className="bg-gray-50 rounded-xl p-4 text-center">
                                    <div className="text-3xl font-black" style={{ color: s.color }}>{days}</div>
                                    <div className="text-xs font-bold text-gray-500 mt-1">{s.label}</div>
                                    <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full"
                                            style={{ width: `${(days / maxLeave) * 100}%`, background: s.color }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {leaves.length === 0 && <EmptyState message="No leave requests yet. Employees can apply from their Leave Portal." />}
                </div>

            </div>
        </div>
    );
};
