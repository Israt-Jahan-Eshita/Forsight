import React, { useState, useEffect } from 'react';

export default function Terms() {
  const [activeSection, setActiveSection] = useState(0);

  const sections = [
    {
      id: "integrity",
      title: "1. Academic Integrity",
      description: "FORSIGHT is designed to facilitate learning, research, and laboratory management. Users must adhere to the highest standards of academic integrity. Using the platform to facilitate plagiarism, share unauthorized examination materials, or bypass automated assessments is strictly prohibited and may result in immediate account termination.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop", 
    },
    {
      id: "roles",
      title: "2. User Accounts & Roles",
      description: "Accounts are designated by role (e.g., Student, Teacher). You are responsible for maintaining the confidentiality of your login credentials. Teachers are granted elevated access to simulate lab environments and view student analytics; this access must be used solely for educational and administrative purposes.",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000&auto=format&fit=crop", 
    },
    {
      id: "intellectual",
      title: "3. Intellectual Property",
      description: "All code snippets, algorithms, and research pipelines provided by FORSIGHT remain the intellectual property of the platform. User-generated content, including thesis proposals and submitted lab assignments, remains the property of the respective user or their affiliated institution.",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop", 
    },
    {
      id: "liability",
      title: "4. Limitation of Liability",
      description: "FORSIGHT is provided 'as is.' We do not guarantee uninterrupted access to virtual labs or flawless automated grading. We are not liable for any academic penalties incurred due to system downtime or data loss.",
      image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=1000&auto=format&fit=crop", 
    }
  ];

  // Scroll Spy Logic: Highlights the sidebar item based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 250; // Offset for the fixed header

      sections.forEach((section, index) => {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(index);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to section when clicking the sidebar
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 120, // Offset so the navbar doesn't cover the title
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pt-28 pb-20 font-sans animate-fade-in relative">
      
      {/* Hero Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mb-16 text-center lg:text-left">
        <div className="inline-block bg-surface px-6 py-2 rounded-full shadow-neuro-inset text-blue-600 font-bold text-sm mb-6">
          Last Updated: May 2026
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-text-primary tracking-tight mb-4">
          Terms of <span className="text-blue-600">Service</span>
        </h1>
        <p className="text-text-muted text-lg sm:text-xl max-w-2xl lg:mx-0 mx-auto">
          The rules of the game for academic excellence. Please read carefully before utilizing the FORSIGHT platform.
        </p>
      </div>

      {/* Two-Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col lg:flex-row gap-12">
        
        {/* Left Column: Sticky Sidebar */}
        <div className="hidden lg:block w-1/3 relative">
          <div className="sticky top-32 bg-surface rounded-[2rem] p-8 shadow-neuro-sm border border-text-muted/10">
            <h3 className="text-lg font-black text-text-primary mb-6 uppercase tracking-wider">
              Contents
            </h3>
            <ul className="flex flex-col gap-4">
              {sections.map((section, idx) => (
                <li key={section.id}>
                  <button
                    onClick={() => scrollToSection(section.id)}
                    className={`text-left w-full text-sm font-bold transition-all duration-300 ${
                      activeSection === idx 
                        ? 'text-blue-600 translate-x-2' 
                        : 'text-text-muted hover:text-text-primary hover:translate-x-1'
                    }`}
                  >
                    {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Content Sections */}
        <div className="w-full lg:w-2/3 flex flex-col gap-16">
          {sections.map((section, idx) => (
            <div 
              key={section.id} 
              id={section.id} 
              className="bg-surface rounded-[2rem] shadow-neuro-sm border border-text-muted/10 overflow-hidden group"
            >
              {/* Massive Image Banner for each section */}
              <div className="w-full h-48 sm:h-64 overflow-hidden relative">
                <img 
                  src={section.image} 
                  alt={section.title} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                
                {/* Floating Title over the image */}
                <div className="absolute bottom-6 left-8">
                  <h2 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">
                    {section.title}
                  </h2>
                </div>
              </div>

              {/* Text Content Area */}
              <div className="p-8 sm:p-10">
                <div className="w-12 h-1 bg-blue-600 rounded-full mb-6"></div>
                <p className="text-text-muted text-base sm:text-lg leading-relaxed">
                  {section.description}
                </p>
              </div>
            </div>
          ))}

          {/* Bottom Agreement Block */}
          <div className="bg-blue-600 rounded-[2rem] p-10 mt-8 text-center shadow-lg relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 blur-[80px] rounded-full pointer-events-none"></div>
            <h3 className="text-2xl font-bold text-white mb-3 relative z-10">Acceptance of Terms</h3>
            <p className="text-white/80 relative z-10">
              By continuing to use the FORSIGHT BD Academic Analytics platform, or by registering an account, you officially acknowledge and agree to these terms.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}