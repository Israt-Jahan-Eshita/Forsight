import React from 'react';

export default function Privacy() {
  const policies = [
    {
      title: "Information We Collect",
      description: "We collect information necessary to provide a personalized academic experience. This includes basic account details (Name, Institutional Email, ID), lab participation data, algorithm execution metrics, and system interaction logs used by our EduLens engine.",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop", // Server/Data
      icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
    },
    {
      title: "How We Use Your Data",
      description: "Your data is utilized strictly for educational purposes. We use this information to populate student dashboards, generate performance analytics for educators, and improve the accuracy of our automated assessment algorithms.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop", // Analytics/Charts
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    },
    {
      title: "Data Sharing & Visibility",
      description: "Student analytical data regarding lab performance and grades is visible only to the student and their authorized instructors. We do not sell your personal or academic data to third parties. Data may be shared with your academic institution upon official request for administrative compliance.",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop", // Global/Network
      icon: "M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
    },
    {
      title: "Platform Security",
      description: "We implement industry-standard encryption to protect your data during transmission and storage. However, no digital platform is completely secure. We encourage users to use strong passwords and avoid sharing account credentials.",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop", // Cybersecurity/Lock
      icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    }
  ];

  return (
    <div className="min-h-screen bg-background pt-28 pb-20 font-sans animate-fade-in overflow-hidden">
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mb-20">
        <div className="bg-surface rounded-[2rem] p-10 lg:p-16 shadow-neuro-sm border border-text-muted/10 relative overflow-hidden flex flex-col lg:flex-row items-center gap-10">
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none"></div>
          
          <div className="flex-1 relative z-10 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-text-primary tracking-tight mb-6">
              Privacy <span className="text-blue-600">Policy</span>
            </h1>
            <p className="text-text-muted text-lg sm:text-xl max-w-2xl">
              Your data is the foundation of our analytics, and we protect it fiercely. Learn how FORSIGHT secures and utilizes your information to drive educational success.
            </p>
          </div>

          <div className="w-full lg:w-1/3 flex justify-center relative z-10">
            <div className="w-40 h-40 bg-background rounded-full shadow-neuro-inset flex items-center justify-center text-blue-600">
               <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
               </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Grid Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-2 gap-10">
        {policies.map((policy, idx) => (
          <div 
            key={idx} 
            className="group bg-surface rounded-[2rem] p-4 shadow-neuro-sm hover:shadow-neuro-hover transition-all flex flex-col overflow-hidden border border-transparent hover:border-blue-500/20"
          >
            {/* Card Image */}
            <div className="w-full h-48 sm:h-64 rounded-[1.5rem] overflow-hidden mb-8 relative">
              <img 
                src={policy.image} 
                alt={policy.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500"></div>
              
              {/* Icon Overlay */}
              <div className="absolute bottom-4 left-4 w-12 h-12 bg-blue-600/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-white shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={policy.icon}></path>
                </svg>
              </div>
            </div>

            {/* Card Content */}
            <div className="px-4 pb-6 flex-1 flex flex-col">
              <h3 className="text-2xl font-bold text-text-primary mb-4 group-hover:text-blue-600 transition-colors">
                {policy.title}
              </h3>
              <p className="text-text-muted text-base leading-relaxed">
                {policy.description}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}