import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Search, Plus, ArrowLeft, BrainCircuit, Briefcase, MapPin, GripVertical, X, Linkedin, Mail, Sparkles, Send, Copy, Check, Zap, Loader2 } from 'lucide-react';
import { Campaign, Lead, LeadStage } from '../types';
import { db } from '../utils/db';
import { syncLeadToLemlist, sendLinkedInMessage } from '../utils/lemlistClient';

const STAGES: { id: LeadStage; label: string; color: string }[] = [
  { id: 'prospecting', label: 'Prospecting', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  { id: 'qualified', label: 'Qualified', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
  { id: 'outreach', label: 'Outreach', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { id: 'replied', label: 'Replied', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
];

interface KanbanCardProps {
  lead: Lead;
  onMove: (id: string, stage: LeadStage) => void;
  onClick: (lead: Lead) => void;
  isSyncing?: boolean;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ lead, onMove, onClick, isSyncing }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('leadId', lead.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div 
      draggable="true"
      onDragStart={handleDragStart}
      onClick={() => onClick(lead)}
      className="bg-secondary/40 border border-border rounded-lg p-3 shadow-sm hover:shadow-md transition-all hover:border-primary/50 group cursor-pointer active:cursor-grabbing relative hover:-translate-y-0.5"
    >
      <div className="absolute top-3 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground cursor-grab">
        <GripVertical size={14} />
      </div>

      <div className="flex items-start justify-between gap-2 pr-4">
        <div className="flex items-center gap-2">
           <img src={lead.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.id}`} alt="" className="w-8 h-8 rounded-full border border-border pointer-events-none" />
           <div className="min-w-0">
              <h4 className="text-sm font-semibold truncate text-foreground">{lead.firstName} {lead.lastName}</h4>
              <p className="text-[10px] text-muted-foreground truncate w-32 pointer-events-none">{lead.title}</p>
           </div>
        </div>
      </div>
      
      <div className="mt-3 space-y-1.5 pointer-events-none">
         <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Briefcase size={10} />
            <span className="truncate">{lead.company}</span>
         </div>
         <div className="flex items-center justify-between">
             {lead.aiScore ? (
                <div className="flex items-center gap-1.5 flex-1 max-w-[60%]">
                   <div className="h-1 flex-1 bg-secondary rounded-full overflow-hidden">
                      <div className={`h-full ${lead.aiScore > 75 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{width: `${lead.aiScore}%`}}></div>
                   </div>
                   <span className={`text-[10px] font-bold ${lead.aiScore > 75 ? 'text-emerald-400' : 'text-amber-400'}`}>{lead.aiScore}</span>
                </div>
             ) : <div></div>}
             
             {/* Lemlist Sync Badge or Loader */}
             {isSyncing ? (
                 <div className="flex items-center gap-1 bg-indigo-500/10 px-1.5 py-0.5 rounded text-[9px] text-indigo-400">
                    <Loader2 size={8} className="animate-spin" /> Syncing...
                 </div>
             ) : lead.lemlistSynced && (
                 <div className="flex items-center gap-1 bg-[#1d1f2e] border border-pink-500/30 px-1.5 py-0.5 rounded text-[9px] text-pink-400 shadow-sm animate-in fade-in zoom-in">
                    <Zap size={8} fill="currentColor" /> Lemlist
                 </div>
             )}
         </div>
      </div>
    </div>
  );
};

interface KanbanColumnProps {
  stage: typeof STAGES[0];
  leads: Lead[];
  onDropLead: (leadId: string, stageId: LeadStage) => void;
  onMove: (id: string, stage: LeadStage) => void;
  onCardClick: (lead: Lead) => void;
  syncingLeadId: string | null;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ stage, leads, onDropLead, onMove, onCardClick, syncingLeadId }) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const leadId = e.dataTransfer.getData('leadId');
    if (leadId) {
      onDropLead(leadId, stage.id);
    }
  };

  return (
    <div 
      className={`flex-1 flex flex-col min-w-[280px] max-w-[350px] transition-all duration-200 rounded-xl ${isOver ? 'ring-2 ring-primary ring-opacity-50 scale-[1.01]' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className={`p-3 rounded-t-xl border-b-2 flex justify-between items-center bg-secondary/20 backdrop-blur-sm ${stage.color.replace('text-', 'border-').split(' ')[2]} ${isOver ? 'bg-secondary/40' : ''}`}>
         <h3 className="font-semibold text-sm uppercase tracking-wide">{stage.label}</h3>
         <span className="text-xs font-mono bg-background/50 px-2 py-0.5 rounded text-foreground">{leads.length}</span>
      </div>
      
      {/* Column Body */}
      <div className={`flex-1 bg-secondary/10 border-x border-b border-border rounded-b-xl p-3 space-y-3 overflow-y-auto transition-colors ${isOver ? 'bg-primary/5' : ''}`}>
         {leads.length > 0 ? (
           leads.map(lead => (
             <KanbanCard 
                key={lead.id} 
                lead={lead} 
                onMove={onMove} 
                onClick={onCardClick}
                isSyncing={syncingLeadId === lead.id}
             />
           ))
         ) : (
           <div className={`h-24 border-2 border-dashed border-border/50 rounded-lg flex items-center justify-center text-xs text-muted-foreground italic transition-colors ${isOver ? 'border-primary/50 bg-primary/5 text-primary' : ''}`}>
              {isOver ? 'Drop here' : 'No leads'}
           </div>
         )}
      </div>
    </div>
  );
}

export const CampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal & AI State
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [messageDraft, setMessageDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [syncingLeadId, setSyncingLeadId] = useState<string | null>(null);
  
  // Notification State
  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    const loadData = async () => {
        if (id) {
            const camp = await db.getCampaignById(id);
            if (camp) {
                setCampaign(camp);
                const leadData = await db.getLeads(id);
                setLeads(leadData);
            }
            setIsLoading(false);
        }
    };
    loadData();
  }, [id]);

  useEffect(() => {
    if (selectedLead) {
        setIsSent(false);
        setMessageDraft(''); // Reset draft on new lead select
    }
  }, [selectedLead]);

  useEffect(() => {
    if (notification) {
        const timer = setTimeout(() => setNotification(null), 3000);
        return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleStageChange = async (leadId: string, newStage: LeadStage) => {
    // Find the lead
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    // Optimistic UI Update for stage
    const updatedLeads = leads.map(l => l.id === leadId ? { ...l, stage: newStage } : l);
    setLeads(updatedLeads);
    
    // DB Update for Stage
    await db.updateLeadStage(leadId, newStage);

    // LEMLIST SYNC TRIGGER: Only if moving to 'qualified' and not already synced
    if (newStage === 'qualified' && !lead.lemlistSynced) {
        setSyncingLeadId(leadId);
        setNotification({ msg: `Syncing ${lead.firstName} to Lemlist...`, type: 'success' });
        
        const syncResult = await syncLeadToLemlist(lead);
        
        setSyncingLeadId(null);

        if (syncResult.success) {
            // Update local state to show sync badge
            setLeads(prev => prev.map(l => l.id === leadId ? { 
                ...l, 
                lemlistSynced: true,
                lemlistId: syncResult.lemlistId,
                lemlistContactId: syncResult.lemlistContactId
            } : l));
            // Persist sync status and IDs to DB
            await db.updateLead({ 
                ...lead, 
                stage: newStage, 
                lemlistSynced: true,
                lemlistId: syncResult.lemlistId,
                lemlistContactId: syncResult.lemlistContactId
            });
            setNotification({ msg: 'Successfully added to Lemlist!', type: 'success' });
        } else {
            setNotification({ msg: 'Failed to sync to Lemlist. Check console.', type: 'error' });
        }
    }
  };

  const handleFindCandidates = () => {
    if (campaign) {
      const params = new URLSearchParams({
        campaignId: campaign.id,
        keyword: campaign.targetJobTitle,
        location: campaign.targetLocation
      });
      navigate(`/scraper?${params.toString()}`);
    }
  };

  const handleGenerateMessage = () => {
    if (!selectedLead) return;
    setIsGenerating(true);

    // Simulate AI Latency
    setTimeout(() => {
        const templates = [
            `Hi ${selectedLead.firstName}, I noticed you're leading things at ${selectedLead.company} as ${selectedLead.title}. I've been following ${selectedLead.company}'s work in the ${selectedLead.location} area and wanted to connect.`,
            `Hello ${selectedLead.firstName}, impressive background! Your experience in ${selectedLead.headline} caught my eye. Would love to discuss how leaders like you are navigating the current market.`,
            `Hi ${selectedLead.firstName}, saw your profile and your role at ${selectedLead.company}. We help ${selectedLead.title}s specifically with scaling operations. Would you be open to a quick chat?`
        ];
        
        // Pick a random template or based on 'aiScore' logic
        const msg = templates[Math.floor(Math.random() * templates.length)];
        setMessageDraft(msg);
        setIsGenerating(false);
    }, 1500);
  };

  const handleSendMessage = async () => {
    if (!selectedLead) return;
    
    setIsSent(true);
    
    // Send message via Lemlist API if the lead is synced to Lemlist
    if (selectedLead.lemlistSynced && selectedLead.lemlistId && selectedLead.lemlistContactId && messageDraft) {
      setNotification({ msg: `Sending LinkedIn message to ${selectedLead.firstName}...`, type: 'success' });
      
      const success = await sendLinkedInMessage(
        selectedLead.lemlistId,
        selectedLead.lemlistContactId,
        messageDraft
      );
      
      if (success) {
        setNotification({ msg: 'LinkedIn message sent successfully!', type: 'success' });
        
        // Store the message in the database
        await db.addMessage(selectedLead.id, 'user', messageDraft, 'LINKEDIN');
        
        // Update stage after successful message send
        if (selectedLead.stage === 'qualified' || selectedLead.stage === 'prospecting') {
          handleStageChange(selectedLead.id, 'outreach');
        }
      } else {
        setNotification({ msg: 'Failed to send LinkedIn message. Check console.', type: 'error' });
      }
    } else {
      // Fallback: open LinkedIn in new tab if not synced to Lemlist
      if (selectedLead.linkedinUrl) {
        window.open(selectedLead.linkedinUrl, '_blank');
        
        // Update stage if needed
        if (selectedLead.stage === 'qualified' || selectedLead.stage === 'prospecting') {
          handleStageChange(selectedLead.id, 'outreach');
        }
      }
    }
  };

  if (isLoading) return (
      <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Loading campaign details...</div>
      </div>
  );
  
  if (!campaign) return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <h2 className="text-xl font-semibold">Campaign not found</h2>
          <Button onClick={() => navigate('/campaigns')}>Back to Campaigns</Button>
      </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] animate-fade-in relative">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-20 right-8 z-50 px-4 py-2 rounded-md shadow-lg flex items-center gap-2 animate-in slide-in-from-right fade-in ${
            notification.type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
        }`}>
            {notification.type === 'success' ? <Check size={16} /> : <X size={16} />}
            <span className="text-sm font-medium">{notification.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/campaigns')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              {campaign.name}
              <Badge variant={campaign.status === 'active' ? 'success' : 'outline'}>{campaign.status}</Badge>
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-3 mt-1">
               <span className="flex items-center gap-1"><Search size={12} /> {campaign.targetJobTitle}</span>
               <span className="w-1 h-1 rounded-full bg-muted-foreground/50"></span>
               <span className="flex items-center gap-1"><MapPin size={12} /> {campaign.targetLocation}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" className="gap-2">
              <BrainCircuit size={16} /> AI Scoring
           </Button>
           <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700" onClick={handleFindCandidates}>
              <Plus size={16} /> Find Candidates
           </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex h-full gap-4 min-w-[1000px]">
          {STAGES.map(stage => (
            <KanbanColumn 
              key={stage.id}
              stage={stage}
              leads={leads.filter(l => l.stage === stage.id)}
              onDropLead={handleStageChange}
              onMove={handleStageChange}
              onCardClick={(lead) => setSelectedLead(lead)}
              syncingLeadId={syncingLeadId}
            />
          ))}
        </div>
      </div>

      {/* Lead Detail Sheet Overlay */}
      {selectedLead && (
         <div className="fixed inset-0 z-50 flex justify-end">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedLead(null)}></div>
           <div className="relative w-full max-w-2xl bg-background/95 backdrop-blur-xl border-l border-border shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
              
              {/* Sheet Header */}
              <div className="p-6 border-b border-border flex items-start justify-between bg-secondary/20">
                 <div className="flex gap-5">
                    <img src={selectedLead.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedLead.id}`} alt="" className="w-16 h-16 rounded-2xl border-2 border-white/10 shadow-lg object-cover" />
                    <div className="pt-1">
                       <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                           {selectedLead.firstName} {selectedLead.lastName}
                           {selectedLead.lemlistSynced && (
                               <div className="bg-[#1d1f2e] border border-pink-500/30 p-1.5 rounded-full text-pink-400" title="Synced to Lemlist">
                                   <Zap size={12} fill="currentColor" />
                               </div>
                           )}
                       </h2>
                       <p className="text-muted-foreground text-sm font-medium">{selectedLead.headline}</p>
                       <div className="flex items-center gap-3 mt-3">
                          <a href={selectedLead.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors bg-blue-400/10 p-1.5 rounded-md flex items-center gap-2 text-xs font-medium">
                             <Linkedin size={14} /> LinkedIn
                          </a>
                          {selectedLead.email && (
                            <a href={`mailto:${selectedLead.email}`} className="text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-400/10 p-1.5 rounded-md flex items-center gap-2 text-xs font-medium">
                               <Mail size={14} /> Email
                            </a>
                          )}
                       </div>
                    </div>
                 </div>
                 <button onClick={() => setSelectedLead(null)} className="text-muted-foreground hover:text-white p-2 hover:bg-white/5 rounded-full transition-all">
                    <X size={24} />
                 </button>
              </div>

              {/* Sheet Content */}
              <div className="flex-1 overflow-y-auto">
                 <div className="p-8 space-y-8">
                    
                    {/* Outreach Section */}
                    <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-xl p-5 shadow-inner">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Linkedin size={18} className="text-blue-400" />
                                LinkedIn Outreach
                            </h3>
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className={`gap-2 border-indigo-500/30 hover:bg-indigo-500/10 ${isGenerating ? 'animate-pulse' : ''}`}
                                onClick={handleGenerateMessage}
                                disabled={isGenerating}
                            >
                                <Sparkles size={14} className={isGenerating ? 'animate-spin' : 'text-indigo-400'} />
                                {isGenerating ? 'Generating...' : 'AI Personalization'}
                            </Button>
                        </div>
                        
                        <div className="relative">
                            <textarea 
                                value={messageDraft}
                                onChange={(e) => setMessageDraft(e.target.value)}
                                placeholder="Write your message or use AI to generate one..."
                                className="w-full bg-black/20 border border-border/50 rounded-lg p-4 min-h-[120px] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-y"
                            />
                            {messageDraft && (
                                <button 
                                    className="absolute bottom-3 right-3 p-1.5 text-muted-foreground hover:text-white bg-black/40 rounded-md transition-colors"
                                    onClick={() => navigator.clipboard.writeText(messageDraft)}
                                    title="Copy to clipboard"
                                >
                                    <Copy size={14} />
                                </button>
                            )}
                        </div>

                        <div className="flex justify-between items-center mt-4">
                            <p className="text-xs text-muted-foreground">
                                {isSent ? <span className="text-emerald-400 flex items-center gap-1"><Check size={12}/> Opened in LinkedIn</span> : "Drafting..."}
                            </p>
                            <Button 
                                className="bg-[#0077b5] hover:bg-[#00669c] text-white gap-2"
                                disabled={!messageDraft}
                                onClick={handleSendMessage}
                            >
                                <Send size={14} /> Send on LinkedIn
                            </Button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                       <div className="flex flex-col gap-1 p-4 rounded-lg bg-secondary/10 border border-border">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider">Company</span>
                          <span className="font-medium flex items-center gap-2">
                             <Briefcase size={14} className="text-muted-foreground"/> {selectedLead.company}
                          </span>
                       </div>
                       <div className="flex flex-col gap-1 p-4 rounded-lg bg-secondary/10 border border-border">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider">Location</span>
                          <span className="font-medium flex items-center gap-2">
                             <MapPin size={14} className="text-muted-foreground"/> {selectedLead.location}
                          </span>
                       </div>
                    </div>

                    {/* AI Score (Mini) */}
                    {selectedLead.aiScore && (
                        <div className="p-4 rounded-lg bg-secondary/10 border border-border">
                             <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider">AI Relevance</span>
                                <span className={`font-bold ${selectedLead.aiScore > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>{selectedLead.aiScore}%</span>
                             </div>
                             <div className="h-2 w-full bg-secondary rounded-full overflow-hidden mb-2">
                                <div className={`h-full ${selectedLead.aiScore > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{width: `${selectedLead.aiScore}%`}}></div>
                             </div>
                             <p className="text-xs text-muted-foreground italic">"{selectedLead.aiReasoning || 'Match based on job title and skills.'}"</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">About</h4>
                        <p className="text-sm leading-relaxed text-foreground/80">
                            {selectedLead.summary || "No summary available for this candidate."}
                        </p>
                    </div>

                 </div>
              </div>

           </div>
         </div>
      )}
    </div>
  );
};