import React, { useState, useEffect } from 'react';
import { store, Interview, InterviewType, InterviewOutcome } from '../utils/store';
import { Calendar, Clock, User, Briefcase, Plus, CheckCircle, XCircle, AlertTriangle, Trash2, MessageSquare, ChevronDown } from 'lucide-react';

const INTERVIEW_TYPES: InterviewType[] = ['Technical Round', 'HR Round', 'Culture Fit', 'Final Round', 'System Design'];
const DURATIONS = [30, 45, 60, 90, 120];

const OUTCOME_STYLES: Record<InterviewOutcome, { bg: string; text: string; icon: React.ReactNode }> = {
    pending: { bg: 'bg-gray-100', text: 'text-gray-600', icon: <Clock size={13} /> },
    passed: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: <CheckCircle size={13} /> },
    failed: { bg: 'bg-red-100', text: 'text-red-700', icon: <XCircle size={13} /> },
    no_show: { bg: 'bg-amber-100', text: 'text-amber-700', icon: <AlertTriangle size={13} /> },
};

function formatDate(dateStr: string) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(timeStr: string) {
    const [h, m] = timeStr.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${suffix}`;
}

export const Scheduler: React.FC = () => {
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [showSchedule, setShowSchedule] = useState(false);
    const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
    const [conflict, setConflict] = useState('');
    const [feedback, setFeedback] = useState('');

    const leads = store.getLeads().filter(l => !['hired', 'rejected'].includes(l.stage));
    const interviewers = store.getUsers();

    const emptyForm = {
        candidateName: '',
        role: '',
        interviewType: 'Technical Round' as InterviewType,
        interviewer: interviewers[0]?.name || '',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        duration: 60,
        leadId: '',
    };
    const [form, setForm] = useState(emptyForm);

    const refresh = () => setInterviews(store.getInterviews().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

    useEffect(() => { refresh(); }, []);

    // When a lead is selected, auto-fill name and role
    const handleLeadChange = (leadId: string) => {
        const lead = leads.find(l => l.id === leadId);
        setForm(f => ({
            ...f,
            leadId,
            candidateName: lead ? lead.name : f.candidateName,
            role: lead?.currentRole || f.role,
        }));
    };

    const handleSchedule = (e: React.FormEvent) => {
        e.preventDefault();
        setConflict('');
        if (!form.candidateName.trim() || !form.interviewer || !form.date || !form.time) return;

        const conf = store.checkInterviewConflict(form.date, form.time, form.duration, form.interviewer);
        if (conf) {
            setConflict(`⚠️ ${form.interviewer} already has "${conf.candidateName}" scheduled from ${formatTime(conf.time)} for ${conf.duration} min on this day. Please choose a different time.`);
            return;
        }

        store.createInterview({
            candidateName: form.candidateName.trim(),
            role: form.role.trim(),
            interviewType: form.interviewType,
            interviewer: form.interviewer,
            date: form.date,
            time: form.time,
            duration: form.duration,
            leadId: form.leadId || undefined,
            outcome: 'pending',
        });

        setForm(emptyForm);
        setShowSchedule(false);
        setFeedback('Interview scheduled successfully!');
        setTimeout(() => setFeedback(''), 3000);
        refresh();
    };

    const handleOutcomeUpdate = (id: string, outcome: InterviewOutcome, feedbackText: string) => {
        store.updateInterview(id, { outcome, feedback: feedbackText });
        // If passed and linked to a lead, advance lead stage
        const interview = interviews.find(i => i.id === id);
        if (outcome === 'passed' && interview?.leadId) {
            const lead = store.getLeads().find(l => l.id === interview.leadId);
            if (lead) {
                const stageProgression: Record<string, string> = {
                    sourced: 'screening', screening: 'interview', interview: 'offer', offer: 'hired'
                };
                const nextStage = stageProgression[lead.stage];
                if (nextStage) store.updateLeadStage(interview.leadId, nextStage as any);
            }
        }
        setSelectedInterview(null);
        refresh();
    };

    const handleDelete = (id: string) => {
        if (!confirm('Delete this interview?')) return;
        store.deleteInterview(id);
        if (selectedInterview?.id === id) setSelectedInterview(null);
        refresh();
    };

    const upcoming = interviews.filter(i => i.outcome === 'pending');
    const completed = interviews.filter(i => i.outcome !== 'pending');

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Interview Scheduler</h1>
                    <p className="text-gray-500 font-medium mt-1">Schedule and track candidate interviews with conflict detection.</p>
                </div>
                <button onClick={() => setShowSchedule(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white font-black text-sm hover:shadow-lg transition-all" style={{ background: 'linear-gradient(135deg,#1d4ed8,#6366f1)' }}>
                    <Plus size={18} /> Schedule Interview
                </button>
            </div>

            {feedback && (
                <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm font-bold text-emerald-700">
                    <CheckCircle size={16} /> {feedback}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Total', count: interviews.length, color: '#1d4ed8' },
                    { label: 'Upcoming', count: upcoming.length, color: '#6366f1' },
                    { label: 'Passed', count: interviews.filter(i => i.outcome === 'passed').length, color: '#059669' },
                    { label: 'Failed', count: interviews.filter(i => i.outcome === 'failed').length, color: '#dc2626' },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">
                        <div className="text-3xl font-black" style={{ color: s.color }}>{s.count}</div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Interview List */}
            {interviews.length === 0 ? (
                <div className="text-center border-2 border-dashed border-gray-200 rounded-3xl py-24">
                    <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-black text-gray-700 mb-2">No Interviews Scheduled</h2>
                    <p className="text-gray-400 text-sm mb-6">Schedule your first interview to get started.</p>
                    <button onClick={() => setShowSchedule(true)} className="px-6 py-3 rounded-2xl text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg,#1d4ed8,#6366f1)' }}>
                        + Schedule Interview
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {upcoming.length > 0 && (
                        <div>
                            <h2 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2"><Clock size={18} className="text-blue-600" /> Upcoming ({upcoming.length})</h2>
                            <div className="space-y-3">
                                {upcoming.map(i => <InterviewCard key={i.id} interview={i} onSelect={setSelectedInterview} onDelete={handleDelete} />)}
                            </div>
                        </div>
                    )}
                    {completed.length > 0 && (
                        <div>
                            <h2 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2"><CheckCircle size={18} className="text-emerald-600" /> Completed ({completed.length})</h2>
                            <div className="space-y-3">
                                {completed.map(i => <InterviewCard key={i.id} interview={i} onSelect={setSelectedInterview} onDelete={handleDelete} />)}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Schedule Modal */}
            {showSchedule && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowSchedule(false); setConflict(''); }} />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 z-10 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-black text-gray-900 mb-6">Schedule Interview</h2>
                        <form onSubmit={handleSchedule} className="space-y-4">
                            {/* Link to Lead */}
                            {leads.length > 0 && (
                                <div>
                                    <label className="text-xs font-black uppercase text-gray-500 block mb-1">Link to CRM Lead (Optional)</label>
                                    <select className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" value={form.leadId} onChange={e => handleLeadChange(e.target.value)}>
                                        <option value="">— Select lead —</option>
                                        {leads.map(l => <option key={l.id} value={l.id}>{l.name} ({l.stage})</option>)}
                                    </select>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-xs font-black uppercase text-gray-500 block mb-1">Candidate Name *</label>
                                    <input required className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" value={form.candidateName} onChange={e => setForm({ ...form, candidateName: e.target.value })} placeholder="e.g., Ananya Singh" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-black uppercase text-gray-500 block mb-1">Role / Position</label>
                                    <input className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="e.g., React Developer" />
                                </div>
                                <div>
                                    <label className="text-xs font-black uppercase text-gray-500 block mb-1">Interview Type *</label>
                                    <select required className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" value={form.interviewType} onChange={e => setForm({ ...form, interviewType: e.target.value as InterviewType })}>
                                        {INTERVIEW_TYPES.map(t => <option key={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-black uppercase text-gray-500 block mb-1">Interviewer *</label>
                                    <select required className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" value={form.interviewer} onChange={e => setForm({ ...form, interviewer: e.target.value })}>
                                        <option value="">— Select —</option>
                                        {interviewers.map(u => <option key={u.id} value={u.name}>{u.name} ({u.role})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-black uppercase text-gray-500 block mb-1">Date *</label>
                                    <input required type="date" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} min={new Date().toISOString().split('T')[0]} />
                                </div>
                                <div>
                                    <label className="text-xs font-black uppercase text-gray-500 block mb-1">Time *</label>
                                    <input required type="time" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs font-black uppercase text-gray-500 block mb-1">Duration</label>
                                    <select className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none" value={form.duration} onChange={e => setForm({ ...form, duration: +e.target.value })}>
                                        {DURATIONS.map(d => <option key={d} value={d}>{d} minutes</option>)}
                                    </select>
                                </div>
                            </div>
                            {conflict && <div className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2.5 rounded-xl">{conflict}</div>}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => { setShowSchedule(false); setConflict(''); }} className="flex-1 py-2.5 border border-gray-200 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="flex-1 py-2.5 rounded-xl font-black text-white text-sm" style={{ background: 'linear-gradient(135deg,#1d4ed8,#6366f1)' }}>Schedule</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Outcome Modal */}
            {selectedInterview && (
                <OutcomeModal
                    interview={selectedInterview}
                    onClose={() => setSelectedInterview(null)}
                    onSave={handleOutcomeUpdate}
                />
            )}
        </div>
    );
};

// ─── Interview Card ──────────────────────────────────────────────────────────
const InterviewCard: React.FC<{
    interview: Interview;
    onSelect: (i: Interview) => void;
    onDelete: (id: string) => void;
}> = ({ interview: i, onSelect, onDelete }) => {
    const o = OUTCOME_STYLES[i.outcome];
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-all">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl flex flex-col items-center justify-center text-center" style={{ background: '#1d4ed810' }}>
                <div className="text-lg font-black text-blue-700">{new Date(i.date + 'T00:00:00').getDate()}</div>
                <div className="text-[9px] font-bold text-blue-600 uppercase">{new Date(i.date + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short' })}</div>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-black text-gray-900 truncate">{i.candidateName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-100 flex-shrink-0">{i.interviewType}</span>
                </div>
                {i.role && <div className="text-xs text-gray-500 font-medium">{i.role}</div>}
                <div className="text-xs text-gray-400 font-medium flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1"><User size={10} /> {i.interviewer}</span>
                    <span className="flex items-center gap-1"><Clock size={10} /> {formatTime(i.time)} · {i.duration}min</span>
                </div>
                {i.feedback && <div className="mt-1.5 text-xs text-gray-600 italic bg-gray-50 px-2 py-1 rounded-lg truncate">"{i.feedback}"</div>}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full ${o.bg} ${o.text}`}>
                    {o.icon} {i.outcome.replace('_', ' ').toUpperCase()}
                </span>
                {i.outcome === 'pending' && (
                    <button onClick={() => onSelect(i)} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all">
                        Outcome
                    </button>
                )}
                <button onClick={() => onDelete(i.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400">
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
};

// ─── Outcome Modal ────────────────────────────────────────────────────────────
const OutcomeModal: React.FC<{
    interview: Interview;
    onClose: () => void;
    onSave: (id: string, outcome: InterviewOutcome, feedback: string) => void;
}> = ({ interview, onClose, onSave }) => {
    const [outcome, setOutcome] = useState<InterviewOutcome>(interview.outcome);
    const [feedbackText, setFeedbackText] = useState(interview.feedback || '');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 z-10">
                <h2 className="text-xl font-black text-gray-900 mb-2">Mark Interview Outcome</h2>
                <p className="text-sm text-gray-500 mb-6">
                    <span className="font-bold text-gray-700">{interview.candidateName}</span> · {interview.interviewType} · {formatDate(interview.date)}
                </p>
                <div className="grid grid-cols-2 gap-3 mb-5">
                    {(['passed', 'failed', 'no_show', 'pending'] as InterviewOutcome[]).map(o => {
                        const s = OUTCOME_STYLES[o];
                        return (
                            <button
                                key={o}
                                onClick={() => setOutcome(o)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-black border-2 transition-all ${outcome === o ? 'scale-105 shadow-md ring-2 ring-offset-1 ring-blue-400' : 'border-transparent opacity-70'} ${s.bg} ${s.text}`}
                            >
                                {s.icon} {o.replace('_', ' ').toUpperCase()}
                            </button>
                        );
                    })}
                </div>
                <div className="mb-5">
                    <label className="text-xs font-black uppercase text-gray-500 block mb-1.5">Feedback / Notes</label>
                    <textarea
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                        rows={4}
                        placeholder="e.g., Strong technical skills, good communication. Recommend for offer stage."
                        value={feedbackText}
                        onChange={e => setFeedbackText(e.target.value)}
                    />
                </div>
                {outcome === 'passed' && interview.leadId && (
                    <div className="mb-5 px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700">
                        ✅ The linked CRM lead will be automatically advanced to the next pipeline stage.
                    </div>
                )}
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                    <button onClick={() => onSave(interview.id, outcome, feedbackText)} className="flex-1 py-2.5 rounded-xl font-black text-white text-sm" style={{ background: 'linear-gradient(135deg,#1d4ed8,#6366f1)' }}>Save Outcome</button>
                </div>
            </div>
        </div>
    );
};
