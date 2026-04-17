import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, Activity, Users, MessageSquare, Save, Eye, XCircle, Trash2, ShieldAlert, BarChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'sessions' | 'settings'>('sessions');
  const [sessions, setSessions] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Basic auth check
    if (localStorage.getItem('admin_auth') !== 'true') {
      navigate('/');
      return;
    }
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'sessions') {
        const [resSessions, resStats] = await Promise.all([
          fetch('/api/admin/sessions'),
          fetch('/api/admin/stats')
        ]);
        setSessions(await resSessions.json());
        setStats(await resStats.json());
      } else {
        const res = await fetch('/api/admin/settings');
        setSettings(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async (id: string) => {
    if (!window.confirm('Weet je zeker dat je deze sessie geforceerd wilt beëindigen?')) return;
    try {
      await fetch(`/api/admin/sessions/${id}/end`, { method: 'POST' });
      fetchData();
    } catch (err) {
      alert('Fout bij beëindigen sessie');
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!window.confirm('Weet je zeker dat je deze sessie en alle bijbehorende data (deelnemers, signalen) permanent wilt verwijderen?')) return;
    try {
      await fetch(`/api/admin/sessions/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      alert('Fout bij verwijderen sessie');
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
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 text-white px-8 py-5 flex justify-between items-center shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/')} className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-all border border-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">EAI <span className="text-blue-500">ADMIN</span></h1>
            <p className="text-xs text-gray-400 font-medium tracking-wider uppercase mt-0.5"><ShieldAlert className="w-3 h-3 inline mr-1 text-amber-500" /> Superuser Dashboard</p>
          </div>
        </div>
        <div className="flex bg-gray-800/80 p-1.5 rounded-xl border border-gray-700">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'sessions' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'}`}
          >
            <Activity className="w-4 h-4" /> Live Sessies
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'}`}
          >
            <Settings className="w-4 h-4" /> Systeem Configuratie
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
          </div>
        ) : activeTab === 'sessions' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Activity className="w-6 h-6" /></div>
                <div><p className="text-sm font-medium text-gray-500">Actieve Sessies</p><p className="text-2xl font-bold text-gray-900">{stats.activeSessions || 0}</p></div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><BarChart className="w-6 h-6" /></div>
                <div><p className="text-sm font-medium text-gray-500">Totale Sessies</p><p className="text-2xl font-bold text-gray-900">{stats.totalSessions || 0}</p></div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><Users className="w-6 h-6" /></div>
                <div><p className="text-sm font-medium text-gray-500">Studenten (Totaal)</p><p className="text-2xl font-bold text-gray-900">{stats.totalParticipants || 0}</p></div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center"><MessageSquare className="w-6 h-6" /></div>
                <div><p className="text-sm font-medium text-gray-500">Signalen Geregistreerd</p><p className="text-2xl font-bold text-gray-900">{stats.totalSignals || 0}</p></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="px-6 py-5 border-b bg-gray-50/50 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Overzicht Sessies</h2>
                <button onClick={fetchData} className="text-sm font-medium text-blue-600 hover:text-blue-700">Vernieuwen</button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Sessie Code</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Vak & Klas</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status & Fase</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Metrieken</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Aangemaakt Op</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Beheer</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {sessions.map((session) => (
                      <tr key={session.id} className="hover:bg-blue-50/50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100">{session.session_code}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">{session.subject}</div>
                          <div className="text-sm font-medium text-gray-500 mt-0.5">{session.grade} {session.level}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1.5 items-start">
                            <span className={`px-2.5 py-1 inline-flex text-xs font-bold uppercase tracking-wider rounded-md ${session.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {session.status}
                            </span>
                            <span className="px-2.5 py-1 inline-flex text-xs font-bold uppercase tracking-wider rounded-md bg-indigo-50 text-indigo-700">
                              {session.active_phase}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                              <Users className="w-4 h-4 text-gray-400" /> {session.participant_count} leerlingen
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                              <MessageSquare className="w-4 h-4 text-gray-400" /> {session.signal_count} signalen
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                           {new Date(session.created_at).toLocaleString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => window.open(`/board/${session.session_code}`, '_blank')}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                              title="Bekijk Digibord"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {session.status === 'ACTIVE' && (
                              <button 
                                onClick={() => handleEndSession(session.id)}
                                className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-100"
                                title="Forceer Einde"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteSession(session.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                              title="Permanent Verwijderen"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {sessions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <p className="text-gray-500 font-medium">Geen sessies in de database gevonden.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Systeem Instellingen</h2>
                <p className="text-gray-500 mt-1">Beheer de globale configuratie en het gedrag van de applicatie.</p>
              </div>
              <button 
                onClick={saveSettings}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
              >
                <Save className="w-5 h-5" /> {saving ? 'Opslaan...' : 'Wijzigingen Opslaan'}
              </button>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-12">
              {/* Branding */}
              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><div className="w-2 h-6 bg-blue-500 rounded-full"></div> Branding & Thematisering</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Applicatie Titel</label>
                    <input 
                      type="text" 
                      value={settings.app_title || ''} 
                      onChange={(e) => handleSettingChange('app_title', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:ring-0 focus:border-blue-500 transition-colors outline-none"
                      placeholder="bijv. EAI Classroom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Primaire Kleur (Hex)</label>
                    <div className="flex gap-3">
                      <input 
                        type="color" 
                        value={settings.theme_color_primary || '#2563eb'} 
                        onChange={(e) => handleSettingChange('theme_color_primary', e.target.value)}
                        className="h-12 w-12 rounded-xl border-2 border-gray-100 p-1 cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={settings.theme_color_primary || ''} 
                        onChange={(e) => handleSettingChange('theme_color_primary', e.target.value)}
                        className="flex-1 px-4 py-3 border-2 border-gray-100 rounded-xl focus:ring-0 focus:border-blue-500 font-mono transition-colors outline-none"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Lettertype (Font Family)</label>
                    <input 
                      type="text" 
                      value={settings.theme_font_family || ''} 
                      onChange={(e) => handleSettingChange('theme_font_family', e.target.value)}
                      placeholder="bijv. 'Inter', sans-serif"
                      className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:ring-0 focus:border-blue-500 font-mono transition-colors outline-none"
                    />
                  </div>
                </div>
              </section>

              {/* UI Toggles */}
              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><div className="w-2 h-6 bg-indigo-500 rounded-full"></div> Interface Opties (Docent)</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <div className="font-bold text-gray-900">Toon timer in docentenweergave</div>
                      <div className="text-sm font-medium text-gray-500 mt-1">Laat een aftelklok zien in het docentendashboard.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settings.ui_teacher_show_timer === 'true'} onChange={(e) => handleSettingChange('ui_teacher_show_timer', e.target.checked ? 'true' : 'false')} />
                      <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <div className="font-bold text-gray-900">AI Samenvattingen Activeren</div>
                      <div className="text-sm font-medium text-gray-500 mt-1">Sta de docent toe om AI-samenvattingen te genereren.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settings.ui_teacher_ai_summaries !== 'false'} onChange={(e) => handleSettingChange('ui_teacher_ai_summaries', e.target.checked ? 'true' : 'false')} />
                      <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><div className="w-2 h-6 bg-emerald-500 rounded-full"></div> Interface Opties (Leerling)</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <div className="font-bold text-gray-900">Anonieme modus</div>
                      <div className="text-sm font-medium text-gray-500 mt-1">Verberg namen van leerlingen voor elkaar op het digibord.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settings.ui_student_anonymous === 'true'} onChange={(e) => handleSettingChange('ui_student_anonymous', e.target.checked ? 'true' : 'false')} />
                      <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <div className="font-bold text-gray-900">Gamification elementen</div>
                      <div className="text-sm font-medium text-gray-500 mt-1">Toon badges en voortgangsbalken aan leerlingen (experimenteel).</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settings.ui_student_gamification === 'true'} onChange={(e) => handleSettingChange('ui_student_gamification', e.target.checked ? 'true' : 'false')} />
                      <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><div className="w-2 h-6 bg-amber-500 rounded-full"></div> Interface Opties (Digibord)</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <div className="font-bold text-gray-900">Bord Animaties</div>
                      <div className="text-sm font-medium text-gray-500 mt-1">Gebruik vloeiende overgangen op het digibord.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settings.ui_board_animations !== 'false'} onChange={(e) => handleSettingChange('ui_board_animations', e.target.checked ? 'true' : 'false')} />
                      <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <div className="font-bold text-gray-900">Toon QR Code</div>
                      <div className="text-sm font-medium text-gray-500 mt-1">Laat een QR code zien voor snelle toegang tijdens de startfase.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settings.ui_board_qr_code === 'true'} onChange={(e) => handleSettingChange('ui_board_qr_code', e.target.checked ? 'true' : 'false')} />
                      <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </section>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
