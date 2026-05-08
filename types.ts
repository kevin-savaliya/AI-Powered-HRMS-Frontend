// types.ts

export interface ApifyProfile {
  publicIdentifier: string;
  firstName: string;
  lastName: string;
  headline: string;
  linkedinUrl: string;
  location?: {
    linkedinText?: string;
  };
  profilePicture?: {
    url?: string;
  };
  experience?: Array<{
    position?: string;
    companyName?: string;
    description?: string;
  }>;
  currentPosition?: Array<{
    title?: string;
    companyName?: string;
  }>;
  skills?: Array<{ name: string }> | string[];
  about?: string;
  verified?: boolean;
}

export interface Candidate {
  id: string;
  fullName: string;
  headline: string;
  currentRole: string;
  company: string;
  location: string;
  avatarUrl: string;
  linkedinUrl: string;
  skills: string[];
  summary: string;
  verified: boolean;
}

export type LeadStage = 'prospecting' | 'qualified' | 'outreach' | 'replied' | 'meeting';

export interface Lead {
  id: string;
  campaignId?: string; // Link to specific campaign
  firstName: string;
  lastName: string;
  headline: string;
  company: string;
  title: string;
  location: string;
  linkedinUrl: string;
  email?: string;
  emailStatus: 'valid' | 'risky' | 'missing';
  stage: LeadStage; // Kanban Stage
  status: string; // Legacy status, keep for compatibility or map to stage
  scrapedAt: string;
  avatarUrl: string;
  summary: string;
  aiScore?: number;
  aiReasoning?: string;
  lemlistSynced?: boolean; // New field for sync status
  lemlistId?: string; // ID from Lemlist API response
  lemlistContactId?: string; // Contact ID from Lemlist API response
}

export interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  createdAt: string;
  // Targeting Metadata for Scraper
  targetJobTitle: string;
  targetLocation: string;
  // Stats (computed dynamically in real app, stored for mock)
  stats?: {
    total: number;
    qualified: number;
    contacted: number;
    replied: number;
  };
}

export interface ScrapeJob {
  id: string;
  date: string;
  targetCount: number;
  successful: number;
  failed: number;
  status: string;
}

export interface Conversation {
  leadId: string;
  campaignId: string; // Added for inbox filtering
  leadName: string;
  leadAvatar: string;
  lastMessage: string;
  timestamp: string;
  channel: 'LINKEDIN' | 'EMAIL';
  unreadCount: number;
}

export interface Message {
  id: string;
  leadId: string;
  sender: 'user' | 'lead';
  content: string;
  timestamp: string;
  channel: 'LINKEDIN' | 'EMAIL';
  read: boolean;
}