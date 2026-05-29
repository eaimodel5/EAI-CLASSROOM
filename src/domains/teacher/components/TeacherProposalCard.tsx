import React from 'react';
import { TeacherProposal, TeacherAction } from '../../../types';
import { Bot, PlayCircle, X } from 'lucide-react';

interface TeacherProposalCardProps {
  proposal: TeacherProposal;
  onStartAction: (action: TeacherAction) => void;
  onDismiss: (id: string) => void;
}

export const TeacherProposalCard: React.FC<TeacherProposalCardProps> = ({ proposal, onStartAction, onDismiss }) => {
  return (
    <div className="bg-indigo-950/20 border border-indigo-900/50 rounded p-2 mb-1.5 relative group">
      <button 
        onClick={() => onDismiss(proposal.id)}
        className="absolute top-1 right-1 p-0.5 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-3 h-3" />
      </button>

      <div className="flex items-start gap-2">
        <div className="w-5 h-5 rounded-[2px] bg-indigo-900 flex items-center justify-center shrink-0 mt-0.5">
          <Bot className="w-3 h-3 text-indigo-400" />
        </div>
        
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="font-bold text-[10px] text-indigo-300 leading-tight mb-0.5 truncate">{proposal.headline}</h3>
          <p className="text-[9px] text-slate-400 leading-tight line-clamp-2 mb-1.5">{proposal.summary}</p>
          
          <div className="space-y-1">
            {proposal.teacher_actions.map(action => (
              <button
                key={action.id}
                onClick={() => onStartAction(action)}
                className="w-full text-left py-1 px-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2px] text-[9px] font-bold transition flex items-center gap-1.5 truncate"
              >
                <PlayCircle className="w-2.5 h-2.5 shrink-0" />
                <span className="truncate">{action.label}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-2 text-[8px] font-black uppercase text-slate-600 mt-1.5 tracking-wider">
            <span>{proposal.evidence.signal_count} SIG</span>
            <span>CONF: {proposal.evidence.confidence_label}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
