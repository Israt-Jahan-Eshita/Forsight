import { API_BASE_URL } from '../config';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { MoreVertical, Key, Copy, Check, CheckCircle2, Sparkles, X, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MockUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

export function AdminRegistration() {
  const { register, token } = useAuth();
  const [users, setUsers] = useState<MockUser[]>([]);
  const [role, setRole] = useState('TEACHER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // State for password showcase modal
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [latestUser, setLatestUser] = useState<MockUser | null>(null);

  // Load all users from backend on component mount
  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      if (!token || token === 'mock-jwt-token') {
        // Mock fallback data in preview mode
        setUsers([
          { id: 1, name: 'Rahim Khan', email: 'rahim@school.edu', role: 'TEACHER', status: 'Active' },
          { id: 2, name: 'Sara Rahman', email: 'sara@student.edu', role: 'STUDENT', status: 'Active' },
        ]);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/messages/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (e) {
      console.error("Failed to fetch users, running in preview mode");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setLoading(true);
    setErrorMsg('');

    try {
      if (!token || token === 'mock-jwt-token') {
        // Preview fallback logic
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const pass = `FS_${name.split(' ')[0] || 'User'}_${randomNum}!`;
        const newUser: MockUser = {
          id: users.length + 1,
          name,
          email,
          role,
          status: 'Active',
        };
        setUsers([newUser, ...users]);
        setLatestUser(newUser);
        setGeneratedPassword(pass);
        setShowModal(true);
        setCopied(false);
        setName('');
        setEmail('');
        setLoading(false);
        return;
      }

      // Real registration request
      const data = await register(name, email, role);
      
      setLatestUser(data.user);
      setGeneratedPassword(data.rawPassword);
      setShowModal(true);
      setCopied(false);

      // Reset fields & reload users list
      setName('');
      setEmail('');
      fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] w-full overflow-hidden rounded-2xl p-6 md:p-10 bg-gradient-to-tr from-[#F1EFF7] via-[#FAF9FC] to-[#EFF1FA] border border-white/40 shadow-sm animate-fade-in">
      
      {/* Drifting premium glowing blur circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-color-accent/15 blur-[120px] animate-float pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#E6C77A]/15 blur-[120px] animate-float pointer-events-none" style={{ animationDelay: '-3s' }} />

      <div className="relative z-10 max-w-4xl mx-auto space-y-10">
        
        {/* Header section with micro-animation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-slide-up">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="secondary" onClick={() => window.history.back()} className="h-8 w-8 p-0 flex items-center justify-center rounded-full" title="Go Back">
                <ArrowLeft className="w-4 h-4 text-color-muted" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-color-accent animate-pulse-soft" />
              <span className="text-xs font-bold uppercase tracking-wider text-color-accent">System Administrator</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-color-text font-serif mt-1">Create Account</h1>
            <p className="text-color-muted mt-1 text-sm md:text-base">Provision new secure accounts for teachers and students.</p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-color-danger/10 text-color-danger font-medium rounded-xl text-center text-sm neu-inset animate-slide-up">
            {errorMsg}
          </div>
        )}

        {/* Form Card with hover effects & neumorphic styling */}
        <Card className="neu-raised border border-white/50 backdrop-blur-xs bg-color-surface/80 p-6 md:p-8 animate-scale-in transition-all duration-300 hover:shadow-[12px_12px_24px_var(--shadow-dark),-12px_-12px_24px_var(--shadow-light)]">
          <CardHeader className="p-0 pb-4 mb-6 border-b border-black/5">
            <h3 className="text-xl font-bold text-color-text font-serif">Account Details</h3>
          </CardHeader>
          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Full Name" 
                placeholder="e.g., Rahim Khan" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full transition-all duration-200 focus:scale-[1.01]"
              />
              <Input 
                label="Email Address" 
                type="email" 
                placeholder="name@school.edu" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full transition-all duration-200 focus:scale-[1.01]"
              />
              
              <div className="flex flex-col gap-1.5 w-full transition-all duration-200 focus:scale-[1.01] md:col-span-2">
                <label className="text-sm font-medium text-color-muted ml-1">Role</label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="neu-inset w-full px-4 py-2.5 text-color-text bg-color-surface focus:outline-none focus:ring-2 focus:ring-accent transition-all cursor-pointer rounded-xl font-medium"
                >
                  <option value="TEACHER">Teacher</option>
                  <option value="STUDENT">Student</option>
                </select>
              </div>

              <div className="md:col-span-2 pt-6">
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)] rounded-xl"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Account & Generate Password'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Recent Accounts Table Section */}
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-2xl font-bold text-color-text font-serif">Recent Accounts</h2>
          <Card className="p-0 overflow-hidden border border-white/50 bg-color-surface/90">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-black/5 neu-inset bg-color-surface/50">
                    <th className="px-6 py-4 font-semibold text-color-muted text-sm rounded-tl-xl">Name & Email</th>
                    <th className="px-6 py-4 font-semibold text-color-muted text-sm">Role</th>
                    <th className="px-6 py-4 font-semibold text-color-muted text-sm">Status</th>
                    <th className="px-6 py-4 font-semibold text-color-muted text-sm text-right rounded-tr-xl">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-black/5 hover:bg-black/[0.01] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-color-text text-sm">{user.name}</div>
                        <div className="text-xs text-color-muted font-medium">{user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-color-text text-sm">
                          {user.role === 'TEACHER' ? 'Teacher' : 'Student'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={user.status === 'Active' ? 'success' : 'default'}>
                          {user.status || 'Active'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="icon" size="sm" className="cursor-pointer hover:bg-black/5 rounded-full p-1.5">
                          <MoreVertical className="w-4 h-4 text-color-muted" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

      </div>

      {/* Generated Password Showcase Modal with blur overlay */}
      {showModal && latestUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div 
            className="absolute inset-0" 
            onClick={() => setShowModal(false)}
          />
          <Card className="w-full max-w-md p-6 bg-color-surface border border-white/60 shadow-[20px_20px_40px_var(--shadow-dark),-20px_-20px_40px_var(--shadow-light)] rounded-2xl relative z-10 animate-scale-in">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/5 text-color-muted transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center space-y-4 pt-2">
              <div className="w-12 h-12 bg-color-success/15 rounded-full flex items-center justify-center text-color-success neu-raised">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif text-color-text">Account Created Successfully!</h3>
                <p className="text-xs text-color-muted mt-1">An auto-generated secure password has been generated for {latestUser.name}.</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="p-4 bg-color-background rounded-xl space-y-2 neu-inset">
                <div className="flex justify-between text-xs text-color-muted font-medium">
                  <span>NAME</span>
                  <span className="font-bold text-color-text">{latestUser.name}</span>
                </div>
                <div className="flex justify-between text-xs text-color-muted font-medium">
                  <span>EMAIL</span>
                  <span className="font-bold text-color-text truncate max-w-[200px]">{latestUser.email}</span>
                </div>
                <div className="flex justify-between text-xs text-color-muted font-medium">
                  <span>ROLE</span>
                  <span className="font-bold text-color-accent">{latestUser.role === 'TEACHER' ? 'Teacher' : 'Student'}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-color-muted uppercase ml-1 tracking-wide flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-color-accent" /> Generated Password
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 neu-inset px-4 py-3 bg-color-surface text-color-text font-mono font-bold tracking-wide select-all text-sm rounded-xl overflow-x-auto whitespace-nowrap">
                    {generatedPassword}
                  </div>
                  <Button 
                    onClick={copyToClipboard}
                    className="p-3 bg-color-accent text-white hover:bg-color-accent-hover rounded-xl shrink-0 cursor-pointer shadow-sm relative group"
                    title="Copy Password"
                  >
                    {copied ? <Check className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5 text-white" />}
                  </Button>
                </div>
                <span className="text-[10px] text-color-danger font-semibold mt-1 block">
                  * Warning: This password is shown only once. Please copy and share it securely.
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-black/5">
              <Button 
                onClick={() => setShowModal(false)}
                className="w-full py-2.5 bg-color-surface text-color-text hover:bg-black/[0.02] border border-black/5 shadow-sm rounded-xl font-bold"
              >
                Close & Finish
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
