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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 text-white px-4 md:px-8 py-4 md:py-5 flex flex-col md:flex-row justify-between items-center gap-4 shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
          <button onClick={() => navigate('/')} className="p-2.5 md:p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-slate-700 active:scale-95">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight">EAI <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">ADMIN</span></h1>
            <p className="text-[10px] md:text-xs text-slate-400 font-bold tracking-wider uppercase mt-0.5"><ShieldAlert className="w-3 h-3 inline mr-1 text-amber-500" /> Superuser Dashboard</p>
          </div>
        </div>
        <div className="flex w-full md:w-auto bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex-1 md:flex-none justify-center px-3 md:px-5 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'sessions' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`}
          >
            <Activity className="w-4 h-4" /> Live Sessies
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 md:flex-none justify-center px-3 md:px-5 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`}
          >
            <Settings className="w-4 h-4" /> Systeem Configuratie
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
          </div>
        ) : activeTab === 'sessions' ? (
          <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-white/80 backdrop-blur-sm p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0"><Activity className="w-5 h-5 md:w-6 md:h-6" /></div>
                <div><p className="text-xs md:text-sm font-bold text-slate-500 line-clamp-1">Actieve Sessies</p><p className="text-xl md:text-2xl font-black text-slate-900">{stats.activeSessions || 0}</p></div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0"><BarChart className="w-5 h-5 md:w-6 md:h-6" /></div>
                <div><p className="text-xs md:text-sm font-bold text-slate-500 line-clamp-1">Totale Sessies</p><p className="text-xl md:text-2xl font-black text-slate-900">{stats.totalSessions || 0}</p></div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0"><Users className="w-5 h-5 md:w-6 md:h-6" /></div>
                <div><p className="text-xs md:text-sm font-bold text-slate-500 line-clamp-1">Studenten</p><p className="text-xl md:text-2xl font-black text-slate-900">{stats.totalParticipants || 0}</p></div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0"><MessageSquare className="w-5 h-5 md:w-6 md:h-6" /></div>
                <div><p className="text-xs md:text-sm font-bold text-slate-500 line-clamp-1">Signalen</p><p className="text-xl md:text-2xl font-black text-slate-900">{stats.totalSignals || 0}</p></div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden w-full max-w-[100vw]">
              <div className="px-4 md:px-6 py-4 md:py-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900">Overzicht sessies</h2>
                <button onClick={fetchData} className="text-sm font-bold text-indigo-600 hover:text-indigo-700 w-full md:w-auto text-left md:text-right">Vernieuwen</button>
              </div>
              <div className="overflow-x-auto hide-scrollbar w-full">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50/80">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Sessie Code</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Vak & Klas</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status & Fase</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Metrieken</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Aangemaakt Op</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Beheer</th>
                    </tr>
                  </thead>
                  <tbody className="bg-transparent divide-y divide-slate-100">
                    {sessions.map((session) => (
                      <tr key={session.id} className="hover:bg-indigo-50/30 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-100">{session.session_code}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-slate-900">{session.subject}</div>
                          <div className="text-sm font-semibold text-slate-500 mt-0.5">{session.grade} {session.level}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1.5 items-start">
                            <span className={`px-2.5 py-1 inline-flex text-xs font-bold uppercase tracking-wider rounded-md ${session.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                              {session.status}
                            </span>
                            <span className="px-2.5 py-1 inline-flex text-xs font-bold uppercase tracking-wider rounded-md bg-indigo-50 text-indigo-700">
                              {session.active_phase}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-sm text-slate-600 font-semibold">
                              <Users className="w-4 h-4 text-slate-400" /> {session.participant_count} leerlingen
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 font-semibold">
                              <MessageSquare className="w-4 h-4 text-slate-400" /> {session.signal_count} signalen
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-semibold">
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
                          <p className="text-slate-500 font-semibold">Geen sessies in de database gevonden.</p>
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-200/60">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Systeeminstellingen</h2>
                <p className="text-slate-500 mt-1 font-medium">Beheer de globale configuratie en het gedrag van de applicatie.</p>
              </div>
              <button 
                onClick={saveSettings}
                disabled={saving}
                className="flex items-center justify-center w-full md:w-auto gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 active:scale-95"
              >
                <Save className="w-5 h-5" /> {saving ? 'Opslaan...' : 'Wijzigingen Opslaan'}
              </button>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-sm border border-slate-200/60 p-8 space-y-12">
              {/* Branding */}
              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><div className="w-2 h-6 bg-indigo-500 rounded-full"></div> Branding & Thematisering</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Applicatie Titel</label>
                    <input 
                      type="text" 
                      value={settings.app_title || ''} 
                      onChange={(e) => handleSettingChange('app_title', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-200/60 bg-slate-50/50 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all outline-none font-medium text-slate-800"
                      placeholder="bijv. EAI Classroom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Primaire Kleur (Hex)</label>
                    <div className="flex gap-3">
                      <input 
                        type="color" 
                        value={settings.theme_color_primary || '#4f46e5'} 
                        onChange={(e) => handleSettingChange('theme_color_primary', e.target.value)}
                        className="h-12 w-12 rounded-xl border-2 border-slate-200/60 p-1 cursor-pointer bg-slate-50/50"
                      />
                      <input 
                        type="text" 
                        value={settings.theme_color_primary || ''} 
                        onChange={(e) => handleSettingChange('theme_color_primary', e.target.value)}
                        className="flex-1 px-4 py-3 border-2 border-slate-200/60 bg-slate-50/50 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 font-mono text-slate-800 transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Lettertype (Font Family)</label>
                    <input 
                      type="text" 
                      value={settings.theme_font_family || ''} 
                      onChange={(e) => handleSettingChange('theme_font_family', e.target.value)}
                      placeholder="bijv. 'Inter', sans-serif"
                      className="w-full px-4 py-3 border-2 border-slate-200/60 bg-slate-50/50 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 font-mono text-slate-800 transition-all outline-none"
                    />
                  </div>
                </div>
              </section>

              {/* UI Toggles */}
              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><div className="w-2 h-6 bg-blue-500 rounded-full"></div> EAI Model & Prompt Configuratie</h3>
                <div className="space-y-6">
                  <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Actief Gemini Model</label>
                    <select 
                      value={settings.eai_model_version || 'gemini-3.1-pro-preview'}
                      onChange={(e) => handleSettingChange('eai_model_version', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-200/60 bg-white rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all font-medium"
                    >
                      <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro Preview (Aanbevolen)</option>
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash (Snel)</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-2">Bepaalt de intelligentie en response-tijd van alle EAI widgets in de docentenweergave.</p>
                  </div>

                  <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                    <label className="block text-sm font-bold text-slate-700 mb-2">EAI Temperatuur (Creativiteit)</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="range" 
                        min="0" max="1" step="0.1" 
                        value={settings.eai_temperature || '0.7'}
                        onChange={(e) => handleSettingChange('eai_temperature', e.target.value)}
                        className="flex-1 accent-blue-600"
                      />
                      <span className="font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-lg">{settings.eai_temperature || '0.7'}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">0.0 = Zeer strikt en voorspelbaar, 1.0 = Zeer creatief en variabel (Kans op hallucinaties).</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><div className="w-2 h-6 bg-red-500 rounded-full"></div> Beveiliging & Globaal Beheer</h3>
                <div className="space-y-6">
                  <div className="p-6 bg-red-50/50 rounded-2xl border border-red-200/60">
                    <label className="block text-sm font-bold text-red-900 mb-2">Globale Systeemmelding (Banner)</label>
                    <input 
                      type="text" 
                      value={settings.global_announcement || ''} 
                      onChange={(e) => handleSettingChange('global_announcement', e.target.value)}
                      placeholder="bijv: Let op! Systeemonderhoud vanavond om 22:00..."
                      className="w-full px-4 py-3 border-2 border-red-200/60 bg-white rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-400 outline-none transition-all placeholder:text-red-300 font-medium text-red-900"
                    />
                    <p className="text-xs text-red-600/70 mt-2">Toon een urgente rode balk over het hele platform (docenten en leerlingen). Laat leeg om uit te schakelen.</p>
                  </div>

                  <div className="flex items-center justify-between p-5 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                    <div>
                      <div className="font-bold text-slate-900">Strikte Profanity Filter (AI input/output)</div>
                      <div className="text-sm font-medium text-slate-500 mt-1">Blokkeer automatisch prompts die als ongepast worden gemarkeerd.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settings.security_profanity_filter !== 'false'} onChange={(e) => handleSettingChange('security_profanity_filter', e.target.checked ? 'true' : 'false')} />
                      <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><div className="w-2 h-6 bg-slate-500 rounded-full"></div> Systeem Limieten & Gedrag</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Max Leerlingen per Sessie</label>
                    <input 
                      type="number" 
                      value={settings.sys_max_students || '35'} 
                      onChange={(e) => handleSettingChange('sys_max_students', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-200/60 bg-white rounded-xl focus:ring-4 focus:ring-slate-500/10 focus:border-slate-400 outline-none transition-all font-medium"
                    />
                    <p className="text-xs text-slate-500 mt-2">Voorkomt ongewenste verbindingen via een gelekte bord-code.</p>
                  </div>
                  <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Auto-verwijder Sessies (Uren)</label>
                    <select 
                      value={settings.sys_auto_delete_hours || '24'}
                      onChange={(e) => handleSettingChange('sys_auto_delete_hours', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-200/60 bg-white rounded-xl focus:ring-4 focus:ring-slate-500/10 focus:border-slate-400 outline-none transition-all font-medium"
                    >
                      <option value="12">12 Uur</option>
                      <option value="24">24 Uur (Aanbevolen)</option>
                      <option value="48">48 Uur</option>
                      <option value="0">Nooit (Handmatig)</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-2">Ruimt inactieve sessies automatisch op om de server snel te houden.</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><div className="w-2 h-6 bg-purple-500 rounded-full"></div> Interface Opties (Docent)</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-5 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                    <div>
                      <div className="font-bold text-slate-900">Schermvergrendeling (Time-Outs) Toestaan</div>
                      <div className="text-sm font-medium text-slate-500 mt-1">Geef docenten de knop om leerlingschermen globaal of individueel op zwart te zetten.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settings.ui_teacher_allow_lock !== 'false'} onChange={(e) => handleSettingChange('ui_teacher_allow_lock', e.target.checked ? 'true' : 'false')} />
                      <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-5 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                    <div>
                      <div className="font-bold text-slate-900">Willekeurige Beurt Kiezer</div>
                      <div className="text-sm font-medium text-slate-500 mt-1">Sta docenten toe de "Rad van Fortuin" functie te gebruiken voor de klas.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settings.ui_teacher_allow_random !== 'false'} onChange={(e) => handleSettingChange('ui_teacher_allow_random', e.target.checked ? 'true' : 'false')} />
                      <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-5 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                    <div>
                      <div className="font-bold text-slate-900">EAI Widgets (Intelligente Tools) Toestaan</div>
                      <div className="text-sm font-medium text-slate-500 mt-1">Geef docenten toegang tot generatieve AI-widgets (zoals de EAI Quiz generator).</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settings.ui_teacher_allow_smart_widgets !== 'false'} onChange={(e) => handleSettingChange('ui_teacher_allow_smart_widgets', e.target.checked ? 'true' : 'false')} />
                      <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><div className="w-2 h-6 bg-emerald-500 rounded-full"></div> Interface Opties (Leerling)</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-5 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                    <div>
                      <div className="font-bold text-slate-900">Vrij Tekenbord (Drawing Pad)</div>
                      <div className="text-sm font-medium text-slate-500 mt-1">Sta leerlingen in specifieke prompts toe om wiskundige formules of schetsen te sturen.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settings.ui_student_allow_drawing !== 'false'} onChange={(e) => handleSettingChange('ui_student_allow_drawing', e.target.checked ? 'true' : 'false')} />
                      <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-5 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                    <div>
                      <div className="font-bold text-slate-900">Vrij Tekstveld Forceren</div>
                      <div className="text-sm font-medium text-slate-500 mt-1">Maak het zelf-typen van tekst optioneel, geef anders alleen voorgedefinieerde knoppen.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settings.ui_student_force_text === 'true'} onChange={(e) => handleSettingChange('ui_student_force_text', e.target.checked ? 'true' : 'false')} />
                      <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-5 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                    <div>
                      <div className="font-bold text-slate-900">Weergave Anonieme Modus</div>
                      <div className="text-sm font-medium text-slate-500 mt-1">Verberg namen van leerlingen voor elkaar op het digibord of gedeelde views.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settings.ui_student_anonymous === 'true'} onChange={(e) => handleSettingChange('ui_student_anonymous', e.target.checked ? 'true' : 'false')} />
                      <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><div className="w-2 h-6 bg-amber-500 rounded-full"></div> Interface Opties (Digibord)</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-5 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                    <div>
                      <div className="font-bold text-slate-900">Slim Uitlichten (Auto-Highlight)</div>
                      <div className="text-sm font-medium text-slate-500 mt-1">Laat het bord periodiek automatisch het meest opvallende antwoord groot projecteren.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settings.ui_board_auto_highlight === 'true'} onChange={(e) => handleSettingChange('ui_board_auto_highlight', e.target.checked ? 'true' : 'false')} />
                      <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-5 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                    <div>
                      <div className="font-bold text-slate-900">Bord Animaties</div>
                      <div className="text-sm font-medium text-slate-500 mt-1">Gebruik vloeiende overgangen op het digibord.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settings.ui_board_animations !== 'false'} onChange={(e) => handleSettingChange('ui_board_animations', e.target.checked ? 'true' : 'false')} />
                      <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-5 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                    <div>
                      <div className="font-bold text-slate-900">Toon QR Code</div>
                      <div className="text-sm font-medium text-slate-500 mt-1">Laat een QR code zien voor snelle toegang tijdens de startfase.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settings.ui_board_qr_code === 'true'} onChange={(e) => handleSettingChange('ui_board_qr_code', e.target.checked ? 'true' : 'false')} />
                      <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-amber-600"></div>
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
