import { API_BASE_URL } from '../../config';
import { useState, useEffect } from 'react';
import { Bell, Menu, MessageSquare, CheckCircle, AlertCircle, ChevronDown, UserCheck, BookOpen } from 'lucide-react';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { role, user, token, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('fs_read_notifs');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Dynamic greeting based on actual user name
  const userName = user?.name || (role === 'student' ? 'Student' : 'Teacher');
  const greeting = role === 'student' ? `Hello, ${userName.split(' ')[0]} 👋` : `Welcome, ${userName}`;
  
  let subtext = '';
  if (role === 'teacher') {
    if (location.pathname.includes('student')) subtext = 'Student Analytics';
    else if (location.pathname.includes('submission')) subtext = 'Submissions Queue';
    else if (location.pathname.includes('resource')) subtext = 'Resource Manager';
    else if (location.pathname.includes('message')) subtext = 'Messages';
    else if (location.pathname.includes('profile')) subtext = 'Account Settings';
    else subtext = 'Instructor Dashboard';
  } else if (role === 'student') {
    if (location.pathname.includes('ask-ai')) subtext = 'AI Assistant';
    else if (location.pathname.includes('resource')) subtext = 'Study Materials';
    else if (location.pathname.includes('submission')) subtext = 'My Assignments';
    else if (location.pathname.includes('message')) subtext = 'Inbox';
    else if (location.pathname.includes('profile')) subtext = 'Student Profile';
    else subtext = 'Student Portal';
  } else if (role === 'admin') {
    subtext = 'System Administrator';
  }
  
  const initials = userName.charAt(0).toUpperCase();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/notifications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          setNotifications(await response.json());
        }
      } catch (e) {
        console.error("Failed to fetch notifications", e);
      }
    };

    if (token && token !== 'mock-jwt-token') {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000); // Check for notifications every 10 seconds
      return () => clearInterval(interval);
    }
  }, [token]);

  const formatTime = (timestampStr: string) => {
    try {
      const date = new Date(timestampStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  return (
    <header className="h-16 w-full flex items-center justify-between px-6 bg-color-surface rounded-b-[8px] shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)] z-50 sticky top-0">
      <div className="flex items-center gap-3 flex-1">
        <Button 
          variant="icon" 
          onClick={onMenuClick}
          className="p-2 rounded-full cursor-pointer shrink-0"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5 text-color-text" />
        </Button>
        <h2 className="text-lg font-bold font-serif text-color-text truncate">{greeting}</h2>
      </div>

      <div className="flex items-center gap-4 relative">
        <Button 
          variant="icon" 
          onClick={() => {
            const newOpen = !dropdownOpen;
            setDropdownOpen(newOpen);
            if (newOpen && notifications.length > 0) {
              setReadIds(prev => {
                const updated = new Set([...prev, ...notifications.map(n => n.id)]);
                localStorage.setItem('fs_read_notifs', JSON.stringify([...updated]));
                return updated;
              });
            }
          }} 
          className="relative p-2 rounded-full cursor-pointer"
        >
          <Bell className="w-5 h-5 text-color-text" />
          {notifications.filter(n => !readIds.has(n.id)).length > 0 && (
             <span className="absolute top-0 right-0 w-4 h-4 bg-color-danger text-black flex items-center justify-center text-[9px] font-bold rounded-full border border-color-surface animate-bounce shadow-sm">
               {notifications.filter(n => !readIds.has(n.id)).length}
             </span>
          )}
        </Button>

        {dropdownOpen && (
          <div className="absolute right-0 top-12 w-80 bg-white border border-black/10 rounded-2xl shadow-[0px_15px_40px_rgba(0,0,0,0.25)] p-4 z-[999999] isolate transform-gpu animate-fade-in max-h-96 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-black/5 pb-2 mb-2">
              <h3 className="font-bold text-sm text-color-text font-serif">Notifications</h3>
              {notifications.length > 0 && (
                <span className="text-[10px] bg-color-accent/15 text-color-accent px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {notifications.length} Active
                </span>
              )}
            </div>
            <div className="space-y-2">
              {notifications.length === 0 ? (
                <div className="py-6 text-center text-xs text-color-muted font-bold">
                  No new notifications
                </div>
              ) : (
                notifications.map((notif) => {
                  const Icon = notif.title.includes('Message') ? MessageSquare :
                               notif.title.includes('Graded') ? CheckCircle :
                               notif.title.includes('Awaiting') ? AlertCircle : Bell;
                  
                  const badgeColor = notif.type === 'success' ? 'text-color-success bg-color-success/10' :
                                    notif.type === 'warning' ? 'text-color-warning bg-color-warning/10' :
                                    notif.type === 'info' ? 'text-color-accent bg-color-accent/10' : 'text-color-muted bg-black/5';

                  return (
                    <div
                      key={notif.id}
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate(notif.link);
                      }}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-black/5 cursor-pointer transition-colors border border-transparent hover:border-black/5"
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${badgeColor}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-color-text font-serif leading-snug">{notif.title}</h4>
                        <p className="text-[10px] text-color-muted mt-0.5 leading-normal truncate">{notif.message}</p>
                        <span className="text-[9px] text-color-muted/80 block mt-1 font-mono">{formatTime(notif.timestamp)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Hackathon Demo Role Switcher */}
        <div className="relative border-l border-black/10 pl-4 hidden sm:block">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
            className="h-8 text-[10px] font-bold bg-color-accent/10 text-color-accent border border-color-accent/20 hover:bg-color-accent hover:text-white transition-all px-3"
          >
            Demo Switcher <ChevronDown className="w-3 h-3 ml-1" />
          </Button>

          {roleSwitcherOpen && (
            <div className="absolute right-0 top-10 w-48 bg-white border border-black/10 rounded-xl shadow-lg p-2 z-[999999] animate-fade-in flex flex-col gap-1">
              <div className="text-[9px] font-bold text-color-muted uppercase px-2 py-1">Quick Switch Role</div>
              
              {role !== 'teacher' && (
                <button 
                  onClick={async () => {
                    setRoleSwitcherOpen(false);
                    await login('judge@forsight.com', 'judge123');
                    navigate('/dashboard');
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-color-text hover:bg-black/5 rounded-lg text-left transition-colors"
                >
                  <UserCheck className="w-4 h-4 text-color-accent" /> Teacher / Judge
                </button>
              )}
              
              {role !== 'student' && (
                <button 
                  onClick={async () => {
                    setRoleSwitcherOpen(false);
                    await login('sara@forsight.com', 'student123');
                    navigate('/dashboard');
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-color-text hover:bg-black/5 rounded-lg text-left transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-color-accent" /> Student (Sara)
                </button>
              )}

              {role !== 'student' && (
                <button 
                  onClick={async () => {
                    setRoleSwitcherOpen(false);
                    await login('vikram@forsight.com', 'student123');
                    navigate('/dashboard');
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-color-danger hover:bg-color-danger/10 rounded-lg text-left transition-colors"
                >
                  <AlertCircle className="w-4 h-4 text-color-danger" /> At-Risk Student
                </button>
              )}
            </div>
          )}
        </div>
        
        <div 
          className="flex items-center gap-3 ml-2 pl-4 border-l border-black/10 cursor-pointer group"
          onClick={() => navigate('/profile')}
        >
          {subtext && (
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-xs text-color-muted font-bold tracking-tight group-hover:text-color-accent transition-colors">{subtext}</span>
            </div>
          )}
          <Avatar fallback={initials} src={user?.avatarUrl} size="sm" className="w-9 h-9 group-hover:shadow-md transition-shadow" />
        </div>
      </div>
    </header>
  );
}
