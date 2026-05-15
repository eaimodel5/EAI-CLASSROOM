import React, { useState, useEffect } from 'react';
import { WidgetInstance, WIDGET_REGISTRY } from './WidgetRegistry';

interface WidgetRendererProps {
  widget: WidgetInstance;
  onUpdate?: (id: string, updates: Partial<WidgetInstance>) => void;
  onRemove?: (id: string) => void;
  isTeacher?: boolean;
  inlineMode?: boolean;
  className?: string;
  participants?: any[];
}

const EAIFeedforwardWidget = ({ data, onUpdate, isTeacher }: any) => {
  const [loading, setLoading] = useState(false);
  const sessionId = window.location.pathname.split('/').pop();

  const handleGenerate = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/feedforward`, { method: 'POST' });
      if (res.ok) {
        const result = await res.json();
        if (onUpdate) onUpdate(result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isTeacher) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 p-4 text-center border-2 border-dashed border-slate-200 rounded-xl m-2">
        Alleen zichtbaar voor de docent
      </div>
    );
  }

  return (
    <div className="p-5 h-full flex flex-col bg-purple-50/30 overflow-hidden relative">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-bold text-purple-900">SSOT: /feedforward</h3>
          <p className="text-xs text-purple-600 font-medium">Brug naar de volgende les</p>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 active:translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <span className="animate-pulse">Analyseert Data...</span> : 'Genereer Plan'}
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {!data || !data.recapStart ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 italic text-sm text-center border-2 border-dashed border-slate-200 rounded-xl p-4">
            Genereer een formatief handelingsplan voor je volgende les op basis van de interactie data van vandaag.
          </div>
        ) : (
          <div className="space-y-4 pb-2 animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm relative overflow-hidden">
              <h4 className="font-bold text-purple-800 flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div> Start van de volgende les
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed">
                {data.recapStart}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 shadow-sm">
                <h4 className="font-bold text-orange-800 text-xs uppercase tracking-widest mb-2">
                   Directe Check-In Nodig
                </h4>
                <ul className="space-y-1">
                  {data.checkInStudentNames && data.checkInStudentNames.length > 0 ? (
                    data.checkInStudentNames.map((name: string, i: number) => (
                      <li key={i} className="text-sm font-medium text-orange-900 bg-white px-2 py-1 rounded inline-block w-full">{name}</li>
                    ))
                  ) : (
                    <li className="text-xs text-orange-400 italic">Geen leerlingen</li>
                  )}
                </ul>
              </div>

              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 shadow-sm">
                 <h4 className="font-bold text-emerald-800 text-xs uppercase tracking-widest mb-2">
                   Next Step Leerdoel
                 </h4>
                 <p className="text-sm font-medium text-emerald-900 leading-relaxed">
                   {data.nextGoalSuggestion}
                 </p>
              </div>
            </div>

            <p className="text-xs text-slate-500 italic bg-white p-3 rounded-lg border border-slate-100">
              <span className="font-bold text-slate-700 not-italic block mb-1">AI Analyse:</span>
              {data.rationale}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({ widget, onUpdate, onRemove, isTeacher, inlineMode, className, participants }) => {
  const def = WIDGET_REGISTRY.find(w => w.type === widget.type);
  const [isDragging, setIsDragging] = useState(false);
  const [pos, setPos] = useState({ x: widget.x, y: widget.y });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  if (!def) return null;

  const Icon = def.icon;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isTeacher || inlineMode) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !isTeacher || inlineMode) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    const dxPct = (dx / window.innerWidth) * 100;
    const dyPct = (dy / window.innerHeight) * 100;

    setPos(p => ({ x: p.x + dxPct, y: p.y + dyPct }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    if (!isDragging || !isTeacher || inlineMode) return;
    setIsDragging(false);
    if (onUpdate) {
      onUpdate(widget.id, { x: pos.x, y: pos.y });
    }
  };

  useEffect(() => {
    if (isDragging && !inlineMode) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, pos, inlineMode]);

  useEffect(() => {
    if (!isDragging) {
      setPos({ x: widget.x, y: widget.y });
    }
  }, [widget.x, widget.y, isDragging]);

  const renderContent = () => {
    switch (widget.type) {
      case 'CLOCK':
        return <ClockWidget />;
      case 'TIMER':
        return <TimerWidget data={widget.data} onUpdate={(data: any) => onUpdate?.(widget.id, { data })} isTeacher={isTeacher} inlineMode={inlineMode} />;
      case 'TRAFFIC_LIGHT':
        return <TrafficLightWidget data={widget.data} onUpdate={(data: any) => onUpdate?.(widget.id, { data })} isTeacher={isTeacher} inlineMode={inlineMode} />;
      case 'RANDOM_NAME':
        return <RandomNameWidget data={widget.data} onUpdate={(data: any) => onUpdate?.(widget.id, { data })} isTeacher={isTeacher} inlineMode={inlineMode} participants={participants || []} />;
      case 'MEDIA_VIEWER':
        return <VideoWidget data={widget.data} onUpdate={(data: any) => onUpdate?.(widget.id, { data })} isTeacher={isTeacher} inlineMode={inlineMode} />;
      case 'TEXT_NOTE':
        return <TextNoteWidget data={widget.data} onUpdate={(data: any) => onUpdate?.(widget.id, { data })} isTeacher={isTeacher} />;
      case 'EAI_EXPLAINER':
        return <EAIExplainerWidget data={widget.data} onUpdate={(data: any) => onUpdate?.(widget.id, { data })} isTeacher={isTeacher} />;
      case 'EAI_DIFFERENTIATION':
        return <EAIDifferentiationWidget data={widget.data} onUpdate={(data: any) => onUpdate?.(widget.id, { data })} isTeacher={isTeacher} inlineMode={inlineMode} participants={participants || []} />;
      case 'EAI_FEEDFORWARD':
        return <EAIFeedforwardWidget data={widget.data} onUpdate={(data: any) => onUpdate?.(widget.id, { data })} isTeacher={isTeacher} />;
      case 'LESSON_PLAN':
        return <LessonPlanWidget data={widget.data} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4 text-center">
            <Icon className="w-12 h-12 mb-2 opacity-50" />
            <p className="font-medium text-gray-600">{def.name}</p>
            <p className="text-sm mt-1">Ingeschakeld op het digibord</p>
          </div>
        );
    }
  };

  if (inlineMode) {
    return (
      <div className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden flex flex-col relative group ${className || 'min-h-[22rem] h-auto'}`}>
        <div className="bg-slate-50/50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2 text-slate-700 font-bold tracking-tight">
            <Icon className="w-4 h-4 text-indigo-500" />
            <span className="text-sm">{def.name}</span>
          </div>
          {isTeacher && (
            <button onClick={() => onRemove?.(widget.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
              &times;
            </button>
          )}
        </div>
        <div className="flex-1 overflow-auto relative p-2">
          {renderContent()}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="absolute bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden flex flex-col transition-shadow hover:shadow-indigo-500/10"
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        width: `${widget.w}%`,
        height: `${widget.h}%`,
        zIndex: 50
      }}
    >
      <div 
        className="bg-slate-50/80 backdrop-blur-sm px-4 py-3 border-b border-slate-100 flex justify-between items-center cursor-move"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2 text-slate-700 font-bold tracking-tight">
          <Icon className="w-5 h-5 text-indigo-500" />
          <span className="text-sm">{def.name}</span>
        </div>
        {isTeacher && (
          <button onClick={() => onRemove?.(widget.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
            &times;
          </button>
        )}
      </div>
      <div className="flex-1 overflow-auto relative p-4">
        {renderContent()}
      </div>
    </div>
  );
};

