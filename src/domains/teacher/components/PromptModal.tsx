import React, { useState, useEffect } from 'react';
import { XCircle } from 'lucide-react';
import { PromptType, PROMPT_CONFIG } from '../types';

interface PromptModalProps {
  isOpen: boolean;
  type: PromptType;
  initialText: string;
  onClose: () => void;
  onSubmit: (type: PromptType, text: string) => void;
}

export function PromptModal({ isOpen, type, initialText, onClose, onSubmit }: PromptModalProps) {
  const [text, setText] = useState(initialText);

  useEffect(() => {
    setText(initialText);
  }, [initialText, isOpen]);

  if (!isOpen) return null;

  const config = PROMPT_CONFIG[type];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(type, text);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200/60 animate-in zoom-in-95">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">
            {config.title}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 bg-slate-100 rounded-full transition-colors active:scale-95" title="Sluiten">
            <XCircle className="w-6 h-6 text-slate-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8">
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              {config.label}
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={config.placeholder}
              className="w-full px-4 py-3 border-2 border-slate-200/60 bg-slate-50/50 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 font-medium text-slate-800 transition-all outline-none min-h-[120px] resize-none"
              autoFocus
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition-colors active:scale-95"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={!text.trim()}
              className={`px-6 py-2.5 text-white rounded-xl font-bold transition-all disabled:opacity-50 shadow-sm active:scale-95 ${config.color}`}
            >
              Verstuur naar klas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
