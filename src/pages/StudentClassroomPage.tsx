import React, { useState, useEffect } from 'react';
import { HelpCircle, MessageSquare, CheckCircle, LogOut, ArrowLeft } from 'lucide-react';
import { ClassroomSession, ClassroomParticipant } from '../types';
import { useNavigate } from 'react-router-dom';

export default function StudentClassroomPage() {
  const navigate = useNavigate();
  // Join Flow State
  const [sessionCode, setSessionCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Active Session State
  const [session, setSession] = useState<ClassroomSession | null>(null);
  const [participant, setParticipant] = useState<ClassroomParticipant | null>(null);
  const [activeSignal, setActiveSignal] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;

    // Setup WebSocket for real-time updates
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'PHASE_CHANGED' && data.session_id === session.id) {
          setSession(prev => prev ? { ...prev, active_phase: data.active_phase } : prev);
          setActiveSignal(null); // Reset signal on phase change
        } else if (data.type === 'SESSION_ENDED' && data.session_id === session.id) {
          setSession(prev => prev ? { ...prev, status: 'ENDED' } : prev);
        }
      } catch (e) {
        console.error('WebSocket message error:', e);
      }
    };

    return () => {
      ws.close();
    };
  }, [session?.id]);

  const joinSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/participants/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_code: sessionCode,
          display_name: displayName,
          device_type: 'browser'
        })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Kan niet deelnemen aan sessie');
      }
      
      const data = await res.json();
      setSession(data.session);
      setParticipant(data.participant);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden');
    } finally {
      setLoading(false);
    }
  };

  const sendSignal = async (signalType: 'HELP' | 'WORD' | 'CHECK' | 'EXIT') => {
    if (!session || !participant) return;
    
    // Optimistic UI update
    setActiveSignal(signalType);

    try {
      await fetch('/api/signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classroom_session_id: session.id,
          participant_id: participant.id,
          phase: session.active_phase,
          signal_type: signalType,
          urgency: signalType === 'HELP' ? 'HIGH' : 'LOW'
        })
      });
    } catch (err) {
      console.error('Failed to send signal:', err);
      setActiveSignal(null); // Revert on failure
    }
  };

  // --- JOIN FLOW UI ---
  if (!session || !participant) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm mb-4">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Terug naar start
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border p-8 max-w-sm w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Deelnemen aan les</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={joinSession} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lescode</label>
              <input 
                required
                type="text" 
                value={sessionCode}
                onChange={e => setSessionCode(e.target.value.toUpperCase())}
                placeholder="bijv. X7K9M2"
                className="w-full px-4 py-3 text-center text-2xl tracking-widest font-mono font-bold border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none uppercase"
                maxLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jouw naam (of alias)</label>
              <input 
                required
                type="text" 
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Hoe heet je?"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || sessionCode.length < 6 || !displayName}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 mt-4"
            >
              {loading ? 'Bezig met verbinden...' : 'Doe mee'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- ACTIVE SESSION UI ---
  
  // Determine background color based on active phase
  const getPhaseStyles = () => {
    switch (session.active_phase) {
      case 'START': return 'bg-blue-50';
      case 'INSTRUCTION': return 'bg-amber-50';
      case 'PRACTICE': return 'bg-emerald-50';
      case 'CLOSING': return 'bg-purple-50';
      default: return 'bg-gray-50';
    }
  };

  const getPhaseTitle = () => {
    switch (session.active_phase) {
      case 'START': return 'Start & Doel';
      case 'INSTRUCTION': return 'Instructie';
      case 'PRACTICE': return 'Zelfstandig Werken';
      case 'CLOSING': return 'Afsluiting';
      default: return '';
    }
  };

  if (session.status === 'ENDED') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Les is afgelopen</h1>
          <p className="text-gray-600 mb-6">De docent heeft deze sessie beëindigd.</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors"
          >
            Terug naar start
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${getPhaseStyles()}`}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b px-4 py-3 flex justify-between items-center sticky top-0 z-10">
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{session.subject}</div>
          <div className="font-bold text-gray-900">{getPhaseTitle()}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
            {participant.display_name.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main Content: Signal Buttons */}
      <main className="flex-1 p-4 flex flex-col items-center justify-center max-w-md mx-auto w-full space-y-4">
        
        {/* Only show relevant buttons based on phase */}
        {session.active_phase === 'INSTRUCTION' && (
          <>
            <button 
              onClick={() => sendSignal('HELP')}
              className={`w-full p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 ${
                activeSignal === 'HELP' 
                  ? 'bg-red-50 border-red-500 text-red-700 scale-95' 
                  : 'bg-white border-gray-200 text-gray-700 hover:border-red-200 hover:bg-red-50 active:scale-95'
              }`}
            >
              <HelpCircle className={`w-10 h-10 ${activeSignal === 'HELP' ? 'text-red-500' : 'text-gray-400'}`} />
              <span className="font-bold text-lg">Ik snap het niet</span>
            </button>
            
            <button 
              onClick={() => sendSignal('WORD')}
              className={`w-full p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 ${
                activeSignal === 'WORD' 
                  ? 'bg-blue-50 border-blue-500 text-blue-700 scale-95' 
                  : 'bg-white border-gray-200 text-gray-700 hover:border-blue-200 hover:bg-blue-50 active:scale-95'
              }`}
            >
              <MessageSquare className={`w-10 h-10 ${activeSignal === 'WORD' ? 'text-blue-500' : 'text-gray-400'}`} />
              <span className="font-bold text-lg">Wat betekent dit woord?</span>
            </button>
          </>
        )}

        {session.active_phase === 'PRACTICE' && (
          <>
            <button 
              onClick={() => sendSignal('HELP')}
              className={`w-full p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 ${
                activeSignal === 'HELP' 
                  ? 'bg-red-50 border-red-500 text-red-700 scale-95' 
                  : 'bg-white border-gray-200 text-gray-700 hover:border-red-200 hover:bg-red-50 active:scale-95'
              }`}
            >
              <HelpCircle className={`w-10 h-10 ${activeSignal === 'HELP' ? 'text-red-500' : 'text-gray-400'}`} />
              <span className="font-bold text-lg">Ik loop vast</span>
            </button>

            <button 
              onClick={() => sendSignal('CHECK')}
              className={`w-full p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 ${
                activeSignal === 'CHECK' 
                  ? 'bg-green-50 border-green-500 text-green-700 scale-95' 
                  : 'bg-white border-gray-200 text-gray-700 hover:border-green-200 hover:bg-green-50 active:scale-95'
              }`}
            >
              <CheckCircle className={`w-10 h-10 ${activeSignal === 'CHECK' ? 'text-green-500' : 'text-gray-400'}`} />
              <span className="font-bold text-lg">Ik ben klaar</span>
            </button>
          </>
        )}

        {(session.active_phase === 'START' || session.active_phase === 'CLOSING') && (
          <div className="text-center p-8 bg-white/60 backdrop-blur-sm rounded-3xl border border-black/5">
            <p className="text-lg font-medium text-gray-600">
              {session.active_phase === 'START' ? 'Kijk naar het bord voor de start van de les.' : 'De les is afgelopen. Kijk naar het bord.'}
            </p>
          </div>
        )}

        {activeSignal && (
          <div className="text-sm font-medium text-gray-500 animate-pulse mt-4">
            Signaal verzonden naar docent
          </div>
        )}

      </main>
    </div>
  );
}
