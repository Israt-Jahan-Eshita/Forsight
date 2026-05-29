import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { Mail, BookOpen, AlertTriangle, TrendingUp, Sparkles, Filter, CheckCircle } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

interface StudentAnalytics {
  id: number;
  name: string;
  email: string;
  gradeAverage: number;
  riskLevel: 'Safe' | 'Watch' | 'Critical';
  weakestSubject: string;
  totalSubmissions: number;
  pendingSubmissions: number;
  gradedCount: number;
  enrolledCourses: string[];
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
        const response = await fetch('http://localhost:8080/api/analytics/students', {
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
        { id: 1, name: 'Alice Smith', email: 'alice@email.com', gradeAverage: 92, riskLevel: 'Safe', weakestSubject: 'Physics', totalSubmissions: 5, pendingSubmissions: 0, gradedCount: 5, enrolledCourses: ['Physics 101', 'Math 202'] },
        { id: 2, name: 'Bob Jones', email: 'bob@email.com', gradeAverage: 65, riskLevel: 'Critical', weakestSubject: 'Chemistry', totalSubmissions: 4, pendingSubmissions: 2, gradedCount: 2, enrolledCourses: ['Chemistry 101'] },
        { id: 3, name: 'Charlie Brown', email: 'charlie@email.com', gradeAverage: 78, riskLevel: 'Watch', weakestSubject: 'Math 202', totalSubmissions: 8, pendingSubmissions: 1, gradedCount: 7, enrolledCourses: ['Math 202'] }
      ]);
      setLoading(false);
    }
  }, [token]);

  const generateInsight = async (student: StudentAnalytics) => {
    setGeneratingInsight(student.id);
    try {
      const promptData = `Student: ${student.name}. Grade Avg: ${student.gradeAverage}%. Risk: ${student.riskLevel}. Weakest Subject: ${student.weakestSubject}.`;
      const response = await fetch('http://localhost:8080/api/ai/intervention-insight', {
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
    const riskWeight = { 'Critical': 3, 'Watch': 2, 'Safe': 1 };
    return riskWeight[b.riskLevel] - riskWeight[a.riskLevel];
  });

  return (
    <div className="pb-20 max-w-6xl mx-auto space-y-8 animate-fade-in relative min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-black/10 pb-6 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-color-text font-serif tracking-tight">
            Learning Analytics Dashboard
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {sortedStudents.map((student) => (
            <Card key={student.id} className="p-6 flex flex-col justify-between neu-raised transition-all hover:scale-[1.01] border border-white/50 bg-color-surface">
              
              {/* Header: Identity & Risk */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-color-accent text-white flex items-center justify-center font-bold font-serif text-2xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)] uppercase">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-color-text font-serif leading-tight">{student.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-color-muted mt-1 font-medium">
                      <Mail className="w-3.5 h-3.5" /> {student.email}
                    </div>
                  </div>
                </div>
                
                <Badge variant={student.riskLevel === 'Critical' ? 'danger' : student.riskLevel === 'Watch' ? 'warning' : 'success'} className="px-3 py-1 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  {student.riskLevel === 'Critical' && <AlertTriangle className="w-3 h-3" />}
                  {student.riskLevel === 'Watch' && <TrendingUp className="w-3 h-3" />}
                  {student.riskLevel === 'Safe' && <CheckCircle className="w-3 h-3" />}
                  {student.riskLevel}
                </Badge>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="neu-inset p-3 rounded-xl bg-color-surface flex flex-col items-center justify-center text-center relative">
                  <span className="text-[10px] text-color-muted font-bold uppercase tracking-wide mb-2">Grade Avg</span>
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-black/5"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" stroke="currentColor" strokeWidth="3"
                      />
                      <path
                        className={`${student.gradeAverage < 70 ? 'text-color-critical' : student.gradeAverage < 85 ? 'text-color-warning' : 'text-color-success'}`}
                        strokeDasharray={`${student.gradeAverage}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" stroke="currentColor" strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className={`absolute text-sm font-black ${student.gradeAverage < 70 ? 'text-color-critical' : student.gradeAverage < 85 ? 'text-color-warning' : 'text-color-success'}`}>
                      {student.gradeAverage}%
                    </span>
                  </div>
                </div>
                <div className="neu-inset p-3 rounded-xl bg-color-surface flex flex-col justify-center text-center">
                  <span className="text-[10px] text-color-muted font-bold uppercase tracking-wide mb-1">Submissions</span>
                  <span className="text-xl font-bold text-color-text">{student.gradedCount} / {student.totalSubmissions}</span>
                </div>
                <div className="neu-inset p-3 rounded-xl bg-color-surface flex flex-col justify-center text-center border-b-2 border-color-danger/20">
                  <span className="text-[10px] text-color-danger font-bold uppercase tracking-wide mb-1">Weakest Topic</span>
                  <span className="text-xs font-bold text-color-text truncate px-1" title={student.weakestSubject}>
                    {student.weakestSubject}
                  </span>
                </div>
              </div>

              {/* Enrolled Courses */}
              <div className="mb-6">
                <div className="text-[10px] font-bold text-color-muted uppercase mb-2 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> Enrolled Courses
                </div>
                <div className="flex flex-wrap gap-2">
                  {student.enrolledCourses.map((course, cIdx) => (
                    <span key={cIdx} className="text-xs font-semibold bg-white/50 border border-black/5 text-color-text px-2.5 py-1 rounded-md shadow-sm">
                      {course}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI Actionable Insight Box */}
              <div className="mt-auto pt-4 border-t border-black/5">
                {aiInsights[student.id] ? (
                  <div className="bg-color-accent/5 border border-color-accent/20 rounded-xl p-4 relative animate-fade-in">
                    <Sparkles className="w-4 h-4 text-color-accent absolute top-4 left-4" />
                    <p className="text-sm font-medium text-color-text pl-6 italic leading-relaxed">
                      "{aiInsights[student.id]}"
                    </p>
                  </div>
                ) : (
                  <Button 
                    variant="secondary" 
                    className="w-full text-sm font-bold flex items-center justify-center gap-2 bg-color-surface hover:bg-color-accent/5 hover:text-color-accent transition-colors py-2.5 border-dashed border-2 border-black/10"
                    onClick={() => generateInsight(student)}
                    disabled={generatingInsight === student.id}
                  >
                    <Sparkles className={`w-4 h-4 ${generatingInsight === student.id ? 'animate-spin' : ''}`} />
                    {generatingInsight === student.id ? 'Analyzing learning patterns...' : 'Generate AI Intervention Strategy'}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
