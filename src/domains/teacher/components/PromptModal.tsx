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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">
            {config.title}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {config.label}
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={config.placeholder}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-h-[100px] resize-none"
              autoFocus
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={!text.trim()}
              className={`px-4 py-2 text-white rounded-lg font-medium transition-colors disabled:opacity-50 ${config.color}`}
            >
              Verstuur naar klas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
