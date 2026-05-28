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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [modeNotice, setModeNotice] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setModeNotice('');
    
    try {
      // 1. Attempt actual Spring Boot API Authentication
      await login(email, password);
      setLoading(false);
      
      // Redirect based on the actual authenticated user's role
      const savedUser = JSON.parse(localStorage.getItem('fs_user') || '{}');
      const actualRole = (savedUser.role || 'STUDENT').toLowerCase();
      
      if (actualRole === 'admin') navigate('/admin');
      else navigate('/dashboard');
      
    } catch (err: any) {
      // 2. Handle network offline or auth failure
      const isNetworkError = err.message.includes('Failed to fetch') || err.message.includes('NetworkError');
      
      if (isNetworkError) {
        // Automatically fallback to offline Preview Mode for rapid developer testing
        setModeNotice('Spring Boot server offline. Launching in Offline Preview Mode...');
        
        setTimeout(() => {
          login(roleSelect || 'teacher'); // Trigger simple preview login
          setLoading(false);
          if (roleSelect === 'admin') navigate('/admin');
          else navigate('/dashboard');
        }, 1500);
      } else {
        // Actual authentication refusal
        setErrorMsg(err.message || 'Invalid email or password');
        setLoading(false);
      }
    }
  };

  return (
    <Card className="p-8 pb-10 w-full animate-slide-up shadow-[16px_16px_32px_var(--shadow-dark),-16px_-16px_32px_var(--shadow-light)] border border-white/50">
      <CardHeader className="text-center pb-6 border-none">
        <h1 className="text-3xl font-bold text-color-text font-serif">Forsight</h1>
        <p className="text-color-muted mt-2 text-sm">Sign in to your account</p>
      </CardHeader>
      
      <CardContent>
        {errorMsg && (
          <div className="mb-4 p-3 bg-color-danger/10 text-color-danger font-medium rounded-xl text-center text-xs neu-inset">
            {errorMsg}
          </div>
        )}

        {modeNotice && (
          <div className="mb-4 p-3 bg-color-warning/15 text-color-accent font-medium rounded-xl text-center text-xs neu-inset border-l-4 border-color-warning animate-pulse-soft">
            {modeNotice}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <Input 
            label="Email" 
            type="email"
            placeholder="Enter your email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="Enter your password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          
          {/* MOCK/FALLBACK: Dropdown to select role for previewing when backend is offline */}
          <div className="flex flex-col gap-1.5 w-full mt-2">
            <label className="text-xs font-semibold text-color-muted ml-1 uppercase tracking-wider">
              Offline Preview Target Role
            </label>
            <select 
              value={roleSelect || ''}
              onChange={(e) => setRoleSelect(e.target.value as Role)}
              className="neu-inset w-full px-4 py-2.5 text-color-text bg-color-surface focus:outline-none focus:ring-2 focus:ring-accent transition-all cursor-pointer rounded-xl font-medium"
            >
              <option value="admin">Admin Dashboard</option>
              <option value="teacher">Teacher Portal</option>
              <option value="student">Student Portal</option>
            </select>
            <span className="text-[10px] text-color-muted ml-1">
              * Note: If the backend is running, this dropdown is bypassed and actual DB credentials are used.
            </span>
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
