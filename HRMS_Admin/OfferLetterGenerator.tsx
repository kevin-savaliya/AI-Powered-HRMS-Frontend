// OfferLetterGenerator.tsx — Professional PDF Offer Letter with Company Header
import React, { useState, useEffect } from 'react';
import { store, OfferLetter } from '../utils/store';
import { jsPDF } from 'jspdf';
import {
    FileText, Download, Send, Eye, History, X, CheckCircle,
    Building2, User, Calendar, DollarSign, Clock, Briefcase, Mail
} from 'lucide-react';

const PROBATION_OPTIONS = ['3 months', '6 months', '12 months'];
const NOTICE_OPTIONS = ['15 days', '30 days', '60 days', '90 days'];

const generatePDF = (letter: OfferLetter): void => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const margin = 20;
    let y = 0;

    // ── Header Band ──────────────────────────────────────────────────────────
    doc.setFillColor(30, 64, 175);          // blue-800
    doc.rect(0, 0, W, 42, 'F');

    // Company name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('NEXT-GEN HRMS', margin, 18);

    // Tagline
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(196, 213, 255);
    doc.text('Human Resource Management System  |  Empowering People, Powering Growth', margin, 26);

    // Horizontal separator line inside header
    doc.setDrawColor(255, 255, 255, 0.3);
    doc.setLineWidth(0.4);
    doc.line(margin, 31, W - margin, 31);

    // Contact line
    doc.setFontSize(8);
    doc.setTextColor(196, 213, 255);
    doc.text('📧 hr@nextgenhrms.io   🌐 www.nextgenhrms.io   📞 +91 80000 99000', margin, 37);

    y = 54;

    // ── Date ────────────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    const dateStr = new Date(letter.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.text(dateStr, W - margin, y, { align: 'right' });

    // Ref no.
    doc.text(`Ref: HRMS/${new Date(letter.createdAt).getFullYear()}/OL-${letter.id.slice(-6).toUpperCase()}`, margin, y);
    y += 10;

    // ── Offer Title ──────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(30, 64, 175);
    doc.text('LETTER OF OFFER', W / 2, y, { align: 'center' });
    y += 6;

    // Underline effect
    doc.setDrawColor(30, 64, 175);
    doc.setLineWidth(0.8);
    doc.line(W / 2 - 28, y, W / 2 + 28, y);
    y += 10;

    // ── Addressee ────────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`Dear ${letter.candidateName},`, margin, y);
    y += 8;

    // Opening para
    const openPara = `We are pleased to inform you that Next-Gen HRMS Solutions Private Limited has selected you for the position of ${letter.position} in our ${letter.department} department. This offer is made based on the skills and experience you have demonstrated during the selection process.`;
    const openLines = doc.splitTextToSize(openPara, W - margin * 2);
    doc.text(openLines, margin, y);
    y += openLines.length * 5 + 6;

    // ── Details Table ─────────────────────────────────────────────────────────
    // Light blue header band for table
    doc.setFillColor(239, 246, 255);
    doc.rect(margin, y, W - margin * 2, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 64, 175);
    doc.text('OFFER DETAILS', margin + 4, y + 5.5);
    y += 10;

    const rows: [string, string][] = [
        ['Designation', letter.position],
        ['Department', letter.department],
        ['Annual CTC', `INR ${Number(letter.salary.replace(/,/g, '')).toLocaleString('en-IN')} per annum`],
        ['Date of Joining', new Date(letter.joinDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })],
        ['Reporting Manager', letter.reportingManager],
        ['Probation Period', letter.probation],
        ['Notice Period', letter.noticePeriod],
    ];
    rows.forEach(([label, value], i) => {
        if (i % 2 === 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(margin, y - 1, W - margin * 2, 7, 'F');
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text(label, margin + 4, y + 4);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        doc.text(value, margin + 55, y + 4);
        y += 7;
    });
    // Bottom border of table
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.rect(margin, y - rows.length * 7 - 2, W - margin * 2, rows.length * 7 + 2);
    y += 6;

    // ── Terms Section ────────────────────────────────────────────────────────
    doc.setFillColor(239, 246, 255);
    doc.rect(margin, y, W - margin * 2, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 64, 175);
    doc.text('TERMS & CONDITIONS', margin + 4, y + 5.5);
    y += 12;

    const terms = [
        'This offer is subject to successful completion of a background verification process.',
        `You will be on probation for ${letter.probation} from your date of joining. During this period, either party may terminate with one week's written notice.`,
        `After confirmation, the notice period will be ${letter.noticePeriod} on either side.`,
        'The compensation stated above is the total cost to the company; breakdown will be shared in the salary structure.',
        'This offer letter is strictly confidential and must not be shared with any third party.',
    ];
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    terms.forEach((t, i) => {
        const lines = doc.splitTextToSize(`${i + 1}.  ${t}`, W - margin * 2 - 4);
        doc.text(lines, margin + 4, y);
        y += lines.length * 4.8 + 1.5;
    });
    y += 4;

    // ── Acceptance ───────────────────────────────────────────────────────────
    const acceptPara = 'Please sign and return a copy of this letter as confirmation of your acceptance of this offer within 7 days of receipt. We look forward to welcoming you to Next-Gen HRMS and wish you a long, fulfilling, and rewarding career with us.';
    const acceptLines = doc.splitTextToSize(acceptPara, W - margin * 2);
    doc.setTextColor(15, 23, 42);
    doc.text(acceptLines, margin, y);
    y += acceptLines.length * 5 + 8;

    // ── Signature area ───────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('For Next-Gen HRMS Solutions Pvt. Ltd.', margin, y);
    doc.text('Accepted by Candidate:', W - margin - 70, y);
    y += 14;
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.4);
    doc.line(margin, y, margin + 55, y);                         // HR signature line
    doc.line(W - margin - 60, y, W - margin, y);                 // Candidate signature line
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`${letter.reportingManager}`, margin, y);
    doc.text('Signature & Date', W - margin - 60, y);
    y += 3.5;
    doc.text('Authorised Signatory', margin, y);
    doc.text(`Name: ${letter.candidateName}`, W - margin - 60, y);

    // ── Footer ───────────────────────────────────────────────────────────────
    doc.setFillColor(30, 64, 175);
    doc.rect(0, H - 12, W, 12, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(196, 213, 255);
    doc.text('Next-Gen HRMS Solutions Pvt. Ltd.  |  This is a system-generated document', W / 2, H - 4.5, { align: 'center' });

    doc.save(`Offer_Letter_${letter.candidateName.replace(/\s+/g, '_')}.pdf`);
};