const ClockWidget = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="flex items-center justify-center h-full bg-slate-50 rounded-xl m-2">
      <div className="text-4xl md:text-5xl font-mono font-bold text-slate-800 tracking-tighter">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>
    </div>
  );
};

const TimerWidget = ({ data, onUpdate, isTeacher, inlineMode }: any) => {
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const int = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(int);
  }, []);

  const targetTime = data?.targetTime || 0;
  const isRunning = data?.isRunning || false;
  const totalDuration = data?.totalDuration || 300000;
  const pausedRemaining = data?.pausedRemaining || 0;

  const getRemaining = () => {
    if (!isRunning) return pausedRemaining;
    const remaining = targetTime - now;
    return remaining > 0 ? remaining : 0;
  };

  const remaining = getRemaining();
  const m = Math.floor((remaining / 1000) / 60);
  const s = Math.floor((remaining / 1000) % 60);

  const handleToggle = () => {
    if (!isTeacher || !onUpdate) return;
    if (isRunning) {
      onUpdate({ isRunning: false, pausedRemaining: remaining });
    } else {
      const startRemaining = remaining > 0 ? remaining : (minutes * 60 + seconds) * 1000;
      onUpdate({
        isRunning: true,
        targetTime: Date.now() + startRemaining,
        totalDuration: startRemaining,
        pausedRemaining: 0
      });
    }
  };

  const handleReset = () => {
    if (!isTeacher || !onUpdate) return;
    onUpdate({
      isRunning: false,
      targetTime: 0,
      pausedRemaining: (minutes * 60 + seconds) * 1000
    });
  };

  if (inlineMode) {
    return (
      <div className="flex flex-col items-center justify-center p-4 gap-3 h-full">
        {!isRunning && remaining === 0 && (
          <div className="flex gap-2">
            <input type="number" value={minutes} onChange={e => setMinutes(Math.max(0, parseInt(e.target.value)))} className="w-16 p-2 border rounded-lg text-center" />
            <span className="text-xl font-bold">:</span>
            <input type="number" value={seconds} onChange={e => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value))))} className="w-16 p-2 border rounded-lg text-center" />
          </div>
        )}
        <div className="text-3xl font-mono font-bold text-slate-800">
          {m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}
        </div>
        <div className="flex gap-2">
          <button onClick={handleToggle} className={`px-4 py-2 text-white font-bold rounded-lg ${isRunning ? 'bg-amber-500' : 'bg-green-500'}`}>
            {isRunning ? 'Pauze' : 'Start'}
          </button>
          <button onClick={handleReset} className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg">Reset</button>
        </div>
      </div>
    );
  }

  const progress = totalDuration > 0 ? (remaining / totalDuration) * 100 : 0;
  
  return (
    <div className="flex flex-col items-center justify-center h-full bg-slate-50 rounded-xl m-2 overflow-hidden relative">
      <div className="absolute bottom-0 left-0 right-0 bg-indigo-100 transition-all duration-100 ease-linear" style={{ height: `${progress}%` }} />
      <div className="text-5xl md:text-6xl lg:text-7xl font-mono font-bold text-slate-800 tracking-tighter z-10 drop-shadow-sm">
        {m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}
      </div>
    </div>
  );
};

