import React, { useState, useEffect } from 'react';
import { store, CampaignRecord, LeadRecord, PipelineStage } from '../utils/store';
import { Users, Plus, Search, X, Briefcase } from 'lucide-react';

const STAGES: PipelineStage[] = ['sourced', 'screening', 'interview', 'offer', 'hired', 'rejected'];
const STAGE_COLORS: Record<PipelineStage, string> = {
    sourced: '#6366f1', screening: '#f59e0b', interview: '#3b82f6',
    offer: '#10b981', hired: '#059669', rejected: '#ef4444'
};
const STAGE_LABELS: Record<PipelineStage, string> = {
    sourced: 'Sourced', screening: 'Screening', interview: 'Interview',
    offer: 'Offer', hired: 'Hired', rejected: 'Rejected'
};

export const Leads: React.FC = () => {
    const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
    const [leads, setLeads] = useState<LeadRecord[]>([]);
    const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
    const [search, setSearch] = useState('');
    const [stageFilter, setStageFilter] = useState<PipelineStage | 'all'>('all');
    const [showAddLead, setShowAddLead] = useState(false);
    const [showAddCampaign, setShowAddCampaign] = useState(false);
    const [newLead, setNewLead] = useState({ name: '', email: '', source: 'Manual', campaignId: '' });
    const [newCampaign, setNewCampaign] = useState({ name: '', jobTitle: '', location: '', status: 'active' as CampaignRecord['status'] });

    const loadData = () => {
        store.init();
        setCampaigns(store.getCampaigns());
        setLeads(store.getLeads());
    };

    useEffect(() => { loadData(); }, []);

    const filteredLeads = leads.filter(l => {
        if (selectedCampaign !== 'all' && l.campaignId !== selectedCampaign) return false;
        if (stageFilter !== 'all' && l.stage !== stageFilter) return false;
        if (search && !l.name.toLowerCase().includes(search.toLowerCase()) && !l.email.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const handleAddCampaign = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCampaign.name.trim()) return;
        store.createCampaign({ name: newCampaign.name.trim(), jobTitle: newCampaign.jobTitle.trim(), location: newCampaign.location.trim(), status: newCampaign.status });
        setNewCampaign({ name: '', jobTitle: '', location: '', status: 'active' });
        setShowAddCampaign(false);
        loadData();
    };

    const handleAddLead = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLead.name.trim() || !newLead.email.trim() || !newLead.campaignId) return;
        store.addLead({ ...newLead, stage: 'sourced', skills: [], notes: '' });
        setNewLead({ name: '', email: '', source: 'Manual', campaignId: '' });
        setShowAddLead(false);
        loadData();
    };

    const handleStageChange = (id: string, stage: PipelineStage) => {
        store.updateLeadStage(id, stage);
        loadData();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">CRM Pipeline</h1>
                    <p className="text-gray-500 font-medium mt-1">Track and manage your recruitment leads.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowAddCampaign(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-blue-600 text-sm font-black border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-all">
                        <Briefcase size={15} />New Campaign
                    </button>
                    <button onClick={() => setShowAddLead(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-black hover:shadow-lg transition-all" style={{ background: 'linear-gradient(135deg,#1d4ed8,#6366f1)' }}>
                        <Plus size={15} />Add Lead
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"><p className="text-2xl font-black text-gray-900">{campaigns.length}</p><p className="text-xs font-bold text-gray-500 mt-1">Campaigns</p></div>
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"><p className="text-2xl font-black text-gray-900">{leads.length}</p><p className="text-xs font-bold text-gray-500 mt-1">Total Leads</p></div>
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"><p className="text-2xl font-black text-emerald-600">{leads.filter(l => l.stage === 'hired').length}</p><p className="text-xs font-bold text-gray-500 mt-1">Hired</p></div>
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"><p className="text-2xl font-black text-blue-600">{leads.filter(l => l.stage === 'interview').length}</p><p className="text-xs font-bold text-gray-500 mt-1">In Interview</p></div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={14} className="absolute left-3 top-3 text-gray-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads..." className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-400" />
                </div>
                <select value={selectedCampaign} onChange={e => setSelectedCampaign(e.target.value)} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-400">
                    <option value="all">All Campaigns</option>
                    {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select value={stageFilter} onChange={e => setStageFilter(e.target.value as any)} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-400">
                    <option value="all">All Stages</option>
                    {STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
                </select>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {STAGES.map(stage => {
                    const stageLeads = filteredLeads.filter(l => l.stage === stage);
                    return (
                        <div key={stage} className="bg-gray-50 rounded-2xl p-3 min-h-[200px]">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-black uppercase" style={{ color: STAGE_COLORS[stage] }}>{STAGE_LABELS[stage]}</span>
                                <span className="w-5 h-5 rounded-full text-white text-[10px] font-black flex items-center justify-center" style={{ background: STAGE_COLORS[stage] }}>{stageLeads.length}</span>
                            </div>
                            <div className="space-y-2">
                                {stageLeads.map(lead => (
                                    <div key={lead.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                                        <p className="font-bold text-xs text-gray-900 truncate">{lead.name}</p>
                                        <p className="text-[10px] text-gray-500 truncate">{lead.email}</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">{lead.source}</p>
                                        <select value={lead.stage} onChange={e => handleStageChange(lead.id, e.target.value as PipelineStage)} className="mt-2 w-full text-[10px] font-bold bg-gray-50 border border-gray-200 rounded-lg px-1 py-1 focus:outline-none" style={{ color: STAGE_COLORS[lead.stage] }}>
                                            {STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredLeads.length === 0 && leads.length === 0 && (
                <div className="text-center py-16">
                    <Users size={40} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No leads yet.</p>
                    <p className="text-gray-400 text-sm">Create a campaign first, then add leads to track them.</p>
                </div>
            )}

            {/* Add Campaign Modal */}
            {showAddCampaign && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-black text-gray-900">New Campaign</h3>
                            <button onClick={() => setShowAddCampaign(false)}><X size={18} className="text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleAddCampaign} className="space-y-4">
                            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Campaign Name *</label><input value={newCampaign.name} onChange={e => setNewCampaign(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Senior Developer Hiring" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-400" required /></div>
                            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Job Title</label><input value={newCampaign.jobTitle} onChange={e => setNewCampaign(p => ({ ...p, jobTitle: e.target.value }))} placeholder="e.g. React Developer" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-400" /></div>
                            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Location</label><input value={newCampaign.location} onChange={e => setNewCampaign(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Mumbai, Remote" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-400" /></div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowAddCampaign(false)} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-bold">Cancel</button>
                                <button type="submit" className="flex-1 py-2.5 rounded-xl text-white text-sm font-black" style={{ background: 'linear-gradient(135deg,#1d4ed8,#6366f1)' }}>Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Lead Modal */}
            {showAddLead && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-black text-gray-900">Add Lead</h3>
                            <button onClick={() => setShowAddLead(false)}><X size={18} className="text-gray-400" /></button>
                        </div>
                        {campaigns.length === 0 ? (
                            <div className="text-center py-6">
                                <Briefcase size={32} className="text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-500 text-sm font-medium">No campaigns exist yet.</p>
                                <p className="text-gray-400 text-xs mt-1">Create a campaign first before adding leads.</p>
                                <button onClick={() => { setShowAddLead(false); setShowAddCampaign(true); }} className="mt-4 px-4 py-2 rounded-xl text-white text-sm font-bold" style={{ background: 'linear-gradient(135deg,#1d4ed8,#6366f1)' }}>Create Campaign</button>
                            </div>
                        ) : (
                            <form onSubmit={handleAddLead} className="space-y-4">
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Campaign *</label>
                                    <select value={newLead.campaignId} onChange={e => setNewLead(p => ({ ...p, campaignId: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-400" required>
                                        <option value="">Select campaign</option>
                                        {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Candidate Name *</label><input value={newLead.name} onChange={e => setNewLead(p => ({ ...p, name: e.target.value }))} placeholder="Full name" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-400" required /></div>
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email *</label><input type="email" value={newLead.email} onChange={e => setNewLead(p => ({ ...p, email: e.target.value }))} placeholder="candidate@email.com" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-400" required /></div>
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Source</label>
                                    <select value={newLead.source} onChange={e => setNewLead(p => ({ ...p, source: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-400">
                                        {['Manual', 'LinkedIn', 'Indeed', 'Referral', 'Resume Parser'].map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowAddLead(false)} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-bold">Cancel</button>
                                    <button type="submit" className="flex-1 py-2.5 rounded-xl text-white text-sm font-black" style={{ background: 'linear-gradient(135deg,#1d4ed8,#6366f1)' }}>Add Lead</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};