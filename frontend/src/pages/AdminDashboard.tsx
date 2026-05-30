import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { 
  Users, Activity, AlertOctagon, Server, 
  MoreVertical, Calendar, Database, Plus, Search 
} from 'lucide-react';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'teachers' | 'students'>('teachers');
  const [searchQuery, setSearchQuery] = useState('');

  const mockTeachers = [
    { id: 1, name: 'Rahim Khan', email: 'rahim@school.edu', dept: 'Science Dept', status: 'Active' },
    { id: 2, name: 'Nusrat Jahan', email: 'nusrat@school.edu', dept: 'Mathematics Dept', status: 'Active' },
    { id: 3, name: 'Tariq Anam', email: 'tariq@school.edu', dept: 'English Dept', status: 'Active' },
  ];

  const mockStudents = [
    { id: 1, name: 'Sara Rahman', email: 'sara@student.edu', info: 'Class 10', status: 'Active' },
    { id: 2, name: 'Tanvir Hasan', email: 'tanvir@student.edu', info: 'Class 12', status: 'Active' },
    { id: 3, name: 'Sadia Islam', email: 'sadia@student.edu', info: 'Class 9', status: 'Active' },
  ];

  const filteredTeachers = mockTeachers.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudents = mockStudents.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <Calendar className="w-3.5 h-3.5" /> Thursday, May 28, 2026
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

      {/* 2. Compact Stat Cards (No massive round orbs!) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Teachers', value: '42', icon: Users, color: 'text-color-accent', border: 'border-l-4 border-color-accent' },
          { label: 'Total Students', value: '1,240', icon: Users, color: 'text-color-accent', border: 'border-l-4 border-color-accent' },
          { label: 'Active Today', value: '890', icon: Activity, color: 'text-color-success', border: 'border-l-4 border-color-success' },
          { label: 'Critical Alerts', value: '12', icon: AlertOctagon, color: 'text-color-danger', border: 'border-l-4 border-color-danger' },
        ].map((stat, i) => (
          <Card key={i} className={`p-4 bg-color-surface border border-white/50 relative overflow-hidden flex items-center gap-4 ${stat.border} transition-all duration-200 hover:shadow-[8px_8px_16px_var(--shadow-dark),-8px_-8px_16px_var(--shadow-light)]`}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-color-background shadow-inner shrink-0">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <div className="text-2xl font-black text-color-text leading-none">{stat.value}</div>
              <div className="text-[10px] font-bold text-color-muted uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* 3. Main Operational Layout (2-Column Spacious Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Unified Tabbed User Directory Ledger (lg:col-span-2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 pb-2">
            <div>
              <h2 className="text-xl font-bold text-color-text font-serif">Registry Directory</h2>
              <p className="text-color-muted text-[10px] font-mono uppercase mt-0.5">Database surveillance ledger of system credentials</p>
            </div>
            
            {/* Search Input Inset */}
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
                onClick={() => {
                  setActiveTab('teachers');
                  setSearchQuery('');
                }}
              >
                Teachers Registry ({filteredTeachers.length})
              </button>
              <button 
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'students' ? 'bg-color-surface text-color-accent shadow-sm' : 'text-color-muted hover:text-color-text'
                }`}
                onClick={() => {
                  setActiveTab('students');
                  setSearchQuery('');
                }}
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
                          {teacher.dept}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge variant="success">{teacher.status}</Badge>
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
                          No matching teacher records found in the database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              // Tab Contents: Students Table
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
                          {student.info}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge variant="success">{student.status}</Badge>
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
                          No matching student records found in the database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Infrastructure Health & Ledger Audit Log (lg:col-span-1) */}
        <div className="space-y-6">
          
          {/* Infrastructure Health */}
          <div className="space-y-3">
            <div className="border-b border-black/5 pb-2">
              <h2 className="text-xl font-bold text-color-text font-serif">Infrastructure</h2>
              <p className="text-color-muted text-[10px] font-mono uppercase mt-0.5">Physical and cognitive microservice metrics</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {[
                { name: 'Spring Boot API', type: 'Database Server' },
                { name: 'FastAPI ML Service', type: 'Intelligence Module' },
                { name: 'Gemini API Gateway', type: 'Cognitive LLM Engine' },
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

          {/* Platform Timeline Audit Logs */}
          <div className="space-y-3">
            <div className="border-b border-black/5 pb-2">
              <h2 className="text-xl font-bold text-color-text font-serif">Audit Chronicles</h2>
              <p className="text-color-muted text-[10px] font-mono uppercase mt-0.5">Chronological system operations timeline</p>
            </div>

            <Card className="p-5 bg-color-surface border border-white/50">
              <div className="border-l-2 border-color-muted/20 space-y-6 pb-2 relative">
                {[
                  { time: '10 mins ago', text: 'Teacher Rahim provisioned secure class logs', type: 'info' },
                  { time: '1 hour ago', text: 'PostgreSQL database synchronization completed', type: 'info' },
                  { time: '2 hours ago', text: 'JWT security token generated for session verification', type: 'info' },
                ].map((log, i) => (
                  <div key={i} className="relative pl-5 text-[11px] leading-snug">
                    <div className="absolute -left-[6px] top-1.5 w-2.5 h-2.5 rounded-full border border-color-surface bg-color-accent shadow-sm"></div>
                    <p className="font-semibold text-color-text">{log.text}</p>
                    <span className="text-[9px] text-color-muted font-bold font-mono uppercase block mt-0.5">{log.time}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

        </div>

      </div>

    </div>
  );
}
