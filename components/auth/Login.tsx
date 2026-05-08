import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Fingerprint, Mail, Lock, Eye, EyeOff, AlertCircle, ShieldCheck, Users, Briefcase } from 'lucide-react';

const ROLE_INFO = {
    admin: { label: 'Administrator', desc: 'Full system access: HRMS, recruitment, analytics & user management.', icon: ShieldCheck, color: '#dc2626' },
    hr: { label: 'HR / Recruiter', desc: 'Recruitment pipeline, AI scoring, interviews & employee management.', icon: Briefcase, color: '#1d4ed8' },
    employee: { label: 'Employee', desc: 'Personal dashboard, attendance, leave management & documents.', icon: Users, color: '#059669' },
};

const PANEL_GRADIENTS = {
    admin: 'linear-gradient(160deg, #7f1d1d 0%, #dc2626 55%, #b91c1c 100%)',
    hr: 'linear-gradient(160deg, #1e1b4b 0%, #1d4ed8 55%, #0369a1 100%)',
    employee: 'linear-gradient(160deg, #064e3b 0%, #059669 55%, #065f46 100%)',
};

const BUTTON_GRADIENTS = {
    admin: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
    hr: 'linear-gradient(135deg, #1d4ed8 0%, #6366f1 100%)',
    employee: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
};

const BUTTON_SHADOWS = {
    admin: 'hover:shadow-red-500/30',
    hr: 'hover:shadow-blue-500/30',
    employee: 'hover:shadow-emerald-500/30',
};

// Soft light color used in left panel text per role
const PANEL_TEXT_COLOR = {
    admin: 'rgba(255,200,200,0.85)',
    hr: 'rgba(186,215,255,0.85)',
    employee: 'rgba(167,243,208,0.85)',
};

export const Login: React.FC = () => {
    const { login, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'admin' | 'hr' | 'employee'>('admin');

    const switchTab = (tab: 'admin' | 'hr' | 'employee') => {
        setActiveTab(tab);
        setError(null);
    };

    // Redirect when auth state changes
    useEffect(() => {
        if (!isAuthenticated || !user) return;
        if (user.role === 'employee') {
            navigate('/employee/dashboard', { replace: true });
        } else if (user.role === 'hr') {
            navigate('/recruiter/dashboard', { replace: true });
        } else {
            navigate('/admin/dashboard', { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!email.trim()) { setError('Please enter your email.'); return; }
        if (!password) { setError('Please enter your password.'); return; }
        setLoading(true);
        try {
            const result = await login(email.trim(), password);
            if (!result.success) setError(result.error || 'Login failed. Please check your credentials.');
        } catch {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const info = ROLE_INFO[activeTab];
    const Icon = info.icon;

    return (
        <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #fafafa 60%, #f0fdf4 100%)' }}>
            {/* Left panel */}
            <div className="hidden lg:flex flex-col justify-center items-center flex-1 p-16 transition-all duration-700" style={{ background: PANEL_GRADIENTS[activeTab] }}>
                <div className="max-w-sm text-white">
                    <div className="w-20 h-20 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center mb-8 backdrop-blur-sm">
                        <Fingerprint size={44} className="text-white" />
                    </div>
                    <h2 className="text-4xl font-black mb-3 leading-snug">Next-Gen<br />HRMS</h2>
                    <p className="text-base font-medium mb-10" style={{ color: PANEL_TEXT_COLOR[activeTab] }}>AI-powered recruitment and HR management for modern enterprises.</p>

                    <div className="space-y-3">
                        {Object.entries(ROLE_INFO).map(([key, r]) => {
                            const RIcon = r.icon;
                            return (
                                <div key={key} className="flex items-center gap-3 bg-white/10 border border-white/10 rounded-2xl px-5 py-3 backdrop-blur-sm">
                                    <RIcon size={18} className="shrink-0" style={{ color: PANEL_TEXT_COLOR[activeTab] }} />
                                    <div>
                                        <p className="text-white font-bold text-sm">{r.label}</p>
                                        <p className="text-xs" style={{ color: PANEL_TEXT_COLOR[activeTab] }}>{r.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-black text-gray-900">Welcome Back</h1>
                        <p className="text-gray-500 font-medium mt-1">Enter your credentials to sign in</p>
                    </div>

                    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                        {/* Role tabs — clicking auto-fills credentials */}
                        <div className="flex border-b border-gray-100">
                            {(Object.entries(ROLE_INFO) as [string, typeof ROLE_INFO.admin][]).map(([key, r]) => {
                                const isActive = activeTab === key;
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => switchTab(key as 'admin' | 'hr' | 'employee')}
                                        className="flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2"
                                        style={isActive ? {
                                            borderColor: r.color,
                                            color: r.color,
                                            backgroundColor: `${r.color}08`,
                                        } : { borderColor: 'transparent', color: '#9ca3af' }}
                                    >
                                        {key === 'hr' ? 'HR' : key}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="p-8">
                            {/* Role descriptor */}
                            <div className="flex items-start gap-3 mb-6 p-4 rounded-2xl" style={{ background: `${info.color}08`, border: `1px solid ${info.color}20` }}>
                                <Icon size={18} style={{ color: info.color }} className="shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-black uppercase tracking-wider" style={{ color: info.color }}>{info.label}</p>
                                    <p className="text-xs text-gray-500 font-medium mt-0.5">{info.desc}</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                                    <div className="relative">
                                        <Mail size={15} className="absolute left-3.5 top-3.5 text-gray-400" />
                                        <input
                                            type="email"
                                            value={email}
                                            autoComplete="email"
                                            onChange={e => { setEmail(e.target.value); setError(null); }}
                                            placeholder="Enter your email"
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
                                    <div className="relative">
                                        <Lock size={15} className="absolute left-3.5 top-3.5 text-gray-400" />
                                        <input
                                            type={showPwd ? 'text' : 'password'}
                                            value={password}
                                            autoComplete="current-password"
                                            onChange={e => { setPassword(e.target.value); setError(null); }}
                                            placeholder="Enter your password"
                                            className="w-full pl-10 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                                        />
                                        <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600">
                                            {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                                        <AlertCircle size={14} className="text-red-500 shrink-0" />
                                        <p className="text-xs font-bold text-red-600">{error}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-3.5 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all hover:shadow-lg ${BUTTON_SHADOWS[activeTab]} active:scale-[0.98] disabled:opacity-70 mt-2`}
                                    style={{ background: BUTTON_GRADIENTS[activeTab] }}
                                >
                                    {loading
                                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        : `Sign In to ${activeTab === 'admin' ? 'Admin' : activeTab === 'hr' ? 'HR' : 'Employee'} Portal`
                                    }
                                </button>
                            </form>
                        </div>
                    </div>

                    <p className="text-center mt-5 text-xs text-gray-400 font-medium">
                        Next-Gen HRMS · Enterprise Edition · v2.0
                    </p>
                </div>
            </div>
        </div>
    );
};
