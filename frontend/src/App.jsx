import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home'; 
import BeforeLoginFeature from './pages/BeforeLoginFeature';
import Terms from './pages/Terms';       
import Privacy from './pages/Privacy';   
import Profile from './pages/Profile';   // <-- 1. Import Profile
import { Navbar } from './components/layout/Navbar'; 
import { Footer } from './components/layout/Footer'; 

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<BeforeLoginFeature />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          
          {/* 2. Add the Profile Route */}
          <Route path="/profile" element={<Profile />} />
          
          <Route path="/dashboard" element={<div className="pt-32 p-8 text-text-primary text-center text-2xl font-bold">Dashboard Coming Soon</div>} />
          <Route path="/labs" element={<div className="pt-32 p-8 text-text-primary text-center text-2xl font-bold">Lab Resources Coming Soon</div>} />
          <Route path="/analytics" element={<div className="pt-32 p-8 text-text-primary text-center text-2xl font-bold">Analytics Coming Soon</div>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer /> 
    </BrowserRouter>
  );
}