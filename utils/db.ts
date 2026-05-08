// utils/db.ts
import { supabase } from '../lib/supabase';
import { Lead, Candidate, Campaign, LeadStage, Message } from '../types';
import { MOCK_CAMPAIGNS, MOCK_LEADS } from '../constants';

// Helper to map DB row to Lead type
const mapLead = (row: any): Lead => ({
  id: row.id,
  campaignId: row.campaign_id,
  firstName: row.first_name,
  lastName: row.last_name,
  headline: row.headline,
  company: row.company,
  title: row.title,
  location: row.location,
  linkedinUrl: row.linkedin_url,
  email: row.email,
  emailStatus: row.email_status as any,
  stage: row.stage as LeadStage,
  status: row.status,
  scrapedAt: row.scraped_at,
  avatarUrl: row.avatar_url,
  summary: row.summary,
  aiScore: row.ai_score,
  aiReasoning: row.ai_reasoning,
  lemlistSynced: row.lemlist_synced || false, // Map sync status
  lemlistId: row.lemlist_id, // Lemlist lead ID
  lemlistContactId: row.lemlist_contact_id // Lemlist contact ID
});

export const db = {
  // --- Seeding ---
  seed: async () => {
    console.log('Seeding Campaigns...');
    for (const c of MOCK_CAMPAIGNS) {
      const { error } = await supabase.from('campaigns').upsert({
        id: c.id,
        name: c.name,
        status: c.status,
        created_at: c.createdAt,
        target_job_title: c.targetJobTitle,
        target_location: c.targetLocation
      });
      if (error) {
         console.error('Error seeding campaign:', c.name, error);
         if (error.code === 'PGRST205') {
             throw new Error('Database tables not found. Please run the SQL from supabase_schema.sql in your Supabase SQL Editor.');
         }
      }
    }

    console.log('Seeding Leads...');
    const leadsWithCampaigns = MOCK_LEADS.map((l, index) => ({
      ...l,
      campaignId: index < 3 ? 'c1' : 'c2'
    }));

    for (const l of leadsWithCampaigns) {
       const { error } = await supabase.from('leads').upsert({
        id: l.id,
        campaign_id: l.campaignId,
        first_name: l.firstName,
        last_name: l.lastName,
        headline: l.headline,
        company: l.company,
        title: l.title,
        location: l.location,
        linkedin_url: l.linkedinUrl,
        email: l.email,
        email_status: l.emailStatus || 'missing',
        stage: l.stage,
        status: l.status,
        scraped_at: l.scrapedAt,
        avatar_url: l.avatarUrl,
        summary: l.summary,
        ai_score: l.aiScore,
        ai_reasoning: l.aiReasoning,
        lemlist_synced: false,
        lemlist_id: l.lemlistId,
        lemlist_contact_id: l.lemlistContactId
      });
      if (error) console.error('Error seeding lead:', l.firstName, error);
    }
    
    return true;
  },

  // --- Leads ---
  getLeads: async (campaignId?: string): Promise<Lead[]> => {
    // FIX: Ordered by 'scraped_at' instead of 'created_at' because 'created_at' does not exist on leads table
    let query = supabase.from('leads').select('*').order('scraped_at', { ascending: false });
    
    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching leads:', error);
      return [];
    }
    
    return data ? data.map(mapLead) : [];
  },

  addLead: async (candidate: Candidate, campaignId: string): Promise<boolean> => {
    // Check for duplicates based on LinkedIn URL
    const { data: existing, error: fetchError } = await supabase
      .from('leads')
      .select('id')
      .eq('linkedin_url', candidate.linkedinUrl)
      .maybeSingle();

    if (fetchError && fetchError.code === 'PGRST205') {
       console.error('Database table "leads" does not exist.');
       return false;
    }

    if (existing) {
      console.log('Lead already exists:', candidate.fullName);
      return true; // Treat duplicate as success (idempotent)
    }

    const { error } = await supabase.from('leads').insert({
      id: candidate.id, 
      campaign_id: campaignId, // Enforced campaignId
      first_name: candidate.fullName.split(' ')[0],
      last_name: candidate.fullName.split(' ').slice(1).join(' ') || '',
      headline: candidate.headline,
      company: candidate.company,
      title: candidate.currentRole,
      location: candidate.location,
      linkedin_url: candidate.linkedinUrl,
      email_status: 'missing',
      stage: 'prospecting',
      status: 'SCRAPED',
      scraped_at: new Date().toISOString(),
      avatar_url: candidate.avatarUrl,
      summary: candidate.summary,
      lemlist_synced: false,
      lemlist_id: null,
      lemlist_contact_id: null
    });

    if (error) {
      console.error('Error adding lead:', error);
      return false;
    }
    return true;
  },

  updateLead: async (updatedLead: Lead) => {
    const { error } = await supabase.from('leads').update({
      first_name: updatedLead.firstName,
      last_name: updatedLead.lastName,
      headline: updatedLead.headline,
      company: updatedLead.company,
      title: updatedLead.title,
      location: updatedLead.location,
      email: updatedLead.email,
      email_status: updatedLead.emailStatus,
      stage: updatedLead.stage,
      status: updatedLead.status,
      ai_score: updatedLead.aiScore,
      ai_reasoning: updatedLead.aiReasoning,
      lemlist_synced: updatedLead.lemlistSynced, // Persist sync status
      lemlist_id: updatedLead.lemlistId, // Persist Lemlist lead ID
      lemlist_contact_id: updatedLead.lemlistContactId // Persist Lemlist contact ID
    }).eq('id', updatedLead.id);

    if (error) {
      console.error('Error updating lead:', error);
    }
  },

  updateLeadStage: async (leadId: string, stage: LeadStage) => {
    const { error } = await supabase
      .from('leads')
      .update({ stage })
      .eq('id', leadId);

    if (error) {
      console.error('Error updating lead stage:', error);
    }
  },

  // --- Campaigns ---
  getCampaigns: async (): Promise<Campaign[]> => {
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching campaigns:', error);
      if (error.code === 'PGRST205') {
        console.warn('HINT: The database tables have not been created. Run the content of supabase_schema.sql in your Supabase SQL Editor.');
      }
      return [];
    }
    
    if (!campaigns) return [];

    const campaignsWithStats = await Promise.all(campaigns.map(async (c) => {
      // In production, use SQL views for performance.
      const { count: total } = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('campaign_id', c.id);
      const { count: qualified } = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('campaign_id', c.id).eq('stage', 'qualified');
      const { count: contacted } = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('campaign_id', c.id).eq('stage', 'outreach');
      const { count: replied } = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('campaign_id', c.id).eq('stage', 'replied');

      return {
        id: c.id,
        name: c.name,
        status: c.status,
        createdAt: c.created_at,
        targetJobTitle: c.target_job_title,
        targetLocation: c.target_location,
        stats: {
          total: total || 0,
          qualified: qualified || 0,
          contacted: contacted || 0,
          replied: replied || 0
        }
      } as Campaign;
    }));

    return campaignsWithStats;
  },

  getCampaignById: async (id: string): Promise<Campaign | undefined> => {
    const { data: c, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !c) return undefined;

    return {
      id: c.id,
      name: c.name,
      status: c.status,
      createdAt: c.created_at,
      targetJobTitle: c.target_job_title,
      targetLocation: c.target_location,
      stats: { total: 0, qualified: 0, contacted: 0, replied: 0 } 
    };
  },

  createCampaign: async (name: string, targetJobTitle: string, targetLocation: string): Promise<Campaign | null> => {
    // Generate an ID client-side since the table schema doesn't default to UUID generation
    const id = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : `camp_${Math.random().toString(36).substr(2, 9)}`;

    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        id, // Explicitly providing the ID
        name,
        target_job_title: targetJobTitle,
        target_location: targetLocation,
        status: 'active'
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Error creating campaign:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      status: data.status,
      createdAt: data.created_at,
      targetJobTitle: data.target_job_title,
      targetLocation: data.target_location,
      stats: { total: 0, qualified: 0, contacted: 0, replied: 0 }
    };
  },
  
  // --- Messages ---
  addMessage: async (leadId: string, sender: 'user' | 'lead', content: string, channel: 'LINKEDIN' | 'EMAIL' = 'LINKEDIN') => {
    const { error } = await supabase.from('messages').insert({
      lead_id: leadId,
      sender,
      content,
      channel,
      timestamp: new Date().toISOString()
    });

    if (error) {
      console.error('Error adding message:', error);
      return false;
    }
    return true;
  },
  
  getMessagesByLead: async (leadId: string): Promise<Message[]> => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('lead_id', leadId)
      .order('timestamp', { ascending: true });
    
    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
    
    return data ? data.map(row => ({
      id: row.id,
      leadId: row.lead_id,
      sender: row.sender,
      content: row.content,
      timestamp: row.timestamp,
      channel: row.channel,
      read: row.read || false
    })) : [];
  }
};