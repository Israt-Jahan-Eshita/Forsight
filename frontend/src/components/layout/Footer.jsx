import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function Footer() {
  const navigate = useNavigate();

  const handleRequireLogin = () => {
    navigate('/login');
  };

  const currentYear = new Date().getFullYear();

  return (
    // Highlighter Effect: Added a thick blue top border and a subtle upward glow
    <footer className="w-full bg-surface pt-16 pb-8 border-t-4 border-blue-600 shadow-[0_-10px_40px_rgba(37,99,235,0.05)] relative z-10 font-sans mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* CTA Banner */}
        <div className="w-full bg-background rounded-[2rem] p-8 lg:p-12 shadow-neuro-inset mb-12 flex flex-col lg:flex-row items-center justify-between gap-8 border border-text-muted/10 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none"></div>

          <div className="text-center lg:text-left flex-1 relative z-10">
            <h2 className="text-3xl lg:text-4xl font-black text-text-primary mb-4">
              Experience superior academic analytics
            </h2>
            <p className="text-text-muted text-base lg:text-lg max-w-2xl mx-auto lg:mx-0">
              Analyze student progress across 150+ distinct data points with our powerful EduLens engine.
            </p>
          </div>

          <button 
            onClick={handleRequireLogin}
            className="bg-blue-600 text-white font-bold px-8 py-4 rounded-xl shadow-neuro-sm hover:brightness-110 active:scale-95 transition-all uppercase tracking-wide text-sm shrink-0 relative z-10"
          >
            Get Started Now
          </button>
        </div>

        {/* Footer Top Row: Branding and Horizontal Links */}
        <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-8 mb-8">
          
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-neuro-sm shrink-0">
              F
            </div>
            <span className="ml-3 font-black text-xl tracking-widest text-text-primary uppercase">
              Forsight
            </span>
          </div>

          <div className="flex flex-col items-center lg:items-end gap-4">
            <div className="flex flex-wrap justify-center lg:justify-end gap-x-6 gap-y-2 text-sm font-semibold text-text-muted">
              <Link to="/features" className="hover:text-blue-500 transition-colors">Features</Link>
              <Link to="#" onClick={handleRequireLogin} className="hover:text-blue-500 transition-colors">Research Focus</Link>
              <Link to="#" onClick={handleRequireLogin} className="hover:text-blue-500 transition-colors">Our Team</Link>
              <Link to="#" onClick={handleRequireLogin} className="hover:text-blue-500 transition-colors">Contact Us</Link>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-end gap-x-6 gap-y-2 text-xs font-medium text-text-muted/70">
              {/* Linked the new Legal Pages */}
              <Link to="/terms" className="hover:text-text-primary transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="hover:text-text-primary transition-colors">Privacy Policy</Link>
              <Link to="#" onClick={handleRequireLogin} className="hover:text-text-primary transition-colors">LinkedIn</Link>
              <Link to="#" onClick={handleRequireLogin} className="hover:text-text-primary transition-colors">Twitter</Link>
            </div>
          </div>
        </div>

        {/* Footer Bottom Row: Contact Info & Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-6 border-t border-text-muted/20 text-xs text-text-muted">
          
          <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-2">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              AUST, Dhaka, Bangladesh {/* <-- Updated Location */}
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
              +880 1700-000000
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              support@forsight.ac.bd
            </span>
          </div>

          <p className="text-center md:text-right">
            &copy; {currentYear} FORSIGHT BD Academic Analytics. All rights reserved.
          </p>

        </div>
      </div>
    </footer>
  );
}