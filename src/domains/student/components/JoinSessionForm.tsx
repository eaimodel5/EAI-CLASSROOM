import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GridBackground from '../../../components/GridBackground';

interface JoinSessionFormProps {
  sessionCode: string;
  setSessionCode: (code: string) => void;
  displayName: string;
  setDisplayName: (name: string) => void;
  loading: boolean;
  error: string | null;
  onJoin: (e: React.FormEvent) => void;
}

export function JoinSessionForm({
  sessionCode,
  setSessionCode,
  displayName,
  setDisplayName,
  loading,
  error,
  onJoin
}: JoinSessionFormProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-transparent flex flex-col items-center justify-center p-4 relative font-sans">
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <GridBackground />
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>
      </div>
      <div className="w-full max-w-sm mb-6 relative z-10">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" /> Terug naar start
        </button>
      </div>
      <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/60 p-10 max-w-sm w-full relative overflow-hidden z-10 animate-in zoom-in-95 duration-500">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-100/50 to-purple-100/50 rounded-bl-full -mr-24 -mt-24 z-0 mix-blend-multiply opacity-50"></div>
        <h1 className="text-3xl font-black text-slate-900 mb-8 text-center tracking-tight relative z-10">Deelnemen</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm text-red-700 rounded-2xl text-sm font-bold border border-red-200/60 shadow-sm animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <form onSubmit={onJoin} className="space-y-6 relative z-10">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Lescode</label>
            <input 
              required
              type="text" 
              value={sessionCode}
              onChange={e => setSessionCode(e.target.value.toUpperCase())}
              placeholder="bijv. X7K9M2"
              className="w-full px-4 py-4 bg-white/50 border-2 border-slate-200/60 rounded-2xl text-center text-4xl tracking-widest font-mono font-black text-indigo-600 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none uppercase transition-all placeholder:text-slate-300 placeholder:font-medium placeholder:tracking-normal placeholder:text-lg shadow-inner"
              maxLength={6}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Jouw naam</label>
            <input 
              required
              type="text" 
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Hoe heet je?"
              className="w-full px-5 py-4 bg-white/50 border-2 border-slate-200/60 rounded-2xl font-bold text-slate-800 text-lg focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-400 placeholder:font-medium shadow-inner"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading || sessionCode.length < 6 || !displayName}
            className="w-full py-4 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50 mt-4 tracking-widest uppercase text-sm active:scale-95"
          >
            {loading ? 'Bezig met verbinden...' : 'Doe mee'}
          </button>
        </form>
      </div>
    </div>
  );
}
