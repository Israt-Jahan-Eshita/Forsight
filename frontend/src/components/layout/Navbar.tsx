import { useState, useEffect } from 'react';
import { Bell, Menu, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { role, user, token } = useAuth();
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Dynamic greeting based on actual user name
  const userName = user?.name || (role === 'student' ? 'Student' : 'Teacher');
  const greeting = role === 'student' ? `Hello, ${userName.split(' ')[0]} 👋` : `Welcome, ${userName}`;
  const subtext = role === 'teacher' ? 'Instructor Dashboard' : '';
  const initials = userName.charAt(0).toUpperCase();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/notifications', {
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
      const interval = setInterval(fetchNotifications, 60000); // Check for notifications every 60 seconds
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
    <header className="h-16 w-full flex items-center justify-between px-6 bg-color-surface rounded-b-[8px] shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)] z-10 sticky top-0">
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
          onClick={() => setDropdownOpen(!dropdownOpen)} 
          className="relative p-2 rounded-full cursor-pointer"
        >
          <Bell className="w-5 h-5 text-color-text" />
          {notifications.length > 0 && (
             <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-color-danger rounded-full border-2 border-color-surface animate-pulse"></span>
          )}
        </Button>

        {dropdownOpen && (
          <div className="absolute right-0 top-12 w-80 bg-color-surface border border-white/50 rounded-2xl shadow-[8px_8px_16px_var(--shadow-dark),-8px_-8px_16px_var(--shadow-light)] p-4 z-50 animate-fade-in max-h-96 overflow-y-auto custom-scrollbar">
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

        <div className="flex items-center gap-3 ml-2 pl-4 border-l border-black/10">
          {subtext && (
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-xs text-color-muted font-bold tracking-tight">{subtext}</span>
            </div>
          )}
          <Avatar fallback={initials} size="sm" className="w-9 h-9" />
        </div>
      </div>
    </header>
  );
}
