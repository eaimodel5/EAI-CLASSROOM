import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TeacherClassroomPage from './pages/TeacherClassroomPage';
import ClassroomBoardPage from './pages/ClassroomBoardPage';
import StudentClassroomPage from './pages/StudentClassroomPage';

const LandingPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
    <h1 className="text-4xl font-bold mb-2 tracking-tight">EAI <span className="text-blue-600">CLASSROOM</span></h1>
    <p className="text-gray-600 mb-8">Kies je rol om te beginnen</p>
    <div className="flex gap-4">
      <a href="/teacher/classroom" className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">Docent</a>
      <a href="/student/classroom" className="px-6 py-3 bg-white border border-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm">Leerling</a>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/teacher/classroom" element={<TeacherClassroomPage />} />
        <Route path="/student/classroom" element={<StudentClassroomPage />} />
        <Route path="/board/:sessionCode" element={<ClassroomBoardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
