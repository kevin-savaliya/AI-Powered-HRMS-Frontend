// ─────────────────────────────────────────────────────────────────────────────
// HRMS Central Data Store — Single source of truth (localStorage-backed)
// ─────────────────────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'hr' | 'employee';

// ─── RECRUITMENT TYPES ───────────────────────────────────────────────────────

export type PipelineStage = 'sourced' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';

export interface CampaignRecord {
    id: string;
    name: string;
    jobTitle: string;
    location: string;
    status: 'draft' | 'active' | 'paused' | 'completed';
    createdAt: string;
    leadCount: number;
}

export interface LeadRecord {
    id: string;
    campaignId: string;
    name: string;
    email: string;
    phone?: string;
    currentRole?: string;
    company?: string;
    location?: string;
    skills: string[];
    matchScore?: number;
    source: string; // 'LinkedIn' | 'Manual' | 'Resume Parser' | etc.
    stage: PipelineStage;
    notes: string;
    createdAt: string;
    hiredAt?: string;
}

export type InterviewType = 'Technical Round' | 'HR Round' | 'Culture Fit' | 'Final Round' | 'System Design';
export type InterviewOutcome = 'pending' | 'passed' | 'failed' | 'no_show';

export interface Interview {
    id: string;
    leadId?: string;
    candidateName: string;
    role: string;
    interviewType: InterviewType;
    interviewer: string; // user name
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
    duration: number; // minutes
    startTime: string; // ISO
    endTime: string; // ISO
    outcome: InterviewOutcome;
    feedback?: string;
    createdAt: string;
}

export interface OfferLetter {
    id: string;
    candidateName: string;
    email?: string;
    position: string;
    department: string;
    salary: string;
    joinDate: string;
    reportingManager: string;
    probation: string;
    noticePeriod: string;
    content: string; // full letter text
    status: 'draft' | 'sent';
    createdAt: string;
    employeeId?: string; // set when linked to hired employee
}

export interface HRMSUser {
    id: string;
    name: string;
    email: string;
    passwordHash: string; // stored as plaintext for demo; in prod use bcrypt
    role: UserRole;
    department?: string;
    managerId?: string;
    avatarInitials?: string;
    createdAt: string;
    isActive: boolean;
}

export interface Employee {
    id: string;
    userId: string;
    name: string;
    email: string;
    department: string;
    designation: string;
    managerId?: string;
    phone?: string;
    joinDate: string;
    skills: string[];
    bio: string;
    emergencyContact?: { name: string; phone: string; relation: string };
    salary?: number;
}

export interface AttendanceRecord {
    id: string;
    employeeId: string;
    date: string; // YYYY-MM-DD
    clockIn?: string; // ISO datetime
    clockOut?: string; // ISO datetime
    hoursWorked?: number;
    status: 'present' | 'absent' | 'half-day' | 'leave';
}

export interface LeaveRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    type: 'sick' | 'casual' | 'earned' | 'unpaid';
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    approvedBy?: string;
    appliedAt: string;
}

export interface Task {
    id: string;
    assignedTo: string; // employeeId
    assignedToName: string;
    assignedBy: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    deadline: string; // ISO date
    createdAt: string;
}

export interface Department {
    id: string;
    name: string;
    headId?: string;
    parentId?: string;
    description?: string;
}

export interface Document {
    id: string;
    employeeId: string;
    type: 'offer_letter' | 'payslip' | 'kyc' | 'other';
    name: string;
    content?: string; // base64 or text content for download
    uploadedAt: string;
}

export interface LeavePolicy {
    sickLeave: number;
    casualLeave: number;
    earnedLeave: number;
}

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    link?: string;
    read: boolean;
    createdAt: string;
}

export interface InboxMessage {
    id: string;
    conversationId: string;  // leadId, candidateEmail, or 'internal-userId1-userId2'
    type: 'candidate' | 'internal';
    fromId: string;          // userId or 'candidate'
    fromName: string;
    fromRole: 'hr' | 'admin' | 'candidate' | 'employee';
    toId: string;            // userId or 'candidate'
    toName: string;
    subject: string;
    body: string;
    sentAt: string;         // ISO
    read: boolean;
    campaignId?: string;
}

