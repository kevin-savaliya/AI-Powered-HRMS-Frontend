// Scraper.tsx — Complete rewrite using localStorage store (no Supabase/URL required)
import React, { useState, useEffect } from 'react';
import { store, CampaignRecord, LeadRecord } from '../utils/store';
import { ApifyProfile, Candidate } from '../types';
import { MOCK_APIFY_RESPONSE } from '../mockData';
import { SENIORITY_MAPPING, EXPERIENCE_MAPPING } from '../constants';
import {
  Search, Play, Loader2, AlertCircle, MapPin, Save, CheckCircle,
  ChevronRight, Users, Target, Slack, Linkedin
} from 'lucide-react';

// ── Transform Apify mock data to Candidate shape ─────────────────────────────
function transformApify(data: ApifyProfile): Candidate {
  const exp0 = data.experience?.[0];
  const pos0 = data.currentPosition?.[0];
  const role = exp0?.position || pos0?.title || 'Open to Work';
  const company = exp0?.companyName || pos0?.companyName || 'Freelancer';
  let skills: string[] = [];
  if (Array.isArray(data.skills) && data.skills.length > 0) {
    skills = typeof data.skills[0] === 'string'
      ? (data.skills as string[])
      : (data.skills as any[]).map(s => s.name);
  }
  return {
    id: data.publicIdentifier || Math.random().toString(36).slice(2, 9),
    fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
    headline: data.headline || 'No Headline',
    currentRole: role,
    company,
    location: data.location?.linkedinText || 'Remote',
    avatarUrl: data.profilePicture?.url || '',
    linkedinUrl: data.linkedinUrl || '',
    skills,
    summary: data.about || '',
    verified: data.verified || false,
  };
}

