import { Lead, Campaign, ScrapeJob, Conversation, Message } from './types';

// --- Mappings for Apify Scraper ---

export const SENIORITY_MAPPING = [
  { id: "100", label: "Entry Level" },
  { id: "110", label: "Senior" },
  { id: "120", label: "Manager" },
  { id: "130", label: "Director" },
  { id: "140", label: "VP" },
  { id: "150", label: "CXO" },
  { id: "200", label: "Partner" },
  { id: "210", label: "Owner" }
];

export const EXPERIENCE_MAPPING = [
  { id: "1", label: "Internship" },
  { id: "2", label: "Entry Level" },
  { id: "3", label: "Associate" },
  { id: "4", label: "Mid-Senior" },
  { id: "5", label: "Director" },
  { id: "6", label: "Executive" }
];

export const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Connor',
    headline: 'VP of Engineering at TechGlobal',
    company: 'TechGlobal',
    title: 'VP Engineering',
    location: 'San Francisco, CA',
    linkedinUrl: 'https://linkedin.com/in/sarahconnor',
    email: 'sarah.c@techglobal.io',
    emailStatus: 'valid',
    status: 'REPLIED',
    stage: 'replied',
    scrapedAt: '2025-05-10T10:00:00Z',
    avatarUrl: 'https://picsum.photos/id/101/200/200',
    summary: 'Experienced engineering leader scaling high-performance teams.',
  },
  {
    id: '2',
    firstName: 'James',
    lastName: 'Howlett',
    headline: 'Chief Product Officer | SaaS Strategist',
    company: 'WeaponX Corp',
    title: 'CPO',
    location: 'Toronto, Canada',
    linkedinUrl: 'https://linkedin.com/in/logan',
    email: 'logan@weaponx.com',
    emailStatus: 'risky',
    status: 'SYNCED_LEMLIST',
    stage: 'outreach',
    scrapedAt: '2025-05-11T14:30:00Z',
    avatarUrl: 'https://picsum.photos/id/102/200/200',
    summary: 'Product visionary with a focus on adamant resilience.',
  },
  {
    id: '3',
    firstName: 'Diana',
    lastName: 'Prince',
    headline: 'Director of Marketing',
    company: 'Themyscira Inc',
    title: 'Director of Marketing',
    location: 'New York, NY',
    linkedinUrl: 'https://linkedin.com/in/dianaprince',
    email: undefined,
    emailStatus: 'missing',
    status: 'SCRAPED',
    stage: 'prospecting',
    scrapedAt: '2025-05-12T09:15:00Z',
    avatarUrl: 'https://picsum.photos/id/103/200/200',
    summary: 'Marketing strategist bridging ancient traditions with modern trends.',
  },
  {
    id: '4',
    firstName: 'Tony',
    lastName: 'Stark',
    headline: 'CEO & Philanthropist',
    company: 'Stark Industries',
    title: 'CEO',
    location: 'Malibu, CA',
    linkedinUrl: 'https://linkedin.com/in/tonystark',
    email: 'tony@stark.com',
    emailStatus: 'valid',
    status: 'CONTACTED',
    stage: 'outreach',
    scrapedAt: '2025-05-12T11:00:00Z',
    avatarUrl: 'https://picsum.photos/id/104/200/200',
    summary: 'Futurist, inventor, and mechanic.',
  },
  {
    id: '5',
    firstName: 'Bruce',
    lastName: 'Wayne',
    headline: 'Chairman',
    company: 'Wayne Enterprises',
    title: 'Chairman',
    location: 'Gotham City',
    linkedinUrl: 'https://linkedin.com/in/bwayne',
    email: 'bruce@wayne.com',
    emailStatus: 'valid',
    status: 'QUEUED',
    stage: 'qualified',
    scrapedAt: '2025-05-12T11:05:00Z',
    avatarUrl: 'https://picsum.photos/id/105/200/200',
    summary: 'Industrialist by day.',
  }
];

export const MOCK_CAMPAIGNS: Campaign[] = [
  { 
    id: 'c1', 
    name: 'Q2 Engineering Outreach', 
    status: 'active', 
    createdAt: '2025-05-01T10:00:00Z',
    targetJobTitle: 'Engineering Manager',
    targetLocation: 'San Francisco, CA',
    stats: { total: 1240, qualified: 600, contacted: 500, replied: 148 }
  },
  { 
    id: 'c2', 
    name: 'SaaS Founders - Cold', 
    status: 'paused', 
    createdAt: '2025-04-15T14:00:00Z',
    targetJobTitle: 'Founder',
    targetLocation: 'Remote',
    stats: { total: 500, qualified: 160, contacted: 150, replied: 25 }
  },
  { 
    id: 'c3', 
    name: 'Webinar Invites', 
    status: 'completed', 
    createdAt: '2025-03-20T09:00:00Z',
    targetJobTitle: 'Marketing Director',
    targetLocation: 'New York, NY',
    stats: { total: 2200, qualified: 1800, contacted: 2200, replied: 44 }
  },
];

export const MOCK_JOBS: ScrapeJob[] = [
  { id: 'JOB-104', date: '2 mins ago', targetCount: 50, successful: 12, failed: 0, status: 'RUNNING' },
  { id: 'JOB-103', date: '2 hours ago', targetCount: 150, successful: 148, failed: 2, status: 'COMPLETED' },
  { id: 'JOB-102', date: 'Yesterday', targetCount: 45, successful: 45, failed: 0, status: 'COMPLETED' },
  { id: 'JOB-101', date: '2 days ago', targetCount: 200, successful: 0, failed: 200, status: 'FAILED' },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    leadId: '1',
    campaignId: 'c1',
    leadName: 'Sarah Connor',
    leadAvatar: 'https://picsum.photos/id/101/200/200',
    lastMessage: 'That sounds interesting, let’s book a demo.',
    timestamp: '10:42 AM',
    channel: 'LINKEDIN',
    unreadCount: 1,
  },
  {
    leadId: '2',
    campaignId: 'c2',
    leadName: 'James Howlett',
    leadAvatar: 'https://picsum.photos/id/102/200/200',
    lastMessage: 'Not interested right now, bub.',
    timestamp: 'Yesterday',
    channel: 'EMAIL',
    unreadCount: 0,
  }
];

export const MOCK_MESSAGES: Message[] = [
  { id: 'm1', leadId: '1', sender: 'user', content: 'Hi Sarah, I noticed your work at TechGlobal...', timestamp: 'May 10, 2:00 PM', channel: 'LINKEDIN', read: true },
  { id: 'm2', leadId: '1', sender: 'lead', content: 'Thanks for reaching out. What exactly do you do?', timestamp: 'May 10, 4:30 PM', channel: 'LINKEDIN', read: true },
  { id: 'm3', leadId: '1', sender: 'user', content: 'We help scale engineering teams with AI. Would you be open to a chat?', timestamp: 'May 11, 9:00 AM', channel: 'LINKEDIN', read: true },
  { id: 'm4', leadId: '1', sender: 'lead', content: 'That sounds interesting, let’s book a demo.', timestamp: 'Today, 10:42 AM', channel: 'LINKEDIN', read: false },
];