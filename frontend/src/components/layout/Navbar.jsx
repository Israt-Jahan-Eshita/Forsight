import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useAuth } from '../../context/AuthContext';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Grab the global user state and logout function
  const { user, logout } = useAuth(); 

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);

    handleResize(); 
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const isSidebar = isScrolled && isDesktop;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Check if 'user' exists to determine which links to show
  const navLinks = user 
    ? [
        { name: 'Dashboard', path: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { name: 'Lab Resources', path: '/labs', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
        { name: 'Analytics', path: '/analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
      ]
    : [
        { name: 'Home', path: '/', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { name: 'Features', path: '/features', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
      ];

  return (
    <nav 
      className={`fixed z-50 transition-all duration-500 ease-in-out bg-surface shadow-neuro flex 
      ${isSidebar 
        ? 'flex-col top-1/4 left-6 py-8 px-4 rounded-[2rem] gap-10 w-20' 
        : `flex-row left-1/2 -translate-x-1/2 w-[95%] max-w-7xl px-4 md:px-8 items-center justify-between ${
            isScrolled ? 'top-2 py-2 sm:py-3 rounded-2xl shadow-neuro-sm' : 'top-4 sm:top-6 py-3 sm:py-4 rounded-2xl'
          }`
      }`}
    >
      <div className="flex items-center justify-center shrink-0">
        <Link to={user ? "/dashboard" : "/"} className="w-10 h-10 rounded-xl shadow-neuro-inset bg-blue-600 flex items-center justify-center text-white font-black text-xl transition-transform hover:scale-105">
          F
        </Link>
        {!isSidebar && (
          <span className="ml-3 font-black text-lg md:text-xl tracking-widest text-text-primary uppercase hidden sm:block">
            Forsight
          </span>
        )}
      </div>

      <div className={`flex ${isSidebar ? 'flex-col gap-8' : 'flex-row gap-2 sm:gap-6'} items-center`}>
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link key={link.name} to={link.path} className="relative group flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg p-2">
              <div className={`transition-colors ${isActive ? 'text-blue-600' : 'text-text-muted group-hover:text-blue-500'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d={link.icon}></path>
                </svg>
              </div>
              
              {!isSidebar ? (
                <span className={`ml-2 text-sm font-semibold transition-colors hidden md:block ${isActive ? 'text-blue-600' : 'text-text-muted group-hover:text-text-primary'}`}>
                  {link.name}
                </span>
              ) : (
                <span className="absolute left-14 bg-surface text-text-primary shadow-neuro-sm px-3 py-1.5 rounded-lg text-sm font-semibold opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all whitespace-nowrap">
                  {link.name}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <div className={`flex ${isSidebar ? 'flex-col gap-6' : 'flex-row gap-3 sm:gap-6'} items-center shrink-0`}>
        <ThemeToggle />
        
        {isSidebar && <div className="w-8 h-px bg-text-muted/30"></div>}
        {!isSidebar && <div className="h-6 w-px bg-text-muted/30 hidden sm:block"></div>}

        {user ? (
          <div className={`flex items-center gap-4 ${isSidebar ? 'flex-col' : 'flex-row'}`}>
            <Link 
              to="/profile"
              title="View Profile"
              className="flex items-center gap-3 cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full pr-2"
            >
              <div className="w-10 h-10 rounded-full shadow-neuro-inset bg-surface border-2 border-blue-500 flex items-center justify-center text-blue-600 font-bold group-hover:bg-blue-50 transition-colors shrink-0">
                {user.initial}
              </div>
              {!isSidebar && (
                <div className="flex-col hidden lg:flex">
                  <span className="text-sm font-bold text-text-primary group-hover:text-blue-600 transition-colors">{user.name}</span>
                  <span className="text-xs text-text-muted font-medium capitalize">{user.role}</span>
                </div>
              )}
            </Link>
            
            <button 
              onClick={handleLogout} 
              className="text-text-muted hover:text-red-500 transition-colors p-2 rounded-full hover:bg-surface shadow-neuro-sm active:shadow-neuro-inset outline-none focus-visible:ring-2 focus-visible:ring-red-500" 
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
            </button>
          </div>
        ) : (
          <div className={`flex ${isSidebar ? 'flex-col gap-4' : 'flex-row gap-2 sm:gap-4'} items-center`}>
            {!isSidebar && (
              <Link to="/login" className="text-sm font-semibold text-text-muted hover:text-text-primary transition-colors hidden sm:block outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1">
                Login
              </Link>
            )}
            <Link to="/signup" className={`bg-blue-600 text-white font-semibold rounded-lg shadow-neuro-sm hover:brightness-110 active:scale-95 transition-all flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${isSidebar ? 'w-10 h-10 p-0' : 'px-4 py-2 text-sm'}`}>
              {isSidebar ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
              ) : (
                "Register"
              )}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}