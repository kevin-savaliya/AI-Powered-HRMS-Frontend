import React, { useState, useEffect } from 'react';
import { store, Department, HRMSUser } from '../../utils/store';
import { Building2, Plus, Trash2, ChevronRight, ChevronDown, Users } from 'lucide-react';

interface TreeNode extends Department { children: TreeNode[]; headName?: string; }

const buildTree = (depts: Department[], users: HRMSUser[], parentId?: string): TreeNode[] =>
    depts.filter(d => (d.parentId ?? undefined) === parentId)
        .map(d => ({
            ...d,
            headName: d.headId ? (users.find(u => u.id === d.headId)?.name) : undefined,
            children: buildTree(depts, users, d.id)
        }));

const TreeNodeItem: React.FC<{ node: TreeNode; onDelete: (id: string) => void; depth?: number }> = ({ node, onDelete, depth = 0 }) => {
    const [open, setOpen] = useState(true);
    return (
        <div style={{ marginLeft: (depth ?? 0) * 24 }}>
            <div className="flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-gray-50 group">
                {node.children.length > 0
                    ? <button onClick={() => setOpen(!open)} className="text-gray-400">{open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</button>
                    : <span className="w-[14px]" />}
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center"><Building2 size={14} className="text-blue-600" /></div>
                <div className="flex-1">
                    <p className="font-bold text-sm text-gray-900">{node.name}</p>
                    {node.headName && <p className="text-xs text-gray-500">Head: {node.headName}</p>}
                    {node.description && <p className="text-xs text-gray-400">{node.description}</p>}
                </div>
                <button onClick={() => onDelete(node.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-all">
                    <Trash2 size={13} />
                </button>
            </div>
            {open && node.children.map(child => <TreeNodeItem key={child.id} node={child} onDelete={onDelete} depth={(depth ?? 0) + 1} />)}
        </div>
    );
};

export const AdminOrgChart: React.FC = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [users, setUsers] = useState<HRMSUser[]>([]);
    const [name, setName] = useState('');
    const [parentId, setParentId] = useState('');
    const [headId, setHeadId] = useState('');
    const [description, setDescription] = useState('');

    const loadData = () => {
        store.init();
        setDepartments(store.getDepartments());
        setUsers(store.getUsers());
    };

    useEffect(() => { loadData(); }, []);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        store.createDepartment({ name: name.trim(), parentId: parentId || undefined, headId: headId || undefined, description: description || undefined });
        setName(''); setParentId(''); setHeadId(''); setDescription('');
        loadData();
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Delete this department?')) {
            store.deleteDepartment(id);
            loadData();
        }
    };

    const tree = buildTree(departments, users, undefined);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-gray-900">Organisation Chart</h1>
                <p className="text-gray-500 font-medium mt-1">Manage your company department structure.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                        <Building2 size={18} className="text-blue-600" />Departments ({departments.length})
                    </h2>
                    {tree.length === 0
                        ? <p className="text-gray-400 text-sm text-center py-8">No departments yet. Create one to get started.</p>
                        : tree.map(node => <TreeNodeItem key={node.id} node={node} onDelete={handleDelete} />)
                    }
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="font-black text-gray-900 mb-5 flex items-center gap-2"><Plus size={18} className="text-blue-600" />Add Department</h2>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name *</label>
                            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Engineering" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-400" required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Parent Department</label>
                            <select value={parentId} onChange={e => setParentId(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-400">
                                <option value="">None (Root)</option>
                                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Department Head</label>
                            <select value={headId} onChange={e => setHeadId(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-400">
                                <option value="">None</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-400" />
                        </div>
                        <button type="submit" className="w-full py-2.5 rounded-xl text-white text-sm font-black flex items-center justify-center gap-2 hover:shadow-lg transition-all" style={{ background: 'linear-gradient(135deg,#1d4ed8,#6366f1)' }}>
                            <Plus size={15} />Add Department
                        </button>
                    </form>
                    <div className="mt-6 pt-5 border-t border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Users size={16} className="text-indigo-500" />Team Members</h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {users.filter(u => u.role !== 'admin').map(u => (
                                <div key={u.id} className="flex items-center gap-2 py-1">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black">{(u.name ?? '?')[0]}</div>
                                    <div><p className="text-xs font-bold text-gray-900">{u.name}</p><p className="text-[10px] text-gray-500 capitalize">{u.role}</p></div>
                                </div>
                            ))}
                            {users.filter(u => u.role !== 'admin').length === 0 && <p className="text-xs text-gray-400">No team members yet.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};