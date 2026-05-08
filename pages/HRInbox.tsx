import React, { useState, useEffect } from 'react';
import { store, LeadRecord } from '../utils/store';
import { useAuth } from '../context/AuthContext';
import { Mail, User, Clock, Tag, MessageSquare, CheckCircle, XCircle } from 'lucide-react';

const STAGE_COLORS: Record<string, string> = { sourced: '#6366f1', screening: '#f59e0b', interview: '#3b82f6', offer: '#10b981', hired: '#059669', rejected: '#ef4444' };

export const HRInbox: React.FC = () => {
    const { user } = useAuth();
    const [leads, setLeads] = useState<LeadRecord[]>([]);
    const [selected, setSelected] = useState<LeadRecord | null>(null);
    const [filter, setFilter] = useState<string>('all');

    const loadData = () => {
        store.init();
        setLeads(store.getLeads());
    };

    useEffect(() => { loadData(); }, []);

    const stages = ['all', 'sourced', 'screening', 'interview', 'offer'];
    const filtered = filter === 'all' ? leads : leads.filter(l => l.stage === filter);

    const handleStageUpdate = (id: string, stage: string) => {
        store.updateLeadStage(id, stage as any);
        loadData();
        if (selected?.id === id) setSelected({ ...selected, stage: stage as any });
    };

    return (
        <div className="space-y-6">
            <div><h1 className="text-3xl font-black text-gray-900">HR Inbox</h1><p className="text-gray-500 font-medium mt-1">Manage candidate leads and pipeline stages.</p></div>
            <div className="flex gap-2 flex-wrap">
                {stages.map(s => (
                    <button key={s} onClick={() => setFilter(s)} className={`px-4 py-1.5 rounded-full text-xs font-black uppercase transition-all ${filter === s ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {s === 'all' ? `All (${leads.length})` : `${s} (${leads.filter(l => l.stage === s).length})`}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100"><p className="font-black text-gray-900 text-sm">{filtered.length} leads</p></div>
                    <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
                        {filtered.length === 0 && <p className="text-gray-400 text-sm text-center py-8">No leads in this stage.</p>}
                        {filtered.map(lead => (
                            <div key={lead.id} onClick={() => setSelected(lead)} className={`p-4 cursor-pointer hover:bg-gray-50 transition-all ${selected?.id === lead.id ? 'bg-blue-50 border-l-2 border-blue-500' : ''}`}>
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="font-bold text-sm text-gray-900">{lead.name}</p>
                                        <p className="text-xs text-gray-500">{lead.email}</p>
                                    </div>
                                    <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: `${STAGE_COLORS[lead.stage]}20`, color: STAGE_COLORS[lead.stage] }}>{lead.stage}</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">{lead.source}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    {!selected ? (
                        <div className="flex flex-col items-center justify-center h-full py-16">
                            <Mail size={40} className="text-gray-200 mb-3" />
                            <p className="text-gray-400 font-medium">Select a lead to view details</p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900">{selected.name}</h2>
                                    <p className="text-gray-500 text-sm">{selected.email}</p>
                                </div>
                                <span className="px-3 py-1 rounded-full text-sm font-black" style={{ background: `${STAGE_COLORS[selected.stage]}15`, color: STAGE_COLORS[selected.stage] }}>{selected.stage}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs font-bold text-gray-500 uppercase mb-1">Source</p><p className="font-bold text-sm text-gray-900">{selected.source}</p></div>
                                <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs font-bold text-gray-500 uppercase mb-1">Applied</p><p className="font-bold text-sm text-gray-900">{new Date(selected.createdAt).toLocaleDateString()}</p></div>
                            </div>
                            {selected.notes && <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs font-bold text-gray-500 uppercase mb-1">Notes</p><p className="text-sm text-gray-700">{selected.notes}</p></div>}
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Move to Stage</p>
                                <div className="flex flex-wrap gap-2">
                                    {['sourced', 'screening', 'interview', 'offer', 'hired', 'rejected'].map(s => (
                                        <button key={s} onClick={() => handleStageUpdate(selected.id, s)} className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${selected.stage === s ? 'text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} style={selected.stage === s ? { background: STAGE_COLORS[s] } : {}}>{s}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};