const TrafficLightWidget = ({ data, onUpdate, isTeacher, inlineMode }: any) => {
  const color = data?.color || 'RED';

  const setColor = (c: string) => {
    if (isTeacher && onUpdate) onUpdate({ color: c });
  };

  const Light = ({ c, active }: { c: string, active: boolean }) => (
    <button 
      onClick={() => setColor(c)}
      disabled={!isTeacher}
      className={`w-10 h-10 md:w-14 md:h-14 rounded-full border-[3px] transition-all duration-300 ${
        active 
          ? c === 'RED' ? 'bg-red-500 border-red-200 shadow-[0_0_20px_rgba(239,68,68,0.6)]' 
          : c === 'YELLOW' ? 'bg-amber-400 border-amber-100 shadow-[0_0_20px_rgba(251,191,36,0.6)]'
          : 'bg-green-500 border-green-200 shadow-[0_0_20px_rgba(34,197,94,0.6)]'
          : 'bg-slate-800 border-slate-700 opacity-30 shadow-inner'
      }`}
    />
  );

  return (
    <div className="flex items-center justify-center h-full">
      <div className="bg-slate-900 px-4 py-6 rounded-3xl flex flex-col gap-4 shadow-xl border-4 border-slate-700">
        <Light c="RED" active={color === 'RED'} />
        <Light c="YELLOW" active={color === 'YELLOW'} />
        <Light c="GREEN" active={color === 'GREEN'} />
      </div>
    </div>
  );
};

