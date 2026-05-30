import { API_BASE_URL } from '../config';
import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { Mail, Sparkles, Filter } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface StudentAnalytics {
  id: number;
  name: string;
  email: string;
  status: 'Safe' | 'Watch' | 'At-Risk' | 'Critical';
  riskScore: number;
  courseName: string;
  behavioralFlags: string[];
}

export function TeacherStudentsList() {
  const { token } = useAuth();
  const [students, setStudents] = useState<StudentAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortCriticalFirst, setSortCriticalFirst] = useState(true);
  const [aiInsights, setAiInsights] = useState<Record<number, string>>({});
  const [generatingInsight, setGeneratingInsight] = useState<number | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/analytics/students-risk`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setStudents(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (token && token !== 'mock-jwt-token') {
      fetchAnalytics();
    } else {
      // Mock data for preview
      setStudents([
        { id: 1, name: 'Alice Smith', email: 'alice@email.com', status: 'Safe', riskScore: 12, courseName: 'Physics 101', behavioralFlags: [] },
        { id: 2, name: 'Bob Jones', email: 'bob@email.com', status: 'Critical', riskScore: 88, courseName: 'Chemistry 101', behavioralFlags: ['Speed-runner', 'Resource Skipper'] },
        { id: 3, name: 'Charlie Brown', email: 'charlie@email.com', status: 'Watch', riskScore: 35, courseName: 'Math 202', behavioralFlags: ['Sharp Grade Drop'] }
      ]);
      setLoading(false);
    }
  }, [token]);

  const generateInsight = async (student: StudentAnalytics) => {
    setGeneratingInsight(student.id);
    try {
      const promptData = `Student: ${student.name}. Risk Score: ${student.riskScore}. Course: ${student.courseName}. Behavioral Flags: ${student.behavioralFlags.join(', ')}.`;
      const response = await fetch(`${API_BASE_URL}/api/ai/intervention-insight`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: promptData })
      });
      
      if (response.ok) {
        const insight = await response.text();
        setAiInsights(prev => ({ ...prev, [student.id]: insight }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingInsight(null);
    }
  };

  const sortedStudents = [...students].sort((a, b) => {
    if (!sortCriticalFirst) return 0;
    const riskWeight: Record<string, number> = { 'Critical': 4, 'At-Risk': 3, 'Watch': 2, 'Safe': 1 };
    return (riskWeight[b.status] || 0) - (riskWeight[a.status] || 0);
  });

  return (
    <div className="pb-20 max-w-6xl mx-auto space-y-8 animate-fade-in relative min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-black/10 pb-6 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-color-text font-serif tracking-tight">
            My Students (Analytics)
          </h1>
          <p className="text-color-muted text-sm mt-2 max-w-2xl">
            Monitor student performance trends, identify at-risk learners, and leverage AI to generate actionable intervention strategies.
          </p>
        </div>
        
        <Button 
          variant="secondary" 
          onClick={() => setSortCriticalFirst(!sortCriticalFirst)}
          className={`flex items-center gap-2 text-sm font-bold shadow-sm ${sortCriticalFirst ? 'border-color-critical text-color-critical bg-color-critical/5' : ''}`}
        >
          <Filter className="w-4 h-4" />
          {sortCriticalFirst ? 'Sorting: Critical First' : 'Sort by Risk Level'}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12 text-color-muted animate-pulse font-bold">Loading Analytics...</div>
      ) : sortedStudents.length === 0 ? (
        <Card className="p-10 text-center text-color-muted font-bold neu-raised bg-color-surface">
          No students are currently enrolled.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedStudents.map((student) => (
            <Card key={student.id} className="p-4 flex flex-col justify-between neu-raised transition-all hover:scale-[1.01] border border-white/50 bg-color-surface">
              
              {/* Header: Identity & Risk */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-color-accent text-white flex items-center justify-center font-bold font-serif text-lg shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)] uppercase">
                    {student.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-color-text font-serif leading-tight truncate">{student.name}</h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-color-muted mt-0.5 font-medium truncate">
                      <Mail className="w-3.5 h-3.5" /> {student.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Insight Section */}
              <div className="mb-4">
                {aiInsights[student.id] ? (
                  <div className="neu-inset p-3 rounded-xl bg-color-surface border border-color-accent/20 animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-color-accent rounded-l-xl"></div>
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-color-accent mt-0.5 shrink-0" />
                      <p className="text-xs font-bold text-color-text italic leading-relaxed">
                        "{aiInsights[student.id]}"
                      </p>
                    </div>
                  </div>
                ) : (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => generateInsight(student)}
                    disabled={generatingInsight === student.id}
                    className="w-full h-10 border border-color-accent/30 bg-color-accent/5 text-color-accent font-bold shadow-sm"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {generatingInsight === student.id ? 'Generating Strategy...' : 'Generate Intervention Strategy'}
                  </Button>
                )}
              </div>

              {/* Behavioral Flags */}
              {student.behavioralFlags && student.behavioralFlags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {student.behavioralFlags.map(flag => (
                    <span key={flag} className="px-2 py-1 text-[10px] font-bold text-color-danger bg-color-danger/10 border border-color-danger/20 rounded-full">
                      {flag}
                    </span>
                  ))}
                </div>
              )}

              {/* Risk Score */}
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-black/5">
                <div className="flex flex-col">
                  <span className="text-[10px] text-color-muted font-bold uppercase">Risk Score</span>
                  <span className={`text-xl font-bold font-serif ${student.status === 'Critical' ? 'text-color-critical' : student.status === 'At-Risk' || student.status === 'Watch' ? 'text-color-warning' : 'text-color-success'}`}>
                    {student.riskScore}/100
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-color-muted font-bold uppercase">Course</span>
                  <span className="text-sm font-bold text-color-text">{student.courseName}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
