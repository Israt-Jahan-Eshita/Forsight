import { API_BASE_URL } from '../config';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { JudgeBanner } from '../components/ui/JudgeBanner';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowUpRight, Activity, Users, ShieldAlert, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import ReactMarkdown from 'react-markdown';

interface Chronicle {
  courseId: number;
  courseName: string;
  className: string;
  status: string;
  latestFeedback: string;
  studentId?: number;
  studentName?: string;
  studentEmail?: string;
  resourceName?: string;
  quizTitle?: string;
}

interface QuizSubmission {
  id: number;
  quiz: {
    id: number;
    title: string;
    course?: { id: number; name: string; className: string; };
  };
  student: { id: number; name: string; email: string; };
  answerText: string;
  answerImageUrl: string;
  submissionDate: string;
  status: string;
  feedback: string;
  score: number;
  attemptNumber: number;
  resubmissionNote: string;
}

export function TeacherDashboard() {
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [chronicles, setChronicles] = useState<Chronicle[]>([]);
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [selectedChronicle, setSelectedChronicle] = useState<Chronicle | null>(null);
  const [showBriefings, setShowBriefings] = useState(false);


  // Dynamic Data State
  const [healthScore, setHealthScore] = useState<{ healthScore: number, status: string } | null>(null);
  const [opEdText, setOpEdText] = useState('');
  const [generatingOpEd, setGeneratingOpEd] = useState(false);
  const [engagementTrend, setEngagementTrend] = useState<any[]>([]);

  // Widget Modal State
  const [activeWidget, setActiveWidget] = useState<'health' | 'ai' | 'trend' | null>(null);

  // Loading State
  const [dashboardLoading, setDashboardLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setDashboardLoading(true);
      try {
        const [chronResponse, subResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/enrollments/teacher/chronicle`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/api/submissions`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (chronResponse.ok) {
          setChronicles(await chronResponse.json());
        }
        if (subResponse.ok) {
          const data: QuizSubmission[] = await subResponse.json();
          setSubmissions(data.sort((a, b) => b.id - a.id));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setDashboardLoading(false);
      }
    };
    if (token && token !== 'mock-jwt-token') {
      fetchDashboardData();
      fetchLogsAndHealth();
    } else {
      setDashboardLoading(false);
    }
  }, [token]);

  const fetchLogsAndHealth = async () => {
    try {

      const healthRes = await fetch(`${API_BASE_URL}/api/analytics/classroom-health`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (healthRes.ok) setHealthScore(await healthRes.json());
      
      const engagementRes = await fetch(`${API_BASE_URL}/api/analytics/engagement-trend`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (engagementRes.ok) setEngagementTrend(await engagementRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  const generateOpEd = async () => {
    if (opEdText || generatingOpEd) return;
    setGeneratingOpEd(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/generate-oped`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setOpEdText(await response.text());
      } else {
        setOpEdText("Failed to generate insights.");
      }
    } catch (e) {
      setOpEdText("Error connecting to AI service.");
    } finally {
      setGeneratingOpEd(false);
    }
  };

  useEffect(() => {
    if (showBriefings) {
      generateOpEd();
    }
  }, [showBriefings]);

  const groupedStudents = chronicles.reduce((acc, chronicle) => {
    if (!chronicle.studentId) return acc;
    if (!acc[chronicle.studentId]) {
      acc[chronicle.studentId] = {
        id: chronicle.studentId,
        name: chronicle.studentName,
        email: chronicle.studentEmail,
        courses: []
      };
    }
    // Only add distinct courses to the dossier list preview
    if (!acc[chronicle.studentId].courses.some((c: any) => c.courseId === chronicle.courseId)) {
      acc[chronicle.studentId].courses.push(chronicle);
    }
    return acc;
  }, {} as Record<number, any>);

  const studentList = Object.values(groupedStudents);

  // No more mock engagementData needed

  if (dashboardLoading) {
    return (
      <div className="pb-20 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/10 pb-4 mb-6">
          <div>
            <div className="h-8 w-64 bg-color-surface rounded-lg neu-raised"></div>
            <div className="h-4 w-48 bg-color-surface rounded mt-2 neu-raised"></div>
          </div>
          <div className="h-10 w-40 bg-color-surface rounded-xl neu-raised"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-color-surface rounded-2xl neu-raised"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-color-surface rounded-2xl neu-raised"></div>
          <div className="h-64 bg-color-surface rounded-2xl neu-raised"></div>
        </div>
        <div className="text-center text-sm text-color-muted font-mono mt-8">
          Connecting to Forsight servers... This may take up to 30 seconds on first load.
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 max-w-7xl mx-auto space-y-6">
      
      <JudgeBanner 
        title="Teacher Command Center"
        description="This dashboard provides a unified view of all enrolled students. Teachers can monitor classroom health, view engagement trends, and identify at-risk students before they fail. The UI heavily utilizes neumorphic design principles for a modern, tactile feel."
      />

      {/* 1. Compact and Sleek Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/10 pb-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-color-text font-serif italic tracking-tight">
            Teacher Dashboard
          </h1>
          <div className="flex items-center gap-2 text-xs text-color-muted font-mono uppercase mt-1">
            <span className="flex items-center gap-1 font-bold">
              <Users className="w-3.5 h-3.5" /> Enrolled Students List
            </span>
          </div>
        </div>
        
        {/* Action Button Removed from header, now in FABs */}
      </div>

      {/* Floating Action Bar for Widgets */}
      <div className="fixed right-6 top-1/3 flex flex-col gap-4 z-40 animate-fade-in">
        <Button 
          variant="icon"
          onClick={() => setActiveWidget('health')}
          className="w-12 h-12 rounded-full neu-raised bg-color-surface flex items-center justify-center text-color-text hover:text-color-accent group relative"
        >
          <Activity className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="absolute right-full mr-4 bg-color-surface neu-inset px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Classroom Health
          </span>
        </Button>
        <Button 
          variant="icon"
          onClick={() => setShowBriefings(true)}
          className="w-12 h-12 rounded-full neu-raised bg-color-surface flex items-center justify-center text-color-text hover:text-color-accent group relative"
        >
          <ShieldAlert className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="absolute right-full mr-4 bg-color-surface neu-inset px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            AI Risk Analysis
          </span>
        </Button>
        <Button 
          variant="icon"
          onClick={() => setActiveWidget('trend')}
          className="w-12 h-12 rounded-full neu-raised bg-color-surface flex items-center justify-center text-color-text hover:text-color-accent group relative"
        >
          <TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="absolute right-full mr-4 bg-color-surface neu-inset px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Engagement Trend
          </span>
        </Button>
      </div>

      {/* Widget Modals */}
      {(activeWidget || showBriefings) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => { setActiveWidget(null); setShowBriefings(false); }}>
          <Card 
            className={`w-full flex flex-col bg-color-surface neu-raised border-2 border-white/20 shadow-2xl relative transition-all max-h-[90vh] overflow-y-auto custom-scrollbar ${
              activeWidget === 'health' ? 'max-w-sm' : 
              showBriefings ? 'max-w-lg' : 
              'max-w-2xl'
            }`} 
            onClick={e => e.stopPropagation()}
          >
            <Button variant="icon" onClick={() => { setActiveWidget(null); setShowBriefings(false); }} className="absolute top-4 right-4 rounded-full hover:bg-black/5 p-2 transition-colors z-10">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </Button>
            
            <div className="p-8 mt-4">
              {activeWidget === 'health' && (
                <div className="flex flex-col items-center text-center">
                  <Activity className="w-10 h-10 mb-4 text-color-accent" />
                  <h3 className="text-lg font-bold text-color-muted uppercase tracking-widest mb-2">Classroom Health Score</h3>
                  <div className="text-6xl font-black font-serif text-color-text my-4">
                    {healthScore ? `${healthScore.healthScore}%` : '...'}
                  </div>
                  <Badge variant={healthScore?.healthScore && healthScore.healthScore >= 70 ? 'success' : 'warning'} className="px-4 py-2 text-sm font-bold shadow-sm">
                    {healthScore?.status || 'Analyzing'}
                  </Badge>
                </div>
              )}

              {showBriefings && (
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-6 border-b border-black/5 pb-4">
                    <ShieldAlert className="w-6 h-6 text-color-accent" />
                    <h3 className="font-bold text-xl text-color-text font-serif">Groq AI Risk Analysis Briefing</h3>
                  </div>
                  <div className="flex-1 bg-color-background/50 rounded-xl p-6 border border-black/5">
                    {generatingOpEd ? (
                      <div className="flex items-center gap-3 text-color-muted font-bold animate-pulse">
                        <div className="w-5 h-5 border-2 border-color-accent border-t-transparent rounded-full animate-spin" />
                        Groq Llama-3.1 is analyzing student data...
                      </div>
                    ) : opEdText ? (
                      <div className="text-lg text-color-text/90 leading-relaxed italic typewriter-text prose prose-sm max-w-none">
                        <ReactMarkdown>{opEdText}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-color-muted italic">Click to generate a real-time risk analysis for your classroom.</p>
                    )}
                  </div>
                </div>
              )}

              {activeWidget === 'trend' && (
                <div className="flex flex-col">
                  <div className="flex items-center gap-3 mb-6 border-b border-black/5 pb-4">
                    <TrendingUp className="w-6 h-6 text-color-accent" />
                    <h3 className="font-bold text-xl text-color-text font-serif">Classroom Engagement Trend (7 Days)</h3>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={engagementTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorAvgScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-muted)' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-muted)' }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'var(--color-surface)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.5)', boxShadow: '4px 4px 10px rgba(0,0,0,0.1)' }}
                          itemStyle={{ fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="engagement" stroke="var(--color-accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorEngagement)" activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--color-accent)' }} />
                        <Area type="monotone" dataKey="avgScore" stroke="var(--color-success)" strokeWidth={2} fillOpacity={1} fill="url(#colorAvgScore)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* 2. Main Content Grid (Spacious Full-Width Student Dossiers) */}
      <div className="space-y-6 mt-4">
        <div className="border-b border-black/5 pb-2">
          <h2 className="text-xl font-bold text-color-text font-serif">Student Dossiers</h2>
          <p className="text-color-muted text-[10px] font-mono uppercase">Individual profiles and their active enrollments</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {studentList.length === 0 ? (
            <div className="col-span-full p-6 text-center text-color-muted border border-dashed border-black/10 rounded-xl bg-color-surface/50">
              No students are currently enrolled in any of your courses.
            </div>
          ) : studentList.map((student, index) => {
            const needsReviewCount = student.courses.filter((c: any) => c.status === 'Needs Review' || c.status === 'Pending').length;
            const hasCritical = needsReviewCount > 0;

            return (
              <Card 
                key={index}
                className="p-4 cursor-pointer border border-white/50 bg-color-surface flex flex-col justify-between relative group overflow-hidden transition-all duration-200 hover:shadow-[10px_10px_20px_var(--shadow-dark),-10px_-10px_20px_var(--shadow-light)]"
              >
                {/* Visual indicator corner */}
                <div className={`absolute top-0 right-0 w-20 h-20 -mr-10 -mt-10 rounded-full opacity-10 blur-lg ${
                  hasCritical ? 'bg-color-warning' : 'bg-color-success'
                }`} />

                <div className="space-y-4">
                  {/* Dossier Header */}
                  <div className="flex items-center gap-3 border-b border-black/5 pb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold font-serif text-base text-black neu-raised shadow-inner shrink-0 uppercase">
                      {student.name?.charAt(0) || 'S'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-color-text text-sm leading-tight font-serif truncate group-hover:text-color-accent transition-colors">
                        {student.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] text-color-muted font-mono uppercase truncate">{student.email}</span>
                      </div>
                    </div>
                    <Badge variant={hasCritical ? 'warning' : 'success'}>
                      {hasCritical ? `${needsReviewCount} Needs Review` : 'All Good'}
                    </Badge>
                  </div>

                  {/* Active Courses */}
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-[11px] text-color-text font-serif leading-snug">
                      Enrolled Courses ({student.courses.length})
                    </h4>
                    <div className="flex flex-col gap-1">
                      {student.courses.slice(0, 3).map((course: any, idx: number) => (
                        <div 
                          key={idx} 
                          onClick={(e) => { e.stopPropagation(); setSelectedChronicle(course); }}
                          className="flex justify-between items-center text-[10px] font-bold text-color-muted bg-black/5 p-2 rounded-lg px-3 cursor-pointer hover:bg-black/10 transition-colors border border-black/5"
                        >
                          <span className="truncate flex-1">{course.courseName}</span>
                          <span className={`${course.status === 'Needs Review' || course.status === 'Pending' ? 'text-color-warning' : 'text-color-success'}`}>
                            {course.status}
                          </span>
                        </div>
                      ))}
                      {student.courses.length > 3 && (
                        <div className="text-[9px] text-color-muted text-center font-bold">+{student.courses.length - 3} more...</div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Go To Action */}
                <div className="mt-3 pt-2 border-t border-black/5 flex items-center justify-between text-[10px] font-bold text-color-muted group-hover:text-color-accent transition-colors" onClick={() => navigate(`/teacher/student/${student.id}`)}>
                  <span className="uppercase tracking-wider">Access Profile</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Teacher Chronicle Modal */}
      {selectedChronicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in bg-black/60 backdrop-blur-sm" onClick={() => setSelectedChronicle(null)}>
          <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-color-surface neu-raised border-2 border-white/20 shadow-2xl overflow-hidden relative" onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div className="p-6 border-b border-black/5 bg-color-background/50 flex justify-between items-start shrink-0">
              <div>
                <h2 className="text-3xl font-black font-serif text-color-text mb-1 leading-tight">{selectedChronicle.courseName}</h2>
                <div className="flex items-center gap-3 text-sm font-bold">
                  <span className="text-color-accent uppercase tracking-widest bg-color-accent/10 px-2 py-0.5 rounded">{selectedChronicle.className}</span>
                  <span className="text-color-muted flex items-center gap-1">Student: <span className="text-color-text">{selectedChronicle.studentName}</span></span>
                </div>
              </div>
              <Button variant="icon" onClick={() => setSelectedChronicle(null)} className="rounded-full hover:bg-black/5 p-2 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </Button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-8 custom-scrollbar">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="neu-inset p-5 rounded-2xl bg-color-surface border border-white/50">
                  <div className="flex items-center gap-2 mb-3 text-color-muted font-bold text-xs uppercase tracking-widest">
                    <Activity className="w-4 h-4" /> Active Module
                  </div>
                  <p className="text-xl font-bold font-serif text-color-text">{selectedChronicle.resourceName || 'No Active Resource'}</p>
                </div>
                <div className="neu-inset p-5 rounded-2xl bg-color-surface border border-white/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-color-muted font-bold text-xs uppercase tracking-widest">
                      <Sparkles className="w-4 h-4" /> Current Task
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-widest ${
                      selectedChronicle.status === 'Completed' ? 'bg-color-success/15 text-color-success' : 
                      selectedChronicle.status === 'Needs Review' || selectedChronicle.status === 'Pending' ? 'bg-color-warning/15 text-color-warning' : 
                      'bg-color-accent/15 text-color-accent'
                    }`}>
                      {selectedChronicle.status}
                    </span>
                  </div>
                  <p className="text-xl font-bold font-serif text-color-text">{selectedChronicle.quizTitle || 'No Pending Quiz'}</p>
                </div>
              </div>

              {/* Version History Log */}
              <div>
                <h3 className="text-lg font-bold font-serif text-color-text mb-4 flex items-center gap-2 border-b border-black/5 pb-2">
                  Student Submission History Log
                </h3>
                
                <div className="space-y-4">
                  {(() => {
                    if (!selectedChronicle.quizTitle) return <p className="text-color-muted italic text-sm py-4">No active quiz task found for this course.</p>;

                    const relatedSubs = submissions.filter(s => s.student.id === selectedChronicle.studentId && s.quiz.title === selectedChronicle.quizTitle)
                      .sort((a, b) => (b.attemptNumber || 1) - (a.attemptNumber || 1));

                    if (relatedSubs.length === 0) {
                      return <p className="text-color-muted italic text-sm py-4">No submissions recorded from this student yet.</p>;
                    }

                    return relatedSubs.map((sub, idx) => {
                      const isLatest = idx === 0;
                      return (
                        <div key={sub.id} className={`p-5 rounded-2xl border ${isLatest ? 'border-color-warning/30 bg-color-warning/5 neu-raised' : 'border-black/5 bg-black/[0.02] opacity-80'}`}>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-color-text text-lg">Attempt {sub.attemptNumber || 1}</span>
                                {isLatest && <span className="text-[10px] bg-color-warning text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Latest</span>}
                              </div>
                              <span className="text-xs text-color-muted block mt-1">{new Date(sub.submissionDate).toLocaleString()}</span>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-white/50 border border-black/10 text-color-text">
                              {sub.status.replace('_', ' ')}
                            </span>
                          </div>

                          {sub.resubmissionNote && (
                            <div className="mb-4 p-3 bg-white/50 rounded-lg border border-black/5">
                              <span className="text-[10px] font-bold text-color-muted uppercase block mb-1">Student Note:</span>
                              <p className="text-sm italic">"{sub.resubmissionNote}"</p>
                            </div>
                          )}

                          <div className="space-y-2 mt-4">
                            <span className="text-[10px] font-bold text-color-muted uppercase block border-t border-black/5 pt-3">Submitted Work:</span>
                            {sub.answerText && <p className="text-sm whitespace-pre-wrap">{sub.answerText}</p>}
                            {sub.answerImageUrl && (
                              <div className="mt-2">
                                <img src={sub.answerImageUrl.startsWith('http') ? sub.answerImageUrl : `${API_BASE_URL}${sub.answerImageUrl}`} alt="Submission file" className="max-w-xs rounded-xl border border-black/10 shadow-sm" />
                              </div>
                            )}
                          </div>

                          {sub.feedback && (
                            <div className="mt-4 p-4 bg-color-accent/10 border-l-4 border-color-accent rounded-r-xl">
                              <span className="text-[10px] font-bold text-color-accent uppercase block mb-1">Your Feedback:</span>
                              <p className="text-sm italic text-color-text">"{sub.feedback}"</p>
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
              
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-black/5 bg-color-background/50 flex justify-end gap-3 shrink-0">
              <Button variant="secondary" onClick={() => setSelectedChronicle(null)}>Close</Button>
              <Button onClick={() => navigate('/submissions')} className="bg-color-warning text-white font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Evaluate Submission
              </Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
