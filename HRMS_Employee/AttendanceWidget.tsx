
import React, { useState, useEffect } from 'react';
import { Clock, Fingerprint, LogIn, LogOut, CheckCircle, MapPin } from 'lucide-react';

export const AttendanceWidget: React.FC = () => {
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [logs, setLogs] = useState<{ type: string, time: string }[]>([]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleClockAction = () => {
        const timeStr = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const type = isClockedIn ? 'Clock Out' : 'Clock In';

        setLogs([{ type, time: timeStr }, ...logs.slice(0, 4)]);
        setIsClockedIn(!isClockedIn);
    };

    return (
        <div className="card h-full flex flex-col overflow-hidden">
            <div className="p-6 bg-primary text-white">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                        <Clock size={24} />
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold font-mono">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                        <div className="text-xs font-bold opacity-80 uppercase tracking-widest">
                            {currentTime.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' })}
                        </div>
                    </div>
                </div>
                <h2 className="text-xl font-bold">Attendance</h2>
                <p className="text-sm opacity-80 font-medium">Capture your daily work hours.</p>
            </div>

            <div className="p-6 flex-1 space-y-6">
                <div className="flex flex-col items-center gap-4 py-4">
                    <button
                        onClick={handleClockAction}
                        className={`w-32 h-32 rounded-full border-8 transition-all duration-500 flex flex-col items-center justify-center gap-1 shadow-2xl active:scale-95 ${isClockedIn
                                ? 'bg-red-50 border-red-100 text-red-600 shadow-red-200/50'
                                : 'bg-primary/5 border-primary/20 text-primary shadow-primary/20'
                            }`}
                    >
                        <Fingerprint size={48} className={isClockedIn ? 'animate-pulse' : ''} />
                        <span className="text-xs font-bold uppercase tracking-widest">
                            {isClockedIn ? 'Clock Out' : 'Clock In'}
                        </span>
                    </button>
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                        <MapPin size={12} className="text-primary" />
                        Office HQ (Verified)
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Today's Activity</h3>
                    <div className="space-y-2">
                        {logs.length > 0 ? logs.map((log, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border animate-in fade-in slide-in-from-left-2 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded-lg ${log.type === 'Clock In' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {log.type === 'Clock In' ? <LogIn size={14} /> : <LogOut size={14} />}
                                    </div>
                                    <span className="text-sm font-bold text-foreground">{log.type}</span>
                                </div>
                                <span className="text-xs font-mono font-bold text-muted-foreground">{log.time}</span>
                            </div>
                        )) : (
                            <div className="text-center py-4 text-xs font-medium text-muted-foreground italic">
                                No logs for today yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-4 bg-primary/[0.02] border-t border-border mt-auto">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-bold">Total Shift Time</span>
                    <span className="text-primary font-bold">08:30 Remaining</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                    <div className="w-1/4 h-full bg-primary" />
                </div>
            </div>
        </div>
    );
};
