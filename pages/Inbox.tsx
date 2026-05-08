import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Search, Linkedin, Mail, Send, MoreVertical, Archive, Filter, ChevronDown, X, Check } from 'lucide-react';
import { MOCK_CONVERSATIONS, MOCK_MESSAGES, MOCK_CAMPAIGNS } from '../constants';
import { db } from '../utils/db';
import { Lead, Conversation, Message } from '../types';
import { sendLinkedInMessage } from '../utils/lemlistClient';

export const Inbox: React.FC = () => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('all');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  // Load conversations and leads
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load all leads to get their Lemlist IDs
        const allLeads = await db.getLeads();
        setLeads(allLeads);
        
        // Create conversations from leads that have been contacted
        const contactedLeads = allLeads.filter(lead => lead.stage === 'outreach' || lead.stage === 'replied');
        
        const newConversations: Conversation[] = contactedLeads.map(lead => ({
          leadId: lead.id,
          campaignId: lead.campaignId || '',
          leadName: `${lead.firstName} ${lead.lastName}`,
          leadAvatar: lead.avatarUrl,
          lastMessage: `Contacted via ${lead.lemlistSynced ? 'Lemlist' : 'Direct'}`,
          timestamp: lead.scrapedAt,
          channel: 'LINKEDIN' as const,
          unreadCount: 0
        }));
        
        setConversations(newConversations);
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Load messages when active chat changes
  useEffect(() => {
    const loadMessages = async () => {
      if (activeChatId) {
        const chatMessages = await db.getMessagesByLead(activeChatId);
        setMessages(chatMessages);
      } else {
        setMessages([]);
      }
    };
    
    loadMessages();
  }, [activeChatId]);

  // Filter conversations
  const filteredConversations = conversations.filter(c => 
    selectedCampaignId === 'all' || c.campaignId === selectedCampaignId
  );

  useEffect(() => {
    if (filteredConversations.length > 0) {
      const currentExists = filteredConversations.find(c => c.leadId === activeChatId);
      if (!currentExists) {
        setActiveChatId(filteredConversations[0].leadId);
      }
    } else {
      setActiveChatId(null);
    }
  }, [selectedCampaignId, filteredConversations, activeChatId]);

  const activeConversation = conversations.find(c => c.leadId === activeChatId);
  const selectedCampaignName = MOCK_CAMPAIGNS.find(c => c.id === selectedCampaignId)?.name || "All Campaigns";

  // Function to send LinkedIn message
  const handleSendMessage = async () => {
    if (!activeConversation || !replyText.trim()) return;

    const lead = leads.find(l => l.id === activeConversation.leadId);
    
    if (lead && lead.lemlistSynced && lead.lemlistId && lead.lemlistContactId) {
      setNotification({ msg: `Sending LinkedIn message to ${lead.firstName}...`, type: 'success' });
      
      const success = await sendLinkedInMessage(
        lead.lemlistId,
        lead.lemlistContactId,
        replyText
      );
      
      if (success) {
        setNotification({ msg: 'LinkedIn message sent successfully!', type: 'success' });
        
        // Store the message in the database
        await db.addMessage(lead.id, 'user', replyText, 'LINKEDIN');
        
        // Refresh messages to include the new one
        const newMessages = await db.getMessagesByLead(lead.id);
        setMessages(newMessages);
        
        setReplyText(''); // Clear the reply text after sending
        
        // Update the conversation's last message
        setConversations(prev => prev.map(conv => 
          conv.leadId === activeConversation.leadId 
            ? { ...conv, lastMessage: replyText, timestamp: new Date().toISOString() } 
            : conv
        ));
      } else {
        setNotification({ msg: 'Failed to send LinkedIn message. Check console.', type: 'error' });
      }
    } else {
      setNotification({ msg: 'Lead is not synced to Lemlist or missing required IDs.', type: 'error' });
    }
  };

  // Notification auto-hide effect
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6 animate-fade-in overflow-hidden">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-20 right-8 z-50 px-4 py-2 rounded-md shadow-lg flex items-center gap-2 animate-in slide-in-from-right fade-in ${
            notification.type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
        }`}>
          <span className="text-sm font-medium">{notification.msg}</span>
        </div>
      )}

      {/* Sidebar List */}
      <Card className="w-1/3 flex flex-col overflow-hidden h-full border-border/60">
         <div className="p-4 border-b border-border space-y-4 bg-secondary/10">
            <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg">Inbox</h2>
                <div className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md border border-border">
                    {filteredConversations.length} Threads
                </div>
            </div>
            
            {/* Campaign Filter */}
            <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none group-hover:text-primary transition-colors">
                    <Filter size={14} />
                </div>
                <select 
                    value={selectedCampaignId}
                    onChange={(e) => setSelectedCampaignId(e.target.value)}
                    className="w-full appearance-none bg-secondary/50 border border-border hover:border-primary/30 rounded-lg pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer text-foreground"
                >
                    <option value="all">All Campaigns</option>
                    {MOCK_CAMPAIGNS.map(camp => (
                        <option key={camp.id} value={camp.id}>{camp.name}</option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                    <ChevronDown size={14} />
                </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search messages..." 
                className="w-full bg-background/50 border border-border rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
              />
            </div>
         </div>

         <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm p-4 text-center">
                    <Filter className="w-8 h-8 mb-2 opacity-20" />
                    <p>No conversations found for "{selectedCampaignName}"</p>
                </div>
            ) : (
                filteredConversations.map((conv) => (
                <div 
                    key={conv.leadId}
                    onClick={() => setActiveChatId(conv.leadId)}
                    className={`p-4 border-b border-border cursor-pointer hover:bg-secondary/40 transition-colors relative ${activeChatId === conv.leadId ? 'bg-secondary/60' : ''}`}
                >
                    {activeChatId === conv.leadId && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                    )}
                    <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                            {conv.channel === 'LINKEDIN' ? <Linkedin size={14} className="text-blue-400" /> : <Mail size={14} className="text-emerald-400" />}
                            <span className={`text-sm font-medium ${conv.unreadCount > 0 ? 'text-white' : 'text-muted-foreground'}`}>{conv.leadName}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{conv.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <img src={conv.leadAvatar} alt="" className="w-10 h-10 rounded-full border border-border" />
                            {conv.unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] flex items-center justify-center text-white rounded-full border border-background">
                                    {conv.unreadCount}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-medium text-white' : 'text-muted-foreground'}`}>
                            {conv.lastMessage}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                                {MOCK_CAMPAIGNS.find(c => c.id === conv.campaignId)?.name}
                            </p>
                        </div>
                    </div>
                </div>
                ))
            )}
         </div>
      </Card>

      {/* Message Thread */}
      <Card className="flex-1 flex flex-col overflow-hidden h-full border-border/60">
         {activeConversation ? (
           <>
             {/* Header */}
             <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/20 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                   <img src={activeConversation.leadAvatar} alt="" className="w-10 h-10 rounded-full border border-border" />
                   <div>
                      <h3 className="font-bold">{activeConversation.leadName}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>VP Engineering at TechGlobal</span>
                        <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                        <span className="text-primary/80">{MOCK_CAMPAIGNS.find(c => c.id === activeConversation.campaignId)?.name}</span>
                      </div>
                   </div>
                </div>
                <div className="flex gap-2">
                   <Button variant="outline" size="sm" className="h-8">Open in Lemlist</Button>
                   <Button variant="ghost" size="icon" className="h-8 w-8"><Archive size={16} /></Button>
                   <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical size={16} /></Button>
                </div>
             </div>

             {/* Messages */}
             <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-secondary/5 to-transparent">
                {messages.map((msg) => (
                   <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl p-4 shadow-sm ${
                          msg.sender === 'user' 
                          ? 'bg-indigo-600 text-white rounded-br-none' 
                          : 'bg-secondary border border-border text-foreground rounded-bl-none'
                      }`}>
                         <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                         <div className={`text-[10px] mt-2 opacity-60 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </div>
                      </div>
                   </div>
                ))}
             </div>

             {/* Composer */}
             <div className="p-4 border-t border-border bg-background/50 backdrop-blur-md">
                <div className="relative">
                   <textarea 
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply via ${activeConversation.channel === 'LINKEDIN' ? 'LinkedIn' : 'Email'}...`}
                      className="w-full bg-secondary/50 border border-border rounded-lg p-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-24 placeholder:text-muted-foreground/50"
                   />
                   <div className="absolute bottom-3 right-3 flex gap-2">
                      <Button size="icon" className="h-8 w-8 rounded-full shadow-lg bg-indigo-600 hover:bg-indigo-500" onClick={handleSendMessage}>
                         <Send size={14} />
                      </Button>
                   </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center flex items-center justify-center gap-1.5 opacity-70">
                   {activeConversation.channel === 'LINKEDIN' 
                      ? <><Linkedin size={10}/> Note: Sent via Lemlist API.</>
                      : <><Mail size={10}/> Sent via Lemlist SMTP provider.</>}
                </p>
             </div>
           </>
         ) : (
           <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center gap-4">
              <div className="w-20 h-20 bg-secondary/30 rounded-full flex items-center justify-center">
                 <Mail className="w-10 h-10 opacity-20" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground">No Conversation Selected</h3>
                <p className="text-sm">Choose a thread from the left or change the campaign filter.</p>
              </div>
           </div>
         )}
      </Card>
    </div>
  );
};