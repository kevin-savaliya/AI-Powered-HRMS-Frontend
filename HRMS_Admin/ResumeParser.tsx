import React, { useState, useRef, useEffect } from 'react';
import { store, CampaignRecord } from '../utils/store';
import { Upload, FileText, User, Mail, Phone, Briefcase, Tag, Star, ChevronRight, CheckCircle, X, Download, BarChart2, Brain } from 'lucide-react';

interface ParsedResume {
    name: string;
    email: string;
    phone: string;
    skills: string[];
    experienceYears: number;
    currentRole: string;
    rawText: string;
    matchScore: number;
    matchReason: string;
}

const SKILL_KEYWORDS = [
    'react', 'angular', 'vue', 'next.js', 'typescript', 'javascript', 'python', 'java', 'c++', 'c#', 'node', 'express',
    'django', 'flask', 'spring', 'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'docker', 'kubernetes', 'aws', 'azure',
    'gcp', 'git', 'ci/cd', 'jenkins', 'terraform', 'figma', 'html', 'css', 'tailwind', 'redux', 'graphql', 'rest',
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'excel', 'tableau', 'power bi',
    'agile', 'scrum', 'jira', 'linux', 'bash', 'php', 'ruby', 'go', 'rust', 'kotlin', 'swift', 'flutter', 'react native'
];

function parseResumeText(text: string): ParsedResume {
    const lower = text.toLowerCase();

    // Name — first line that looks like a name (2–4 words, no symbols)
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const nameLine = lines.find(l => /^[A-Za-z\s]{4,40}$/.test(l) && l.split(' ').length >= 2);
    const name = nameLine || '';

    // Email
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const email = emailMatch ? emailMatch[0] : '';

    // Phone
    const phoneMatch = text.match(/(\+?\d[\d\s\-().]{7,16}\d)/);
    const phone = phoneMatch ? phoneMatch[0].trim() : '';

    // Skills — find all keyword matches
    const skills = SKILL_KEYWORDS.filter(sk => lower.includes(sk.toLowerCase()));

    // Experience years
    const expMatch = text.match(/(\d+)\s*\+?\s*years?\s*(of\s*)?(experience|exp)/i);
    const experienceYears = expMatch ? parseInt(expMatch[1]) : 0;

    // Current Role — first line containing common job words
    const roleMatch = lines.find(l => /(developer|engineer|designer|analyst|manager|intern|lead|architect|consultant|specialist)/i.test(l) && l.length < 60);
    const currentRole = roleMatch || '';

    // Mock AI match score based on skills count + experience
    const base = Math.min(40 + skills.length * 4 + experienceYears * 2, 98);
    const matchScore = Math.max(base, 30);
    const matchReason = skills.length >= 6
        ? `Strong match — ${skills.length} relevant skills detected. ${experienceYears > 0 ? `${experienceYears} years experience.` : ''}`
        : skills.length >= 3
            ? `Moderate match — ${skills.length} relevant skills found. Consider screening further.`
            : `Weak match — Only ${skills.length} relevant skills detected. May not fit current requirements.`;

    return { name, email, phone, skills, experienceYears, currentRole, rawText: text, matchScore, matchReason };
}

