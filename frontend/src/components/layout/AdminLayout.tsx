import { Outlet } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';

export function AdminLayout() {
  return (
    <div className="flex flex-col h-screen w-full bg-color-background overflow-hidden relative">
      <header className="h-16 shrink-0 w-full flex items-center justify-between px-6 bg-color-surface shadow-[0_4px_8px_var(--shadow-dark)] z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-color-text flex items-center justify-center neu-raised">
            <span className="text-white font-bold text-sm font-serif">F</span>
          </div>
          <h1 className="text-xl font-bold text-color-text font-serif tracking-wide">Forsight</h1>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="icon">
            <Bell className="w-5 h-5 text-color-text" />
          </Button>
          <div className="flex items-center gap-3 ml-2 pl-4 border-l border-black/10">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-xs font-bold">Admin Panel</span>
            </div>
            <Avatar fallback="A" size="sm" className="w-9 h-9 bg-color-accent text-white" />
          </div>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
        <Outlet />
      </main>
    </div>
  );
}
