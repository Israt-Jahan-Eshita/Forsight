import { API_BASE_URL } from '../config';
import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';

import { Avatar } from '../components/ui/Avatar';
import { Search, AlertTriangle, ChevronRight, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface StudentRisk {
  id: number;
  name: string;
  email: string;
  status: 'Safe' | 'Watch' | 'At-Risk' | 'Critical';
  riskScore: number;
  courseName: string;
  behavioralFlags?: string[];
}

export function RiskDashboard() {
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [students, setStudents] = useState<StudentRisk[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Safe' | 'Watch' | 'At-Risk' | 'Critical'>('All');

  useEffect(() => {
    const fetchRiskData = async () => {
      try {
        if (!token || token === 'mock-jwt-token') {
          // Fallback mock data
          const mockData: StudentRisk[] = [
            { id: 2, name: 'Sara Rahman', email: 'sara@student.edu', status: 'Safe', riskScore: 12, courseName: 'Science Class 10' },
            { id: 4, name: 'Vikram Das', email: 'vikram@student.edu', status: 'Critical', riskScore: 92, courseName: 'Science Class 10' },
            { id: 5, name: 'Aarav Patel', email: 'aarav@student.edu', status: 'At-Risk', riskScore: 78, courseName: 'Math Class 10' },
            { id: 6, name: 'Neha Gupta', email: 'neha@student.edu', status: 'Watch', riskScore: 45, courseName: 'Science Class 10' },
            { id: 7, name: 'Rohan Sharma', email: 'rohan@student.edu', status: 'Safe', riskScore: 5, courseName: 'English Class 10' },
          ];
          setStudents(mockData);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/analytics/students-risk`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setStudents(data);
        }
      } catch (e) {
        console.error('Failed to fetch risk data:', e);
      }
    };
    fetchRiskData();
  }, [token]);

  const criticalStudents = students.filter(s => s.status === 'Critical');
  
  const filteredStudents = students.filter(s => {
    if (filter !== 'All' && s.status !== filter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Critical': return 'text-color-danger bg-color-danger/10 border-color-danger';
      case 'At-Risk': return 'text-color-warning bg-color-warning/10 border-color-warning';
      case 'Watch': return 'text-color-accent bg-color-accent/10 border-color-accent';
      default: return 'text-color-success bg-color-success/10 border-color-success';
    }
  };

  const getRingColor = (score: number) => {
    if (score >= 80) return 'stroke-color-danger';
    if (score >= 60) return 'stroke-color-warning';
    if (score >= 30) return 'stroke-color-accent';
    return 'stroke-color-success';
  };

  return (
    <div className="pb-20 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {/* 1. AlertStrip */}
      {criticalStudents.length > 0 && (
        <div className="w-full bg-color-danger/10 border border-color-danger/30 rounded-xl p-4 flex items-center gap-3 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse-soft">
          <AlertTriangle className="w-5 h-5 text-color-danger shrink-0" />
          <div className="flex-1">
            <h4 className="font-bold text-color-danger text-sm">CRITICAL RISK ALERT</h4>
            <p className="text-xs text-color-danger/80">
              Immediate intervention required for: <span className="font-bold">{criticalStudents.map(s => s.name).join(', ')}</span>
            </p>
          </div>
          <button className="text-xs font-bold text-color-danger hover:underline" onClick={() => setFilter('Critical')}>
            View Profiles
          </button>
        </div>
      )}

      <div className="border-b border-black/5 pb-2">
        <h1 className="text-3xl font-extrabold text-color-text font-serif italic tracking-tight flex items-center gap-2">
          <Activity className="w-8 h-8 text-color-accent" /> Risk Analytics
        </h1>
        <p className="text-color-muted text-xs font-mono uppercase tracking-wider mt-1">Predictive intervention dashboard</p>
      </div>

      {/* 2. Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: students.length, color: 'text-color-text' },
          { label: 'Safe', value: students.filter(s => s.status === 'Safe').length, color: 'text-color-success' },
          { label: 'Watch', value: students.filter(s => s.status === 'Watch').length, color: 'text-color-accent' },
          { label: 'At-Risk / Critical', value: students.filter(s => ['At-Risk', 'Critical'].includes(s.status)).length, color: 'text-color-danger' },
        ].map((stat, i) => (
          <div key={i} className="p-5 bg-color-surface neu-inset rounded-2xl border border-black/5 flex flex-col items-center justify-center text-center transition-all hover:bg-color-background/50 cursor-default">
            <span className="text-[10px] font-bold text-color-muted uppercase tracking-widest">{stat.label}</span>
            <span className={`text-4xl font-extrabold font-serif mt-1 ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* 3. Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-2 bg-color-surface neu-raised rounded-2xl border border-white/50">
        <div className="flex gap-1 overflow-x-auto w-full md:w-auto p-1">
          {['All', 'Safe', 'Watch', 'At-Risk', 'Critical'].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === f ? 'bg-color-background shadow-inner border border-black/5 text-color-text' : 'text-color-muted hover:text-color-text'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-color-muted" />
          <input 
            type="text" 
            placeholder="Search student..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl neu-inset bg-color-background text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* 4. Student Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStudents.map(student => (
          <Card 
            key={student.id} 
            onClick={() => navigate(`/teacher/student/${student.id}`, { state: { student } })}
            className="p-5 flex items-center gap-4 cursor-pointer group bg-color-surface border border-white/60 neu-raised hover:shadow-[0_0_25px_rgba(0,0,0,0.05)] transition-all overflow-hidden relative"
          >
            {/* Glowing background hint based on status */}
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 rounded-full opacity-20 blur-xl ${
              student.status === 'Critical' ? 'bg-color-danger' : 
              student.status === 'At-Risk' ? 'bg-color-warning' : 
              student.status === 'Watch' ? 'bg-color-accent' : 'bg-color-success'
            }`} />

            {/* Avatar with SVG Risk Ring */}
            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="32" cy="32" r="30" className="stroke-black/5 fill-none stroke-2" />
                <circle 
                  cx="32" cy="32" r="30" 
                  className={`fill-none stroke-2 transition-all duration-1000 ${getRingColor(student.riskScore)}`}
                  strokeDasharray={`${(student.riskScore / 100) * 188.5} 188.5`}
                  strokeLinecap="round"
                />
              </svg>
              <Avatar fallback={student.name[0]} size="md" className="border-2 border-white shadow-sm" />
            </div>

            <div className="flex-1 min-w-0 z-10">
              <div className="flex items-center justify-between mb-0.5">
                <h3 className="font-bold text-sm text-color-text truncate group-hover:text-color-accent transition-colors">
                  {student.name}
                </h3>
                <ChevronRight className="w-4 h-4 text-color-muted opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
              </div>
              <p className="text-[10px] font-mono text-color-muted uppercase truncate">{student.courseName}</p>
              
              <div className="mt-2 flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase border ${getStatusColor(student.status)}`}>
                  {student.status}
                </span>
                <span className="text-[10px] font-bold text-color-muted">Risk {student.riskScore}%</span>
              </div>
              {student.behavioralFlags && student.behavioralFlags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {student.behavioralFlags.map(flag => (
                    <span key={flag} className="px-2 py-0.5 rounded bg-black/5 text-[9px] font-bold text-color-muted uppercase">
                      {flag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
        {filteredStudents.length === 0 && (
          <div className="col-span-full p-10 text-center text-color-muted italic border border-dashed border-black/10 rounded-xl">
            No students found matching the criteria.
          </div>
        )}
      </div>

    </div>
  );
}
