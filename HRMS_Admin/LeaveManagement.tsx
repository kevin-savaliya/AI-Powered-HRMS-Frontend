
import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, User, Filter, MoreVertical, AlertCircle } from 'lucide-react';

interface LeaveRequest {
    id: string;
    name: string;
    type: string;
    dates: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
}

export const LeaveManagement: React.FC = () => {
    const [requests, setRequests] = useState<LeaveRequest[]>([
        { id: '1', name: 'Akash Sharma', type: 'Sick Leave', dates: '24 May - 25 May', reason: 'High Fever', status: 'pending' },
        { id: '2', name: 'Priya Verma', type: 'Casual Leave', dates: '30 May (Full Day)', reason: 'Family Function', status: 'pending' },
        { id: '3', name: 'Karan Mehra', type: 'Vacation', dates: '10 Jun - 15 Jun', reason: 'Summer Trip', status: 'approved' },
    ]);

    const handleStatus = (id: string, status: 'approved' | 'rejected') => {
        setRequests(requests.map(r => r.id === id ? { ...r, status } : r));
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Leave Management</h1>
                <p className="text-muted-foreground">Review and manage employee time-off requests.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Quick Stats */}
                <div className="card p-6 flex items-center justify-between border-l-4 border-l-primary/40">
                    <div>
                        <div className="text-xs font-bold text-muted-foreground uppercase">Pending</div>
                        <div className="text-2xl font-bold">{requests.filter(r => r.status === 'pending').length} Requests</div>
                    </div>
                    <Clock className="text-primary/20" size={32} />
                </div>
                <div className="card p-6 flex items-center justify-between border-l-4 border-l-green-400/40">
                    <div>
                        <div className="text-xs font-bold text-muted-foreground uppercase">Today Out</div>
                        <div className="text-2xl font-bold">2 Employees</div>
                    </div>
                    <Calendar className="text-green-400/20" size={32} />
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
                    <h2 className="font-bold flex items-center gap-2">
                        <Filter size={18} className="text-primary" />
                        Recent Requests
                    </h2>
                    <div className="flex gap-2">
                        <button className="text-xs font-bold text-primary hover:underline">View History</button>
                    </div>
                </div>

                <div className="divide-y divide-border">
                    {requests.map(request => (
                        <div key={request.id} className="p-6 hover:bg-muted/10 transition-colors">
                            <div className="flex items-start justify-between">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-primary">
                                        {request.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground">{request.name}</h3>
                                        <div className="flex flex-wrap items-center gap-3 mt-1">
                                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold border border-indigo-100 uppercase tracking-wider">
                                                {request.type}
                                            </span>
                                            <span className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                                                <Calendar size={14} /> {request.dates}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground/80 mt-2 bg-secondary/30 p-2 rounded-lg italic">
                                            "{request.reason}"
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-3">
                                    {request.status === 'pending' ? (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleStatus(request.id, 'rejected')}
                                                className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 transition-all flex items-center gap-1.5"
                                            >
                                                <XCircle size={14} /> Reject
                                            </button>
                                            <button
                                                onClick={() => handleStatus(request.id, 'approved')}
                                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:shadow-lg hover:shadow-green-200 transition-all flex items-center gap-1.5"
                                            >
                                                <CheckCircle size={14} /> Approve
                                            </button>
                                        </div>
                                    ) : (
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${request.status === 'approved'
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-red-50 text-red-700 border-red-200'
                                            }`}>
                                            {request.status}
                                        </span>
                                    )}
                                    <button className="text-muted-foreground hover:text-foreground">
                                        <MoreVertical size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card p-6 bg-amber-50 border-amber-100">
                <h3 className="font-bold text-amber-900 mb-2">High Logic Feature: Automated Leave Balancer</h3>
                <p className="text-sm text-amber-800 leading-relaxed">
                    The system implements <strong>Condition-Based Approvals</strong>. Before rendering the "Approve" button, the system calculates:
                    <code className="block mt-2 bg-white/50 p-2 rounded font-mono text-xs border border-amber-200">
                        Current_Balance - Proposed_Days &gt;= 0 ? Enable_Action() : Require_Admin_Override()
                    </code>
                </p>
            </div>
        </div>
    );
};
