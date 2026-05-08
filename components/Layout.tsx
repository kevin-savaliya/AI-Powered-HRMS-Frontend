import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, DownloadCloud, Users, Send, MessageSquare, Settings,
  Bell, Menu, ChevronLeft, Fingerprint, FileSearch, Calendar, FileCheck,
  UserCheck, Building2, Clock, ClipboardList, BarChart3, CalendarOff,
  LogOut, User, FileText, ShieldCheck, Briefcase, CheckCircle, AlertCircle, X, Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { store, Notification } from '../utils/store';
import { ChatWidget } from './ChatWidget';

interface LayoutProps { children: React.ReactNode; }

const SidebarItem = ({ to, icon: Icon, label, collapsed, end = false }: { to: string; icon: React.ElementType; label: string; collapsed: boolean; end?: boolean }) => (
  <NavLink to={to} end={end}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
        ? 'bg-blue-700 text-white shadow-lg shadow-blue-700/20'
        : 'text-slate-400 hover:bg-white/10 hover:text-white'
      }`
    }
  >
    <Icon size={17} className="shrink-0" />
    {!collapsed && <span className="font-semibold text-sm truncate">{label}</span>}
  </NavLink>
);

const SidebarSection = ({ label, collapsed }: { label: string; collapsed: boolean }) => (
  !collapsed
    ? <div className="px-4 pt-5 pb-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">{label}</div>
    : <div className="h-px bg-white/10 mx-3 my-3" />
);

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;
    const loadNotifs = () => setNotifications(store.getNotifications().filter(n => n.userId === user.id));
    loadNotifs();
    const interval = setInterval(loadNotifs, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [user?.id]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  const markRead = (id: string) => {
    store.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    if (!user) return;
    store.markAllNotificationsRead(user.id);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // ── Admin Sidebar ─────────────────────────────────────────────────────────
  const AdminNav = () => (
    <>
      <SidebarSection label="Overview" collapsed={collapsed} />
      <SidebarItem to="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} end />
      <SidebarItem to="/admin/analytics" icon={BarChart3} label="Analytics" collapsed={collapsed} />

      <SidebarSection label="People Management" collapsed={collapsed} />
      <SidebarItem to="/admin/users" icon={Users} label="User Management" collapsed={collapsed} />
      <SidebarItem to="/admin/org-chart" icon={Building2} label="Org Chart" collapsed={collapsed} />
      <SidebarItem to="/admin/leaves" icon={CalendarOff} label="Leave Approvals" collapsed={collapsed} />

      <SidebarSection label="Recruitment (View)" collapsed={collapsed} />
      <SidebarItem to="/admin/scraper" icon={DownloadCloud} label="Candidate Scraper" collapsed={collapsed} />
      <SidebarItem to="/admin/leads" icon={Users} label="CRM Pipeline" collapsed={collapsed} />
      <SidebarItem to="/admin/scheduler" icon={Calendar} label="Scheduler" collapsed={collapsed} />
      <SidebarItem to="/admin/resume-parser" icon={FileSearch} label="Resume Parser" collapsed={collapsed} />
      <SidebarItem to="/admin/offer-letters" icon={FileCheck} label="Offer Letters" collapsed={collapsed} />
      <SidebarItem to="/inbox" icon={MessageSquare} label="Inbox" collapsed={collapsed} />

      <SidebarSection label="HR Tools" collapsed={collapsed} />
      <SidebarItem to="/hr/tasks" icon={ClipboardList} label="Task Assignment" collapsed={collapsed} />

      <SidebarSection label="System" collapsed={collapsed} />
      <SidebarItem to="/admin/settings" icon={Settings} label="Settings" collapsed={collapsed} />
    </>
  );

  // ── HR Sidebar ────────────────────────────────────────────────────────────
  const HRNav = () => (
    <>
      <SidebarSection label="Overview" collapsed={collapsed} />
      <SidebarItem to="/recruiter/dashboard" icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} end />

      <SidebarSection label="Recruitment" collapsed={collapsed} />
      <SidebarItem to="/scraper" icon={DownloadCloud} label="AI Scraper" collapsed={collapsed} />
      <SidebarItem to="/leads" icon={Users} label="CRM Pipeline" collapsed={collapsed} />
      <SidebarItem to="/campaigns" icon={Send} label="Campaigns" collapsed={collapsed} />
      <SidebarItem to="/resume-parser" icon={FileSearch} label="Resume Parser" collapsed={collapsed} />
      <SidebarItem to="/scheduler" icon={Calendar} label="Scheduler" collapsed={collapsed} />
      <SidebarItem to="/offer-letters" icon={FileCheck} label="Offer Letters" collapsed={collapsed} />
      <SidebarItem to="/inbox" icon={MessageSquare} label="Inbox" collapsed={collapsed} />

      <SidebarSection label="HR Tools" collapsed={collapsed} />
      <SidebarItem to="/hr/tasks" icon={ClipboardList} label="Task Assignment" collapsed={collapsed} />
    </>
  );

  // ── Employee Sidebar ──────────────────────────────────────────────────────
  const EmployeeNav = () => (
    <>
      <SidebarSection label="My Portal" collapsed={collapsed} />
      <SidebarItem to="/employee/dashboard" icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} end />
      <SidebarItem to="/employee/attendance" icon={Clock} label="Attendance" collapsed={collapsed} />
      <SidebarItem to="/employee/leave" icon={CalendarOff} label="Leave Portal" collapsed={collapsed} />
      <SidebarItem to="/employee/tasks" icon={ClipboardList} label="My Tasks" collapsed={collapsed} />
      <SidebarItem to="/employee/documents" icon={FileText} label="Documents" collapsed={collapsed} />
      <SidebarItem to="/employee/profile" icon={User} label="My Profile" collapsed={collapsed} />
      <SidebarItem to="/inbox" icon={MessageSquare} label="Messaging" collapsed={collapsed} />
    </>
  );

  const ROLE_LABEL: Record<string, string> = { admin: 'Administrator', hr: 'HR / Recruiter', employee: 'Employee' };
  const ROLE_ICON: Record<string, React.ElementType> = { admin: ShieldCheck, hr: Briefcase, employee: UserCheck };
  const RoleIcon = user?.role ? ROLE_ICON[user.role] : User;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f8fafc' }}>
      {/* Sidebar */}
      <aside className={`flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}
        style={{ background: 'linear-gradient(180deg,#0f172a 0%,#1e293b 100%)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Brand */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b shrink-0`} style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0"><Fingerprint size={18} className="text-white" /></div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-white font-black text-sm leading-tight">Next-Gen HRMS</p>
              <p className="text-slate-400 text-[10px] font-medium leading-tight">Enterprise Edition</p>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-slate-500 hover:text-white transition-colors shrink-0">
            {collapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2 custom-scrollbar space-y-0.5">
          {user?.role === 'admin' && <AdminNav />}
          {user?.role === 'hr' && <HRNav />}
          {user?.role === 'employee' && <EmployeeNav />}
        </nav>

        {/* User footer */}
        <div className="border-t px-3 py-3 shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-xl bg-blue-700 flex items-center justify-center text-white font-black text-sm shrink-0">
              {user?.name?.[0] || '?'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-xs truncate">{user?.name}</p>
                <p className="text-slate-500 text-[10px] font-medium">{user?.role ? ROLE_LABEL[user.role] : ''}</p>
              </div>
            )}
            {!collapsed && (
              <button onClick={handleLogout} title="Logout" className="text-slate-500 hover:text-red-400 transition-colors shrink-0"><LogOut size={15} /></button>
            )}
          </div>
          {collapsed && (
            <button onClick={handleLogout} title="Logout" className="mt-2 w-full flex items-center justify-center text-slate-500 hover:text-red-400 transition-colors"><LogOut size={14} /></button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2">
            <RoleIcon size={16} className="text-blue-600" />
            <h2 className="font-black text-gray-800 text-sm capitalize">{user?.role ? ROLE_LABEL[user.role] : ''} Portal</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 rounded-xl transition-all ${showNotifications ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
              >
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                      <h3 className="text-sm font-black text-gray-900">Notifications</h3>
                      <button onClick={markAllRead} className="text-[10px] font-black text-blue-600 hover:underline">Mark all read</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center">
                          <Bell size={24} className="text-gray-200 mx-auto mb-2" />
                          <p className="text-xs text-gray-400 font-bold">No notifications</p>
                        </div>
                      ) : notifications.map(n => (
                        <div
                          key={n.id}
                          className={`p-4 border-b border-gray-50 flex gap-3 transition-colors ${!n.read ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                          onClick={() => { if (!n.read) markRead(n.id); if (n.link) navigate(n.link); setShowNotifications(false); }}
                        >
                          <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${n.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                            n.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                              n.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                            }`}>
                            {n.type === 'success' ? <CheckCircle size={14} /> : n.type === 'warning' ? <AlertCircle size={14} /> : n.type === 'error' ? <X size={14} /> : <Info size={14} />}
                          </div>
                          <div className="min-w-0">
                            <p className={`text-xs ${!n.read ? 'font-black text-gray-900' : 'font-bold text-gray-700'}`}>{n.title}</p>
                            <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{n.message}</p>
                            <p className="text-[9px] text-gray-400 font-bold mt-1 uppercase">{new Date(n.createdAt).toLocaleDateString()} · {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-2.5 pl-3 border-l border-gray-100">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm">{user?.name?.[0]}</div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-gray-900">{user?.name}</p>
                <p className="text-[10px] text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {children}
        </main>
        <ChatWidget />
      </div>
    </div>
  );
};