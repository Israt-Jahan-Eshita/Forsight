import { Bell, Menu } from 'lucide-react';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { role } = useAuth();
  
  // Mock greeting based on role
  const greeting = role === 'student' ? 'Hello, Sara 👋' : 'Good morning, Mr. Rahim';
  const subtext = role === 'teacher' ? 'Class 10 - Science' : '';
  const initials = role === 'student' ? 'S' : 'R';

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

      <div className="flex items-center gap-4">
        <Button variant="icon" className="relative">
          <Bell className="w-5 h-5 text-color-text" />
          {role === 'teacher' && (
             <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-color-danger rounded-full border-2 border-color-surface"></span>
          )}
        </Button>
        <div className="flex items-center gap-3 ml-2 pl-4 border-l border-black/10">
          {subtext && (
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-xs text-color-muted">{subtext}</span>
            </div>
          )}
          <Avatar fallback={initials} size="sm" className="w-9 h-9" />
        </div>
      </div>
    </header>
  );
}