export const ResumeParser: React.FC = () => {
    const [parsed, setParsed] = useState<ParsedResume | null>(null);
    const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
    const [selectedCampaign, setSelectedCampaign] = useState('');
    const [fileName, setFileName] = useState('');
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [added, setAdded] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const camps = store.getCampaigns();
        setCampaigns(camps);
        if (camps.length > 0) setSelectedCampaign(camps[0].id);
    }, []);

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileName(file.name);
        setLoading(true);
        setAdded(false);

        try {
            let text = '';
            const lowerName = file.name.toLowerCase();

            if (lowerName.endsWith('.pdf')) {
                // Dynamite import pdfjs to avoid huge bundle penalty
                const pdfjsLib = await import('pdfjs-dist');
                // Use unpkg instead of CDNJS to ensure exact version matching (CDNJS lags behind npm for v5+)
                pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
                
                const arrayBuffer = await file.arrayBuffer();
                // pdfjs 4.x+ requires Uint8Array, raw ArrayBuffer can cause parsing to fail
                const pdf = await pdfjsLib.getDocument(new Uint8Array(arrayBuffer)).promise;
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    const pageText = content.items.map((item: any) => item.str).join(' ');
                    text += pageText + '\n';
                }
            } else if (lowerName.endsWith('.docx')) {
                // DOCX Parsing
                const mammoth = (await import('mammoth')).default;
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.extractRawText({ arrayBuffer });
                text = result.value;
            } else {
                // Default TXT
                text = await file.text();
            }

            const result = parseResumeText(text);
            setParsed(result);
            if (textAreaRef.current) textAreaRef.current.value = text.slice(0, 3000);
        } catch (error) {
            console.error("Error parsing file:", error);
            alert("Failed to parse the file. Ensure it is a valid PDF, DOCX, or TXT file.");
        } finally {
            setLoading(false);
        }
        
        e.target.value = '';
    };

    const handleManualParse = () => {
        const text = textAreaRef.current?.value || '';
        if (!text.trim()) return;
        setLoading(true);
        setAdded(false);
        setTimeout(() => {
            setParsed(parseResumeText(text));
            setLoading(false);
        }, 400);
    };

    const handleAddToCRM = () => {
        if (!parsed) return;
        const campaignId = selectedCampaign || store.getCampaigns()[0]?.id || 'default';
        store.addLead({
            campaignId,
            name: parsed.name || parsed.email.split('@')[0] || 'Unknown',
            email: parsed.email,
            phone: parsed.phone,
            currentRole: parsed.currentRole,
            skills: parsed.skills,
            matchScore: parsed.matchScore,
            source: 'Resume Parser',
            stage: 'screening',
            notes: `Parsed from resume: ${fileName || 'manual input'}. Match: ${parsed.matchScore}%.`,
        });
        setAdded(true);
        setFeedback(`✅ "${parsed.name || 'Lead'}" added to CRM Pipeline (stage: Screening)`);
        setTimeout(() => setFeedback(''), 5000);
    };

    const handleDownload = () => {
        if (!parsed) return;
        const content = [
            `Resume Parse Report`,
            `-------------------`,
            `Name: ${parsed.name}`,
            `Email: ${parsed.email}`,
            `Phone: ${parsed.phone}`,
            `Current Role: ${parsed.currentRole}`,
            `Experience: ${parsed.experienceYears} years`,
            `Skills: ${parsed.skills.join(', ')}`,
            `Match Score: ${parsed.matchScore}%`,
            `Match Analysis: ${parsed.matchReason}`,
        ].join('\n');
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resume_parse_${(parsed.name || 'candidate').replace(/\s+/g, '_')}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const scoreColor = !parsed ? '#6b7280'
        : parsed.matchScore >= 80 ? '#059669'
            : parsed.matchScore >= 55 ? '#d97706'
                : '#dc2626';

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-gray-900">Resume Parser</h1>
                <p className="text-gray-500 font-medium mt-1">Upload or paste a resume to extract skills, score candidates, and export to CRM.</p>
            </div>

            {feedback && (
                <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm font-bold text-emerald-700">
                    <CheckCircle size={16} /> {feedback}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Panel */}
                <div className="space-y-5">
                    {/* File Upload */}
                    <div
                        onClick={() => fileRef.current?.click()}
                        className="border-2 border-dashed border-blue-200 rounded-2xl p-8 text-center cursor-pointer hover:bg-blue-50 transition-all group"
                    >
                        <Upload size={32} className="mx-auto text-blue-400 group-hover:text-blue-600 mb-3" />
                        <p className="font-black text-gray-700 text-sm">Drop resume file here or click to upload</p>
                        <p className="text-xs text-gray-400 mt-1">Supports .pdf, .docx, and .txt files.</p>
                        {fileName && <p className="mt-3 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl inline-block">{fileName}</p>}
                        <input ref={fileRef} type="file" accept=".pdf,.docx,.txt,.text" className="hidden" onChange={handleFile} />
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400 font-bold">OR PASTE RESUME TEXT</span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    <textarea
                        ref={textAreaRef}
                        rows={12}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                        placeholder="Paste resume text here...&#10;&#10;John Smith&#10;john@email.com | +91-9000000000&#10;Senior React Developer — 5 years experience&#10;Skills: React, TypeScript, Node.js, AWS, Docker..."
                    />

                    <button
                        onClick={handleManualParse}
                        className="w-full py-3 rounded-2xl font-black text-white text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        style={{ background: 'linear-gradient(135deg,#1d4ed8,#6366f1)' }}
                    >
                        <Brain size={18} /> Parse Resume
                    </button>
                </div>

                {/* Results Panel */}
                <div>
                    {loading && (
                        <div className="border border-gray-100 rounded-2xl p-8 text-center">
                            <div className="animate-pulse space-y-4">
                                <div className="h-4 bg-gray-100 rounded-xl w-3/4 mx-auto" />
                                <div className="h-4 bg-gray-100 rounded-xl w-1/2 mx-auto" />
                                <div className="h-4 bg-gray-100 rounded-xl w-2/3 mx-auto" />
                            </div>
                            <p className="mt-4 text-sm text-gray-400 font-medium">Analyzing resume...</p>
                        </div>
                    )}

                    {!loading && !parsed && (
                        <div className="border-2 border-dashed border-gray-100 rounded-2xl p-12 text-center">
                            <FileText size={40} className="text-gray-200 mx-auto mb-4" />
                            <p className="font-bold text-gray-400">Parsed results will appear here</p>
                            <p className="text-xs text-gray-300 mt-1">Upload a file or paste text and click Parse</p>
                        </div>
                    )}

                    {!loading && parsed && (
                        <div className="space-y-4">
                            {/* Match Score */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Brain size={18} style={{ color: scoreColor }} />
                                        <span className="font-black text-gray-900 text-sm">AI Match Score</span>
                                    </div>
                                    <span className="text-3xl font-black" style={{ color: scoreColor }}>{parsed.matchScore}%</span>
                                </div>
                                <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${parsed.matchScore}%`, background: scoreColor }} />
                                </div>
                                <p className="text-xs text-gray-500 font-medium">{parsed.matchReason}</p>
                            </div>

                            {/* Contact Info */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <h3 className="font-black text-gray-700 text-xs uppercase tracking-widest mb-3">Extracted Info</h3>
                                <div className="space-y-2.5">
                                    <InfoRow icon={<User size={13} />} label="Name" value={parsed.name || '—'} />
                                    <InfoRow icon={<Mail size={13} />} label="Email" value={parsed.email || '—'} />
                                    <InfoRow icon={<Phone size={13} />} label="Phone" value={parsed.phone || '—'} />
                                    <InfoRow icon={<Briefcase size={13} />} label="Role" value={parsed.currentRole || '—'} />
                                    <InfoRow icon={<Star size={13} />} label="Experience" value={parsed.experienceYears ? `${parsed.experienceYears} years` : '—'} />
                                </div>
                            </div>

                            {/* Skills */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <h3 className="font-black text-gray-700 text-xs uppercase tracking-widest mb-3 flex items-center gap-1">
                                    <Tag size={11} /> Skills ({parsed.skills.length} detected)
                                </h3>
                                {parsed.skills.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5">
                                        {parsed.skills.map(sk => (
                                            <span key={sk} className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-black border border-blue-100">{sk}</span>
                                        ))}
                                    </div>
                                ) : <p className="text-xs text-gray-400">No known skills detected. Try adding more technical keywords.</p>}
                            </div>

                            {/* Export Actions */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                                <h3 className="font-black text-gray-700 text-xs uppercase tracking-widest mb-3">Export</h3>
                                {campaigns.length > 0 && (
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 block mb-1">Target Campaign</label>
                                        <select className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-200" value={selectedCampaign} onChange={e => setSelectedCampaign(e.target.value)}>
                                            {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleAddToCRM}
                                        disabled={added || !parsed.email}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black text-white disabled:opacity-50 transition-all"
                                        style={{ background: added ? '#059669' : 'linear-gradient(135deg,#059669,#10b981)' }}
                                    >
                                        {added ? <CheckCircle size={15} /> : <ChevronRight size={15} />}
                                        {added ? 'Added to CRM!' : 'Export to CRM'}
                                    </button>
                                    <button onClick={handleDownload} className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50">
                                        <Download size={15} /> Report
                                    </button>
                                </div>
                                {!parsed.email && <p className="text-xs text-amber-600 font-medium">⚠️ No email found in resume. Email is required for CRM export.</p>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="flex items-start gap-2">
        <span className="mt-0.5 text-gray-400 flex-shrink-0">{icon}</span>
        <span className="text-xs font-bold text-gray-500 w-16 flex-shrink-0">{label}</span>
        <span className="text-xs font-black text-gray-900 break-all">{value}</span>
    </div>
);
