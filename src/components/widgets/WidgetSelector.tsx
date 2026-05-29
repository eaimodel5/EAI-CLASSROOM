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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-950 border border-slate-800 rounded bg-slate-950/80 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95">
        <div className="flex justify-between items-center px-4 py-2.5 border-b border-slate-800/80 bg-slate-900/80">
          <h2 className="text-[10px] font-black uppercase text-indigo-400 tracking-widest pl-1">Digibord Tools toevoegen</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 text-slate-500 hover:text-indigo-400 rounded transition-colors active:scale-95">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex gap-1.5 px-3 py-2 border-b border-slate-800/50 overflow-x-auto hide-scrollbar bg-slate-950">
          {['ALL', 'TOOLS', 'CLASS_MANAGEMENT', 'MEDIA', 'EAI'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat as any)}
              className={`px-3 py-1 rounded-[2px] text-[9px] uppercase font-black tracking-wider whitespace-nowrap transition-all border ${
                filter === cat 
                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 shadow-sm' 
                  : 'bg-transparent text-slate-500 hover:text-slate-300 border-transparent hover:bg-slate-900'
              }`}
            >
              {cat === 'ALL' ? 'Alle Tools' : 
               cat === 'TOOLS' ? 'Gereedschap' : 
               cat === 'CLASS_MANAGEMENT' ? 'Klasmanagement' : 
               cat === 'MEDIA' ? 'Media' : 'EAI Intelligentie'}
            </button>
          ))}
        </div>

        <div className="p-4 overflow-y-auto flex-1 bg-slate-950 custom-scrollbar">
          {filter === 'ALL' ? (
            <div className="space-y-6">
              {['CLASS_MANAGEMENT', 'TOOLS', 'MEDIA', 'EAI'].map(cat => {
                const catWidgets = WIDGET_REGISTRY.filter(w => w.category === cat);
                if (catWidgets.length === 0) return null;
                
                return (
                  <div key={cat} className="space-y-2">
                    <div className="flex items-center gap-2 mb-1 mt-2">
                      <h3 className="font-black text-slate-500 uppercase tracking-widest text-[9px] pl-1">
                         {cat === 'TOOLS' ? 'Gereedschap' : 
                          cat === 'CLASS_MANAGEMENT' ? 'Klasmanagement' : 
                          cat === 'MEDIA' ? 'Media' : 'EAI Intelligentie'}
                      </h3>
                      <div className="flex-1 h-px bg-slate-800/50"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {catWidgets.map(widget => {
                        const Icon = widget.icon;
                        return (
                          <button
                            key={widget.type}
                            onClick={() => {
                              onAddWidget(widget.type);
                              onClose();
                            }}
                            className="bg-slate-900/50 p-2 rounded border border-slate-800 hover:border-indigo-500/50 transition-all text-left flex flex-row items-center gap-2 group shadow-sm hover:bg-slate-900 relative overflow-hidden"
                          >
                            <div className="w-8 h-8 shrink-0 rounded-[2px] bg-slate-800 text-slate-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors z-10 border border-slate-700">
                              <Icon className="w-4 h-4" />
                            </div>
                            
                            <div className="z-10 w-full min-w-0 pr-1">
                              <h4 className="font-bold text-slate-300 text-[11px] mb-0.5 group-hover:text-indigo-400 transition-colors truncate">{widget.name}</h4>
                              <p className="text-[9px] text-slate-500 font-medium leading-tight line-clamp-2">
                                {widget.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {filteredWidgets.map(widget => {
                const Icon = widget.icon;
                return (
                  <button
                    key={widget.type}
                    onClick={() => {
                      onAddWidget(widget.type);
                      onClose();
                    }}
                    className="bg-slate-900/50 p-2 rounded border border-slate-800 hover:border-indigo-500/50 transition-all text-left flex flex-row items-center gap-2 group shadow-sm hover:bg-slate-900 relative overflow-hidden"
                  >
                    <div className="w-8 h-8 shrink-0 rounded-[2px] bg-slate-800 text-slate-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors z-10 border border-slate-700">
                      <Icon className="w-4 h-4" />
                    </div>
                    
                    <div className="z-10 w-full min-w-0 pr-1">
                      <h4 className="font-bold text-slate-300 text-[11px] mb-0.5 group-hover:text-indigo-400 transition-colors truncate">{widget.name}</h4>
                      <p className="text-[9px] text-slate-500 font-medium leading-tight line-clamp-2">
                        {widget.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
