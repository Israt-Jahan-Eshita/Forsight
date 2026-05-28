import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth, type Role } from '../context/AuthContext';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [roleSelect, setRoleSelect] = useState<Role>('teacher');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call and role detection
    setTimeout(() => {
      setLoading(false);
      login(roleSelect);
      
      if (roleSelect === 'admin') navigate('/admin');
      else if (roleSelect === 'teacher') navigate('/dashboard');
      else navigate('/dashboard');
    }, 1000);
  };

  return (
    <Card className="p-8 pb-10 w-full animate-slide-up shadow-[16px_16px_32px_var(--shadow-dark),-16px_-16px_32px_var(--shadow-light)] border border-white/50">
      <CardHeader className="text-center pb-6 border-none">
        <h1 className="text-3xl font-bold text-color-text font-serif">Forsight</h1>
        <p className="text-color-muted mt-2 text-sm">Sign in to your account</p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <Input 
            label="Email" 
            type="email"
            placeholder="Enter your email" 
            required 
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="Enter your password" 
            required 
          />
          
          {/* MOCK: Dropdown to select role for testing purposes since there is no real backend */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-color-muted ml-1">Mock Role Selection (Testing)</label>
            <select 
              value={roleSelect || ''}
              onChange={(e) => setRoleSelect(e.target.value as Role)}
              className="neu-inset w-full px-4 py-2 text-color-text bg-color-surface focus:outline-none focus:ring-2 focus:ring-accent transition-all"
            >
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
          </div>

          <Button 
            type="submit" 
            className="w-full mt-4 h-12 text-base shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)]" 
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="text-center mt-6">
          <p className="text-xs text-color-muted">Contact your admin if you don't have access.</p>
        </div>
      </CardContent>
    </Card>
  );
}
