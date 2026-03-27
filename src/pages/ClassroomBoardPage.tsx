import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ClassroomSession } from '../types';

export default function ClassroomBoardPage() {
  const { sessionCode } = useParams<{ sessionCode: string }>();
  const [session, setSession] = useState<ClassroomSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Initial fetch of session data by code
    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/sessions/code/${sessionCode}`);
        if (!res.ok) throw new Error('Sessie niet gevonden');
        const data = await res.json();
        setSession(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Fout bij laden sessie');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    // 2. Setup WebSocket for real-time updates
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'PHASE_CHANGED' && session && data.session_id === session.id) {
          setSession(prev => prev ? { ...prev, active_phase: data.active_phase } : prev);
        }
      } catch (e) {
        console.error('WebSocket message error:', e);
      }
    };

    return () => {
      ws.close();
    };
  }, [sessionCode, session?.id]);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Laden...</div>;
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Oeps!</h1>
          <p className="text-xl text-gray-600">{error || 'Sessie niet gevonden'}</p>
        </div>
      </div>
    );
  }

  // Determine background color based on active phase
  const getPhaseStyles = () => {
    switch (session.active_phase) {
      case 'START': return 'bg-blue-50 text-blue-900';
      case 'INSTRUCTION': return 'bg-amber-50 text-amber-900';
      case 'PRACTICE': return 'bg-emerald-50 text-emerald-900';
      case 'CLOSING': return 'bg-purple-50 text-purple-900';
      default: return 'bg-gray-50 text-gray-900';
    }
  };

  const getPhaseTitle = () => {
    switch (session.active_phase) {
      case 'START': return 'Welkom';
      case 'INSTRUCTION': return 'Instructie';
      case 'PRACTICE': return 'Zelfstandig Werken';
      case 'CLOSING': return 'Afsluiting';
      default: return '';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${getPhaseStyles()}`}>
      {/* Top Bar: Code & Subject */}
      <header className="p-8 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-medium opacity-80">{session.subject} {session.grade}</h2>
          <h1 className="text-5xl font-bold mt-2 tracking-tight">{getPhaseTitle()}</h1>
        </div>
        
        <div className="bg-white/60 backdrop-blur-sm px-8 py-6 rounded-3xl shadow-sm border border-black/5 text-center">
          <div className="text-sm font-semibold uppercase tracking-widest opacity-60 mb-2">Doe mee via EAIHUB</div>
          <div className="text-6xl font-mono font-black tracking-widest">{session.session_code}</div>
        </div>
      </header>

      {/* Main Content Area: Goal & Context */}
      <main className="flex-1 flex flex-col items-center justify-center p-12 text-center max-w-5xl mx-auto w-full">
        {session.lesson_goal && (
          <div className="space-y-6">
            <h3 className="text-2xl font-medium opacity-60 uppercase tracking-widest">Lesdoel</h3>
            <p className="text-5xl md:text-6xl font-medium leading-tight">{session.lesson_goal}</p>
          </div>
        )}
        
        {!session.lesson_goal && (
          <div className="text-4xl font-medium opacity-40">
            Kijk naar de docent voor instructies.
          </div>
        )}
      </main>

      {/* Footer: Timer placeholder */}
      <footer className="p-8 flex justify-center">
        {/* Timer will go here in a later block */}
      </footer>
    </div>
  );
}
