import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { 
  LayoutDashboard, Users, UploadCloud, 
  CheckSquare, MessageCircle, User, LogOut, Lightbulb, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { role, logout } = useAuth();
  
  const handleLinkClick = () => {
    if (window.innerWidth < 768 && onClose) {
      onClose();
    }
  };

  const teacherNav = [
    { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Students', path: '/students', icon: Users },
    { label: 'Resources', path: '/resources', icon: UploadCloud },
    { label: 'Submissions', path: '/submissions', icon: CheckSquare },
    { label: 'Messages', path: '/messages', icon: MessageCircle },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  const adminNav = [
    { label: 'Admin Home', path: '/admin', icon: LayoutDashboard },
    { label: 'Create Account', path: '/admin/registration', icon: Users },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  const studentNav = [
    { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Resources', path: '/resources', icon: UploadCloud },
    { label: 'Ask AI', path: '/ask-ai', icon: Lightbulb },
    { label: 'My Submissions', path: '/submissions', icon: CheckSquare },
    { label: 'Messages', path: '/messages', icon: MessageCircle },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  const navItems = role === 'student' ? studentNav : role === 'admin' ? adminNav : teacherNav;

  return (
    <aside className={cn(
      "h-full flex flex-col p-3 bg-color-background neu-inset rounded-r-[12px] shadow-[inset_-2px_0_4px_rgba(0,0,0,0.05)] shrink-0 transition-all duration-300 ease-in-out relative",
      "fixed md:relative inset-y-0 left-0 z-30",
      isOpen ? "translate-x-0 w-48" : "-translate-x-full md:translate-x-0 md:w-16 w-48"
    )}>
      <div className={cn("flex items-center justify-between px-3 py-4 mb-3", !isOpen && "md:justify-center")}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-color-surface flex items-center justify-center neu-raised shrink-0">
            <span className="text-color-accent font-bold text-sm font-serif">F</span>
          </div>
          <span className={cn(
            "text-base font-bold text-color-text tracking-wide transition-all duration-200", 
            !isOpen && "md:opacity-0 md:w-0 md:hidden"
          )}>
            Forsight
          </span>
        </div>
        <button 
          onClick={onClose}
          className="md:hidden p-1.5 rounded-full neu-raised hover:text-color-danger transition-colors cursor-pointer"
          aria-label="Close menu"
        >
          <X className="w-4 h-4 text-color-text" />
        </button>
      </div>

      <nav className="flex-1 flex flex-col gap-2 overflow-y-auto pr-2">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              className={cn(
                'group flex items-center gap-3 px-3 py-3 rounded-[12px] font-semibold text-sm transition-all duration-300',
                isActive
                  ? 'neu-inset text-color-accent'
                  : 'text-color-muted neu-raised hover:text-color-text',
                !isOpen && 'md:justify-center md:px-0'
              )}
              title={!isOpen ? item.label : undefined}
            >
              <item.icon className={cn(
                "w-[16px] h-[16px] shrink-0 transition-transform duration-300",
                !isActive && "group-hover:scale-110"
              )} />
              <span className={cn(
                "transition-all duration-300 whitespace-nowrap", 
                !isOpen && "md:opacity-0 md:w-0 md:hidden",
                !isActive && "group-hover:translate-x-1"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-black/5 shrink-0">
        <button 
          onClick={logout}
          className={cn(
            "group flex w-full items-center gap-3 px-3 py-3 rounded-[12px] font-semibold text-sm text-color-muted transition-all neu-raised hover:text-color-danger cursor-pointer",
            !isOpen && "md:justify-center md:px-0"
          )}
          title={!isOpen ? "Logout" : undefined}
        >
          <LogOut className="w-[16px] h-[16px] shrink-0 transition-transform duration-300 group-hover:-translate-x-1" />
          <span className={cn(
            "transition-all duration-300 whitespace-nowrap", 
            !isOpen && "md:opacity-0 md:w-0 md:hidden"
          )}>
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}
