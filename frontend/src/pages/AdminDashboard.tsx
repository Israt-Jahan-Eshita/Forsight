import { API_BASE_URL } from '../config';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Activity, AlertOctagon, Server, 
  MoreVertical, Calendar, Database, Plus, Search 
} from 'lucide-react';

interface SystemStats {
  totalTeachers: number;
  totalStudents: number;
  activeToday: number;
  criticalAlerts: number;
}

interface UserRecord {
  id: number;
  name: string;
  email: string;
  dept?: string;
  info?: string;
  status: string;
}

interface AuditLog {
  id: number;
  timestamp: string;
  eventDescription: string;
  eventType: string;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'teachers' | 'students'>('teachers');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<SystemStats>({ totalTeachers: 0, totalStudents: 0, activeToday: 0, criticalAlerts: 0 });
  const [teachers, setTeachers] = useState<UserRecord[]>([]);
  const [students, setStudents] = useState<UserRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, [token]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, logsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/system-stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/logs/recent`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) {
        const data = await usersRes.json();
        setTeachers(data.teachers || []);
        setStudents(data.students || []);
      }
      if (logsRes.ok) setAuditLogs(await logsRes.json());
    } catch (e) {
      console.error('Failed to load admin data', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="pb-20 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {/* 1. Sleek Compact Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/10 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-color-text font-serif italic tracking-tight flex items-center gap-2">
            <Database className="w-7 h-7 text-color-accent" /> Forsight Control Panel
          </h1>
          <div className="flex items-center gap-2 text-xs text-color-muted font-mono uppercase mt-1">
            <span className="flex items-center gap-1 font-bold">
              <Calendar className="w-3.5 h-3.5" /> {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <span>•</span>
            <span className="text-color-accent font-bold">System Administration</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            onClick={() => navigate('/admin/docs')}
            className="neu-inset text-xs py-2 px-4 gap-1.5 flex items-center bg-color-surface text-color-text font-bold rounded-xl cursor-pointer shadow-sm hover:text-color-accent transition-all border border-color-accent/20"
          >
            Manage /docs
          </Button>
          <Button 
            variant="primary" 
            onClick={() => navigate('/admin/registration')}
            className="neu-raised text-xs py-2 px-4 gap-1.5 flex items-center bg-color-accent text-white font-bold rounded-xl cursor-pointer shadow-sm hover:brightness-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Provision Account
          </Button>
        </div>
      </div>

      {/* 2. Live Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Teachers', value: String(stats.totalTeachers), icon: Users, color: 'text-color-accent', border: 'border-l-4 border-color-accent' },
          { label: 'Total Students', value: String(stats.totalStudents), icon: Users, color: 'text-color-accent', border: 'border-l-4 border-color-accent' },
          { label: 'Total Submissions', value: String(stats.activeToday), icon: Activity, color: 'text-color-success', border: 'border-l-4 border-color-success' },
          { label: 'At-Risk Alerts', value: String(stats.criticalAlerts), icon: AlertOctagon, color: 'text-color-danger', border: 'border-l-4 border-color-danger' },
        ].map((stat, i) => (
          <Card key={i} className={`p-4 bg-color-surface border border-white/50 relative overflow-hidden flex items-center gap-4 ${stat.border} transition-all duration-200 hover:shadow-[8px_8px_16px_var(--shadow-dark),-8px_-8px_16px_var(--shadow-light)]`}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-color-background shadow-inner shrink-0">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <div className="text-2xl font-black text-color-text leading-none">{loading ? '—' : stat.value}</div>
              <div className="text-[10px] font-bold text-color-muted uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* 3. Main Operational Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Registry Directory */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 pb-2">
            <div>
              <h2 className="text-xl font-bold text-color-text font-serif">Registry Directory</h2>
              <p className="text-color-muted text-[10px] font-mono uppercase mt-0.5">Live database of system credentials</p>
            </div>
            
            <div className="relative w-full sm:w-60">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-3.5 h-3.5 text-color-muted" />
              </span>
              <input 
                type="text" 
                placeholder="Search database..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full neu-inset pl-9 pr-4 py-1.5 text-xs bg-color-surface focus:outline-none focus:ring-1 focus:ring-accent rounded-xl"
              />
            </div>
          </div>

          <Card className="p-0 overflow-hidden border border-white/50 bg-color-surface">
            {/* Tab Controls */}
            <div className="flex p-1 bg-color-background/50 border-b border-black/5">
              <button 
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'teachers' ? 'bg-color-surface text-color-accent shadow-sm' : 'text-color-muted hover:text-color-text'
                }`}
                onClick={() => { setActiveTab('teachers'); setSearchQuery(''); }}
              >
                Teachers Registry ({filteredTeachers.length})
              </button>
              <button 
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'students' ? 'bg-color-surface text-color-accent shadow-sm' : 'text-color-muted hover:text-color-text'
                }`}
                onClick={() => { setActiveTab('students'); setSearchQuery(''); }}
              >
                Students Registry ({filteredStudents.length})
              </button>
            </div>

            {/* Tab Contents: Teachers Table */}
            {activeTab === 'teachers' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-black/5 neu-inset bg-color-surface/50">
                      <th className="px-5 py-3 font-bold text-color-muted text-xs rounded-tl-xl">Teacher Name & Email</th>
                      <th className="px-5 py-3 font-bold text-color-muted text-xs">Department</th>
                      <th className="px-5 py-3 font-bold text-color-muted text-xs">Status</th>
                      <th className="px-5 py-3 font-bold text-color-muted text-xs text-right rounded-tr-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeachers.map((teacher) => (
                      <tr key={teacher.id} className="border-b border-black/5 hover:bg-black/[0.01] transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-color-text text-xs">{teacher.name}</div>
                          <div className="text-[10px] text-color-muted font-medium">{teacher.email}</div>
                        </td>
                        <td className="px-5 py-3.5 text-xs font-semibold text-color-text">
                          {teacher.dept || 'Unassigned'}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge variant="success">{teacher.status || 'Active'}</Badge>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Button variant="icon" size="sm" className="cursor-pointer hover:bg-black/5 rounded-full p-1">
                            <MoreVertical className="w-3.5 h-3.5 text-color-muted" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {filteredTeachers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-10 text-xs text-color-muted italic">
                          {loading ? 'Loading records from database...' : 'No matching teacher records found.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-black/5 neu-inset bg-color-surface/50">
                      <th className="px-5 py-3 font-bold text-color-muted text-xs rounded-tl-xl">Student Name & Email</th>
                      <th className="px-5 py-3 font-bold text-color-muted text-xs">Class / Grade</th>
                      <th className="px-5 py-3 font-bold text-color-muted text-xs">Status</th>
                      <th className="px-5 py-3 font-bold text-color-muted text-xs text-right rounded-tr-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="border-b border-black/5 hover:bg-black/[0.01] transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-color-text text-xs">{student.name}</div>
                          <div className="text-[10px] text-color-muted font-medium">{student.email}</div>
                        </td>
                        <td className="px-5 py-3.5 text-xs font-semibold text-color-text">
                          {student.info || 'Unassigned'}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge variant="success">{student.status || 'Active'}</Badge>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Button variant="icon" size="sm" className="cursor-pointer hover:bg-black/5 rounded-full p-1">
                            <MoreVertical className="w-3.5 h-3.5 text-color-muted" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-10 text-xs text-color-muted italic">
                          {loading ? 'Loading records from database...' : 'No matching student records found.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Infrastructure & Audit Logs */}
        <div className="space-y-6">
          
          {/* Infrastructure Health */}
          <div className="space-y-3">
            <div className="border-b border-black/5 pb-2">
              <h2 className="text-xl font-bold text-color-text font-serif">Infrastructure</h2>
              <p className="text-color-muted text-[10px] font-mono uppercase mt-0.5">Service health monitoring</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {[
                { name: 'Spring Boot API', type: 'Core Backend' },
                { name: 'Groq LLM Engine', type: 'AI Intelligence' },
                { name: 'PostgreSQL', type: 'Data Persistence' },
              ].map((service) => (
                <Card key={service.name} className="p-4 bg-color-surface border border-white/50 flex items-center justify-between transition-all hover:shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-color-background shadow-inner flex items-center justify-center shrink-0">
                      <Server className="w-4 h-4 text-color-muted" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-color-text block">{service.name}</span>
                      <span className="text-[9px] text-color-muted font-bold uppercase block">{service.type}</span>
                    </div>
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-color-success animate-pulse-soft shadow-[0_0_8px_var(--color-success)] shrink-0"></div>
                </Card>
              ))}
            </div>
          </div>

          {/* Live Audit Logs */}
          <div className="space-y-3">
            <div className="border-b border-black/5 pb-2">
              <h2 className="text-xl font-bold text-color-text font-serif">Audit Chronicles</h2>
              <p className="text-color-muted text-[10px] font-mono uppercase mt-0.5">Live system operations timeline</p>
            </div>

            <Card className="p-5 bg-color-surface border border-white/50">
              <div className="border-l-2 border-color-muted/20 space-y-6 pb-2 relative">
                {auditLogs.length > 0 ? auditLogs.slice(0, 8).map((log, i) => (
                  <div key={log.id || i} className="relative pl-5 text-[11px] leading-snug">
                    <div className={`absolute -left-[6px] top-1.5 w-2.5 h-2.5 rounded-full border border-color-surface shadow-sm ${
                      log.eventType === 'WARNING' ? 'bg-color-danger' : 'bg-color-accent'
                    }`}></div>
                    <p className="font-semibold text-color-text">{log.eventDescription}</p>
                    <span className="text-[9px] text-color-muted font-bold font-mono uppercase block mt-0.5">{formatTimeAgo(log.timestamp)}</span>
                  </div>
                )) : (
                  <p className="pl-5 text-[11px] text-color-muted italic">{loading ? 'Loading audit log...' : 'No system events recorded yet.'}</p>
                )}
              </div>
            </Card>
          </div>

        </div>

      </div>

    </div>
  );
}
