import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, Activity, Users, MessageSquare, Save, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'sessions' | 'settings'>('sessions');
  const [sessions, setSessions] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'sessions') {
        const res = await fetch('/api/admin/sessions');
        const data = await res.json();
        setSessions(data);
      } else {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      alert('Instellingen succesvol opgeslagen!');
      // Apply primary color immediately if changed
      if (settings.theme_color_primary) {
        document.documentElement.style.setProperty('--color-primary', settings.theme_color_primary);
      }
    } catch (err) {
      console.error('Failed to save settings', err);
      alert('Fout bij opslaan van instellingen.');
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold tracking-tight">EAI <span className="text-blue-400">ADMIN</span></h1>
        </div>
        <div className="flex bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'sessions' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <Activity className="w-4 h-4" /> Actieve Sessies
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'settings' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <Settings className="w-4 h-4" /> Systeem Instellingen
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : activeTab === 'sessions' ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Overzicht Sessies</h2>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessie Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vak & Klas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fase</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deelnemers</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Signalen</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acties</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-blue-600">{session.session_code}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{session.subject}</div>
                        <div className="text-sm text-gray-500">{session.grade} {session.level}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${session.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {session.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {session.active_phase}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1"><Users className="w-4 h-4" /> {session.participant_count}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1"><MessageSquare className="w-4 h-4" /> {session.signal_count}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => window.open(`/board/${session.session_code}`, '_blank')}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1 justify-end w-full"
                        >
                          <Eye className="w-4 h-4" /> Bekijk Bord
                        </button>
                      </td>
                    </tr>
                  ))}
                  {sessions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">Geen sessies gevonden.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-3xl">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Systeem Instellingen</h2>
              <button 
                onClick={saveSettings}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {saving ? 'Opslaan...' : 'Opslaan'}
              </button>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border p-6 space-y-8">
              {/* Branding */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Branding & Thematisering</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Applicatie Titel</label>
                    <input 
                      type="text" 
                      value={settings.app_title || ''} 
                      onChange={(e) => handleSettingChange('app_title', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Primaire Kleur (Hex)</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={settings.theme_color_primary || '#2563eb'} 
                        onChange={(e) => handleSettingChange('theme_color_primary', e.target.value)}
                        className="h-10 w-10 rounded border p-1"
                      />
                      <input 
                        type="text" 
                        value={settings.theme_color_primary || ''} 
                        onChange={(e) => handleSettingChange('theme_color_primary', e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lettertype (Font Family)</label>
                    <input 
                      type="text" 
                      value={settings.theme_font_family || ''} 
                      onChange={(e) => handleSettingChange('theme_font_family', e.target.value)}
                      placeholder="bijv. 'Inter', sans-serif"
                      className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* UI Toggles */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Interface Opties (Docent)</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Toon timer in docentenweergave</div>
                      <div className="text-sm text-gray-500">Laat een aftelklok zien in het docentendashboard.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settings.ui_teacher_show_timer === 'true'} onChange={(e) => handleSettingChange('ui_teacher_show_timer', e.target.checked ? 'true' : 'false')} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">AI Samenvattingen Activeren</div>
                      <div className="text-sm text-gray-500">Sta de docent toe om AI-samenvattingen te genereren.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settings.ui_teacher_ai_summaries !== 'false'} onChange={(e) => handleSettingChange('ui_teacher_ai_summaries', e.target.checked ? 'true' : 'false')} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Interface Opties (Leerling)</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Anonieme modus</div>
                      <div className="text-sm text-gray-500">Verberg namen van leerlingen voor elkaar.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settings.ui_student_anonymous === 'true'} onChange={(e) => handleSettingChange('ui_student_anonymous', e.target.checked ? 'true' : 'false')} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Gamification elementen</div>
                      <div className="text-sm text-gray-500">Toon badges en voortgangsbalken aan leerlingen.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settings.ui_student_gamification === 'true'} onChange={(e) => handleSettingChange('ui_student_gamification', e.target.checked ? 'true' : 'false')} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Interface Opties (Digibord)</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Bord Animaties</div>
                      <div className="text-sm text-gray-500">Gebruik vloeiende overgangen op het digibord.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settings.ui_board_animations !== 'false'} onChange={(e) => handleSettingChange('ui_board_animations', e.target.checked ? 'true' : 'false')} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Toon QR Code</div>
                      <div className="text-sm text-gray-500">Laat een QR code zien voor snelle toegang.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settings.ui_board_qr_code === 'true'} onChange={(e) => handleSettingChange('ui_board_qr_code', e.target.checked ? 'true' : 'false')} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