const RandomNameWidget = ({ data, onUpdate, isTeacher, inlineMode, participants }: any) => {
  const [now, setNow] = useState(Date.now());
  const [animatedName, setAnimatedName] = useState('');
  
  const pickTimestamp = data?.pickTimestamp || 0;
  const pickedId = data?.targetParticipantId;
  
  const pickedParticipant = participants?.find((p: any) => p.id === pickedId);
  const isSpinning = (now - pickTimestamp) < 2000;

  useEffect(() => {
    let int: any;
    if (isSpinning) {
      int = setInterval(() => {
        setNow(Date.now());
        const randomP = participants[Math.floor(Math.random() * participants.length)];
        if (randomP) setAnimatedName(randomP.display_name);
      }, 100);
    } else {
      setNow(Date.now());
    }
    return () => clearInterval(int);
  }, [isSpinning, participants]);

  const handlePick = () => {
    if (!isTeacher || !onUpdate || !participants?.length) return;
    const randomP = participants[Math.floor(Math.random() * participants.length)];
    onUpdate({
      targetParticipantId: randomP.id,
      pickTimestamp: Date.now()
    });
  };

  const displayName = isSpinning 
    ? animatedName 
    : (pickedParticipant ? pickedParticipant.display_name : 'Kies een naam...');

  if (inlineMode) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
        <div className="text-xl font-bold text-center text-slate-800 bg-slate-100 w-full py-3 rounded-xl border border-slate-200">
          {displayName}
        </div>
        <button 
          onClick={handlePick}
          disabled={!participants?.length || isSpinning}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-2 px-6 rounded-xl shadow-md active:scale-95 transition-all"
        >
          Trek Naam
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full bg-slate-50 m-2 rounded-2xl relative overflow-hidden">
      <div className="absolute blur-3xl opacity-20 bg-indigo-500 w-64 h-64 rounded-full"></div>
      <div className={`text-3xl md:text-4xl font-extrabold text-slate-800 text-center z-10 px-8 py-12 ${isSpinning ? 'opacity-70 blur-[1px]' : 'scale-110 drop-shadow-md text-indigo-700'} transition-all duration-300`}>
        {displayName}
      </div>
    </div>
  );
};

