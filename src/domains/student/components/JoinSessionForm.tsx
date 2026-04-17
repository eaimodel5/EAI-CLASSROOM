import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col items-center justify-center p-4">
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

        <form onSubmit={onJoin} className="space-y-4">
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
