import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserRole } from './utils/store';
import { Layout } from './components/Layout';
import { Login } from './components/auth/Login';

// ── Admin Pages ────────────────────────────────────────────────────────────
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { AdminLeaveManagement } from './pages/admin/AdminLeaveManagement';
import { AdminOrgChart } from './pages/admin/AdminOrgChart';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';

// ── HR Pages (preserved + new) ─────────────────────────────────────────────
import { HRDashboard } from './pages/hr/HRDashboard';
import { TaskAssignment } from './pages/hr/TaskAssignment';
import { Scraper } from './pages/Scraper';
import { Leads } from './pages/Leads';
import { Campaigns } from './pages/Campaigns';
import { CampaignDetail } from './pages/CampaignDetail';
import { ResumeParser } from './HRMS_Admin/ResumeParser';
import { Scheduler } from './HRMS_Admin/Scheduler';
import { OfferLetterGenerator } from './HRMS_Admin/OfferLetterGenerator';
import { MessagingInbox } from './pages/MessagingInbox';

// ── Employee Pages ─────────────────────────────────────────────────────────
import { EmployeeDashboard } from './HRMS_Employee/EmployeeDashboard';
import { AttendancePortal } from './HRMS_Employee/AttendancePortal';
import { LeavePortal } from './HRMS_Employee/LeavePortal';
import { EmployeeTaskBoard } from './HRMS_Employee/EmployeeTaskBoard';
import { EmployeeDocuments } from './HRMS_Employee/EmployeeDocuments';
import { DigitalProfile } from './HRMS_Employee/DigitalProfile';

// ── Settings ───────────────────────────────────────────────────────────────
import { Settings } from './pages/Settings';

// ─── Protected Route ───────────────────────────────────────────────────────
const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user && !allowedRoles.includes(user.role)) {
    // Redirect to their own home
    if (user.role === 'employee') return <Navigate to="/employee/dashboard" replace />;
    if (user.role === 'hr') return <Navigate to="/recruiter/dashboard" replace />;
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

// ─── Root redirect ─────────────────────────────────────────────────────────
const RootRedirect: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'employee') return <Navigate to="/employee/dashboard" replace />;
  if (user?.role === 'hr') return <Navigate to="/recruiter/dashboard" replace />;
  return <Navigate to="/admin/dashboard" replace />;
};

// ─── App ────────────────────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRedirect />} />

          {/* ── ADMIN ROUTES ── */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><Layout><AdminAnalytics /></Layout></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><Layout><UserManagement /></Layout></ProtectedRoute>} />
          <Route path="/admin/org-chart" element={<ProtectedRoute allowedRoles={['admin']}><Layout><AdminOrgChart /></Layout></ProtectedRoute>} />
          <Route path="/admin/leaves" element={<ProtectedRoute allowedRoles={['admin']}><Layout><AdminLeaveManagement /></Layout></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><Layout><Settings /></Layout></ProtectedRoute>} />
          {/* Admin can also see recruitment */}
          <Route path="/admin/scraper" element={<ProtectedRoute allowedRoles={['admin']}><Layout><Scraper /></Layout></ProtectedRoute>} />
          <Route path="/admin/leads" element={<ProtectedRoute allowedRoles={['admin']}><Layout><Leads /></Layout></ProtectedRoute>} />
          <Route path="/admin/scheduler" element={<ProtectedRoute allowedRoles={['admin']}><Layout><Scheduler /></Layout></ProtectedRoute>} />
          <Route path="/admin/resume-parser" element={<ProtectedRoute allowedRoles={['admin']}><Layout><ResumeParser /></Layout></ProtectedRoute>} />
          <Route path="/admin/offer-letters" element={<ProtectedRoute allowedRoles={['admin']}><Layout><OfferLetterGenerator /></Layout></ProtectedRoute>} />

          {/* ── HR / RECRUITER ROUTES ── */}
          <Route path="/recruiter/dashboard" element={<ProtectedRoute allowedRoles={['hr', 'admin']}><Layout><HRDashboard /></Layout></ProtectedRoute>} />
          <Route path="/scraper" element={<ProtectedRoute allowedRoles={['hr', 'admin']}><Layout><Scraper /></Layout></ProtectedRoute>} />
          <Route path="/leads" element={<ProtectedRoute allowedRoles={['hr', 'admin']}><Layout><Leads /></Layout></ProtectedRoute>} />
          <Route path="/campaigns" element={<ProtectedRoute allowedRoles={['hr', 'admin']}><Layout><Campaigns /></Layout></ProtectedRoute>} />
          <Route path="/campaigns/:id" element={<ProtectedRoute allowedRoles={['hr', 'admin']}><Layout><CampaignDetail /></Layout></ProtectedRoute>} />
          <Route path="/resume-parser" element={<ProtectedRoute allowedRoles={['hr', 'admin']}><Layout><ResumeParser /></Layout></ProtectedRoute>} />
          <Route path="/scheduler" element={<ProtectedRoute allowedRoles={['hr', 'admin']}><Layout><Scheduler /></Layout></ProtectedRoute>} />
          <Route path="/offer-letters" element={<ProtectedRoute allowedRoles={['hr', 'admin']}><Layout><OfferLetterGenerator /></Layout></ProtectedRoute>} />
          <Route path="/hr/tasks" element={<ProtectedRoute allowedRoles={['hr', 'admin']}><Layout><TaskAssignment /></Layout></ProtectedRoute>} />

          {/* ── EMPLOYEE ROUTES ── */}
          <Route path="/employee/dashboard" element={<ProtectedRoute allowedRoles={['employee', 'admin']}><Layout><EmployeeDashboard /></Layout></ProtectedRoute>} />
          <Route path="/employee/attendance" element={<ProtectedRoute allowedRoles={['employee', 'admin']}><Layout><AttendancePortal /></Layout></ProtectedRoute>} />
          <Route path="/employee/leave" element={<ProtectedRoute allowedRoles={['employee', 'admin']}><Layout><LeavePortal /></Layout></ProtectedRoute>} />
          <Route path="/employee/tasks" element={<ProtectedRoute allowedRoles={['employee', 'admin']}><Layout><EmployeeTaskBoard /></Layout></ProtectedRoute>} />
          <Route path="/employee/documents" element={<ProtectedRoute allowedRoles={['employee', 'admin']}><Layout><EmployeeDocuments /></Layout></ProtectedRoute>} />
          <Route path="/employee/profile" element={<ProtectedRoute allowedRoles={['employee', 'admin']}><Layout><DigitalProfile /></Layout></ProtectedRoute>} />

          {/* ── COMMON ROUTES ── */}
          <Route path="/inbox" element={<ProtectedRoute allowedRoles={['admin', 'hr', 'employee']}><Layout><MessagingInbox /></Layout></ProtectedRoute>} />

          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
