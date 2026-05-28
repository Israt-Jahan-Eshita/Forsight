import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthLayout } from './components/layout/AuthLayout';
import { DesktopLayout } from './components/layout/DesktopLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { Login } from './pages/Login';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { StudentDetail } from './pages/StudentDetail';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminRegistration } from './pages/AdminRegistration';
import { TeacherResources } from './pages/TeacherResources';
import { TeacherSubmissions } from './pages/TeacherSubmissions';
import { TeacherQuizManager } from './pages/TeacherQuizManager';
import { Messages } from './pages/Messages';

import { StudentHome } from './pages/StudentHome';
import { StudentResources } from './pages/StudentResources';
import { StudentAskAI } from './pages/StudentAskAI';
import { StudentSubmissions } from './pages/StudentSubmissions';
import { StudentQuizzes } from './pages/StudentQuizzes';
import { Profile } from './pages/Profile';
import { useAuth } from './context/AuthContext';

function AppRoutes() {
  const { role } = useAuth();
  
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>
      
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/registration" element={<AdminRegistration />} />
      </Route>
      
      <Route element={<DesktopLayout />}>
        {/* Dynamic routing based on mock role */}
        <Route path="/dashboard" element={role === 'student' ? <StudentHome /> : <TeacherDashboard />} />
        <Route path="/students" element={<TeacherDashboard />} />
        <Route path="/students/:id" element={<StudentDetail />} />
        <Route path="/resources" element={role === 'student' ? <StudentResources /> : <TeacherResources />} />
        <Route path="/ask-ai" element={<StudentAskAI />} />
        <Route path="/submissions" element={role === 'student' ? <StudentSubmissions /> : <TeacherSubmissions />} />
        <Route path="/quizzes" element={role === 'student' ? <StudentQuizzes /> : <TeacherQuizManager />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
