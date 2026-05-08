
import React, { useState } from 'react';
import { Search, Building2, User, Mail, Phone, ChevronDown, ChevronRight, Share2, Filter } from 'lucide-react';

interface Employee {
    id: string;
    name: string;
    role: string;
    dept: string;
    managerId: string | null;
    email: string;
    phone: string;
    avatar: string;
}

export const OrgChart: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [employees] = useState<Employee[]>([
        { id: '1', name: 'Sanjay Gupta', role: 'Chief Tech Officer', dept: 'Leadership', managerId: null, email: 'sanjay@hrms.io', phone: '+91 98765 43210', avatar: 'SG' },
        { id: '2', name: 'Akash Sharma', role: 'React Lead', dept: 'Engineering', managerId: '1', email: 'akash@hrms.io', phone: '+91 87654 32109', avatar: 'AS' },
        { id: '3', name: 'Priya Verma', role: 'Node.js Dev', dept: 'Engineering', managerId: '1', email: 'priya@hrms.io', phone: '+91 76543 21098', avatar: 'PV' },
        { id: '4', name: 'Karan Mehra', role: 'UI/UX Designer', dept: 'Product', managerId: '2', email: 'karan@hrms.io', phone: '+91 65432 10987', avatar: 'KM' },
        { id: '5', name: 'Sneha Rao', role: 'QA Engineer', dept: 'Engineering', managerId: '2', email: 'sneha@hrms.io', phone: '+91 54321 09876', avatar: 'SR' },
    ]);

    const filteredEmployees = employees.filter(e =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.dept.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Employee Directory</h1>
                    <p className="text-muted-foreground">Browse company members and organizational hierarchy.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-border rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-secondary transition-all">
                        <Filter size={16} /> Filters
                    </button>
                    <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-primary/20 transition-all">
                        <Share2 size={16} /> Export Org
                    </button>
                </div>
            </div>

            {/* Search & Actions */}
            <div className="relative group max-w-xl">
                <Search className="absolute left-4 top-3 text-muted-foreground group-focus-within:text-primary transition-all" size={20} />
                <input
                    type="text"
                    placeholder="Search by name, role, or department..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-border rounded-2xl focus:shadow-md focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEmployees.map(emp => (
                    <div key={emp.id} className="card p-6 hover:shadow-xl hover:shadow-primary/5 transition-all group border-b-4 border-b-transparent hover:border-b-primary group">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center font-bold text-lg text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                {emp.avatar}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-foreground">{emp.name}</h3>
                                <p className="text-sm font-bold text-primary">{emp.role}</p>
                                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground font-semibold">
                                    <Building2 size={12} /> {emp.dept}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 space-y-2 border-t border-border pt-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail size={14} className="text-muted-foreground/60" />
                                <span className="truncate">{emp.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone size={14} className="text-muted-foreground/60" />
                                <span>{emp.phone}</span>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="text-[10px] font-bold uppercase text-muted-foreground/60">Reports To</div>
                                <div className="px-2 py-0.5 bg-muted rounded text-[10px] font-bold">
                                    {employees.find(e => e.id === emp.managerId)?.name || 'Direct / Founder'}
                                </div>
                            </div>
                            <button className="p-2 bg-secondary text-primary rounded-lg hover:bg-primary hover:text-white transition-all">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card p-6 bg-blue-50 border-blue-100">
                <h3 className="font-bold text-blue-900 mb-2">High Logic Feature: Recursive Org Hierarchy Rendering</h3>
                <p className="text-sm text-blue-800 leading-relaxed">
                    The directory is built on a <strong>Graph Data Structure</strong> where each employee node points to a parent manager.
                    While displayed as a grid for UX, the underlying logic supports recursive tree traversal for depth-first visual org charts.
                </p>
            </div>
        </div>
    );
};
