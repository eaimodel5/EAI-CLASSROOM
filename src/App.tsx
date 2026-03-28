import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import TeacherClassroomPage from './pages/TeacherClassroomPage';
import ClassroomBoardPage from './pages/ClassroomBoardPage';
import StudentClassroomPage from './pages/StudentClassroomPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import GridBackground from './components/GridBackground';

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
      <GridBackground />
      <div className="z-10 bg-white/80 backdrop-blur-sm p-12 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center text-center max-w-lg w-full">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl shadow-lg flex items-center justify-center mb-6 transform rotate-3">
          <span className="text-white font-bold text-2xl">EAI</span>
        </div>
        <h1 
          className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-gray-900 cursor-default select-none"
          onDoubleClick={() => navigate('/admin')}
        >
          EAI <span className="text-blue-600">CLASSROOM</span>
        </h1>
        <p className="text-gray-500 mb-10 text-lg">Kies je rol om te beginnen met de interactieve les.</p>
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <a href="/teacher/classroom" className="flex-1 px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1 text-center">Docent</a>
          <a href="/student/classroom" className="flex-1 px-8 py-4 bg-white border-2 border-gray-200 text-gray-800 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-1 text-center">Leerling</a>
        </div>
      </div>
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
