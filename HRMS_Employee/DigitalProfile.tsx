import React, { useState } from 'react';
import { store } from '../utils/store';
import { useAuth } from '../context/AuthContext';
import { User, Save, CheckCircle, Plus, X } from 'lucide-react';

export const DigitalProfile: React.FC = () => {
    const { user } = useAuth();
    const employee = user ? store.getEmployeeByUserId(user.id) : undefined;

    const [name, setName] = useState(employee?.name || '');
    const [phone, setPhone] = useState(employee?.phone || '');
    const [bio, setBio] = useState(employee?.bio || '');
    const [skills, setSkills] = useState<string[]>(employee?.skills || []);
    const [skillInput, setSkillInput] = useState('');
    const [saved, setSaved] = useState(false);

    const addSkill = () => {
        if (!skillInput.trim() || skills.includes(skillInput.trim())) return;
        setSkills([...skills, skillInput.trim()]);
        setSkillInput('');
    };

    const removeSkill = (s: string) => setSkills(skills.filter(x => x !== s));

    const handleSave = () => {
        if (!employee) return;
        store.updateEmployee(employee.id, { name, phone, bio, skills });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    if (!employee) return <div className="text-center py-20 text-gray-400 font-medium">Employee record not found.</div>;

    const manager = store.getUsers().find(u => u.id === employee.managerId);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-gray-900">My Profile</h1>
                <p className="text-gray-500 font-medium mt-1">View and update your professional profile.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: avatar + static info */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-center space-y-4">
                    <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-white text-4xl font-black mx-auto shadow-lg" style={{ background: 'linear-gradient(135deg,#1d4ed8,#6366f1)' }}>{employee.name[0]}</div>
                    <div>
                        <h2 className="font-black text-xl text-gray-900">{employee.name}</h2>
                        <p className="text-sm text-blue-600 font-bold mt-0.5">{employee.designation}</p>
                        <p className="text-xs text-gray-500 font-medium">{employee.department}</p>
                    </div>
                    <div className="border-t border-gray-100 pt-4 text-left space-y-3">
                        {[
                            { label: 'Email', value: employee.email },
                            { label: 'Join Date', value: employee.joinDate },
                            { label: 'Manager', value: manager?.name || '—' },
                            { label: 'Employee ID', value: employee.id.slice(0, 8) + '...' },
                        ].map(f => (
                            <div key={f.label}>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{f.label}</p>
                                <p className="text-sm font-semibold text-gray-700 mt-0.5">{f.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: editable fields */}
                <div className="lg:col-span-2 space-y-5">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h2 className="font-black text-gray-900 mb-5 flex items-center gap-2"><User size={17} className="text-blue-600" />Edit Profile</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
                                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91-9000000000" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Professional Bio</label>
                                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Tell us about yourself..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none resize-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Skills</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {skills.map(s => (
                                        <span key={s} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-xs font-bold text-blue-700">
                                            {s}
                                            <button onClick={() => removeSkill(s)} className="text-blue-400 hover:text-blue-700"><X size={11} /></button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} placeholder="Add a skill (press Enter)" className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                                    <button onClick={addSkill} className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"><Plus size={18} /></button>
                                </div>
                            </div>
                            {saved && <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl"><CheckCircle size={14} className="text-emerald-500" /><p className="text-xs font-bold text-emerald-700">Profile saved successfully!</p></div>}
                            <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-black hover:shadow-lg transition-all" style={{ background: 'linear-gradient(135deg,#1d4ed8,#6366f1)' }}>
                                <Save size={15} /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
