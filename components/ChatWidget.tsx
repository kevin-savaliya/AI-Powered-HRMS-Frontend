
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Bot, User, Maximize2, Minimize2, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { detectIntent, generateAIResponseStream } from '../lib/ai';
import { HR_KNOWLEDGE_BASE } from '../lib/knowledge_base';
import { generateSecureSQL } from '../lib/sql-generator';
import { MarkdownMessage } from './MarkdownMessage';

interface Message {
    role: 'user' | 'model';
    content: string;
    intent?: string;
}

export const ChatWidget: React.FC = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const SUGGESTIONS = [
        "What's the sick leave policy?",
        "Show my attendance summary",
        "List my pending tasks",
        "Company holiday calendar"
    ];

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async (text: string = input) => {
        if (!text.trim() || !user) return;

        const userMsg: Message = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        // Security Check: API Key
        if (!import.meta.env.VITE_GEMINI_API_KEY) {
            setMessages(prev => [...prev, {
                role: 'model',
                content: "⚠️ **Gemini API Key is missing.**\n\nPlease add `VITE_GEMINI_API_KEY` to your `.env` file and restart your terminal/dev server for changes to take effect."
            }]);
            setIsLoading(false);
            return;
        }

        try {
            // 1. Detect Intent
            const intent = await detectIntent(text);
            console.log('Detected Intent:', intent);

            // 2. Retrieval (Decoupled from Supabase since we migrated to local FastAPI/SQLite)
            let context = '';
            if (intent === 'policy') {
                // We inject the entire compiled Master HR Knowledge Base directly into Gemini's massive context window
                // This guarantees 100% precision on queries about specific rules in any of the 6 policy documents.
                context = HR_KNOWLEDGE_BASE;
            }
            else if (intent === 'data' || intent === 'analytics') {
                // Since arbitrary SQL execution is dangerous on the new local SQLite DB, we provide a summary of what they can see on the dashboard.
                context = `[System Message] Inform the user that live, detailed ${intent} metrics and exact numbers should be securely viewed directly on their respective Portal Dashboards (Employee, HR, or Admin) for 100% accuracy, as the AI only has read-only conversational access. Provide general guidance on where to find the data in the UI.`;
            }

            // 3. Generate AI Response (Streaming)
            const history = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.content }]
            }));

            // Don't turn off loading until the VERY FIRST chunk of text arrives from Gemini
            let fullResponse = '';
            const stream = generateAIResponseStream(text, context, user.role, history);
            let isFirstChunk = true;

            for await (const chunk of stream) {
                if (isFirstChunk) {
                    setIsLoading(false); // Turn off the loading animation NOW
                    setMessages(prev => [...prev, { role: 'model', content: '', intent }]);
                    isFirstChunk = false;
                }
                
                fullResponse += chunk;
                setMessages(prev => {
                    const next = [...prev];
                    next[next.length - 1].content = fullResponse;
                    return next;
                });
            }

            // 4. Log the interaction (Decoupled from Supabase)
            console.log("Chat Log:", { user_id: user.id, role: user.role, question: text, answer: fullResponse });

        } catch (error: any) {
            console.error('Chat Error Full Details:', error);
            let errorMessage = "I encountered an error while processing your request.";

            // Check for missing RPC functions (common if schema wasn't run)
            if (error?.message?.includes('function') && error?.message?.includes('does not exist')) {
                errorMessage = "⚠️ **Database Error:** The required AI functions (RPCs) are missing. Please ensure you have run the full content of `chatbot_schema.sql` in your Supabase SQL Editor.";
            }
            // Check for rate limit (429 or quota exceeded)
            else if (error?.message?.includes('429') || error?.message?.includes('Too Many Requests') || error?.message?.includes('quota')) {
                errorMessage = "⚠️ **Rate Limit Exceeded:** You've reached the Gemini Free Tier limits. Please wait 60 seconds to a few minutes and try again.";
            }
            // Check for RLS or Permission issues
            else if (error?.code === '42501') {
                errorMessage = "⚠️ **Permission Error:** Supabase denied the request. Please check your RLS policies in `chatbot_schema.sql`.";
            }
            // Check for general connectivity or API errors
            else if (error?.message?.includes('API key not valid')) {
                errorMessage = "⚠️ **Invalid API Key:** The Gemini API key provided is not valid. Please check your `.env` file.";
            }
            else if (error?.message?.includes('fetch') || error?.message?.includes('Failed to fetch')) {
                errorMessage = "⚠️ **Connection Error:** Failed to talk to Gemini. Check your internet or ensure the API endpoint is reachable.";
            }

            // Always append technical info for debugging
            if (error?.message) {
                errorMessage += `\n\n**Technical Info:** ${error.message}`;
            }

            setMessages(prev => [...prev, { role: 'model', content: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-50 group"
            >
                <MessageSquare size={26} className="group-hover:rotate-12 transition-transform" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-[10px] font-bold px-2 py-1 rounded-full animate-bounce">AI</span>
            </button>
        );
    }

    return (
        <div className={`fixed bottom-6 right-6 bg-white dark:bg-gray-900 shadow-2xl rounded-2xl border border-gray-100 flex flex-col transition-all z-50 overflow-hidden ${isExpanded ? 'w-[500px] h-[700px]' : 'w-96 h-[550px]'}`}>
            {/* Header */}
            <div className="p-4 bg-blue-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <Bot size={22} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">HR Assistant</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-[10px] opacity-80 uppercase font-bold tracking-wider">Online</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {messages.length === 0 && (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Bot size={32} />
                        </div>
                        <h4 className="font-bold text-gray-900">Hello, {user?.name}!</h4>
                        <p className="text-xs text-gray-500 mt-1 max-w-[200px] mx-auto">
                            I can help you with policies, your leave balance, and more.
                        </p>

                        <div className="mt-6 flex flex-wrap justify-center gap-2">
                            {SUGGESTIONS.map(s => (
                                <button
                                    key={s}
                                    onClick={() => handleSend(s)}
                                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-semibold text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all shadow-sm"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-2 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-white border border-gray-100 shadow-sm text-gray-400'}`}>
                                {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                            </div>
                            <div className={`p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none shadow-md' : 'bg-white border border-gray-100 shadow-sm rounded-tl-none'}`}>
                                {m.role === 'user' ? m.content : <MarkdownMessage content={m.content} />}
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="flex gap-3 max-w-[85%] items-center transition-all animate-fade-in-up">
                            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                                <Bot size={20} className="relative z-10 animate-pulse" />
                                <div className="absolute inset-0 bg-white/20 rounded-xl animate-ping opacity-75"></div>
                            </div>
                            <div className="py-3 px-5 bg-white border border-gray-100 shadow-md rounded-2xl rounded-tl-none flex items-center gap-3 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-blue-50/50 to-transparent -translate-x-[100%] animate-[shimmer_2s_infinite]"></div>
                                <div className="flex gap-1 items-center justify-center">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-100">
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="relative flex items-center gap-2"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me anything..."
                        disabled={isLoading}
                        className="w-full pl-4 pr-12 py-3 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100 transition-all outline-none disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-1 w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md"
                    >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </form>
                <p className="text-[10px] text-gray-400 mt-2 text-center">
                    AI-powered assistant. May hallucinate. Check policies for critical info.
                </p>
            </div>
        </div>
    );
};
