import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const backgroundImages = [
  "https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop"
];

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [role, setRole] = useState('student'); // <-- Added Role State
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSignup = (e) => {
    e.preventDefault();
    alert(`Registration submitted successfully for ${role} role!`);
    navigate('/login'); 
  };

  const handleSocialSignup = (provider) => alert(`Initiating ${provider} Registration as ${role}...`);

  return (
    // Fixed padding: Added pt-28 lg:pt-32 to clear the navbar
    <div className="min-h-screen bg-background flex items-center justify-center p-4 pt-28 sm:p-6 sm:pt-32 lg:p-8 lg:pt-32 font-sans animate-fade-in relative">
      <div className="bg-surface w-full max-w-6xl rounded-[2rem] p-4 flex flex-col lg:flex-row-reverse gap-6 shadow-neuro transition-all animate-slide-up">
        
        {/* Right Side: Image Carousel */}
        <div 
          className="hidden lg:flex flex-col w-1/2 rounded-[1.5rem] bg-cover bg-center shadow-neuro-inset relative overflow-hidden transition-all duration-1000 ease-in-out" 
          style={{ backgroundImage: `url('${backgroundImages[currentImage]}')` }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
          <div className="relative h-full flex flex-col justify-end p-10">
            <h2 className="text-white font-bold text-3xl uppercase tracking-wide drop-shadow-lg leading-snug transition-opacity duration-500">
              Join <br/> FORSIGHT
            </h2>
            <p className="text-gray-200 mt-3 font-medium text-lg">Streamline your learning, elevate your research.</p>
            
            <div className="flex gap-2 mt-6">
              {backgroundImages.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all duration-500 ${currentImage === idx ? 'w-8 bg-blue-500' : 'w-4 bg-white/50'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Left Side: Form */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 lg:p-10 flex flex-col justify-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text-primary uppercase leading-tight mb-4 tracking-tight">
            Create Your <br /> Profile
          </h1>
          <p className="text-text-muted mb-6 text-sm sm:text-base">
            Register your account to connect with your resources and groups.
          </p>

          {/* Role Selector Toggle */}
          <div className="flex bg-background rounded-lg shadow-neuro-inset p-1 mb-2">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-md transition-all ${role === 'student' ? 'bg-surface shadow-neuro-sm text-blue-600' : 'text-text-muted hover:text-text-primary'}`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole('teacher')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-md transition-all ${role === 'teacher' ? 'bg-surface shadow-neuro-sm text-blue-600' : 'text-text-muted hover:text-text-primary'}`}
            >
              Teacher
            </button>
          </div>

          <form onSubmit={handleSignup} className="flex flex-col gap-5" autoComplete="off">
            <div>
              <label className="block text-sm font-semibold text-text-muted mb-2 px-1">Full Name</label>
              <input 
                type="text" 
                name="fullName"
                placeholder="Enter your full name" 
                required 
                autoComplete="off"
                className="w-full bg-background border-none rounded-lg px-4 py-3 text-sm text-text-primary shadow-neuro-inset focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-text-muted/40 transition-shadow" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-muted mb-2 px-1">Email Address</label>
              <input 
                type="email" 
                name="email"
                placeholder="Enter your email" 
                required 
                autoComplete="off"
                className="w-full bg-background border-none rounded-lg px-4 py-3 text-sm text-text-primary shadow-neuro-inset focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-text-muted/40 transition-shadow" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-muted mb-2 px-1">Create Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  placeholder="Set a secure password" 
                  required 
                  autoComplete="new-password"
                  className="w-full bg-background border-none rounded-lg px-4 py-3 text-sm text-text-primary shadow-neuro-inset focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-text-muted/40 transition-shadow" 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-blue-500 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full p-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                </button>
              </div>
            </div>

            <p className="text-sm text-text-muted mt-[-8px] px-1">
              Already registered? <Link to="/login" className="text-text-primary font-semibold hover:text-blue-500 underline decoration-2 underline-offset-4 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1">Log in here</Link>
            </p>

            <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-3.5 rounded-lg shadow-neuro-sm hover:brightness-110 active:scale-[0.98] transition-all mt-2 outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
              Register Account
            </button>
            
            <div className="flex items-center gap-4 my-2">
              <div className="h-px bg-text-muted/30 flex-1"></div>
              <span className="text-sm text-text-muted font-medium">Or register with</span>
              <div className="h-px bg-text-muted/30 flex-1"></div>
            </div>

            <div className="flex flex-col gap-4">
              <button type="button" onClick={() => handleSocialSignup('Google')} className="w-full flex items-center justify-center gap-2 bg-surface text-text-primary font-medium py-3 rounded-lg shadow-neuro-sm hover:shadow-neuro-hover active:shadow-neuro-inset active:scale-[0.98] transition-all outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" /> Sign up with Google
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}