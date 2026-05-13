import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Lock, Presentation, Users, Brain, Shield, ChevronDown, CheckCircle } from 'lucide-react';
import TeacherClassroomPage from './pages/TeacherClassroomPage';
import ClassroomBoardPage from './pages/ClassroomBoardPage';
import StudentClassroomPage from './pages/StudentClassroomPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import GridBackground from './components/GridBackground';

const LandingPage = () => {
  const navigate = useNavigate();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'vis@emmauscollege.nl' && password === 'AnalyseAdvies') {
      localStorage.setItem('admin_auth', 'true');
      navigate('/admin');
    } else {
      setError('Gegevens onjuist');
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gray-50 relative flex flex-col font-sans">
      <div className="fixed inset-0 z-0">
        <GridBackground />
      </div>
      
      <button 
        onClick={() => setShowAdminLogin(true)}
        className="fixed top-4 right-4 p-3 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full shadow-sm text-gray-400 hover:text-gray-900 transition-colors z-50 border"
        title="Admin Login"
      >
        <Lock className="w-5 h-5" />
      </button>

      {showAdminLogin && (
        <div className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full animate-in fade-in zoom-in-95">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900"><Lock className="w-5 h-5 text-gray-400" /> Superuser toegang</h2>
            {error && <p className="text-red-600 bg-red-50 p-2 text-sm mb-4 rounded-md font-medium border border-red-100">{error}</p>}
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">E-mailadres</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg p-2.5 outline-none focus:border-blue-500 transition-colors"
                  placeholder="vis@emmauscollege.nl"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Wachtwoord</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg p-2.5 outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setShowAdminLogin(false)} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">Annuleren</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors shadow-md shadow-blue-500/20">Inloggen</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="min-h-[100dvh] flex flex-col items-center justify-center px-4 relative z-10 pt-16 pb-32">
        <div className="bg-white/60 backdrop-blur-xl p-12 rounded-[3rem] shadow-2xl border border-white/60 flex flex-col items-center text-center max-w-2xl w-full mx-auto relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500"></div>
          
          <div className="w-20 h-20 bg-indigo-600 rounded-[1.5rem] shadow-xl flex items-center justify-center mb-8 transform rotate-3 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"></div>
            <span className="text-white font-black text-3xl tracking-tighter">EAI</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight text-slate-900 cursor-default select-none">
            EAI <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">CLASSROOM</span>
          </h1>
          
          <p className="text-slate-500 mb-10 text-lg max-w-lg font-medium leading-relaxed">
            De volgende generatie in interactief lesgeven. Real-time inzicht, AI-gestuurde feedback en direct contact met elke leerling.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full px-4 max-w-md mx-auto">
            <button onClick={() => navigate('/teacher/classroom')} className="flex-1 px-8 py-5 bg-indigo-600 text-white font-bold text-lg rounded-2xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1 active:translate-y-0 text-center">Docent</button>
            <button onClick={() => navigate('/student/classroom')} className="flex-1 px-8 py-5 bg-white border-2 border-slate-200 text-slate-800 font-bold text-lg rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-1 active:translate-y-0 text-center">Leerling</button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-gray-400 animate-bounce">
          <span className="text-sm font-semibold tracking-widest uppercase mb-2">Ontdek Meer</span>
          <ChevronDown className="w-6 h-6" />
        </div>
      </section>

      {/* Tutorial / Features Section */}
      <section className="py-24 px-4 relative z-10 antialiased">
        <div className="max-w-5xl mx-auto space-y-32">
          
          {/* Feature 1 */}
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">AI-ondersteunde inzichten</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Terwijl jouw leerlingen op hun eigen device werken, analyseert de EAI engine real-time waar leerlingen vastlopen. Met één druk op de knop genereert de AI een samenvatting van veelgemaakte fouten of moeilijke concepten.
              </p>
              <ul className="space-y-3 pt-4">
                <li className="flex items-center gap-3 text-gray-700 font-medium"><CheckCircle className="w-5 h-5 text-green-500" /> Directe formatieve evaluatie</li>
                <li className="flex items-center gap-3 text-gray-700 font-medium"><CheckCircle className="w-5 h-5 text-green-500" /> Automatische groepering van knelpunten</li>
              </ul>
            </div>
            <div className="flex-1 w-full relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-indigo-50 transform rotate-3 rounded-3xl"></div>
              <div className="bg-white p-8 rounded-3xl shadow-xl relative border border-gray-100 transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-100 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-100 rounded w-full"></div>
                  <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mt-6">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">AI Insight</span>
                    <p className="text-blue-900 mt-2 font-medium">3 leerlingen verwarren "Deductie" met "Inductie". Wil je dit klassikaal uitleggen?</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-16">
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Klassikale regie</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Behoud de volledige controle over de les. Zet schermen van leerlingen met één klik op zwart als je de aandacht nodig hebt, of geef specifieke leerlingen een time-out als ze zijn afgeleid.
              </p>
              <ul className="space-y-3 pt-4">
                <li className="flex items-center gap-3 text-gray-700 font-medium"><CheckCircle className="w-5 h-5 text-amber-500" /> Schermvergrendeling (Kijk naar docent)</li>
                <li className="flex items-center gap-3 text-gray-700 font-medium"><CheckCircle className="w-5 h-5 text-amber-500" /> Individuele 5-minuten time-outs</li>
                <li className="flex items-center gap-3 text-gray-700 font-medium"><CheckCircle className="w-5 h-5 text-amber-500" /> Leerlingen kicken of hernoemen</li>
              </ul>
            </div>
            <div className="flex-1 w-full relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-100 to-orange-50 transform -rotate-3 rounded-3xl"></div>
              <div className="bg-gray-900 p-8 rounded-3xl shadow-xl relative border border-gray-800 transform rotate-1 hover:rotate-0 transition-transform duration-500 flex flex-col items-center justify-center min-h-[250px] text-center">
                <Shield className="w-12 h-12 text-gray-500 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2 tracking-widest uppercase">Kijk naar de docent</h3>
                <p className="text-gray-400">Je scherm is tijdelijk vergrendeld.</p>
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Het interactieve digibord</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Gebruik het "Shared Signal" bord om leerlingenacties te projecteren. Geef leerlingen toestemming om te tekenen of te schrijven en laat hun werk direct na goedkeuring zien aan de rest van de klas.
              </p>
              <ul className="space-y-3 pt-4">
                <li className="flex items-center gap-3 text-gray-700 font-medium"><CheckCircle className="w-5 h-5 text-emerald-500" /> Deel opvallende antwoorden anoniem</li>
                <li className="flex items-center gap-3 text-gray-700 font-medium"><CheckCircle className="w-5 h-5 text-emerald-500" /> Wijs individuele tekenrechten toe</li>
              </ul>
            </div>
            <div className="flex-1 w-full relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100 to-teal-50 transform rotate-3 rounded-3xl"></div>
              <div className="bg-white p-8 rounded-3xl shadow-xl relative border border-gray-100 transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="border-2 border-dashed border-gray-200 rounded-xl h-48 flex items-center justify-center bg-gray-50">
                  <span className="text-green-600 font-bold text-2xl rotate-[-10deg]">Pieter's Oplossing 🎨</span>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  </div>
                  <button className="px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-lg text-sm">Deel op bord</button>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-16">
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Slimme Lesuitdraai (Print)</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Start je les digitaal of analoog! Na het invullen van je les-intake genereert EAI direct een compleet lesvoorbereidingssjabloon en uitknipbare leskaarten voor de docent.
              </p>
              <ul className="space-y-3 pt-4">
                <li className="flex items-center gap-3 text-gray-700 font-medium"><CheckCircle className="w-5 h-5 text-indigo-500" /> Kant-en-klare PDF uitdraai</li>
                <li className="flex items-center gap-3 text-gray-700 font-medium"><CheckCircle className="w-5 h-5 text-indigo-500" /> Handige leskaarten voor de lesfases</li>
              </ul>
            </div>
            <div className="flex-1 w-full relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 to-purple-50 transform -rotate-3 rounded-3xl"></div>
              <div className="bg-white p-8 rounded-3xl shadow-xl relative border border-gray-100 transform rotate-1 hover:rotate-0 transition-transform duration-500 flex flex-col min-h-[250px]">
                <div className="w-1/2 h-8 bg-indigo-50 rounded-lg mb-4"></div>
                <div className="w-full h-4 bg-gray-100 rounded mb-2"></div>
                <div className="w-5/6 h-4 bg-gray-100 rounded mb-6"></div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="h-24 border-2 border-indigo-100 rounded-xl bg-indigo-50/50 p-3">
                     <div className="text-[10px] font-bold text-indigo-400 uppercase">Leskaart start</div>
                   </div>
                   <div className="h-24 border-2 border-amber-100 rounded-xl bg-amber-50/50 p-3">
                     <div className="text-[10px] font-bold text-amber-500 uppercase">Leskaart check</div>
                   </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12 text-center relative z-10 w-full">
        <p className="font-medium">EAI Classroom Platform &copy; 2026</p>
      </footer>
    </div>
  );
};

export default function App() {
  useEffect(() => {
    // Fetch and apply global settings
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(settings => {
        if (settings.theme_color_primary) {
          document.documentElement.style.setProperty('--color-primary', settings.theme_color_primary);
        }
        if (settings.theme_font_family) {
          document.documentElement.style.setProperty('--font-family', settings.theme_font_family);
          document.body.style.fontFamily = settings.theme_font_family;
        }
        if (settings.app_title) {
          document.title = settings.app_title;
        }
      })
      .catch(err => console.error('Failed to load settings', err));
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/teacher/classroom" element={<TeacherClassroomPage />} />
        <Route path="/student/classroom" element={<StudentClassroomPage />} />
        <Route path="/board/:sessionCode" element={<ClassroomBoardPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
