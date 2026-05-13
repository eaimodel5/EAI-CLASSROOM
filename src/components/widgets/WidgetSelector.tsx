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
        <div className="flex justify-between items-center p-6 border-b border-indigo-100 bg-white/50 backdrop-blur-sm">
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Kies een tool voor op het digibord</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 bg-slate-100 rounded-full transition-colors active:scale-95" title="Sluiten">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>
        
        <div className="flex gap-2 p-4 border-b border-slate-100 overflow-x-auto hide-scrollbar bg-slate-50/50 backdrop-blur-sm">
          {['ALL', 'TOOLS', 'CLASS_MANAGEMENT', 'MEDIA', 'EAI'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat as any)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all shadow-sm ${
                filter === cat 
                  ? 'bg-indigo-600 text-white shadow-indigo-500/20' 
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'Alle Bord Tools' : 
               cat === 'TOOLS' ? 'Gereedschap' : 
               cat === 'CLASS_MANAGEMENT' ? 'Klasmanagement' : 
               cat === 'MEDIA' ? 'Media' : 'EAI Intelligentie'}
            </button>
          ))}
        </div>

        <div className="p-4 md:p-6 overflow-y-auto flex-1 bg-slate-50/50">
          {filter === 'ALL' ? (
            <div className="space-y-8">
              {['CLASS_MANAGEMENT', 'TOOLS', 'MEDIA', 'EAI'].map(cat => {
                const catWidgets = WIDGET_REGISTRY.filter(w => w.category === cat);
                if (catWidgets.length === 0) return null;
                
                return (
                  <div key={cat} className="space-y-3">
                    <h3 className="font-black text-slate-400 uppercase tracking-widest text-xs border-b border-slate-200 pb-2">
                       {cat === 'TOOLS' ? 'Gereedschap' : 
                        cat === 'CLASS_MANAGEMENT' ? 'Klasmanagement' : 
                        cat === 'MEDIA' ? 'Media' : 'EAI Intelligentie'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {catWidgets.map(widget => {
                        const Icon = widget.icon;
                        return (
                          <button
                            key={widget.type}
                            onClick={() => {
                              onAddWidget(widget.type);
                              onClose();
                            }}
                            className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all text-left flex flex-row items-center gap-3.5 group hover:-translate-y-0.5 shadow-sm hover:shadow-md hover:shadow-indigo-500/5 relative overflow-hidden"
                          >
                            <div className="w-10 h-10 shrink-0 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors z-10 border border-slate-100">
                              <Icon className="w-5 h-5" />
                            </div>
                            
                            <div className="z-10 w-full">
                              <h4 className="font-bold text-slate-800 text-sm mb-0.5 group-hover:text-indigo-600 transition-colors">{widget.name}</h4>
                              <p className="text-[11px] text-slate-500 font-medium leading-tight line-clamp-2">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredWidgets.map(widget => {
                const Icon = widget.icon;
                return (
                  <button
                    key={widget.type}
                    onClick={() => {
                      onAddWidget(widget.type);
                      onClose();
                    }}
                    className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all text-left flex flex-row items-center gap-3.5 group hover:-translate-y-0.5 shadow-sm hover:shadow-md hover:shadow-indigo-500/5 relative overflow-hidden"
                  >
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors z-10 border border-slate-100">
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    <div className="z-10 w-full">
                      <h4 className="font-bold text-slate-800 text-sm mb-0.5 group-hover:text-indigo-600 transition-colors">{widget.name}</h4>
                      <p className="text-[11px] text-slate-500 font-medium leading-tight line-clamp-2">
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
