import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { store } from '../utils/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { UserPlus, Trash2, Eye, EyeOff, CheckCircle, AlertCircle, Shield, Briefcase } from 'lucide-react';

/**
 * RecruiterManagement — manages HR users (recruiters).
 * Note: This page is not linked in Nav. HR user management is done via Admin → User Management.
 * This file is a legacy page kept for compatibility; it now uses the localStorage store directly.
 */
export const RecruiterManagement: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [department, setDepartment] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [, forceRender] = useState(0);

    const allUsers = store.getUsers();
    const recruiters = allUsers.filter(u => u.role === 'hr');
    const employees = allUsers.filter(u => u.role === 'employee');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess(null);
        setError(null);
        if (!name.trim()) { setError('Full name is required.'); return; }
        if (!email.trim() || !email.includes('@')) { setError('Valid email is required.'); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

        const existing = store.getUserByEmail(email);
        if (existing) { setError('A user with this email already exists.'); return; }

        store.createUser({
            email, passwordHash: password, name,
            role: 'hr', department: department || 'Talent Acquisition',
            avatarInitials: name.slice(0, 2).toUpperCase(), isActive: true,
        });
        setSuccess(`HR user "${name}" created successfully! They can now log in.`);
        setName(''); setEmail(''); setPassword(''); setDepartment('');
        forceRender(n => n + 1);
    };

    const handleRemove = (id: string) => {
        store.deleteUser(id);
        forceRender(n => n + 1);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">HR User Management</h1>
                <p className="text-gray-500 font-medium mt-1">Create and manage HR recruiter accounts.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Add Recruiter Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserPlus size={18} className="text-blue-600" />
                            Add New HR Recruiter
                        </CardTitle>
                        <CardDescription>Create login credentials for a new recruiter.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Priya Sharma" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. priya@hrms.io" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
                                <div className="relative">
                                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400">
                                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Department (optional)</label>
                                <input type="text" value={department} onChange={e => setDepartment(e.target.value)} placeholder="e.g. Talent Acquisition" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl">
                                    <AlertCircle size={14} className="text-red-500 shrink-0" />
                                    <p className="text-xs font-bold text-red-600">{error}</p>
                                </div>
                            )}
                            {success && (
                                <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                                    <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                                    <p className="text-xs font-bold text-emerald-700">{success}</p>
                                </div>
                            )}

                            <button type="submit" className="w-full py-2.5 rounded-xl text-white text-sm font-black flex items-center justify-center gap-2 hover:shadow-lg transition-all" style={{ background: 'linear-gradient(135deg, #1d4ed8, #6366f1)' }}>
                                <UserPlus size={16} />
                                Create HR Account
                            </button>
                        </form>
                    </CardContent>
                </Card>

                {/* Recruiter List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase size={18} className="text-blue-600" />
                            Active HR Recruiters ({recruiters.length})
                        </CardTitle>
                        <CardDescription>All HR users with portal access.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recruiters.length === 0 && (
                                <p className="text-sm text-gray-400 text-center py-6 font-medium">No HR recruiters added yet.</p>
                            )}
                            {recruiters.map(r => (
                                <div key={r.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-blue-50 border border-blue-100">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{r.name}</p>
                                        <p className="text-xs text-gray-500 font-mono mt-0.5">{r.email}</p>
                                        <p className="text-[11px] font-bold text-blue-600 mt-0.5">{r.department}</p>
                                    </div>
                                    <button onClick={() => handleRemove(r.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-all" title="Remove HR user">
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Employees */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield size={18} className="text-emerald-600" />
                        Hired Employees with Portal Access ({employees.length})
                    </CardTitle>
                    <CardDescription>Candidates hired from the CRM Pipeline. Default password: username@Hrms1</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {employees.length === 0 && (
                            <p className="text-sm text-gray-400 font-medium col-span-full text-center py-6">
                                No employees hired yet. Use CRM Pipeline &rarr; Hire to create employee accounts.
                            </p>
                        )}
                        {employees.map(emp => (
                            <div key={emp.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100">
                                <div className="w-9 h-9 rounded-full bg-emerald-200 flex items-center justify-center font-black text-emerald-700 text-sm">
                                    {emp.name[0]?.toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate">{emp.name}</p>
                                    <p className="text-xs text-gray-500 font-mono truncate">{emp.email}</p>
                                    <p className="text-[11px] font-bold text-emerald-600 mt-0.5">
                                        Password: {emp.email.split('@')[0]}@Hrms1
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
