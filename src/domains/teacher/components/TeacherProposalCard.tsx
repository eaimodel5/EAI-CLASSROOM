import React from 'react';
import { TeacherProposal, TeacherAction } from '../../../../types';
import { Bot, PlayCircle } from 'lucide-react';

interface TeacherProposalCardProps {
  proposal: TeacherProposal;
  onStartAction: (action: TeacherAction) => void;
  onDismiss: (id: string) => void;
}

export const TeacherProposalCard: React.FC<TeacherProposalCardProps> = ({ proposal, onStartAction, onDismiss }) => {
  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 mb-6 relative">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-indigo-900">{proposal.headline}</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-800">
              {proposal.proposal_type}
            </span>
          </div>
          <p className="text-sm text-indigo-800 mb-2">{proposal.summary}</p>
          
          <div className="bg-white rounded-lg p-4 mb-4 border border-indigo-100/50">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">Advies: {proposal.suggested_activity.label}</h4>
            <p className="text-sm text-gray-600 mb-3">{proposal.suggested_activity.rationale}</p>
            
            <div className="flex flex-wrap gap-2">
              {proposal.teacher_actions.map(action => (
                <button
                  key={action.id}
                  onClick={() => onStartAction(action)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center gap-2"
                >
                  <PlayCircle className="w-4 h-4" />
                  {action.label}
                </button>
              ))}
              <button 
                onClick={() => onDismiss(proposal.id)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
              >
                Sluiten
              </button>
            </div>
          </div>

          {(proposal.groups?.needs_support?.length || 0) > 0 && (
            <div className="text-xs text-gray-500 mt-2">
              <strong>Check-in voorgesteld:</strong> {proposal.groups?.needs_support.length} leerling(en)
            </div>
          )}
          
          <div className="flex gap-4 text-xs text-indigo-500/70 mt-2">
            <span>{proposal.evidence.signal_count} signalen verwerkt</span>
            <span>Zekerheid: {proposal.evidence.confidence_label}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
