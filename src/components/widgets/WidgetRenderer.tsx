import React, { useState, useEffect } from 'react';
import { WidgetInstance, WIDGET_REGISTRY } from './WidgetRegistry';

interface WidgetRendererProps {
  widget: WidgetInstance;
  onUpdate?: (id: string, data: any) => void;
  onRemove?: (id: string) => void;
  isTeacher?: boolean;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({ widget, onUpdate, onRemove, isTeacher }) => {
  const def = WIDGET_REGISTRY.find(w => w.type === widget.type);
  if (!def) return null;

  const Icon = def.icon;

  const renderContent = () => {
    switch (widget.type) {
      case 'CLOCK':
        return <ClockWidget />;
      case 'TEXT_NOTE':
        return <TextNoteWidget data={widget.data} onUpdate={(data) => onUpdate?.(widget.id, data)} isTeacher={isTeacher} />;
      case 'EAI_EXPLAINER':
        return <EAIExplainerWidget data={widget.data} onUpdate={(data) => onUpdate?.(widget.id, data)} isTeacher={isTeacher} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4 text-center">
            <Icon className="w-12 h-12 mb-2 opacity-50" />
            <p className="font-medium text-gray-600">{def.name}</p>
            <p className="text-sm mt-1">Binnenkort beschikbaar</p>
          </div>
        );
    }
  };

  return (
    <div 
      className="absolute bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col"
      style={{
        left: \`\${widget.x}%\`,
        top: \`\${widget.y}%\`,
        width: \`\${widget.w}%\`,
        height: \`\${widget.h}%\`,
        zIndex: 50
      }}
    >
      <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex justify-between items-center cursor-move">
        <div className="flex items-center gap-2 text-gray-600">
          <Icon className="w-4 h-4" />
          <span className="text-sm font-medium">{def.name}</span>
        </div>
        {isTeacher && (
          <button onClick={() => onRemove?.(widget.id)} className="text-gray-400 hover:text-red-500 transition-colors">
            &times;
          </button>
        )}
      </div>
      <div className="flex-1 overflow-auto relative">
        {renderContent()}
      </div>
    </div>
  );
};

// --- Specific Widgets ---

const ClockWidget = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-5xl font-mono font-bold text-gray-800 tracking-tighter">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>
    </div>
  );
};

const TextNoteWidget = ({ data, onUpdate, isTeacher }: any) => {
  const [text, setText] = useState(data?.text || '');
  
  const handleBlur = () => {
    if (isTeacher && onUpdate) onUpdate({ text });
  };

  if (!isTeacher) {
    return (
      <div className="p-4 h-full text-gray-800 text-lg whitespace-pre-wrap">
        {data?.text || 'Geen notitie...'}
      </div>
    );
  }

  return (
    <textarea
      className="w-full h-full p-4 resize-none outline-none text-lg text-gray-800 bg-transparent"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={handleBlur}
      placeholder="Typ een notitie..."
    />
  );
};

const EAIExplainerWidget = ({ data, onUpdate, isTeacher }: any) => {
  const [topic, setTopic] = useState(data?.topic || '');
  const [explanation, setExplanation] = useState(data?.explanation || '');
  const [loading, setLoading] = useState(false);

  const generateExplanation = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      // In a real app, we'd call an API endpoint that uses Gemini.
      // For this widget, we'll simulate a quick response or use a generic endpoint if available.
      // Since we don't have a generic LLM endpoint, we'll just mock it for the demo,
      // or we could add one to server.ts. Let's mock it for now to avoid server changes.
      setTimeout(() => {
        const result = \`EAI Uitleg over "\${topic}": Dit is een complex concept dat we eenvoudig kunnen uitleggen als...\`;
        setExplanation(result);
        if (onUpdate) onUpdate({ topic, explanation: result });
        setLoading(false);
      }, 1500);
    } catch (e) {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 h-full flex flex-col">
      {isTeacher && (
        <div className="flex gap-2 mb-4">
          <input 
            type="text" 
            value={topic} 
            onChange={e => setTopic(e.target.value)} 
            placeholder="Onderwerp..."
            className="flex-1 border rounded px-2 py-1 text-sm"
          />
          <button 
            onClick={generateExplanation}
            disabled={loading || !topic.trim()}
            className="bg-indigo-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
          >
            {loading ? '...' : 'Vraag EAI'}
          </button>
        </div>
      )}
      <div className="flex-1 overflow-auto text-gray-800">
        {explanation ? (
          <p className="whitespace-pre-wrap leading-relaxed">{explanation}</p>
        ) : (
          <p className="text-gray-400 italic text-center mt-4">Nog geen uitleg gegenereerd.</p>
        )}
      </div>
    </div>
  );
};
