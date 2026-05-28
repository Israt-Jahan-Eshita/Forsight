import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const heroImages = [
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop"
];

const demoCourses = [
  {
    id: 1,
    title: "Machine Learning Engineer",
    duration: "12 months",
    lessons: "115 lessons",
    hours: "250 h",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=400&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Augmented Reality Designer",
    duration: "6 months",
    lessons: "54 lessons",
    hours: "120 h",
    image: "https://images.unsplash.com/photo-1617802690992-15d93263d3a9?q=80&w=400&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Quantum Computing Dev",
    duration: "24 months",
    lessons: "300+ lessons",
    hours: "500+ h",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=400&auto=format&fit=crop"
  }
];

export default function Home() {
  const [currentImage, setCurrentImage] = useState(0);
  const navigate = useNavigate();

  // Handle rotating images for the hero section
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Universal click handler for logged-out state
  const handleRequireLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background pt-28 pb-20 px-4 sm:px-8 font-sans animate-fade-in overflow-hidden">
      
      {/* --- HERO SECTION --- */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        
        {/* Left: Text & CTA */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center text-center lg:text-left z-10">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-text-primary leading-[1.1] tracking-tight mb-6">
            Discover <br className="hidden lg:block"/> the professions <br className="hidden lg:block"/> of the future
          </h1>
          <p className="text-text-muted text-lg sm:text-xl mb-10 max-w-2xl mx-auto lg:mx-0">
            Unlock the doors to the future job market and explore the most in-demand academic tracks and research fields with Forsight.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <button 
              onClick={handleRequireLogin}
              className="w-full sm:w-auto bg-blue-600 text-white font-bold px-8 py-4 rounded-xl shadow-neuro-sm hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
            >
              Start Learning Now
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
            <button 
              onClick={handleRequireLogin}
              className="w-full sm:w-auto bg-surface text-text-primary font-bold px-8 py-4 rounded-xl shadow-neuro-sm hover:shadow-neuro-hover active:shadow-neuro-inset transition-all uppercase tracking-wide text-sm border border-text-muted/10"
            >
              Choose a Specialty
            </button>
          </div>
        </div>

        {/* Right: Rotating Image Showcase */}
        <div className="w-full lg:w-1/2 relative h-[400px] sm:h-[500px] lg:h-[600px] w-full max-w-[600px] mx-auto rounded-[2rem] shadow-neuro overflow-hidden">
          {heroImages.map((img, idx) => (
            <div 
              key={idx}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${currentImage === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              style={{ backgroundImage: `url('${img}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
          ))}
          
          {/* Floating UI Element on Image */}
          <div className="absolute bottom-8 left-8 right-8 z-20 bg-surface/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <div>
                <p className="text-text-primary font-bold">Interactive Labs</p>
                <p className="text-text-muted text-sm">Access 500+ practical sessions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- COURSES / FOCUS AREAS SECTION --- */}
      <div className="max-w-7xl mx-auto mt-32">
        
        <div className="flex items-center gap-4 mb-10">
          <h2 className="text-3xl sm:text-4xl font-black text-text-primary">Professions</h2>
          <span className="bg-surface text-text-primary font-bold py-1 px-3 rounded-lg shadow-neuro-inset text-sm border border-text-muted/20">
            {demoCourses.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {demoCourses.map((course) => (
            <div 
              key={course.id}
              onClick={handleRequireLogin}
              className="group bg-surface rounded-[2rem] p-6 shadow-neuro-sm hover:shadow-neuro-hover active:shadow-neuro-inset transition-all cursor-pointer flex flex-col relative overflow-hidden border border-transparent hover:border-blue-500/30"
            >
              {/* Card Image area */}
              <div className="h-48 rounded-xl bg-cover bg-center mb-6 shadow-neuro-inset relative overflow-hidden" style={{ backgroundImage: `url('${course.image}')` }}>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
              </div>
              
              <h3 className="text-xl font-bold text-text-primary mb-6 group-hover:text-blue-600 transition-colors">
                {course.title}
              </h3>
              
              <div className="mt-auto flex flex-wrap gap-2">
                <span className="text-xs font-semibold text-text-muted bg-background px-3 py-1.5 rounded-full shadow-neuro-inset">
                  {course.duration}
                </span>
                <span className="text-xs font-semibold text-text-muted bg-background px-3 py-1.5 rounded-full shadow-neuro-inset">
                  {course.lessons}
                </span>
                <span className="text-xs font-semibold text-text-muted bg-background px-3 py-1.5 rounded-full shadow-neuro-inset">
                  {course.hours}
                </span>
              </div>
              
              {/* Overlay hover effect */}
              <div className="absolute top-4 right-4 bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all shadow-lg">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}