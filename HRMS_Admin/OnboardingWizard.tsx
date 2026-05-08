
import React, { useState } from 'react';
import { UserCheck, FileText, Fingerprint, CheckCircle2, ChevronRight, Rocket, ShieldCheck, Mail } from 'lucide-react';

interface OnboardingStep {
    id: number;
    title: string;
    description: string;
    icon: any;
    status: 'pending' | 'current' | 'completed';
}

export const OnboardingWizard: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [steps, setSteps] = useState<OnboardingStep[]>([
        { id: 1, title: 'Offer Acceptance', description: 'Digital signature on offer letter.', icon: Mail, status: 'current' },
        { id: 2, title: 'Document Upload', description: 'Pan, Aadhar, and certificates.', icon: FileText, status: 'pending' },
        { id: 3, title: 'Identity Verif.', description: 'Biometric and background check.', icon: Fingerprint, status: 'pending' },
        { id: 4, title: 'IT Asset Setup', description: 'Laptop and email provisioning.', icon: ShieldCheck, status: 'pending' },
    ]);

    const [onboardingLeads] = useState([
        { id: 'L1', name: 'Sarah Connor', role: 'VP Engineering', progress: 25 },
        { id: 'L2', name: 'Tony Stark', role: 'Lead Architect', progress: 75 },
        { id: 'L3', name: 'Diana Prince', role: 'Marketing Head', progress: 50 },
    ]);

    const handleNext = () => {
        if (currentStep < 4) {
            const newSteps = steps.map(s => {
                if (s.id === currentStep) return { ...s, status: 'completed' as const };
                if (s.id === currentStep + 1) return { ...s, status: 'current' as const };
                return s;
            });
            setSteps(newSteps);
            setCurrentStep(currentStep + 1);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Employee Onboarding</h1>
                    <p className="text-muted-foreground">Manage the transition from candidate to productive employee.</p>
                </div>
                <div className="flex -space-x-3">
                    {onboardingLeads.map(lead => (
                        <div key={lead.id} className="w-10 h-10 rounded-full bg-primary border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-md cursor-help" title={`${lead.name} (${lead.progress}%)`}>
                            {lead.name.charAt(0)}
                        </div>
                    ))}
                    <div className="w-10 h-10 rounded-full bg-secondary border-2 border-white flex items-center justify-center text-muted-foreground text-xs font-bold shadow-md">
                        +5
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Wizard Progress Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    {steps.map((step) => (
                        <div
                            key={step.id}
                            className={`p-4 rounded-2xl border transition-all duration-300 ${step.status === 'current'
                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105'
                                    : step.status === 'completed'
                                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                        : 'bg-white border-border text-muted-foreground'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${step.status === 'current' ? 'bg-white/20' : 'bg-muted'
                                    }`}>
                                    {step.status === 'completed' ? <CheckCircle2 size={18} /> : <step.icon size={18} />}
                                </div>
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-tighter opacity-80">Step 0{step.id}</div>
                                    <div className="font-bold text-sm leading-tight">{step.title}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Active Step Content */}
                <div className="lg:col-span-3">
                    <div className="card p-8 min-h-[400px] flex flex-col justify-between">
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center gap-4 mb-8 text-primary">
                                <div className="p-4 bg-primary/10 rounded-2xl">
                                    {React.createElement(steps[currentStep - 1].icon, { size: 32 })}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-foreground">{steps[currentStep - 1].title}</h2>
                                    <p className="text-muted-foreground">{steps[currentStep - 1].description}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 border-2 border-dashed border-border rounded-2xl bg-muted/20 flex flex-col items-center justify-center gap-4 py-12">
                                    <Rocket className="text-primary/40" size={48} />
                                    <div className="text-center">
                                        <p className="font-bold text-foreground">Waiting for Candidate Action</p>
                                        <p className="text-sm text-muted-foreground max-w-sm">
                                            Automated email sent to <strong>tony@stark.com</strong>. The portal will update instantly once the step is completed.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-secondary/50 p-4 rounded-xl border border-border">
                                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Internal Notes</h4>
                                    <p className="text-sm italic">"Background check usually takes 48 hours. Equipment is ready in IT warehouse." - HR Admin</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-border flex justify-end gap-3">
                            <button className="px-6 py-2.5 bg-secondary text-secondary-foreground font-bold rounded-xl hover:bg-muted transition-all">
                                Save Draft
                            </button>
                            <button
                                onClick={handleNext}
                                className="px-8 py-2.5 bg-primary text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center gap-2"
                            >
                                Force Complete Step
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card p-6 bg-purple-50 border-purple-100">
                <h3 className="font-bold text-purple-900 mb-2">High Logic Feature: State-Driven Onboarding Workflow</h3>
                <p className="text-sm text-purple-800 leading-relaxed">
                    The wizard implements a <strong>Finite State Machine (FSM)</strong> logic where subsequent steps are locked based on the completion status of predecessors.
                    It demonstrates progress tracking and data-driven navigation.
                </p>
            </div>
        </div>
    );
};