const getYouTubeEmbedUrl = (rawUrl: string) => {
  if (!rawUrl) return '';

  const trimmedUrl = rawUrl.trim();

  try {
    const parsedUrl = new URL(trimmedUrl);
    const host = parsedUrl.hostname.replace('www.', '');

    let videoId = '';

    if (host === 'youtu.be') {
      videoId = parsedUrl.pathname.split('/')[1] || '';
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      if (parsedUrl.pathname === '/watch') {
        videoId = parsedUrl.searchParams.get('v') || '';
      }

      if (parsedUrl.pathname.startsWith('/embed/')) {
        videoId = parsedUrl.pathname.split('/embed/')[1]?.split('/')[0] || '';
      }

      if (parsedUrl.pathname.startsWith('/shorts/')) {
        videoId = parsedUrl.pathname.split('/shorts/')[1]?.split('/')[0] || '';
      }

      if (parsedUrl.pathname.startsWith('/live/')) {
        videoId = parsedUrl.pathname.split('/live/')[1]?.split('/')[0] || '';
      }
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
    }

    return trimmedUrl;
  } catch {
    const ytRegex = /(?:youtube\.com\/(?:.*[?&]v=|embed\/|shorts\/|live\/)|youtu\.be\/)([^"&?/\s]{11})/i;
    const match = trimmedUrl.match(ytRegex);

    if (match?.[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0`;
    }

    return trimmedUrl;
  }
};

const VideoWidget = ({ data, onUpdate, isTeacher, inlineMode }: any) => {
  const initialUrl = data?.url || '';
  const initialEmbedUrl = data?.embedUrl || getYouTubeEmbedUrl(initialUrl);

  const [url, setUrl] = useState(initialUrl);
  const [embedUrl, setEmbedUrl] = useState(initialEmbedUrl);

  useEffect(() => {
    const newUrl = data?.url || '';
    const newEmbedUrl = data?.embedUrl || getYouTubeEmbedUrl(newUrl);

    setUrl(newUrl);
    setEmbedUrl(newEmbedUrl);
  }, [data?.url, data?.embedUrl]);

  const handleSave = () => {
    const parsedEmbed = getYouTubeEmbedUrl(url);

    setEmbedUrl(parsedEmbed);

    if (isTeacher && onUpdate) {
      onUpdate({ url, embedUrl: parsedEmbed });
    }
  };

  if (!isTeacher && !embedUrl) {
     return <div className="flex items-center justify-center h-full text-slate-500 font-medium">Wachten op video...</div>;
  }

  if (inlineMode && !embedUrl) {
     return (
       <div className="p-4 flex flex-col gap-3 h-full justify-center">
         <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">YouTube of Video URL</label>
         <input 
           type="text" 
           value={url} 
           onChange={e => setUrl(e.target.value)} 
           className="border-2 border-slate-200/60 bg-slate-50/50 p-3 rounded-xl text-sm w-full outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all font-medium" 
           placeholder="https://youtube.com/..." 
         />
         <button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-bold transition-all shadow-md shadow-indigo-500/20 active:translate-y-0.5 hover:-translate-y-0.5">Opslaan</button>
       </div>
     );
  }

  return (
     <div className="flex flex-col h-full w-full">
        {inlineMode && isTeacher && (
          <div className="p-2 border-b border-slate-100 flex gap-2 bg-slate-50/50 shrink-0">
            <input 
              type="text" 
              value={url} 
              onChange={e => setUrl(e.target.value)} 
              className="border border-slate-200/60 bg-white p-2 rounded-lg flex-1 text-xs outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 font-medium" 
              placeholder="YouTube URL" 
            />
            <button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors">Update</button>
          </div>
        )}
        <div className="flex-1 bg-black w-full h-full relative overflow-hidden rounded-xl" style={{ minHeight: inlineMode ? 0 : '100%' }}>
          {embedUrl ? (
            <iframe 
              src={embedUrl} 
              className="absolute inset-0 w-full h-full border-0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
              title="Video Widget"
            ></iframe>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 bg-white font-medium">Geen geldige video URL</div>
          )}
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
      <div className="p-6 h-full text-slate-800 text-lg whitespace-pre-wrap font-medium leading-relaxed bg-amber-50/50 rounded-xl m-2">
        {data?.text || 'Geen notitie...'}
      </div>
    );
  }

  return (
    <div className="p-2 h-full">
      <textarea
        className="w-full h-full p-4 resize-none outline-none text-lg text-slate-800 bg-amber-50/80 rounded-xl border border-amber-200/50 font-medium leading-relaxed focus:bg-amber-50 focus:ring-2 focus:ring-amber-500/20"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        placeholder="Typ een notitie..."
      />
    </div>
  );
};

const EAIExplainerWidget = ({ data, onUpdate, isTeacher }: any) => {
  const [loading, setLoading] = useState(false);
  const [topicInput, setTopicInput] = useState(data?.lastTopic || '');
  
  const sessionId = window.location.pathname.split('/').pop();

  const handleGenerate = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicInput })
      });
      if (res.ok) {
        const result = await res.json();
        if (onUpdate) onUpdate({ ...data, explainer: result, lastTopic: topicInput });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 h-full flex flex-col bg-indigo-50/30">
      <div className="flex justify-between items-start mb-4 gap-4">
        <div>
          <h3 className="text-sm font-bold text-indigo-900">SSOT: /uitleg</h3>
          <p className="text-xs text-indigo-600 font-medium">Extra Metafoor & Verduidelijking</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto flex flex-col gap-4">
        {isTeacher && (
           <div className="flex gap-2 shrink-0">
           <input 
             value={topicInput}
             onChange={(e) => setTopicInput(e.target.value)}
             placeholder="Concept om uit te leggen (bijv. 'Breuken')"
             className="flex-1 px-3 py-2 border border-indigo-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
           />
           <button 
             onClick={handleGenerate}
             disabled={loading}
             className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 active:translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
           >
             {loading ? <span className="animate-pulse">Denkt na...</span> : 'Genereer'}
           </button>
         </div>
        )}

        {!data?.explainer ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 italic text-sm text-center border-2 border-dashed border-slate-200 rounded-xl p-4">
            Laat de EAI Agent een abstract concept verhelderen op basis van de lesfase.
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300 pb-2">
            <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-100 to-transparent rounded-bl-full opacity-50 pointer-events-none"></div>
              
              <h4 className="font-bold text-indigo-800 text-lg mb-2 relative z-10">{data.explainer.title}</h4>
              <p className="text-slate-700 text-sm leading-relaxed relative z-10">
                {data.explainer.explanation}
              </p>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-inner">
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-1">Controlevraag</h4>
              <p className="text-amber-900 font-medium text-sm">
                {data.explainer.checkQuestion}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const EAIDifferentiationWidget = ({ data, onUpdate, isTeacher, participants }: any) => {
  const [loading, setLoading] = useState(false);

  const sessionId = window.location.pathname.split('/').pop();

  const handleGenerate = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/differentiation`, { method: 'POST' });
      if (res.ok) {
        const result = await res.json();
        if (onUpdate) onUpdate(result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getParticipantNames = (ids: string[]) => {
    if (!ids || !participants) return [];
    return ids.map(id => {
      const p = participants.find((p: any) => p.id === id);
      return p ? p.display_name : 'Onbekend';
    });
  };

  const extendedNames = getParticipantNames(data?.extendedInstruction || []);
  const enrichmentNames = getParticipantNames(data?.enrichment || []);

  return (
    <div className="p-5 h-full flex flex-col bg-indigo-50/30">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-bold text-indigo-900">SSOT: /diff</h3>
          <p className="text-xs text-indigo-600 font-medium">Verlengde Instructie Groepen</p>
        </div>
        {isTeacher && (
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 active:translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <span className="animate-pulse">Genereert...</span> : 'Genereer via EAI'}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {!data?.rationale ? (
          <div className="flex items-center justify-center h-full text-slate-400 italic text-sm">
            Klik op genereer om de klas in te delen.
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
              <span className="font-bold text-indigo-600 block mb-1">AI Analyse:</span>
              {data.rationale}
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <h4 className="font-bold text-red-700 flex items-center gap-2 mb-3 pb-2 border-b border-red-200">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div> Verlengde Instructie
                </h4>
                <ul className="space-y-2">
                  {extendedNames.length > 0 
                    ? extendedNames.map((name, i) => <li key={i} className="text-sm font-medium text-red-900 bg-white px-2 py-1.5 rounded">{name}</li>)
                    : <li className="text-xs text-red-400 italic">Geen leerlingen</li>}
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <h4 className="font-bold text-green-700 flex items-center gap-2 mb-3 pb-2 border-b border-green-200">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div> Verdieping
                </h4>
                <ul className="space-y-2">
                  {enrichmentNames.length > 0 
                    ? enrichmentNames.map((name, i) => <li key={i} className="text-sm font-medium text-green-900 bg-white px-2 py-1.5 rounded">{name}</li>)
                    : <li className="text-xs text-green-400 italic">Geen leerlingen</li>}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const LessonPlanWidget = ({ data }: any) => {
  const prep = data?.prep;
  
  if (!prep) {
    return (
      <div className="p-4 h-full flex items-center justify-center text-gray-500 italic text-center">
        Geen lesvoorbereiding gevonden voor deze sessie.
      </div>
    );
  }

  return (
    <div className="p-4 h-full overflow-y-auto space-y-4">
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Leerdoel</h3>
        <p className="text-gray-800 font-medium">{prep.learningGoal || 'Niet ingevuld'}</p>
      </div>
      
      {prep.successCriteria && prep.successCriteria.length > 0 && prep.successCriteria[0] !== "" && (
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Succescriteria</h3>
          <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
            {prep.successCriteria.map((c: string, i: number) => c && <li key={i}>{c}</li>)}
          </ul>
        </div>
      )}

      {prep.misconceptions && prep.misconceptions.length > 0 && prep.misconceptions[0] !== "" && (
        <div>
          <h3 className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">Misconcepties</h3>
          <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
            {prep.misconceptions.map((m: string, i: number) => m && <li key={i}>{m}</li>)}
          </ul>
        </div>
      )}

      {prep.teacherNotes && (
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Notities</h3>
          <p className="text-gray-700 text-sm whitespace-pre-wrap">{prep.teacherNotes}</p>
        </div>
      )}
    </div>
  );
};