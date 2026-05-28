import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function BeforeLoginFeature() {
  const [activeTab, setActiveTab] = useState('student');
  const navigate = useNavigate();

  // Universal redirect for logged-out users
  const handleRequireLogin = () => {
    navigate('/login');
  };

  // Data for Student Features
  const studentFeatures = [
    {
      title: "Interactive Algorithms",
      description: "Stop guessing. Visually step through complex operating system logic, memory allocations, and CPU scheduling algorithms in real-time.",
      icon: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
    },
    {
      title: "Group Collaboration Hubs",
      description: "Your entire lab group, perfectly synced. Track combined Git commit histories and manage database projects in one unified workspace.",
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    },
    {
      title: "Research Environments",
      description: "Built for next-gen research. Manage massive datasets like medical time-series signals and monitor multilingual transformer pipelines.",
      icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
    },
    {
      title: "Automated Formatting",
      description: "Focus on the content. Export reports, exam-type questions, and thesis proposals directly into clean, standardized academic formats.",
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    }
  ];

  // Data for Teacher Features
  const teacherFeatures = [
    {
      title: "Precision Analytics (EduLens)",
      description: "Identify bottlenecks instantly. View real-time data on where students are struggling with syntax errors or algorithm logic to intervene effectively.",
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    },
    {
      title: "Advanced Access Control",
      description: "Complete command over virtual labs. Build custom access simulators, configure strict entry conditions, and monitor denied vs. approved requests.",
      icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    },
    {
      title: "Streamlined Distribution",
      description: "Deploy assignments with a single click. Push foundational code, datasets, or mandatory formatting templates directly to specific lab sections.",
      icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
    },
    {
      title: "Automated Assessments",
      description: "Save hours of grading. Generate comprehensive exam-type questions and automatically validate student algorithm outputs.",
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
    }
  ];

  const currentFeatures = activeTab === 'student' ? studentFeatures : teacherFeatures;

  return (
    <div className="min-h-screen bg-background pt-28 sm:pt-32 lg:pt-32 px-4 sm:px-8 pb-20 font-sans animate-fade-in">
      
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-text-primary leading-tight tracking-tight mb-6">
            Everything you need for <br /> <span className="text-blue-600">Academic Excellence</span>
          </h1>
          <p className="text-text-muted text-lg sm:text-xl">
            Whether you're learning complex algorithms or managing multiple lab sections, FORSIGHT has the tools designed specifically for your workflow.
          </p>
        </div>

        {/* Huge Neuromorphic Role Toggle */}
        <div className="flex bg-background rounded-[1.5rem] shadow-neuro-inset p-2 mb-16 w-full max-w-md">
          <button
            onClick={() => setActiveTab('student')}
            className={`flex-1 py-4 text-base sm:text-lg font-bold rounded-xl transition-all ${
              activeTab === 'student' 
                ? 'bg-surface shadow-neuro-sm text-blue-600' 
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            For Students
          </button>
          <button
            onClick={() => setActiveTab('teacher')}
            className={`flex-1 py-4 text-base sm:text-lg font-bold rounded-xl transition-all ${
              activeTab === 'teacher' 
                ? 'bg-surface shadow-neuro-sm text-blue-600' 
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            For Teachers
          </button>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 w-full mb-20">
          {currentFeatures.map((feature, idx) => (
            <div 
              key={idx}
              onClick={handleRequireLogin}
              className="group bg-surface rounded-[2rem] p-8 sm:p-10 shadow-neuro-sm hover:shadow-neuro-hover active:shadow-neuro-inset transition-all cursor-pointer flex flex-col border border-transparent hover:border-blue-500/30 relative overflow-hidden"
            >
              <div className="w-16 h-16 rounded-2xl shadow-neuro-inset bg-background flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={feature.icon}></path>
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold text-text-primary mb-4 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-text-muted text-base sm:text-lg leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Indicator */}
              <div className="absolute bottom-8 right-8 bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all shadow-lg">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Call to Action */}
        <div className="w-full bg-surface rounded-[2.5rem] p-10 sm:p-16 shadow-neuro-sm text-center flex flex-col items-center">
          <h2 className="text-3xl sm:text-4xl font-black text-text-primary mb-4">Ready to get started?</h2>
          <p className="text-text-muted text-lg mb-8 max-w-2xl">
            Join FORSIGHT today and unlock the full potential of your academic journey.
          </p>
          <button 
            onClick={handleRequireLogin}
            className="bg-blue-600 text-white font-bold px-10 py-5 rounded-xl shadow-neuro-sm hover:brightness-110 active:scale-95 transition-all text-lg uppercase tracking-wider"
          >
            Create Your Account
          </button>
        </div>

      </div>
    </div>
  );
}