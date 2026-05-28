import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-color-background p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-color-accent/20 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#E6C77A]/20 blur-3xl" />
      
      <div className="z-10 w-full max-w-md animate-slide-up">
        <Outlet />
      </div>
    </div>
  );
}
