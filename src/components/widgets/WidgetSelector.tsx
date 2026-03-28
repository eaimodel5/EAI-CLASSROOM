import React, { useState } from 'react';
import { WIDGET_REGISTRY, WidgetType } from './WidgetRegistry';
import { Plus, X } from 'lucide-react';

interface WidgetSelectorProps {
  onAddWidget: (type: WidgetType) => void;
  onClose: () => void;
}

export const WidgetSelector: React.FC<WidgetSelectorProps> = ({ onAddWidget, onClose }) => {
  const [filter, setFilter] = useState<'ALL' | 'TOOLS' | 'MEDIA' | 'EAI' | 'CLASS_MANAGEMENT'>('ALL');

  const filteredWidgets = filter === 'ALL' 
    ? WIDGET_REGISTRY 
    : WIDGET_REGISTRY.filter(w => w.category === filter);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Voeg een Widget toe</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        
        <div className="flex gap-2 p-4 border-b border-gray-100 overflow-x-auto">
          {['ALL', 'TOOLS', 'CLASS_MANAGEMENT', 'MEDIA', 'EAI'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === cat 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat === 'ALL' ? 'Alle Widgets' : 
               cat === 'TOOLS' ? 'Gereedschap' : 
               cat === 'CLASS_MANAGEMENT' ? 'Klasmanagement' : 
               cat === 'MEDIA' ? 'Media' : 'EAI Intelligentie'}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredWidgets.map(widget => {
              const Icon = widget.icon;
              return (
                <button
                  key={widget.type}
                  onClick={() => {
                    onAddWidget(widget.type);
                    onClose();
                  }}
                  className="bg-white p-4 rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all text-left flex flex-col items-start gap-3 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{widget.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{widget.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