// ─── Keys ────────────────────────────────────────────────────────────────────

const KEYS = {
    users: 'hrms_users',
    employees: 'hrms_employees',
    attendance: 'hrms_attendance',
    leaves: 'hrms_leaves',
    tasks: 'hrms_tasks',
    departments: 'hrms_departments',
    documents: 'hrms_documents',
    leavePolicy: 'hrms_leave_policy',
    // Recruitment
    campaigns: 'hrms_campaigns',
    leads: 'hrms_leads',
    interviews: 'hrms_interviews',
    offerLetters: 'hrms_offer_letters',
    messages: 'hrms_inbox_messages',
    notifications: 'hrms_notifications',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const load = <T>(key: string, fallback: T): T => {
    try {
        const v = localStorage.getItem(key);
        return v ? JSON.parse(v) : fallback;
    } catch { return fallback; }
};

const save = <T>(key: string, data: T) => {
    localStorage.setItem(key, JSON.stringify(data));
};

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const today = () => new Date().toISOString().split('T')[0];

// ─── SEED DATA (Clean Slate — only Admin account pre-seeded) ─────────────────

const seedUsers = (): HRMSUser[] => [
    // Only the System Admin is pre-seeded. Create HR users via Admin → User Management.
    { id: 'admin-001', name: 'System Admin', email: 'admin@hrms.io', passwordHash: 'Admin@123', role: 'admin', department: 'Management', avatarInitials: 'SA', createdAt: '2025-01-01T00:00:00Z', isActive: true },
];

const seedEmployees = (): Employee[] => [];

const seedDepartments = (): Department[] => [
    // One root department pre-seeded. Add more via Admin → Org Chart.
    { id: 'dept-001', name: 'Management', headId: 'admin-001', description: 'Top-level management' },
];

const seedTasks = (): Task[] => [];

const seedLeaves = (): LeaveRequest[] => [];

const seedAttendance = (): AttendanceRecord[] => [];

const seedDocuments = (): Document[] => [];

// ─── STORE VERSION ────────────────────────────────────────────────────────────
const STORE_VERSION = 'hrms-v7'; // v7: fresh reset — clears stale migration data
const VERSION_KEY = 'hrms_store_version';

// ─── STORE CLASS ──────────────────────────────────────────────────────────────

class HRMSStore {
    private initialized = false;

    init() {
        if (this.initialized) return;

        // ── Version check: if stale version, purge all cached data ────────────
        const storedVersion = localStorage.getItem(VERSION_KEY);
        if (storedVersion !== STORE_VERSION) {
            // Clear old data from all store keys
            Object.values(KEYS).forEach(k => localStorage.removeItem(k));
            localStorage.setItem(VERSION_KEY, STORE_VERSION);
        }

        // Seed only if empty
        if (!localStorage.getItem(KEYS.users)) save(KEYS.users, seedUsers());
        if (!localStorage.getItem(KEYS.employees)) save(KEYS.employees, seedEmployees());
        if (!localStorage.getItem(KEYS.departments)) save(KEYS.departments, seedDepartments());
        if (!localStorage.getItem(KEYS.tasks)) save(KEYS.tasks, seedTasks());
        if (!localStorage.getItem(KEYS.leaves)) save(KEYS.leaves, seedLeaves());
        if (!localStorage.getItem(KEYS.attendance)) save(KEYS.attendance, seedAttendance());
        if (!localStorage.getItem(KEYS.documents)) save(KEYS.documents, seedDocuments());
        if (!localStorage.getItem(KEYS.leavePolicy)) save(KEYS.leavePolicy, { sickLeave: 12, casualLeave: 12, earnedLeave: 15 } as LeavePolicy);
        if (!localStorage.getItem(KEYS.campaigns)) save(KEYS.campaigns, []);
        if (!localStorage.getItem(KEYS.leads)) save(KEYS.leads, []);
        if (!localStorage.getItem(KEYS.interviews)) save(KEYS.interviews, []);
        if (!localStorage.getItem(KEYS.offerLetters)) save(KEYS.offerLetters, []);
        if (!localStorage.getItem(KEYS.messages)) save(KEYS.messages, []);
        if (!localStorage.getItem(KEYS.notifications)) save(KEYS.notifications, []);
        this.initialized = true;
    }

    // ── USERS ────────────────────────────────────────────────────────────────
    getUsers(): HRMSUser[] { return load<HRMSUser[]>(KEYS.users, []); }
    saveUsers(users: HRMSUser[]) { save(KEYS.users, users); }

    getUserByEmail(email: string): HRMSUser | undefined {
        return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    validateLogin(email: string, password: string): HRMSUser | null {
        const user = this.getUserByEmail(email);
        if (!user || !user.isActive) return null;
        if (user.passwordHash !== password) return null;
        return user;
    }

    createUser(data: Omit<HRMSUser, 'id' | 'createdAt'>): HRMSUser {
        const users = this.getUsers();
        const newUser: HRMSUser = { ...data, id: uid(), createdAt: new Date().toISOString() };
        this.saveUsers([...users, newUser]);
        return newUser;
    }

    updateUser(id: string, updates: Partial<HRMSUser>) {
        const users = this.getUsers().map(u => u.id === id ? { ...u, ...updates } : u);
        this.saveUsers(users);
    }

    deleteUser(id: string) {
        this.saveUsers(this.getUsers().filter(u => u.id !== id));
    }

    // ── EMPLOYEES ─────────────────────────────────────────────────────────────
    getEmployees(): Employee[] { return load<Employee[]>(KEYS.employees, []); }
    saveEmployees(emps: Employee[]) { save(KEYS.employees, emps); }

    getEmployeeByUserId(userId: string): Employee | undefined {
        return this.getEmployees().find(e => e.userId === userId);
    }

    createEmployee(data: Omit<Employee, 'id'>): Employee {
        const employees = this.getEmployees();
        const emp: Employee = { ...data, id: uid() };
        this.saveEmployees([...employees, emp]);
        return emp;
    }

    updateEmployee(id: string, updates: Partial<Employee>) {
        const emps = this.getEmployees().map(e => e.id === id ? { ...e, ...updates } : e);
        this.saveEmployees(emps);
    }

    // ── HIRE (from Leads/CRM) ─────────────────────────────────────────────────
    hireCandidate(name: string, email: string, department: string = 'General'): { user: HRMSUser; employee: Employee; password: string } {
        const password = `${email.split('@')[0]}@Hrms1`;
        const user = this.createUser({
            name, email, passwordHash: password, role: 'employee',
            department, avatarInitials: name.slice(0, 2).toUpperCase(), isActive: true,
        });
        const employee = this.createEmployee({
            userId: user.id, name, email, department, designation: 'New Hire',
            joinDate: today(), skills: [], bio: '',
        });
        // Generate offer letter
        const docs = this.getDocuments();
        docs.push({
            id: uid(), employeeId: employee.id, type: 'offer_letter',
            name: `Offer Letter - ${name}.pdf`,
            content: `Dear ${name},\n\nWe are pleased to offer you the position at Next-Gen HRMS Solutions.\n\nDepartment: ${department}\nStart Date: ${today()}\n\nWelcome aboard!\n\nSincerely,\nHRMS Team`,
            uploadedAt: new Date().toISOString(),
        });
        save(KEYS.documents, docs);
        return { user, employee, password };
    }

    // ── ATTENDANCE ────────────────────────────────────────────────────────────
    getAttendance(): AttendanceRecord[] { return load<AttendanceRecord[]>(KEYS.attendance, []); }
    saveAttendance(records: AttendanceRecord[]) { save(KEYS.attendance, records); }

    getAttendanceByEmployee(employeeId: string): AttendanceRecord[] {
        return this.getAttendance().filter(a => a.employeeId === employeeId);
    }

    clockIn(employeeId: string): AttendanceRecord {
        const allRecords = this.getAttendance();
        const dateStr = today();
        const existing = allRecords.find(a => a.employeeId === employeeId && a.date === dateStr);
        if (existing) return existing;
        const record: AttendanceRecord = {
            id: uid(), employeeId, date: dateStr,
            clockIn: new Date().toISOString(), status: 'present',
        };
        this.saveAttendance([...allRecords, record]);
        return record;
    }

    clockOut(employeeId: string): AttendanceRecord | null {
        const allRecords = this.getAttendance();
        const dateStr = today();
        const idx = allRecords.findIndex(a => a.employeeId === employeeId && a.date === dateStr);
        if (idx === -1) return null;
        const record = allRecords[idx];
        if (!record.clockIn) return null;
        const clockOut = new Date().toISOString();
        const hrs = (new Date(clockOut).getTime() - new Date(record.clockIn).getTime()) / 3600000;
        const updated = { ...record, clockOut, hoursWorked: Math.round(hrs * 10) / 10 };
        allRecords[idx] = updated;
        this.saveAttendance(allRecords);
        return updated;
    }

    // ── LEAVES ────────────────────────────────────────────────────────────────
    getLeaves(): LeaveRequest[] { return load<LeaveRequest[]>(KEYS.leaves, []); }
    saveLeaves(leaves: LeaveRequest[]) { save(KEYS.leaves, leaves); }

    getLeavesByEmployee(employeeId: string): LeaveRequest[] {
        return this.getLeaves().filter(l => l.employeeId === employeeId);
    }

    getLeaveBalance(employeeId: string): { sick: number; casual: number; earned: number } {
        const policy = this.getLeavePolicy();
        const approved = this.getLeavesByEmployee(employeeId).filter(l => l.status === 'approved');
        const used = { sick: 0, casual: 0, earned: 0 };
        for (const l of approved) {
            if (l.type === 'sick') used.sick += l.days;
            else if (l.type === 'casual') used.casual += l.days;
            else if (l.type === 'earned') used.earned += l.days;
        }
        return {
            sick: Math.max(0, policy.sickLeave - used.sick),
            casual: Math.max(0, policy.casualLeave - used.casual),
            earned: Math.max(0, policy.earnedLeave - used.earned),
        };
    }

    applyLeave(data: Omit<LeaveRequest, 'id' | 'appliedAt' | 'status'>): LeaveRequest | { error: string } {
        // Validate leave balance
        const balance = this.getLeaveBalance(data.employeeId);
        const typeKey = data.type === 'sick' ? 'sick' : data.type === 'casual' ? 'casual' : data.type === 'earned' ? 'earned' : null;
        if (typeKey && balance[typeKey] < data.days) {
            return { error: `Insufficient ${data.type} leave balance. Available: ${balance[typeKey as keyof typeof balance]} days.` };
        }
        const leave: LeaveRequest = { ...data, id: uid(), status: 'pending', appliedAt: new Date().toISOString() };
        this.saveLeaves([...this.getLeaves(), leave]);
        return leave;
    }

    updateLeaveStatus(id: string, status: 'approved' | 'rejected', approvedBy: string) {
        const leave = this.getLeaves().find(l => l.id === id);
        const leaves = this.getLeaves().map(l => l.id === id ? { ...l, status, approvedBy } : l);
        this.saveLeaves(leaves);

        if (leave) {
            this.addNotification({
                userId: leave.employeeId,
                title: `Leave Request ${status.toUpperCase()}`,
                message: `Your leave request from ${leave.startDate} to ${leave.endDate} has been ${status}.`,
                type: status === 'approved' ? 'success' : 'error',
                link: '/employee/leave'
            });
        }
    }

    // ── TASKS ─────────────────────────────────────────────────────────────────
    getTasks(): Task[] { return load<Task[]>(KEYS.tasks, []); }
    saveTasks(tasks: Task[]) { save(KEYS.tasks, tasks); }

    getTasksByEmployee(employeeId: string): Task[] {
        return this.getTasks().filter(t => t.assignedTo === employeeId);
    }

    createTask(data: Omit<Task, 'id' | 'createdAt'>): Task {
        const task: Task = { ...data, id: uid(), createdAt: new Date().toISOString() };
        this.saveTasks([...this.getTasks(), task]);

        this.addNotification({
            userId: task.assignedTo,
            title: 'New Task Assigned',
            message: `You have been assigned a new task: ${task.title}. Priority: ${task.priority.toUpperCase()}`,
            type: 'info',
            link: '/employee/tasks'
        });

        return task;
    }

    updateTaskStatus(id: string, status: Task['status']) {
        this.saveTasks(this.getTasks().map(t => t.id === id ? { ...t, status } : t));
    }

    deleteTask(id: string) {
        this.saveTasks(this.getTasks().filter(t => t.id !== id));
    }

    // ── DEPARTMENTS ───────────────────────────────────────────────────────────
    getDepartments(): Department[] { return load<Department[]>(KEYS.departments, []); }
    saveDepartments(depts: Department[]) { save(KEYS.departments, depts); }

    createDepartment(data: Omit<Department, 'id'>): Department {
        const dept: Department = { ...data, id: uid() };
        this.saveDepartments([...this.getDepartments(), dept]);
        return dept;
    }

    deleteDepartment(id: string) {
        this.saveDepartments(this.getDepartments().filter(d => d.id !== id));
    }

    // ── DOCUMENTS ─────────────────────────────────────────────────────────────
    getDocuments(): Document[] { return load<Document[]>(KEYS.documents, []); }

    getDocumentsByEmployee(employeeId: string): Document[] {
        return this.getDocuments().filter(d => d.employeeId === employeeId);
    }

    generatePayslip(employeeId: string, month: string): Document {
        const emp = this.getEmployees().find(e => e.id === employeeId);
        const salary = emp?.salary || 500000;
        const monthly = Math.round(salary / 12);
        const doc: Document = {
            id: uid(), employeeId, type: 'payslip',
            name: `Payslip - ${month}.pdf`,
            content: `PAYSLIP - ${month}\n\nEmployee: ${emp?.name}\nDepartment: ${emp?.department}\n\nBasic Salary: ₹${monthly.toLocaleString()}\nHRA: ₹${Math.round(monthly * 0.4).toLocaleString()}\nPF Deduction: -₹${Math.round(monthly * 0.12).toLocaleString()}\n\nNet Pay: ₹${Math.round(monthly * 1.28).toLocaleString()}`,
            uploadedAt: new Date().toISOString(),
        };
        const docs = this.getDocuments();
        docs.push(doc);
        save(KEYS.documents, docs);
        return doc;
    }

    // ── LEAVE POLICY ──────────────────────────────────────────────────────────
    getLeavePolicy(): LeavePolicy { return load<LeavePolicy>(KEYS.leavePolicy, { sickLeave: 12, casualLeave: 12, earnedLeave: 15 }); }
    saveLeavePolicy(policy: LeavePolicy) { save(KEYS.leavePolicy, policy); }

    // ── ANALYTICS ─────────────────────────────────────────────────────────────
    getAnalytics() {
        const users = this.getUsers();
        const employees = this.getEmployees();
        const leaves = this.getLeaves();
        const tasks = this.getTasks();
        const attendance = this.getAttendance();

        const totalEmployees = employees.length;
        const totalHR = users.filter(u => u.role === 'hr').length;
        const pendingLeaves = leaves.filter(l => l.status === 'pending').length;
        const pendingTasks = tasks.filter(t => t.status === 'pending').length;
        const todayAttendance = attendance.filter(a => a.date === today() && a.status === 'present').length;
        const avgHours = attendance.filter(a => a.hoursWorked).reduce((s, a) => s + (a.hoursWorked || 0), 0) / (attendance.filter(a => a.hoursWorked).length || 1);

        return { totalEmployees, totalHR, pendingLeaves, pendingTasks, todayAttendance, avgHours: Math.round(avgHours * 10) / 10 };
    }

    // ── CAMPAIGNS ─────────────────────────────────────────────────────────────
    getCampaigns(): CampaignRecord[] { return load<CampaignRecord[]>(KEYS.campaigns, []); }
    saveCampaigns(c: CampaignRecord[]) { save(KEYS.campaigns, c); }

    createCampaign(data: Omit<CampaignRecord, 'id' | 'createdAt' | 'leadCount'>): CampaignRecord {
        const rec: CampaignRecord = { ...data, id: uid(), createdAt: new Date().toISOString(), leadCount: 0 };
        this.saveCampaigns([...this.getCampaigns(), rec]);
        return rec;
    }

    updateCampaignLeadCount(campaignId: string) {
        const leads = this.getLeads().filter(l => l.campaignId === campaignId).length;
        const campaigns = this.getCampaigns().map(c => c.id === campaignId ? { ...c, leadCount: leads } : c);
        this.saveCampaigns(campaigns);
    }

    updateCampaignStatus(id: string, status: CampaignRecord['status']) {
        this.saveCampaigns(this.getCampaigns().map(c => c.id === id ? { ...c, status } : c));
    }

    deleteCampaign(id: string) {
        this.saveCampaigns(this.getCampaigns().filter(c => c.id !== id));
        this.saveLeads(this.getLeads().filter(l => l.campaignId !== id));
    }

    // ── LEADS (CRM Pipeline) ──────────────────────────────────────────────────
    getLeads(): LeadRecord[] { return load<LeadRecord[]>(KEYS.leads, []); }
    saveLeads(leads: LeadRecord[]) { save(KEYS.leads, leads); }

    getLeadsByCampaign(campaignId: string): LeadRecord[] {
        return this.getLeads().filter(l => l.campaignId === campaignId);
    }

    addLead(data: Omit<LeadRecord, 'id' | 'createdAt'>): LeadRecord {
        const lead: LeadRecord = { ...data, id: uid(), createdAt: new Date().toISOString() };
        this.saveLeads([...this.getLeads(), lead]);
        this.updateCampaignLeadCount(data.campaignId);
        return lead;
    }

    updateLead(id: string, updates: Partial<LeadRecord>) {
        this.saveLeads(this.getLeads().map(l => l.id === id ? { ...l, ...updates } : l));
    }

    updateLeadStage(id: string, stage: PipelineStage) {
        this.saveLeads(this.getLeads().map(l => l.id === id ? { ...l, stage } : l));
    }

    deleteLead(id: string) {
        const lead = this.getLeads().find(l => l.id === id);
        this.saveLeads(this.getLeads().filter(l => l.id !== id));
        if (lead) this.updateCampaignLeadCount(lead.campaignId);
    }

    // Convert lead to hired employee
    hireLead(leadId: string, department: string): { user: HRMSUser; employee: Employee; password: string } | null {
        const lead = this.getLeads().find(l => l.id === leadId);
        if (!lead) return null;
        const result = this.hireCandidate(lead.name, lead.email || `${lead.name.toLowerCase().replace(/\s+/g, '.')}@company.com`, department);
        this.updateLead(leadId, { stage: 'hired', hiredAt: new Date().toISOString() });

        if (result) {
            this.addNotification({
                userId: result.user.id,
                title: 'Welcome to the Team!',
                message: `Congratulations ${result.user.name}! Your employee account is ready. Please set up your profile.`,
                type: 'success',
                link: '/employee/profile'
            });
        }

        return result;
    }

    // ── INTERVIEWS ────────────────────────────────────────────────────────────
    getInterviews(): Interview[] { return load<Interview[]>(KEYS.interviews, []); }
    saveInterviews(items: Interview[]) { save(KEYS.interviews, items); }

    createInterview(data: Omit<Interview, 'id' | 'createdAt' | 'startTime' | 'endTime'>): Interview {
        const [h, m] = data.time.split(':').map(Number);
        const start = new Date(data.date);
        start.setHours(h, m, 0, 0);
        const end = new Date(start.getTime() + data.duration * 60000);
        const interview: Interview = {
            ...data,
            id: uid(),
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            createdAt: new Date().toISOString(),
        };
        this.saveInterviews([...this.getInterviews(), interview]);
        return interview;
    }

    updateInterview(id: string, updates: Partial<Interview>) {
        this.saveInterviews(this.getInterviews().map(i => i.id === id ? { ...i, ...updates } : i));
    }

    deleteInterview(id: string) {
        this.saveInterviews(this.getInterviews().filter(i => i.id !== id));
    }

    checkInterviewConflict(date: string, time: string, duration: number, interviewerName: string, excludeId?: string): Interview | null {
        const [h, m] = time.split(':').map(Number);
        const start = new Date(date);
        start.setHours(h, m, 0, 0);
        const end = new Date(start.getTime() + duration * 60000);
        const conflict = this.getInterviews().find(i => {
            if (i.interviewer !== interviewerName) return false;
            if (excludeId && i.id === excludeId) return false;
            const iStart = new Date(i.startTime);
            const iEnd = new Date(i.endTime);
            return start < iEnd && end > iStart;
        });
        return conflict || null;
    }

    // ── OFFER LETTERS ─────────────────────────────────────────────────────────
    getOfferLetters(): OfferLetter[] { return load<OfferLetter[]>(KEYS.offerLetters, []); }
    saveOfferLetters(items: OfferLetter[]) { save(KEYS.offerLetters, items); }

    generateOfferLetter(data: Omit<OfferLetter, 'id' | 'createdAt' | 'content' | 'status'>): OfferLetter {
        const content = `
Next-Gen HRMS Solutions
${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

Dear ${data.candidateName},

SUBJECT: OFFER LETTER – ${data.position.toUpperCase()}

We are delighted to offer you the position of ${data.position} in our ${data.department} department.

Your appointment details are as follows:

  Designation    : ${data.position}
  Department     : ${data.department}
  Annual CTC     : INR ${data.salary}
  Date of Joining: ${new Date(data.joinDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
  Reporting To   : ${data.reportingManager}
  Probation Period: ${data.probation}
  Notice Period  : ${data.noticePeriod}

Terms:
  1. This offer is subject to satisfactory background verification.
  2. You will be on probation for ${data.probation} from the date of joining.
  3. Either party may terminate during probation with one week's notice.

Please sign and return a copy of this letter as acceptance.

We look forward to your joining and wish you a rewarding career with us.

Warm regards,

${data.reportingManager}
On behalf of HR Department
Next-Gen HRMS Solutions
`;
        const letter: OfferLetter = {
            ...data, id: uid(), createdAt: new Date().toISOString(),
            content, status: 'draft',
        };
        this.saveOfferLetters([...this.getOfferLetters(), letter]);
        // Also save to employee's documents if employeeId is provided
        if (data.employeeId) {
            const docs = this.getDocuments();
            docs.push({
                id: uid(), employeeId: data.employeeId, type: 'offer_letter',
                name: `Offer Letter - ${data.candidateName}.txt`,
                content,
                uploadedAt: new Date().toISOString(),
            });
            save(KEYS.documents, docs);
        }
        return letter;
    }

    downloadOfferLetter(id: string) {
        const letter = this.getOfferLetters().find(l => l.id === id);
        if (!letter) return;
        const blob = new Blob([letter.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Offer_Letter_${letter.candidateName.replace(/\s+/g, '_')}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }

    markOfferLetterSent(id: string) {
        this.saveOfferLetters(this.getOfferLetters().map(l => l.id === id ? { ...l, status: 'sent' } : l));
        // Simulate email logging
        const letter = this.getOfferLetters().find(l => l.id === id);
        console.log(`[EMAIL SIMULATION] Sending offer letter to ${letter?.email || 'unknown'}...`);
    }

    // ─── RESET (for dev) ─────────────────────────────────────────────────────
    resetAll() {
        Object.values(KEYS).forEach(k => localStorage.removeItem(k));
        this.initialized = false;
        this.init();
    }

    // ── INBOX MESSAGES ────────────────────────────────────────────────────────
    getMessages(): InboxMessage[] { return load<InboxMessage[]>(KEYS.messages, []); }
    saveMessages(msgs: InboxMessage[]) { save(KEYS.messages, msgs); }

    sendMessage(data: Omit<InboxMessage, 'id' | 'sentAt' | 'read'>): InboxMessage {
        const msgs = this.getMessages();
        const msg: InboxMessage = { ...data, id: uid(), sentAt: new Date().toISOString(), read: false };
        this.saveMessages([...msgs, msg]);

        // Add notification for recipient if not 'candidate'
        if (msg.toId !== 'candidate') {
            this.addNotification({
                userId: msg.toId,
                title: 'New Message',
                message: `You received a new message from ${msg.fromName}`,
                type: 'info',
                link: '/inbox'
            });
        }

        return msg;
    }

    markRead(messageId: string) {
        this.saveMessages(this.getMessages().map(m => m.id === messageId ? { ...m, read: true } : m));
    }

    markConversationRead(conversationId: string, userId: string) {
        this.saveMessages(this.getMessages().map(m =>
            m.conversationId === conversationId && m.toId === userId ? { ...m, read: true } : m
        ));
    }

    getConversations(userId: string): { conversationId: string; lastMsg: InboxMessage; unread: number; otherName: string; type: 'candidate' | 'internal' }[] {
        const msgs = this.getMessages().filter(m => m.fromId === userId || m.toId === userId);
        const map = new Map<string, { lastMsg: InboxMessage; unread: number; otherName: string; type: 'candidate' | 'internal' }>();
        msgs.forEach(m => {
            const existing = map.get(m.conversationId);
            const isNewer = !existing || new Date(m.sentAt) > new Date(existing.lastMsg.sentAt);
            const unreadIncr = (m.toId === userId && !m.read) ? 1 : 0;
            if (!existing) {
                map.set(m.conversationId, {
                    lastMsg: m,
                    unread: unreadIncr,
                    otherName: m.fromId === userId ? m.toName : m.fromName,
                    type: m.type
                });
            } else {
                map.set(m.conversationId, {
                    lastMsg: isNewer ? m : existing.lastMsg,
                    unread: existing.unread + unreadIncr,
                    otherName: existing.otherName,
                    type: existing.type
                });
            }
        });
        return [...map.entries()]
            .map(([conversationId, v]) => ({ conversationId, ...v }))
            .sort((a, b) => new Date(b.lastMsg.sentAt).getTime() - new Date(a.lastMsg.sentAt).getTime());
    }

    getConversationMessages(conversationId: string): InboxMessage[] {
        return this.getMessages()
            .filter(m => m.conversationId === conversationId)
            .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
    }

    // ── NOTIFICATIONS ─────────────────────────────────────────────────────────
    getNotifications(): Notification[] { return load<Notification[]>(KEYS.notifications, []); }
    saveNotifications(notifs: Notification[]) { save(KEYS.notifications, notifs); }

    addNotification(data: Omit<Notification, 'id' | 'read' | 'createdAt'>): Notification {
        const notifs = this.getNotifications();
        const notif: Notification = { ...data, id: uid(), read: false, createdAt: new Date().toISOString() };
        this.saveNotifications([notif, ...notifs]);
        return notif;
    }

    getUnreadNotificationCount(userId: string): number {
        return this.getNotifications().filter(n => n.userId === userId && !n.read).length;
    }

    markNotificationRead(id: string) {
        this.saveNotifications(this.getNotifications().map(n => n.id === id ? { ...n, read: true } : n));
    }

    markAllNotificationsRead(userId: string) {
        this.saveNotifications(this.getNotifications().map(n => n.userId === userId ? { ...n, read: true } : n));
    }
}

export const store = new HRMSStore();
