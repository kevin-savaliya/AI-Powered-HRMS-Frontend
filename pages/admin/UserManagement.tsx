import React, { useState, useEffect } from 'react';
import { store, HRMSUser, UserRole } from '../../utils/store';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, Trash2, Eye, EyeOff, CheckCircle, AlertCircle, RefreshCw, Shield, Briefcase, Users } from 'lucide-react';

const ROLE_COLORS: Record<UserRole, string> = { admin: '#6366f1', hr: '#1d4ed8', employee: '#10b981' };
const ROLE_LABELS: Record<UserRole, string> = { admin: 'Admin', hr: 'HR / Recruiter', employee: 'Employee' };

export const UserManagement: React.FC = () => {
    const { refreshUser } = useAuth();
    const [users, setUsers] = useState<HRMSUser[]>([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>('hr');
    const [dept, setDept] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [resetId, setResetId] = useState<string | null>(null);
    const [newPwd, setNewPwd] = useState('');

    const loadUsers = () => {
        store.init();
        setUsers(store.getUsers());
    };

    useEffect(() => { loadUsers(); }, []);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null); setSuccess(null);
        if (!name.trim() || !email.trim() || !password) { setError('All fields are required.'); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
        const exists = store.getUserByEmail(email.trim().toLowerCase());
        if (exists) { setError('A user with this email already exists.'); return; }
        const newUser = store.createUser({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            passwordHash: password,
            role,
            department: dept || 'General',
            avatarInitials: name.slice(0, 2).toUpperCase(),
            isActive: true,
        });
        if (role === 'employee') {
            store.createEmployee({
                userId: newUser.id,
                name: name.trim(),
                email: email.trim().toLowerCase(),
                department: dept || 'General',
                designation: 'Employee',
                joinDate: new Date().toISOString().split('T')[0],
                skills: [],
                bio: ''
            });
        }
        setSuccess(`User "${name}" created successfully!`);
        setName(''); setEmail(''); setPassword(''); setDept('');
        loadUsers();
    };

    const handleDelete = (id: string) => {
        if (id === 'admin-001') { setError('Cannot delete the system admin.'); return; }
        if (window.confirm('Are you sure you want to delete this user?')) {
            store.deleteUser(id);
            loadUsers();
        }
    };

    const handleReset = (id: string) => {
        if (!newPwd || newPwd.length < 6) { setError('New password must be at least 6 characters.'); return; }
        store.updateUser(id, { passwordHash: newPwd });
        setResetId(null); setNewPwd(''); setSuccess('Password reset successfully.');
        refreshUser();
        loadUsers();
    };

    const nonAdmin = users.filter(u => u.role !== 'admin');
    const hrUsers = users.filter(u => u.role === 'hr');
    const empUsers = users.filter(u => u.role === 'employee');

    return (
        <div className="space-y-8">
            <div><h1 className="text-3xl font-black text-gray-900">User Management</h1><p className="text-gray-500 font-medium mt-1">Create, manage and control access for all users.</p></div>
            <div className="grid grid-cols-3 gap-4">
                {[{ label: 'HR / Recruiters', count: hrUsers.length, icon: Briefcase, color: '#1d4ed8' }, { label: 'Employees', count: empUsers.length, icon: Users, color: '#10b981' }, { label: 'Total Users', count: users.length, icon: Shield, color: '#6366f1' }].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15` }}><s.icon size={20} style={{ color: s.color }} /></div>
                        <div><p className="text-2xl font-black text-gray-900">{s.count}</p><p className="text-xs font-bold text-gray-500">{s.label}</p></div>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="font-black text-gray-900 mb-5 flex items-center gap-2"><UserPlus size={18} className="text-blue-600" />Create New User</h2>
                    <form onSubmit={handleCreate} className="space-y-3">
                        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-4">
                            {(['hr', 'employee'] as UserRole[]).map(r => (
                                <button key={r} type="button" onClick={() => setRole(r)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${role === r ? 'bg-white shadow text-blue-700' : 'text-gray-500'}`}>{ROLE_LABELS[r]}</button>
                            ))}
                        </div>
                        {[{ label: 'Full Name', val: name, set: setName, type: 'text', ph: 'e.g. Priya Sharma' }, { label: 'Email', val: email, set: setEmail, type: 'email', ph: 'e.g. priya@hrms.io' }, { label: 'Department', val: dept, set: setDept, type: 'text', ph: 'e.g. Engineering' }].map(f => (
                            <div key={f.label}>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{f.label}</label>
                                <input type={f.type} value={f.val} onChange={e => { f.set(e.target.value); setError(null); }} placeholder={f.ph} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                            </div>
                        ))}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                            <div className="relative">
                                <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError(null); }} placeholder="Min. 6 characters" className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-3 text-gray-400">{showPwd ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                            </div>
                        </div>
                        {error && <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl"><AlertCircle size={13} className="text-red-500" /><p className="text-xs font-bold text-red-600">{error}</p></div>}
                        {success && <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl"><CheckCircle size={13} className="text-emerald-500" /><p className="text-xs font-bold text-emerald-700">{success}</p></div>}
                        <button type="submit" className="w-full py-2.5 rounded-xl text-white text-sm font-black flex items-center justify-center gap-2 hover:shadow-lg transition-all" style={{ background: 'linear-gradient(135deg,#1d4ed8,#6366f1)' }}><UserPlus size={15} />Create User</button>
                    </form>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="font-black text-gray-900 mb-5">All Users ({nonAdmin.length})</h2>
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                        {nonAdmin.length === 0 && <p className="text-gray-400 text-sm text-center py-8">No users yet. Create one using the form.</p>}
                        {nonAdmin.map(u => (
                            <div key={u.id} className="rounded-xl border border-gray-100 p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm" style={{ background: `linear-gradient(135deg,${ROLE_COLORS[u.role]},${ROLE_COLORS[u.role]}aa)` }}>{u.name?.[0] ?? '?'}</div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-900">{u.name}</p>
                                            <p className="text-xs text-gray-500">{u.email}</p>
                                            <span className="inline-block mt-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full" style={{ background: `${ROLE_COLORS[u.role]}15`, color: ROLE_COLORS[u.role] }}>{ROLE_LABELS[u.role]}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <button onClick={() => { setResetId(u.id); setNewPwd(''); }} title="Reset password" className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-all"><RefreshCw size={13} /></button>
                                        <button onClick={() => handleDelete(u.id)} title="Delete user" className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"><Trash2 size={13} /></button>
                                    </div>
                                </div>
                                {resetId === u.id && (
                                    <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                                        <input type="text" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="New password" className="flex-1 px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none" />
                                        <button onClick={() => handleReset(u.id)} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700">Save</button>
                                        <button onClick={() => setResetId(null)} className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg">Cancel</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};