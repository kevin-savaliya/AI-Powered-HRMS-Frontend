import React, { useState, useEffect } from 'react';
import { store, CampaignRecord } from '../utils/store';
import { Plus, Target, MapPin, BarChart3, ChevronRight, Users, Trash2, CheckCircle, PauseCircle } from 'lucide-react';

const STATUS_COLORS: Record<CampaignRecord['status'], string> = {
  draft: 'bg-gray-100 text-gray-600',
  active: 'bg-emerald-100 text-emerald-700',
  paused: 'bg-amber-100 text-amber-700',
  completed: 'bg-blue-100 text-blue-700',
};

export const Campaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', jobTitle: '', location: '' });
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = () => setCampaigns(store.getCampaigns());

  useEffect(() => { load(); }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.jobTitle.trim()) {
      setError('Campaign name and job title are required.');
      return;
    }
    store.createCampaign({
      name: form.name.trim(),
      jobTitle: form.jobTitle.trim(),
      location: form.location.trim(),
      status: 'active',
    });
    setForm({ name: '', jobTitle: '', location: '' });
    setError('');
    setShowCreate(false);
    load();
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this campaign and all its leads?')) {
      store.deleteCampaign(id);
      load();
    }
  };

  const toggleStatus = (c: CampaignRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    store.updateCampaignStatus(c.id, c.status === 'active' ? 'paused' : 'active');
    load();
  };

  const selected = campaigns.find(c => c.id === selectedId);
  const leads = selectedId ? store.getLeadsByCampaign(selectedId) : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Campaigns</h1>
          <p className="text-gray-500 font-medium mt-1">Manage outreach campaigns and candidate pipelines.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white font-black text-sm hover:shadow-lg hover:scale-105 transition-all"
          style={{ background: 'linear-gradient(135deg,#1d4ed8,#6366f1)' }}
        >
          <Plus size={18} /> Create Campaign
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center border-2 border-dashed border-gray-200 rounded-3xl py-24">
          <BarChart3 size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-black text-gray-700 mb-2">No Campaigns Yet</h2>
          <p className="text-gray-400 text-sm mb-6">Create your first campaign to start sourcing candidates.</p>
          <button onClick={() => setShowCreate(true)} className="px-6 py-3 rounded-2xl text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg,#1d4ed8,#6366f1)' }}>
            + Create Campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {campaigns.map(c => (
            <div
              key={c.id}
              onClick={() => setSelectedId(selectedId === c.id ? null : c.id)}
              className={`bg-white rounded-2xl border p-5 shadow-sm cursor-pointer transition-all hover:shadow-md ${selectedId === c.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-100'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#1d4ed815' }}>
                  <Target size={20} style={{ color: '#1d4ed8' }} />
                </div>
                <span className={`text-xs font-black px-2.5 py-1 rounded-full ${STATUS_COLORS[c.status]}`}>
                  {c.status.toUpperCase()}
                </span>
              </div>
              <h3 className="font-black text-gray-900 text-lg leading-tight mb-2">{c.name}</h3>
              <div className="space-y-1 text-xs text-gray-500 font-medium">
                <div className="flex items-center gap-1.5"><Target size={11} /> {c.jobTitle}</div>
                {c.location && <div className="flex items-center gap-1.5"><MapPin size={11} /> {c.location}</div>}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
                  <Users size={14} className="text-blue-600" /> {c.leadCount} leads
                </div>
                <div className="flex gap-1">
                  <button onClick={e => toggleStatus(c, e)} title={c.status === 'active' ? 'Pause' : 'Activate'} className="p-1.5 rounded-lg hover:bg-gray-100">
                    {c.status === 'active' ? <PauseCircle size={16} className="text-amber-500" /> : <CheckCircle size={16} className="text-emerald-500" />}
                  </button>
                  <button onClick={e => handleDelete(c.id, e)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50">
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                  <ChevronRight size={16} className={`text-gray-400 mt-0.5 transition-transform ${selectedId === c.id ? 'rotate-90' : ''}`} />
                </div>
              </div>

              {/* Lead mini-list when expanded */}
              {selectedId === c.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  {leads.length === 0 ? (
                    <p className="text-xs text-gray-400 font-medium text-center py-2">No leads yet. Use Candidate Scraper or add manually in CRM.</p>
                  ) : leads.slice(0, 5).map(l => (
                    <div key={l.id} className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-800">{l.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold capitalize">{l.stage}</span>
                    </div>
                  ))}
                  {leads.length > 5 && <p className="text-xs text-gray-400 text-center">+{leads.length - 5} more — view in CRM Pipeline</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowCreate(false); setError(''); }} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 z-10">
            <h2 className="text-xl font-black text-gray-900 mb-6">Create New Campaign</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">Campaign Name *</label>
                <input
                  autoFocus
                  type="text"
                  placeholder="e.g., React Dev Outreach Q1"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">Target Job Title *</label>
                <input
                  type="text"
                  placeholder="e.g., React Developer"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  value={form.jobTitle}
                  onChange={e => setForm({ ...form, jobTitle: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">Target Location</label>
                <input
                  type="text"
                  placeholder="e.g., Bangalore"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                />
              </div>
              {error && <p className="text-xs font-bold text-red-600 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowCreate(false); setError(''); }} className="flex-1 py-2.5 border border-gray-200 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl font-black text-white text-sm hover:shadow-lg transition-all" style={{ background: 'linear-gradient(135deg,#1d4ed8,#6366f1)' }}>
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};