// ────────────────────────────────────────────────────────────────────────────

export const OfferLetterGenerator: React.FC = () => {
    const [form, setForm] = useState({
        candidateName: '', email: '', position: '', department: '',
        salary: '', joinDate: '', reportingManager: '', probation: '6 months', noticePeriod: '30 days',
    });
    const [errors, setErrors] = useState<Partial<typeof form>>({});
    const [generated, setGenerated] = useState<OfferLetter | null>(null);
    const [feedback, setFeedback] = useState('');
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState<OfferLetter[]>([]);
    const [departments, setDepartments] = useState<string[]>([]);
    const [hrUsers, setHrUsers] = useState<string[]>([]);

    useEffect(() => {
        setDepartments(store.getDepartments().map(d => d.name));
        setHrUsers(store.getUsers().filter(u => ['admin', 'hr'].includes(u.role)).map(u => u.name));
        setHistory(store.getOfferLetters().slice().reverse());
    }, []);

    const set = (field: keyof typeof form, value: string) => {
        setForm(f => ({ ...f, [field]: value }));
        setErrors(e => ({ ...e, [field]: '' }));
    };

    const validate = (): boolean => {
        const e: Partial<typeof form> = {};
        if (!form.candidateName.trim()) e.candidateName = 'Required';
        if (!form.position.trim()) e.position = 'Required';
        if (!form.department) e.department = 'Required';
        if (!form.salary.trim()) e.salary = 'Required';
        if (!form.joinDate) e.joinDate = 'Required';
        if (!form.reportingManager.trim()) e.reportingManager = 'Required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleGenerate = () => {
        if (!validate()) return;
        const letter = store.generateOfferLetter({
            candidateName: form.candidateName,
            email: form.email,
            position: form.position,
            department: form.department,
            salary: form.salary,
            joinDate: form.joinDate,
            reportingManager: form.reportingManager,
            probation: form.probation,
            noticePeriod: form.noticePeriod,
        });
        setGenerated(letter);
        setHistory(store.getOfferLetters().slice().reverse());
        setFeedback('');
    };

    const handleDownload = () => {
        if (!generated) return;
        generatePDF(generated);
        setFeedback('✅ PDF downloaded!');
    };

    const handleSend = () => {
        if (!generated) return;
        store.markOfferLetterSent(generated.id);
        setGenerated({ ...generated, status: 'sent' });
        setHistory(store.getOfferLetters().slice().reverse());
        setFeedback(`📧 Offer letter marked as sent to ${generated.email || generated.candidateName}! (Simulation: log available in browser console)`);
    };

    const handleMailTo = () => {
        if (!generated) return;
        const subject = `Offer Letter - Next-Gen HRMS - ${generated.candidateName}`;
        const body = `Dear ${generated.candidateName},\n\nPlease find your offer letter details below:\n\nPosition: ${generated.position}\nDepartment: ${generated.department}\nCTC: ${generated.salary}\n\nPlease download the full PDF from the portal.`;
        window.location.href = `mailto:${generated.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const inputCls = (err?: string) =>
        `w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${err ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-200 bg-gray-50 focus:bg-white'}`;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Offer Letter Generator</h1>
                    <p className="text-gray-500 font-medium mt-1">Generate professional PDF offer letters with company branding.</p>
                </div>
                <button
                    onClick={() => { setShowHistory(true); setHistory(store.getOfferLetters().slice().reverse()); }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-gray-200 font-black text-sm text-gray-600 hover:bg-gray-50 transition-all"
                >
                    <History size={16} /> History ({history.length})
                </button>
            </div>

            {feedback && (
                <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm font-bold text-emerald-700">
                    <CheckCircle size={16} /> {feedback}
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Form */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 space-y-5">
                    <h2 className="font-black text-sm uppercase tracking-widest text-gray-500">Candidate Details</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">
                                <User size={10} className="inline mr-1" /> Candidate Name *
                            </label>
                            <input value={form.candidateName} onChange={e => set('candidateName', e.target.value)} placeholder="Full name" className={inputCls(errors.candidateName)} />
                            {errors.candidateName && <p className="text-xs text-red-500 mt-1">{errors.candidateName}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">Email</label>
                            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="candidate@email.com" className={inputCls()} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">
                                <Briefcase size={10} className="inline mr-1" /> Position / Designation *
                            </label>
                            <input value={form.position} onChange={e => set('position', e.target.value)} placeholder="e.g. Senior React Developer" className={inputCls(errors.position)} />
                            {errors.position && <p className="text-xs text-red-500 mt-1">{errors.position}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">
                                <Building2 size={10} className="inline mr-1" /> Department *
                            </label>
                            <select value={form.department} onChange={e => set('department', e.target.value)} className={inputCls(errors.department)}>
                                <option value="">Select department</option>
                                {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                <option value="Engineering">Engineering</option>
                                <option value="Product">Product</option>
                                <option value="Sales">Sales</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Operations">Operations</option>
                                <option value="Finance">Finance</option>
                                <option value="Human Resources">Human Resources</option>
                            </select>
                            {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">
                                <DollarSign size={10} className="inline mr-1" /> Annual CTC (INR) *
                            </label>
                            <input value={form.salary} onChange={e => set('salary', e.target.value)} placeholder="e.g. 12,00,000" className={inputCls(errors.salary)} />
                            {errors.salary && <p className="text-xs text-red-500 mt-1">{errors.salary}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">
                                <Calendar size={10} className="inline mr-1" /> Date of Joining *
                            </label>
                            <input type="date" value={form.joinDate} onChange={e => set('joinDate', e.target.value)} className={inputCls(errors.joinDate)} />
                            {errors.joinDate && <p className="text-xs text-red-500 mt-1">{errors.joinDate}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">
                            <User size={10} className="inline mr-1" /> Reporting Manager *
                        </label>
                        <input
                            list="hr-users-list"
                            value={form.reportingManager} onChange={e => set('reportingManager', e.target.value)}
                            placeholder="Type or select manager name"
                            className={inputCls(errors.reportingManager)}
                        />
                        <datalist id="hr-users-list">
                            {hrUsers.map(u => <option key={u} value={u} />)}
                        </datalist>
                        {errors.reportingManager && <p className="text-xs text-red-500 mt-1">{errors.reportingManager}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">
                                <Clock size={10} className="inline mr-1" /> Probation Period
                            </label>
                            <select value={form.probation} onChange={e => set('probation', e.target.value)} className={inputCls()}>
                                {PROBATION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">
                                <Clock size={10} className="inline mr-1" /> Notice Period
                            </label>
                            <select value={form.noticePeriod} onChange={e => set('noticePeriod', e.target.value)} className={inputCls()}>
                                {NOTICE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        className="w-full py-3.5 rounded-2xl font-black text-white text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        style={{ background: 'linear-gradient(135deg,#1d4ed8,#6366f1)' }}
                    >
                        <Eye size={16} /> Generate & Preview
                    </button>
                </div>

                {/* Preview */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    {/* Preview header */}
                    <div className="px-7 py-4 border-b border-gray-50 flex items-center justify-between">
                        <h2 className="font-black text-sm text-gray-700 uppercase tracking-widest">Preview</h2>
                        {generated && (
                            <div className="flex gap-2">
                                <button onClick={handleDownload}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black text-white transition-all hover:shadow-md"
                                    style={{ background: 'linear-gradient(135deg,#1d4ed8,#6366f1)' }}>
                                    <Download size={14} /> Download PDF
                                </button>
                                {generated.status !== 'sent' && (
                                    <div className="flex gap-2">
                                        <button onClick={handleSend}
                                            title="Mark as sent in system (Simulated)"
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black text-white transition-all hover:shadow-md"
                                            style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
                                            <Send size={14} /> Send (Sim)
                                        </button>
                                        <button onClick={handleMailTo}
                                            title="Open in local email client"
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black text-white transition-all hover:shadow-md"
                                            style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}>
                                            <Mail size={14} /> Mailto
                                        </button>
                                    </div>
                                )}
                                {generated.status === 'sent' && (
                                    <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        <CheckCircle size={14} /> Sent
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {!generated ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center p-8">
                            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                                <FileText size={28} className="text-blue-400" />
                            </div>
                            <p className="font-black text-gray-400 text-lg">No preview yet</p>
                            <p className="text-sm text-gray-300 mt-1">Fill the form and click Generate & Preview</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-7 font-mono text-xs text-gray-600 leading-relaxed bg-gray-50" style={{ whiteSpace: 'pre-wrap' }}>
                            {/* Inline styled preview mimicking the PDF */}
                            <div className="bg-blue-800 text-white -mx-7 -mt-7 px-7 py-5 mb-6">
                                <p className="text-xl font-black tracking-wide">NEXT-GEN HRMS</p>
                                <p className="text-blue-200 text-xs mt-0.5">Human Resource Management System | Empowering People, Powering Growth</p>
                                <div className="border-t border-blue-600 mt-3 pt-2">
                                    <p className="text-blue-200 text-[10px]">📧 hr@nextgenhrms.io  🌐 www.nextgenhrms.io  📞 +91 80000 99000</p>
                                </div>
                            </div>
                            <div className="space-y-1 mb-5 font-sans">
                                <p className="text-[11px] text-gray-400">Ref: HRMS/{new Date(generated.createdAt).getFullYear()}/OL-{generated.id.slice(-6).toUpperCase()}</p>
                                <p className="text-[11px] text-gray-400">{new Date(generated.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                            <h2 className="font-black text-blue-700 text-base text-center font-sans mb-5">LETTER OF OFFER</h2>
                            <p className="font-sans mb-4">Dear {generated.candidateName},</p>
                            <p className="font-sans text-[11px] mb-5 text-gray-600">We are pleased to offer you the position of <strong>{generated.position}</strong> in our {generated.department} department.</p>
                            <div className="bg-blue-50 rounded-xl p-4 mb-4">
                                <table className="w-full text-[11px] font-sans">
                                    <tbody className="divide-y divide-blue-100">
                                        {([['Designation', generated.position], ['Department', generated.department], ['CTC', `INR ${generated.salary}`], ['Joining', generated.joinDate], ['Manager', generated.reportingManager], ['Probation', generated.probation], ['Notice', generated.noticePeriod]] as [string, string][]).map(([k, v]) => (
                                            <tr key={k}>
                                                <td className="py-1.5 font-black text-gray-700 w-28">{k}</td>
                                                <td className="py-1.5 text-gray-600">{v}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className="font-sans text-[11px] text-gray-500 italic">Full terms, signature section and company seal included in the downloaded PDF.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* History Modal */}
            {showHistory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowHistory(false)} />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col z-10">
                        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-50">
                            <h2 className="text-xl font-black text-gray-900">Offer Letter History</h2>
                            <button onClick={() => setShowHistory(false)}><X size={20} className="text-gray-400" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 space-y-3">
                            {history.length === 0 ? (
                                <div className="text-center py-12">
                                    <FileText size={32} className="text-gray-200 mx-auto mb-3" />
                                    <p className="text-sm font-bold text-gray-400">No letters generated yet</p>
                                </div>
                            ) : history.map(l => (
                                <div key={l.id} className="flex items-center justify-between bg-gray-50 rounded-2xl p-4">
                                    <div>
                                        <p className="font-black text-gray-900 text-sm">{l.candidateName}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{l.position} · {l.department}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{new Date(l.createdAt).toLocaleDateString('en-IN')}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-black px-2.5 py-1 rounded-full ${l.status === 'sent' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'}`}>
                                            {l.status === 'sent' ? '✅ Sent' : 'Draft'}
                                        </span>
                                        <button onClick={() => { generatePDF(l); }} title="Download PDF"
                                            className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all">
                                            <Download size={15} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
