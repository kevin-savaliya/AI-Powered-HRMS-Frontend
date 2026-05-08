import React, { useState } from 'react';
import { store, Document } from '../utils/store';
import { useAuth } from '../context/AuthContext';
import { FileText, Download, Plus, CheckCircle, Upload } from 'lucide-react';

const TYPE_LABELS = { offer_letter: 'Offer Letter', payslip: 'Payslip', kyc: 'KYC Document', other: 'Document' };
const TYPE_COLORS = { offer_letter: '#6366f1', payslip: '#10b981', kyc: '#f59e0b', other: '#64748b' };

const MONTHS = ['January 2026', 'February 2026', 'March 2026'];

export const EmployeeDocuments: React.FC = () => {
    const { user } = useAuth();
    const employee = user ? store.getEmployeeByUserId(user.id) : undefined;
    const [docs, setDocs] = useState<Document[]>(employee ? store.getDocumentsByEmployee(employee.id) : []);
    const [selectedMonth, setSelectedMonth] = useState('February 2026');
    const [kycSuccess, setKycSuccess] = useState<string | null>(null);

    const refresh = () => { if (employee) setDocs(store.getDocumentsByEmployee(employee.id)); };

    const downloadDoc = (doc: Document) => {
        const content = doc.content || `Document: ${doc.name}`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = doc.name; a.click();
        URL.revokeObjectURL(url);
    };

    const generatePayslip = () => {
        if (!employee) return;
        const payslip = store.generatePayslip(employee.id, selectedMonth);
        refresh();
        setTimeout(() => downloadDoc(payslip), 100);
    };

    const handleKycUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!employee || !e.target.files?.length) return;
        const file = e.target.files[0];
        const docs2 = store.getDocuments();
        docs2.push({ id: `kyc-${Date.now()}`, employeeId: employee.id, type: 'kyc', name: file.name, uploadedAt: new Date().toISOString() });
        localStorage.setItem('hrms_documents', JSON.stringify(docs2));
        setKycSuccess(`"${file.name}" uploaded successfully!`);
        refresh();
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-gray-900">My Documents</h1>
                <p className="text-gray-500 font-medium mt-1">Download payslips, your offer letter and upload KYC documents.</p>
            </div>

            {/* Generate Payslip */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="font-black text-gray-900 mb-4 flex items-center gap-2"><Plus size={17} className="text-emerald-600" />Generate & Download Payslip</h2>
                <div className="flex items-center gap-4">
                    <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <button onClick={generatePayslip} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-black hover:shadow-lg transition-all" style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}>
                        <Download size={15} /> Generate & Download
                    </button>
                </div>
            </div>

            {/* Upload KYC */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="font-black text-gray-900 mb-4 flex items-center gap-2"><Upload size={17} className="text-amber-600" />Upload KYC Document</h2>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
                    <input type="file" id="kyc-upload" className="hidden" accept=".pdf,.jpg,.png,.jpeg" onChange={handleKycUpload} />
                    <label htmlFor="kyc-upload" className="flex flex-col items-center gap-3 cursor-pointer">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center"><Upload size={22} className="text-amber-600" /></div>
                        <div>
                            <p className="font-bold text-gray-700">Click to upload KYC document</p>
                            <p className="text-xs text-gray-500 mt-0.5">PDF, JPG, PNG supported (max 10MB)</p>
                        </div>
                    </label>
                </div>
                {kycSuccess && <div className="mt-3 flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl"><CheckCircle size={14} className="text-emerald-500" /><p className="text-xs font-bold text-emerald-700">{kycSuccess}</p></div>}
            </div>

            {/* All docs */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100"><h2 className="font-black text-gray-900">All Documents ({docs.length})</h2></div>
                <div className="divide-y divide-gray-50">
                    {docs.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No documents available.</p>}
                    {docs.map(doc => (
                        <div key={doc.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${TYPE_COLORS[doc.type]}15` }}>
                                    <FileText size={18} style={{ color: TYPE_COLORS[doc.type] }} />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-900">{doc.name}</p>
                                    <p className="text-xs font-semibold" style={{ color: TYPE_COLORS[doc.type] }}>{TYPE_LABELS[doc.type]}</p>
                                    <p className="text-xs text-gray-400">{new Date(doc.uploadedAt).toLocaleDateString('en-IN')}</p>
                                </div>
                            </div>
                            {doc.content && (
                                <button onClick={() => downloadDoc(doc)} className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl border border-blue-100 hover:bg-blue-100 transition-all">
                                    <Download size={13} /> Download
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
