// components/CandidateCard.tsx
import React, { useState } from 'react';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { MapPin, Briefcase, CheckCircle2, ExternalLink, Save, Check, Sparkles } from 'lucide-react';
import { Candidate } from '../types';

interface CandidateCardProps {
  candidate: Candidate;
  onSave?: (candidate: Candidate) => void;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, onSave }) => {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    if (onSave) {
      onSave(candidate);
      setIsSaved(true);
    }
  };

  return (
    <div className="group relative bg-secondary/20 backdrop-blur-md border border-border hover:border-primary/50 rounded-xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full overflow-hidden">
      
      {/* Decorative Gradient Background on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-start gap-4">
        <div className="relative shrink-0">
          <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-indigo-500 to-purple-500">
            <img 
              src={candidate.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + candidate.id} 
              alt={candidate.fullName}
              className="w-full h-full rounded-full object-cover border-2 border-background"
            />
          </div>
          {candidate.verified && (
            <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
               <CheckCircle2 className="w-4 h-4 text-blue-500" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg truncate text-foreground group-hover:text-primary transition-colors" title={candidate.fullName}>
            {candidate.fullName}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px] leading-relaxed" title={candidate.headline}>
            {candidate.headline}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="relative z-10 mt-5 space-y-3 text-sm">
        <div className="flex items-center gap-2.5 text-foreground/90 bg-secondary/40 p-2 rounded-md border border-border/50">
          <Briefcase size={14} className="text-indigo-400 shrink-0" />
          <span className="truncate">
            <span className="font-medium">{candidate.currentRole}</span>
            <span className="text-muted-foreground mx-1">at</span>
            {candidate.company}
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-muted-foreground px-2">
          <MapPin size={14} className="shrink-0" />
          <span className="truncate">{candidate.location}</span>
        </div>
      </div>

      {/* Skills */}
      <div className="relative z-10 mt-4">
         <div className="flex flex-wrap gap-1.5 h-[52px] overflow-hidden content-start mask-linear-fade">
            {candidate.skills.slice(0, 5).map((skill, i) => (
            <Badge key={i} variant="outline" className="text-[10px] px-2 py-0.5 bg-secondary/30 text-muted-foreground font-normal border-border/50">
                {skill}
            </Badge>
            ))}
         </div>
      </div>

      {/* Footer Actions */}
      <div className="relative z-10 mt-5 pt-4 border-t border-border/50 flex gap-3">
        <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button variant="ghost" size="sm" className="w-full gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary/60">
            <ExternalLink size={14} /> Profile
          </Button>
        </a>
        <Button 
          size="sm" 
          className={`flex-1 gap-2 transition-all duration-300 shadow-lg ${
             isSaved 
             ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/30' 
             : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
          }`}
          onClick={handleSave}
          disabled={isSaved}
        >
          {isSaved ? <><Check size={14} /> Saved</> : <><Save size={14} /> Save Lead</>}
        </Button>
      </div>
    </div>
  );
};