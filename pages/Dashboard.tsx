import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Activity, Database, Send, AlertTriangle, CheckCircle, MessageSquare, Users, Briefcase, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const VELOCITY_DATA = [
  { day: 'Mon', profiles: 120 },
  { day: 'Tue', profiles: 155 },
  { day: 'Wed', profiles: 200 },
  { day: 'Thu', profiles: 180 },
  { day: 'Fri', profiles: 240 },
  { day: 'Sat', profiles: 90 },
  { day: 'Sun', profiles: 60 },
];

const FUNNEL_DATA = [
  { stage: 'Scraped', value: 1200 },
  { stage: 'Enriched', value: 950 },
  { stage: 'Synced', value: 800 },
  { stage: 'Replied', value: 120 },
];

const COLORS = ['#94a3b8', '#64748b', '#6366f1', '#10b981'];

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';
  const isRecruiter = user?.role === 'recruiter';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            {isAdmin ? 'System Intelligence' : isRecruiter ? 'Recruitment Hub' : 'Employee Overview'}
          </h1>
          <p className="text-muted-foreground font-medium mt-1">
            Welcome back, <span className="text-primary font-bold">{user?.name}</span>. Here's your {user?.role} summary.
          </p>
        </div>
        {(isAdmin || isRecruiter) && (
          <div className="flex gap-2 text-sm">
            <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Scraper Status: Online
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Recruiter & Admin - pipeline stats */}
        {(isRecruiter || isAdmin) && (
          <>
            <Card className="col-span-1 md:col-span-2 row-span-2 bg-white border-0 shadow-sm ring-1 ring-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="text-primary" size={20} />
                  Talent Flow Velocity
                </CardTitle>
                <CardDescription>Daily candidate extraction rate</CardDescription>
              </CardHeader>
              <CardContent className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={VELOCITY_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line type="monotone" dataKey="profiles" stroke="#2563eb" strokeWidth={4} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-1 md:col-span-2 row-span-2 bg-white border-0 shadow-sm ring-1 ring-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="text-primary" size={20} />
                  Pipeline Conversion
                </CardTitle>
                <CardDescription>Conversion from scrape to shortlist</CardDescription>
              </CardHeader>
              <CardContent className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={FUNNEL_DATA} margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="stage" type="category" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} width={80} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px' }} />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                      {FUNNEL_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}

        {/* Global Admin Stats */}
        {isAdmin && (
          <>
            <Card className="col-span-1 p-6 bg-primary text-white border-0 shadow-xl shadow-primary/20">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/70 text-xs font-bold uppercase tracking-wider leading-none">Total Employees</p>
                  <h3 className="text-3xl font-black mt-2 leading-none">1,284</h3>
                </div>
                <Users className="text-white/40" size={24} />
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold bg-white/10 w-fit px-2 py-1 rounded-lg">
                <span className="text-white">+12%</span>
                <span className="text-white/60">vs last month</span>
              </div>
            </Card>

            <Card className="col-span-1 p-6 bg-white border-0 shadow-sm ring-1 ring-border">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider leading-none">Security Status</p>
                  <h3 className="text-3xl font-black mt-2 leading-none text-foreground">Optimal</h3>
                </div>
                <CheckCircle className="text-emerald-500" size={24} />
              </div>
              <p className="mt-4 text-[10px] font-bold text-muted-foreground uppercase leading-none">All Gateways responding</p>
            </Card>
          </>
        )}

        {/* Recent Activity for Everyone */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-4 bg-white border-0 shadow-sm ring-1 ring-border p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle>System Activity</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', text: 'New Hire: Alex Rivera onboarded', time: '2h ago' },
                { icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-50', text: 'Sarah Connor scheduled for interview', time: '4h ago' },
                { icon: TrendingUp, color: 'text-primary', bg: 'bg-indigo-50', text: 'Recruitment velocity increased by 15%', time: '6h ago' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/30 border border-border/50 hover:border-primary/20 transition-all cursor-default group">
                  <div className={`w-12 h-12 rounded-xl ${item.bg} ${item.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                    <item.icon size={22} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground leading-tight">{item.text}</p>
                    <p className="text-xs font-medium text-muted-foreground mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};