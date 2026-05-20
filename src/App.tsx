import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Lock, Presentation, Users, Brain, Shield, ChevronDown, CheckCircle, LogIn } from 'lucide-react';
import TeacherClassroomPage from './pages/TeacherClassroomPage';
import ClassroomBoardPage from './pages/ClassroomBoardPage';
import StudentClassroomPage from './pages/StudentClassroomPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import GridBackground from './components/GridBackground';
import { auth, db } from './lib/firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signInAnonymously } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-gray-50 relative flex flex-col font-sans">
      <div className="fixed inset-0 z-0">
        <GridBackground />
      </div>
      
      <button 
        onClick={() => navigate('/admin')}
        className="fixed top-4 right-4 p-3 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full shadow-sm text-gray-400 hover:text-gray-900 transition-colors z-50 border"
        title="Admin Login"
      >
        <Lock className="w-5 h-5" />
      </button>

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
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [globalAnnouncement, setGlobalAnnouncement] = useState<string>('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    // 1. Fetch initially for robustness
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
        if (settings.global_announcement) {
          setGlobalAnnouncement(settings.global_announcement);
        }
      })
      .catch(err => console.error('Failed to load settings', err));

    // 2. Real-time Firebase Firestore observer for live propagation of superuser settings
    const unsubSettings = onSnapshot(doc(db, 'admin_settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const settings = docSnap.data();
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
        setGlobalAnnouncement(settings.global_announcement || '');
      }
    }, (err) => {
      console.warn('Firestore settings listener error (expected if anonymous/offline):', err);
    });

    return () => unsubSettings();
  }, []);

  if (!authReady) {
    return <div className="flex h-screen w-screen items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {globalAnnouncement && (
        <div className="bg-red-600 text-white text-center px-4 py-2 font-bold text-xs md:text-sm z-[9999] shadow-md flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300">
          <span className="inline-block animate-pulse">⚠️</span> {globalAnnouncement}
        </div>
      )}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/teacher/classroom" element={user ? <TeacherClassroomPage /> : <GoogleLoginPrompt allowAnonymous />} />
          <Route path="/student/classroom" element={<StudentWrapper user={user} />} />
          <Route path="/board/:sessionCode" element={<BoardWrapper user={user} />} />
          <Route 
            path="/admin" 
            element={
              (user && !user.isAnonymous) || localStorage.getItem('admin_bypass_active') === 'true' 
                ? <AdminDashboardPage /> 
                : <GoogleLoginPrompt />
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

function GoogleLoginPrompt({ allowAnonymous = false }: { allowAnonymous?: boolean }) {
  const [showPinInput, setShowPinInput] = useState(false);
  const [pinCode, setPinCode] = useState('');

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCode === 'emmaus2026') {
      localStorage.setItem('admin_bypass_active', 'true');
      alert('Superuser bypass geactiveerd! Welkom.');
      window.location.reload();
    } else {
      alert('Onjuiste bypass-code.');
    }
  };

  return (
    <div className="flex h-[100dvh] w-screen flex-col items-center justify-center bg-gray-50 relative font-sans">
      <div className="fixed inset-0 z-0">
        <GridBackground />
      </div>
      <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-xl z-10 max-w-sm w-full mx-4 border border-white flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg flex items-center justify-center mb-6 transform rotate-3">
          <span className="text-white font-black text-2xl tracking-tighter">EAI</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Inloggen</h2>
        <p className="text-gray-500 mb-8 font-medium">Log in of ga anoniem door. Anonieme sessies worden niet bewaard.</p>
        
        <div className="w-full space-y-3">
          <button 
            onClick={() => {
              const provider = new GoogleAuthProvider();
              provider.setCustomParameters({ prompt: 'select_account' });
              signInWithPopup(auth, provider).catch(err => {
                if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
                  console.error('Google login failed:', err);
                  alert('Inloggen is mislukt. Zorg dat pop-ups zijn toegestaan en probeer het opnieuw.');
                }
              });
            }}
            className="w-full py-3 px-4 bg-white border-2 border-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
          >
            <LogIn className="w-5 h-5 text-indigo-600" />
            Inloggen met Google
          </button>

          {allowAnonymous && (
            <button 
              onClick={() => {
                signInAnonymously(auth).catch(err => {
                  console.error('Anonymous login failed:', err);
                  alert('Fout bij anoniem doorgaan.');
                });
              }}
              className="w-full py-3 px-4 bg-transparent border-2 border-transparent text-gray-500 font-bold rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center shadow-none hover:text-gray-700"
            >
              Anoniem doorgaan
            </button>
          )}

          <div className="pt-4 border-t border-gray-100 mt-4">
            {!showPinInput ? (
              <button
                onClick={() => setShowPinInput(true)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Inloggen met bypass-code?
              </button>
            ) : (
              <form onSubmit={handlePinSubmit} className="space-y-2 mt-2">
                <input
                  type="password"
                  placeholder="Voer bypass-code in"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none font-medium text-center"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPinInput(false)}
                    className="flex-1 py-1 px-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-lg transition-colors"
                  >
                    Annuleer
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-1 px-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors"
                  >
                    Inloggen
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentWrapper({ user }: { user: User | null }) {
  useEffect(() => {
    if (!user) {
      signInAnonymously(auth).catch(console.error);
    }
  }, [user]);

  if (!user) {
    return <div className="flex h-screen w-screen items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }
  return <StudentClassroomPage />;
}

function BoardWrapper({ user }: { user: User | null }) {
  useEffect(() => {
    if (!user) {
      signInAnonymously(auth).catch(console.error);
    }
  }, [user]);

  if (!user) {
    return <div className="flex h-screen w-screen items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }
  return <ClassroomBoardPage />;
}

