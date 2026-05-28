import { Activity, Server, Users, AlertOctagon, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export function AdminDashboard() {
  const navigate = useNavigate();
  return (
    <div className="animate-fade-in pb-20 max-w-7xl mx-auto space-y-12">
      
      {/* Section 1 - System Overview */}
      <section>
        <h2 className="text-2xl font-bold text-color-text font-serif mb-6">System Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Teachers', value: '42', icon: Users, color: 'text-color-accent' },
            { label: 'Total Students', value: '1,240', icon: Users, color: 'text-color-accent' },
            { label: 'Active Today', value: '890', icon: Activity, color: 'text-color-success' },
            { label: 'Critical Alerts', value: '12', icon: AlertOctagon, color: 'text-color-danger' },
          ].map((stat, i) => (
            <div key={i} className="neu-raised rounded-full w-full aspect-square flex flex-col items-center justify-center p-6 text-center transform transition-transform hover:scale-105">
              <stat.icon className={`w-8 h-8 mb-4 ${stat.color}`} />
              <div className="text-4xl font-bold text-color-text">{stat.value}</div>
              <div className="text-sm font-medium text-color-muted mt-2 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2 - User Management */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-color-text font-serif">User Management</h2>
          <Button 
            variant="primary" 
            onClick={() => navigate('/admin/registration')}
            className="rounded-full shadow-[6px_6px_12px_var(--shadow-dark),-6px_-6px_12px_var(--shadow-light)]"
          >
            + Create New Account
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="h-[400px] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <span className="font-bold">Teachers</span>
              <input type="text" placeholder="Search..." className="neu-inset px-3 py-1.5 text-sm rounded-full bg-color-surface focus:outline-none focus:ring-1 focus:ring-accent" />
            </CardHeader>
            <CardContent className="overflow-y-auto space-y-3 pt-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="neu-raised p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm">Teacher {i}</div>
                    <div className="text-xs text-color-muted">Science Dept</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="success">Active</Badge>
                    <button className="text-color-muted hover:text-color-text"><MoreVertical className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="h-[400px] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <span className="font-bold">Students</span>
              <input type="text" placeholder="Search..." className="neu-inset px-3 py-1.5 text-sm rounded-full bg-color-surface focus:outline-none focus:ring-1 focus:ring-accent" />
            </CardHeader>
            <CardContent className="overflow-y-auto space-y-3 pt-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="neu-raised p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm">Student {i}</div>
                    <div className="text-xs text-color-muted">Class 10</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="success">Active</Badge>
                    <button className="text-color-muted hover:text-color-text"><MoreVertical className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section 3 - System Health */}
      <section>
        <h2 className="text-2xl font-bold text-color-text font-serif mb-6">System Health</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {['Spring Boot API', 'FastAPI ML Service', 'Gemini API'].map((service) => (
            <Card key={service} className="p-6 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-color-muted" />
                <span className="font-semibold">{service}</span>
              </div>
              <div className="w-3 h-3 rounded-full bg-color-success animate-pulse-soft shadow-[0_0_8px_var(--color-success)]"></div>
            </Card>
          ))}
        </div>
      </section>

      {/* Section 4 - Platform Activity Log */}
      <section>
        <h2 className="text-2xl font-bold text-color-text font-serif mb-6">Platform Activity Log</h2>
        <Card>
          <CardContent className="pt-6 pb-2 pl-4">
            <div className="border-l-2 border-color-muted/20 space-y-8 pb-4 relative">
              {[
                { time: '10 mins ago', text: 'Teacher Rahim uploaded a PDF', type: 'info' },
                { time: '1 hour ago', text: 'Student Sara submitted a solution', type: 'info' },
                { time: '2 hours ago', text: '3 students hit CRITICAL risk today', type: 'danger' },
              ].map((log, i) => (
                <div key={i} className="relative pl-6">
                  <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-color-surface neu-raised ${log.type === 'danger' ? 'bg-color-danger' : 'bg-color-accent'}`}></div>
                  <p className="text-sm font-semibold text-color-text">{log.text}</p>
                  <span className="text-xs text-color-muted">{log.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

    </div>
  );
}