export const Scraper: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [selectedSeniority, setSelectedSeniority] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [allSaved, setAllSaved] = useState(false);
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const camps = store.getCampaigns().filter(c => c.status !== 'completed');
    setCampaigns(camps);
    if (camps.length > 0) setSelectedCampaign(camps[0].id);
  }, []);

  const toggle = (id: string, list: string[], set: (v: string[]) => void) => {
    set(list.includes(id) ? list.filter(x => x !== id) : [...list, id]);
  };

  const handleSearch = async () => {
    if (!keyword.trim()) { setError('Enter a keyword or job title to search.'); return; }
    setError(null);
    setLoading(true);
    setCandidates([]);
    setSavedIds(new Set());
    setAllSaved(false);

    const apifyToken = import.meta.env.VITE_APIFY_API_TOKEN;
    
    // Fallback to mock data if no API token is configured
    if (!apifyToken) {
      setTimeout(() => {
        try {
          const results = MOCK_APIFY_RESPONSE.map((d: any) => transformApify(d as ApifyProfile));
          setCandidates(results);
          setError('API Key not found in .env. Falling back to mock data. Please configure VITE_APIFY_API_TOKEN.');
        } catch {
          setError('Failed to load mock data. See console for details.');
        }
        setLoading(false);
      }, 1500);
      return;
    }

    try {
      // NOTE: We rely on the env variable for the chosen Apify Actor
      const actorId = import.meta.env.VITE_APIFY_ACTOR_ID;
      
      if (!actorId) {
        throw new Error('VITE_APIFY_ACTOR_ID is missing in your .env file. Please add an Apify LinkedIn scraper ID like: VITE_APIFY_ACTOR_ID=curious_coder~linkedin-profile-scraper');
      }

      // Format query for searching LinkedIn via Google to bypass restrictions
      const query = `site:linkedin.com/in "${keyword}" "${location || ''}"`.trim();
      
      let payloadBody = {};
      
      // Auto-adapt payload based on the selected actor:
      if (actorId.includes('google-search-scraper')) {
        payloadBody = {
          queries: query,
          maxPagesPerQuery: 1,
          resultsPerPage: 10,
          countryCode: 'us',
        };
      } else {
        // Fallback for custom search actors (like basic search params)
        payloadBody = {
          keyword: keyword,
          searchKeywords: keyword,
          location: location || '',
          limit: 10
        };
      }
      
      const response = await fetch(`https://api.apify.com/v2/acts/${actorId.replace('/', '~')}/run-sync-get-dataset-items?token=${apifyToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payloadBody),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Apify Actor '${actorId}' not found. Please verify your VITE_APIFY_ACTOR_ID in the .env file exactly matches a valid Apify Actor ID (e.g., username~actor-name).`);
        }
        if (response.status === 400) {
           throw new Error(`Apify request failed with 400 Bad Request. The Actor '${actorId}' expects different input parameters (e.g., a list of URLs instead of keywords). Please use a Search-based actor (like apify/google-search-scraper).`);
        }
        throw new Error(`Apify request failed: ${response.status} ${response.statusText}`);
      }

      let data = await response.json();
      
      // Handle the nested dataset response from standard apify templates
      if (Array.isArray(data) && data.length > 0 && data[0].organicResults) {
         data = data[0].organicResults;
      } else if (data && data.organicResults) {
         data = data.organicResults;
      }
      
      if (Array.isArray(data) && data.length > 0) {
        // Map actual real data to to standard format
        const results = data.map((d: any) => {
           // Support mapping from direct LinkedIn scraper vs Google Search scraper
           if (d.publicIdentifier || d.firstName) return transformApify(d as ApifyProfile);
           
           // If it's from Google Search (highly reliable for candidates)
           if (d.title && d.url && d.url.includes('linkedin.com')) {
              const parts = d.title.split(' - ');
              const fullName = parts[0]?.trim() || 'Unknown Candidate';
              let role = parts[1]?.trim() || keyword;
              let company = parts.length > 2 ? parts[2]?.replace(' | LinkedIn', '').trim() : 'Unknown';
              if (role.includes('| LinkedIn')) role = role.replace('| LinkedIn', '').trim();
              
              return {
                 id: d.url,
                 fullName: fullName,
                 headline: d.description || role,
                 currentRole: role,
                 company: company,
                 location: location || 'Remote',
                 avatarUrl: '', // Google does not extract avatars
                 linkedinUrl: d.url,
                 skills: [keyword],
                 summary: d.description || '',
                 verified: true
              } as Candidate;
           }
           
           return transformApify(d as ApifyProfile);
        });
        
        // Filter out bad links/generic pages
        setCandidates(results.filter(r => r.id && r.fullName.toLowerCase() !== 'unknown candidate'));
      } else {
        setError('No candidates found matching your criteria from the Apify output.');
        setCandidates([]);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch actual data from Apify. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (c: Candidate) => {
    if (!selectedCampaign) { setFeedback('⚠️ Please select a campaign first.'); return; }
    if (savedIds.has(c.id)) return;
    store.addLead({
      campaignId: selectedCampaign,
      name: c.fullName || 'Unknown',
      email: `${(c.fullName || 'candidate').toLowerCase().replace(/\s+/g, '.')}@linkedin.com`,
      currentRole: c.currentRole,
      company: c.company,
      location: c.location,
      skills: c.skills,
      source: 'AI Scraper (Mock)',
      stage: 'sourced',
      notes: c.headline,
      matchScore: Math.floor(50 + Math.random() * 49),
    });
    const next = new Set(savedIds);
    next.add(c.id);
    setSavedIds(next);
    showFeedback(`✅ "${c.fullName}" saved to CRM Pipeline!`);
  };

  const handleSaveAll = () => {
    if (!selectedCampaign) { setFeedback('⚠️ Please select a campaign first.'); return; }
    let count = 0;
    candidates.forEach(c => {
      if (!savedIds.has(c.id)) {
        store.addLead({
          campaignId: selectedCampaign,
          name: c.fullName || 'Unknown',
          email: `${(c.fullName || 'candidate').toLowerCase().replace(/\s+/g, '.')}@linkedin.com`,
          currentRole: c.currentRole, company: c.company, location: c.location,
          skills: c.skills, source: 'AI Scraper (Mock)', stage: 'sourced',
          notes: c.headline, matchScore: Math.floor(50 + Math.random() * 49),
        });
        count++;
      }
    });
    const allIds = new Set(candidates.map(c => c.id));
    setSavedIds(allIds);
    setAllSaved(true);
    showFeedback(`✅ All ${count} candidates saved to CRM!`);
  };

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 4000);
  };

  const activeCampaign = campaigns.find(c => c.id === selectedCampaign);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900">AI Candidate Scraper</h1>
        <p className="text-gray-500 font-medium mt-1">Search and scrape LinkedIn profiles with mock data, then save to your CRM pipeline.</p>
      </div>

      {feedback && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm font-bold text-emerald-700">
          <CheckCircle size={16} /> {feedback}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Search Panel */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5 sticky top-24">
            <h2 className="font-black text-sm uppercase tracking-widest text-gray-500">Search Criteria</h2>

            {/* Campaign Picker */}
            <div>
              <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">
                <Target size={11} className="inline mr-1" /> Save to Campaign
              </label>
              {campaigns.length === 0 ? (
                <div className="text-xs text-amber-600 font-bold bg-amber-50 border border-amber-200 rounded-xl p-2.5">
                  No active campaigns. <a href="#/campaigns" className="underline">Create one first</a>.
                </div>
              ) : (
                <select
                  value={selectedCampaign}
                  onChange={e => setSelectedCampaign(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  {campaigns.map(c => <option key={c.id} value={c.id}>{c.name} — {c.jobTitle}</option>)}
                </select>
              )}
            </div>

            {/* Keyword */}
            <div>
              <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">Job Title / Keywords</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text" value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="e.g. React Developer"
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">Location</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text" value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Bangalore, India"
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>

            {/* Seniority */}
            <div>
              <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2">Seniority Level</label>
              <div className="flex flex-wrap gap-1.5">
                {SENIORITY_MAPPING.map(s => (
                  <button key={s.id} onClick={() => toggle(s.id, selectedSeniority, setSelectedSeniority)}
                    className={`text-xs px-3 py-1.5 rounded-full border font-bold transition-all ${selectedSeniority.includes(s.id) ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-blue-300'}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2">Years of Experience</label>
              <div className="flex flex-wrap gap-1.5">
                {EXPERIENCE_MAPPING.map(e => (
                  <button key={e.id} onClick={() => toggle(e.id, selectedExperience, setSelectedExperience)}
                    className={`text-xs px-3 py-1.5 rounded-full border font-bold transition-all ${selectedExperience.includes(e.id) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-indigo-300'}`}>
                    {e.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-bold">
                <AlertCircle size={13} className="mt-0.5 shrink-0" /> {error}
              </div>
            )}

            <button
              onClick={handleSearch} disabled={loading}
              className="w-full py-3 rounded-2xl font-black text-white text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#4f46e5,#1d4ed8)' }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
              {loading ? 'Scraping...' : 'Run AI Scraper (Mock)'}
            </button>
          </div>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-8 space-y-5">
          {candidates.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="font-black text-gray-900 text-lg">{candidates.length} Candidates Found</h2>
                {savedIds.size > 0 && (
                  <span className="text-xs font-black px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                    {savedIds.size} Saved to CRM
                  </span>
                )}
                <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-full">
                  Mock LinkedIn Data
                </span>
              </div>
              <button
                onClick={handleSaveAll}
                disabled={allSaved}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black text-white disabled:opacity-50 transition-all hover:shadow-md"
                style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}
              >
                <Save size={15} /> Save All to CRM
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
                <Linkedin size={22} className="absolute inset-0 m-auto text-blue-600" />
              </div>
              <div className="text-center">
                <p className="font-black text-gray-700">Scraping LinkedIn profiles...</p>
                <p className="text-sm text-gray-400 font-medium mt-1">Loading mock Apify data</p>
              </div>
            </div>
          )}

          {!loading && candidates.length === 0 && (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl py-24 text-center">
              <Linkedin size={48} className="text-gray-200 mb-4" />
              <p className="font-black text-gray-400 text-lg">No results yet</p>
              <p className="text-sm text-gray-300 mt-1">Enter a keyword and click Run AI Scraper</p>
            </div>
          )}

          {!loading && candidates.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {candidates.map(c => (
                <CandidateResultCard
                  key={c.id}
                  candidate={c}
                  saved={savedIds.has(c.id)}
                  onSave={() => handleSave(c)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Inline candidate card (replaces broken CandidateCard import) ──────────────
const CandidateResultCard: React.FC<{ candidate: Candidate; saved: boolean; onSave: () => void }> = ({ candidate, saved, onSave }) => (
  <div className={`bg-white rounded-2xl border p-5 shadow-sm transition-all ${saved ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-100 hover:border-blue-200 hover:shadow-md'}`}>
    {/* Header */}
    <div className="flex items-start gap-3 mb-4">
      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-base flex-shrink-0">
        {candidate.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-black text-gray-900 truncate">{candidate.fullName}</p>
        <p className="text-xs text-gray-500 font-medium truncate mt-0.5">{candidate.headline}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <MapPin size={10} className="text-gray-400" />
          <p className="text-xs text-gray-400">{candidate.location}</p>
        </div>
      </div>
      {candidate.linkedinUrl && (
        <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 flex-shrink-0">
          <Linkedin size={16} />
        </a>
      )}
    </div>

    {/* Role + Company */}
    <div className="flex items-center gap-2 mb-3">
      <span className="text-xs font-bold text-gray-600 px-2.5 py-1 bg-gray-100 rounded-full truncate max-w-full">
        {candidate.currentRole} @ {candidate.company}
      </span>
    </div>

    {/* Skills */}
    {candidate.skills.length > 0 && (
      <div className="flex flex-wrap gap-1 mb-4">
        {candidate.skills.slice(0, 5).map(s => (
          <span key={s} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-bold">{s}</span>
        ))}
        {candidate.skills.length > 5 && <span className="text-xs px-2 py-0.5 bg-gray-50 text-gray-400 rounded-full">+{candidate.skills.length - 5}</span>}
      </div>
    )}

    {/* Save button */}
    <button
      onClick={onSave}
      disabled={saved}
      className={`w-full py-2.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all ${saved ? 'bg-emerald-100 text-emerald-700 cursor-default' : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'}`}
    >
      {saved ? <><CheckCircle size={14} /> Saved to CRM</> : <><Save size={14} /> Save to CRM</>}
    </button>
  </div>
);