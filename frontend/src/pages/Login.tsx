import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Settings, BookOpen } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const executeLogin = async (loginEmail: string, loginPass: string) => {
    setLoading(true);
    setErrorMsg('');
    
    try {
      await login(loginEmail, loginPass);
      setLoading(false);
      
      const savedUser = JSON.parse(localStorage.getItem('fs_user') || '{}');
      const actualRole = (savedUser.role || 'STUDENT').toLowerCase();
      
      if (actualRole === 'admin') navigate('/admin');
      else navigate('/dashboard');
      
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password. Is the backend running?');
      setLoading(false);
    }
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(email, password);
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

        <div className="mb-8 grid grid-cols-2 gap-4">
          <div 
            onClick={() => executeLogin('judge@forsight.com', 'judge123')}
            className="neu-raised bg-color-surface p-4 rounded-xl border border-white/50 cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all active:scale-95 text-center"
          >
            <div className="mb-2"><UserCheck className="w-8 h-8 text-color-accent mx-auto" /></div>
            <div className="text-xs font-bold text-color-accent uppercase">Judge View</div>
            <div className="text-[10px] text-color-muted mt-1 font-mono">judge@forsight.com</div>
          </div>
          <div 
            onClick={() => executeLogin('admin@forsight.com', 'admin123')}
            className="neu-raised bg-color-surface p-4 rounded-xl border border-white/50 cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all active:scale-95 text-center"
          >
            <div className="mb-2"><Settings className="w-8 h-8 text-color-accent mx-auto" /></div>
            <div className="text-xs font-bold text-color-accent uppercase">Admin View</div>
            <div className="text-[10px] text-color-muted mt-1 font-mono">admin@forsight.com</div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-black/10"></div>
          <div className="text-xs font-bold text-color-muted uppercase">OR MANUAL LOGIN</div>
          <div className="flex-1 h-px bg-black/10"></div>
        </div>

        <form onSubmit={handleManualLogin} className="flex flex-col gap-5">
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

          <Button 
            type="submit" 
            className="w-full h-12 text-base font-bold shadow-sm" 
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6">
          <Button 
            type="button" 
            variant="secondary"
            onClick={() => navigate('/docs')}
            className="w-full h-12 text-sm font-black italic font-serif shadow-sm bg-color-background text-color-accent border-2 border-color-accent/20 hover:border-color-accent hover:bg-color-accent hover:text-white transition-all flex items-center justify-center gap-2" 
          >
            <BookOpen className="w-4 h-4" /> View Pitch Deck & Tech Docs (/docs)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
