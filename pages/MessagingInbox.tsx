import React, { useState, useEffect, useRef } from 'react';
import { store, InboxMessage, LeadRecord, HRMSUser } from '../utils/store';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, Search, Users, Inbox, Plus, X, Mail, Hash, User as UserIcon } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// Unified Messaging Inbox (Slack-like)
// Supports: 
// 1. Candidate Outreach (HR/Admin <-> Leads)
// 2. Internal DMs (Employee <-> Employee/HR/Admin)
// ─────────────────────────────────────────────────────────────────

export const MessagingInbox: React.FC = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<ReturnType<typeof store.getConversations>>([]);
    const [activeConvId, setActiveConvId] = useState<string | null>(null);
    const [messages, setMessages] = useState<InboxMessage[]>([]);
    const [body, setBody] = useState('');
    const [search, setSearch] = useState('');
    const [showNewChat, setShowNewChat] = useState(false);

    // New Messaging State
    const [chatType, setChatType] = useState<'internal' | 'candidate'>('internal');
    const [internalUsers, setInternalUsers] = useState<HRMSUser[]>([]);
    const [leads, setLeads] = useState<LeadRecord[]>([]);
    const [targetUserId, setTargetUserId] = useState('');
    const [targetLeadId, setTargetLeadId] = useState('');
    const [newSubject, setNewSubject] = useState('');
    const [newBody, setNewBody] = useState('');

    const bottomRef = useRef<HTMLDivElement>(null);

    const reload = () => {
        if (!user) return;
        setConversations(store.getConversations(user.id));
        setInternalUsers(store.getUsers().filter(u => u.id !== user.id));
        setLeads(store.getLeads());
    };

    useEffect(() => { reload(); }, [user?.id]);

    useEffect(() => {
        if (!activeConvId || !user) return;
        const msgs = store.getConversationMessages(activeConvId);
        setMessages(msgs);
        store.markConversationRead(activeConvId, user.id);
        reload();
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeConvId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!body.trim() || !user || !activeConvId) return;
        const conv = conversations.find(c => c.conversationId === activeConvId);
        if (!conv) return;

        store.sendMessage({
            conversationId: activeConvId,
            type: conv.type,
            fromId: user.id,
            fromName: user.name,
            fromRole: user.role,
            toId: conv.lastMsg.fromId === user.id ? conv.lastMsg.toId : conv.lastMsg.fromId,
            toName: conv.otherName,
            subject: conv.lastMsg.subject,
            body: body.trim(),
        });

        setBody('');
        setMessages(store.getConversationMessages(activeConvId));
        reload();
    };

    const handleStartNewChat = () => {
        if (!user) return;

        let toId = '';
        let toName = '';
        let convId = '';
        let type: 'internal' | 'candidate' = 'internal';

        if (chatType === 'internal') {
            const target = internalUsers.find(u => u.id === targetUserId);
            if (!target || !newBody.trim()) return;
            toId = target.id;
            toName = target.name;
            type = 'internal';
            // Sort IDs to ensure stable conversation ID for DMs
            convId = `internal-${[user.id, toId].sort().join('-')}`;
        } else {
            const target = leads.find(l => l.id === targetLeadId);
            if (!target || !newBody.trim()) return;
            toId = 'candidate';
            toName = target.name;
            type = 'candidate';
            convId = target.id;
        }

        store.sendMessage({
            conversationId: convId,
            type,
            fromId: user.id,
            fromName: user.name,
            fromRole: user.role,
            toId,
            toName,
            subject: newSubject || (type === 'internal' ? 'Direct Message' : 'Recruitment Inquiry'),
            body: newBody.trim(),
        });

        setShowNewChat(false);
        setNewBody('');
        setNewSubject('');
        setActiveConvId(convId);
        reload();
    };

    const filteredConvs = conversations.filter(c =>
        c.otherName.toLowerCase().includes(search.toLowerCase()) ||
        c.lastMsg.subject.toLowerCase().includes(search.toLowerCase())
    );

    const activeConv = conversations.find(c => c.conversationId === activeConvId);

    if (!user) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Inbox</h1>
                    <p className="text-gray-500 font-medium mt-1">Connect with your team and candidates.</p>
                </div>
                <button
                    onClick={() => setShowNewChat(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black text-white hover:shadow-lg transition-all"
                    style={{ background: 'linear-gradient(135deg,#4f46e5,#1d4ed8)' }}
                >
                    <Plus size={16} /> New Message
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 230px)', minHeight: 550 }}>
                <div className="flex h-full">
                    {/* Sidebar */}
                    <div className="w-80 border-r border-gray-100 flex flex-col flex-shrink-0 bg-gray-50/50">
                        {/* Search */}
                        <div className="p-4 border-b border-gray-100">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text" value={search} onChange={e => setSearch(e.target.value)}
                                    placeholder="Jump to..."
                                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        </div>

                        {/* Conversations list */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Recent Messages</div>
                            {filteredConvs.length === 0 ? (
                                <div className="text-center py-12 px-4">
                                    <Inbox size={32} className="text-gray-200 mx-auto mb-3" />
                                    <p className="text-sm font-bold text-gray-400">No chats found</p>
                                </div>
                            ) : filteredConvs.map(conv => (
                                <button
                                    key={conv.conversationId}
                                    onClick={() => setActiveConvId(conv.conversationId)}
                                    className={`w-full text-left p-4 border-b border-gray-50 transition-all hover:bg-white ${activeConvId === conv.conversationId ? 'bg-white border-l-4 border-l-blue-600 shadow-sm' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-xs shrink-0 ${conv.type === 'internal' ? 'bg-indigo-500' : 'bg-emerald-500'}`}>
                                            {conv.otherName.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className={`text-sm truncate ${conv.unread > 0 ? 'font-black text-gray-900' : 'font-bold text-gray-700'}`}>{conv.otherName}</p>
                                                {conv.unread > 0 && <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">{conv.unread}</span>}
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className={`w-1.5 h-1.5 rounded-full ${conv.type === 'internal' ? 'bg-blue-400' : 'bg-emerald-400'}`} />
                                                <p className="text-xs text-gray-400 truncate">{conv.lastMsg.body}</p>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Chat Area */}
                    {!activeConvId ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white">
                            <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center mb-6">
                                <MessageSquare size={40} className="text-blue-500" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900">Your Messages</h2>
                            <p className="text-gray-500 mt-2 max-w-sm font-medium">Select a conversation from the left to start chatting with your colleagues or candidates.</p>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col bg-white">
                            {/* Chat Header */}
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-xs ${activeConv?.type === 'internal' ? 'bg-indigo-500' : 'bg-emerald-500'}`}>
                                        {activeConv?.otherName.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-900">{activeConv?.otherName}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={`text-[10px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded ${activeConv?.type === 'internal' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                {activeConv?.type === 'internal' ? 'Colleague' : 'Candidate'}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-bold">{activeConv?.lastMsg.subject}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Messages Grid */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {messages.map((msg, idx) => {
                                    const isMe = msg.fromId === user?.id;
                                    const prevMsg = messages[idx - 1];
                                    const sameUser = prevMsg?.fromId === msg.fromId;

                                    return (
                                        <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'} ${sameUser ? 'mt-[-16px]' : ''}`}>
                                            {!sameUser ? (
                                                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-black text-gray-500 shrink-0">
                                                    {msg.fromName.slice(0, 2).toUpperCase()}
                                                </div>
                                            ) : (
                                                <div className="w-9 shrink-0" />
                                            )}
                                            <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                                                {!sameUser && (
                                                    <div className="flex items-center gap-2 mb-1 px-1">
                                                        <span className="text-xs font-black text-gray-900">{isMe ? 'You' : msg.fromName}</span>
                                                        <span className="text-[10px] text-gray-400 font-bold">{new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                )}
                                                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-200' : 'bg-gray-100 text-gray-800 rounded-tl-none shadow-sm shadow-gray-100'}`}>
                                                    {msg.body}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={bottomRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-white border-t border-gray-100">
                                <div className="relative flex items-end gap-3 p-1.5 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
                                    <textarea
                                        rows={2}
                                        value={body}
                                        onChange={e => setBody(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                        placeholder={`Message ${activeConv?.otherName}...`}
                                        className="flex-1 px-3 py-2 bg-transparent text-sm resize-none focus:outline-none"
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!body.trim()}
                                        className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center disabled:opacity-40 disabled:grayscale transition-all hover:bg-blue-700"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2 ml-2 font-bold px-1">
                                    <b>Enter</b> to send, <b>Shift + Enter</b> for new line
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* New Message Modal */}
            {showNewChat && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-gray-900">New Message</h2>
                                <button onClick={() => setShowNewChat(false)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-all"><X size={20} className="text-gray-400" /></button>
                            </div>

                            <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl mb-6">
                                <button onClick={() => setChatType('internal')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all ${chatType === 'internal' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}><UserIcon size={14} /> Team Member</button>
                                {(user.role === 'hr' || user.role === 'admin') && (
                                    <button onClick={() => setChatType('candidate')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all ${chatType === 'candidate' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500'}`}><Mail size={14} /> Candidate</button>
                                )}
                            </div>

                            <div className="space-y-5">
                                {chatType === 'internal' ? (
                                    <div>
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Select Colleague</label>
                                        <select value={targetUserId} onChange={e => setTargetUserId(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 font-bold">
                                            <option value="">-- Choose person --</option>
                                            {internalUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role.toUpperCase()})</option>)}
                                        </select>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Choose Candidate</label>
                                        <select value={targetLeadId} onChange={e => setTargetLeadId(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 font-bold">
                                            <option value="">-- Choose lead --</option>
                                            {leads.map(l => <option key={l.id} value={l.id}>{l.name} ({l.stage})</option>)}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Message Body</label>
                                    <textarea
                                        rows={4} value={newBody} onChange={e => setNewBody(e.target.value)}
                                        placeholder="Type your first message..."
                                        className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 font-medium resize-none"
                                    />
                                </div>

                                <button
                                    onClick={handleStartNewChat}
                                    disabled={(chatType === 'internal' ? !targetUserId : !targetLeadId) || !newBody.trim()}
                                    className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black text-sm hover:shadow-xl hover:shadow-blue-200 transition-all disabled:opacity-50 mt-2 shadow-lg shadow-blue-600/20"
                                >
                                    Start Conversation
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
