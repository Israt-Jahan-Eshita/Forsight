import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthLayout } from './components/layout/AuthLayout';
import { DesktopLayout } from './components/layout/DesktopLayout';
import { Login } from './pages/Login';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { StudentDetail } from './pages/StudentDetail';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminRegistration } from './pages/AdminRegistration';
import { TeacherResources } from './pages/TeacherResources';
import { TeacherSubmissions } from './pages/TeacherSubmissions';
import { Messages } from './pages/Messages';
import { RiskDashboard } from './pages/RiskDashboard';
import { TeacherStudentsList } from './pages/TeacherStudentsList';

import { StudentHome } from './pages/StudentHome';
import { StudentResources } from './pages/StudentResources';
import { StudentAskAI } from './pages/StudentAskAI';
import { StudentSubmissions } from './pages/StudentSubmissions';
import { StudentQuizzes } from './pages/StudentQuizzes';
import { Profile } from './pages/Profile';
import { useAuth } from './context/AuthContext';

function AppRoutes() {
  const { role } = useAuth();
  
  // Dynamic Security Route Guard
  if (!role) {
    return (
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }
  
  return (
    <Routes>
      <Route element={<DesktopLayout />}>
        {/* Dynamic routing based on authenticated role */}
        <Route path="/dashboard" element={
          role === 'student' ? <StudentHome /> : 
          role === 'admin' ? <AdminDashboard /> : 
          <TeacherDashboard />
        } />
        
        {/* Admin Specific Screens */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/registration" element={<AdminRegistration />} />
        
        {/* Teacher/Student Cohorts */}
        <Route path="/students" element={<TeacherStudentsList />} />
        <Route path="/students/:id" element={<StudentDetail />} />
        <Route path="/teacher/student/:id" element={<StudentDetail />} />
        <Route path="/teacher/risk-dashboard" element={<RiskDashboard />} />
        <Route path="/resources" element={role === 'student' ? <StudentResources /> : <TeacherResources />} />
        <Route path="/ask-ai" element={<StudentAskAI />} />
        <Route path="/submissions" element={role === 'student' ? <StudentSubmissions /> : <TeacherSubmissions />} />
        <Route path="/quizzes" element={role === 'student' ? <StudentQuizzes /> : <Navigate to="/resources" replace />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/profile" element={<Profile />} />
        
        {/* Wildcard Fallbacks */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
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
