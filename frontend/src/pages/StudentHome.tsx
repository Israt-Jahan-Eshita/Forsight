import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Activity, BookOpen, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Chronicle {
  courseId: number;
  courseName: string;
  className: string;
  status: string;
  latestFeedback: string;
  lastUpdate: string;
  teacherId: number;
  teacherName: string;
  resourceName: string;
  quizTitle: string;
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

export function StudentHome() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [chronicles, setChronicles] = useState<Chronicle[]>([]);
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [selectedChronicle, setSelectedChronicle] = useState<Chronicle | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [chronResponse, subResponse] = await Promise.all([
          fetch('http://localhost:8080/api/enrollments/student/chronicle', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://localhost:8080/api/submissions', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        if (chronResponse.ok) {
          setChronicles(await chronResponse.json());
        }
        if (subResponse.ok) {
          const subs: QuizSubmission[] = await subResponse.json();
          setSubmissions(subs.sort((a, b) => b.id - a.id));
        }
      } catch (e) {
        console.error(e);
      }
    };
    if (token && token !== 'mock-jwt-token') {
      fetchDashboardData();
    }
  }, [token]);

  // Dynamic Status Calculation
  const pendingCount = chronicles.filter(c => c.status === 'Pending').length;
  const completedCount = chronicles.filter(c => c.status === 'Completed').length;
  const totalCourses = chronicles.length;
  
  let riskStatus = 'Doing Well';
  let gaugeColor = 'var(--color-success)';
  let message = 'Your engagement has been high this week. Keep up the momentum!';
  let dashOffset = '110'; // mostly full

  if (totalCourses === 0) {
    riskStatus = 'Getting Started';
    gaugeColor = 'var(--color-muted)';
    message = 'You have not enrolled in any courses yet. Browse the resource directory to begin.';
    dashOffset = '440'; // empty
  } else if (pendingCount > 0) {
    riskStatus = 'Action Required';
    gaugeColor = 'var(--color-warning)';
    message = `You have ${pendingCount} assignment(s) currently awaiting evaluation.`;
    dashOffset = '220'; // half full
  } else if (completedCount > 0) {
    dashOffset = '80'; // very full
  } else {
    // Just enrolled
    riskStatus = 'On Track';
    message = 'You are enrolled and ready to take on new quizzes!';
    dashOffset = '300'; // 1/3 full
  }

  const handleMessageTeacher = (teacherId: number, teacherName: string) => {
    navigate('/messages', { state: { targetUser: { id: teacherId, name: teacherName, role: 'TEACHER' } } });
  };

  return (
    <div className="animate-fade-in pb-20 max-w-6xl mx-auto space-y-8">
      
      {/* Risk Card */}
      <Card className="flex flex-col md:flex-row items-center p-10 gap-10 bg-color-surface neu-raised border border-white/50">
        <div className="relative w-48 h-48 flex items-center justify-center neu-inset rounded-full shrink-0 shadow-inner">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle cx="96" cy="96" r="80" fill="none" stroke="var(--color-background)" strokeWidth="16" />
            <circle 
              cx="96" cy="96" r="80" fill="none" 
              stroke={gaugeColor} strokeWidth="16" strokeLinecap="round"
              strokeDasharray="502" strokeDashoffset={dashOffset} 
              className="transition-all duration-1500 ease-out"
            />
          </svg>
          <div className="text-center">
            <div className="text-[10px] font-bold text-color-muted uppercase tracking-widest mb-1">Status</div>
            <div className="text-lg font-black font-serif leading-tight px-4" style={{ color: gaugeColor }}>
              {riskStatus}
            </div>
          </div>
        </div>
        <div className="flex-1 text-center md:text-left space-y-3">
          <h2 className="text-4xl font-black font-serif text-color-text italic tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'Student'}
          </h2>
          <p className="text-color-muted font-medium text-lg max-w-lg">
            {message}
          </p>
          <div className="pt-4">
            <Button onClick={() => navigate('/submissions')} className="font-bold rounded-xl px-6 bg-color-accent text-white shadow-sm hover:brightness-105 active:scale-95 transition-all">
              View My Submissions
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-8">
        {/* Chronicle Cards */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold font-serif flex items-center gap-2">
              <Activity className="w-6 h-6 text-color-accent" /> Active Course Files
            </h3>
            <Button variant="secondary" size="sm" onClick={() => navigate('/resources')} className="text-xs">
              <BookOpen className="w-3.5 h-3.5 mr-1" /> Resource Directory
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chronicles.length === 0 ? (
              <Card className="col-span-full p-10 text-center text-color-muted neu-raised bg-color-surface border border-dashed border-black/10">
                <p className="font-bold text-lg mb-2">No Active Courses</p>
                <p className="text-sm">You haven't enrolled in any courses yet.</p>
              </Card>
            ) : (
              chronicles.map((chronicle) => {
                // Using courseId + teacherId ensures absolute uniqueness if they have same course names
                const uniqueKey = `${chronicle.courseId}-${chronicle.teacherId}`;
                return (
                  <Card 
                    key={uniqueKey} 
                    onClick={() => setSelectedChronicle(chronicle)}
                    className="p-5 flex flex-col justify-between neu-raised border-l-4 border border-white/50 bg-color-surface transition-all duration-200 hover:shadow-[10px_10px_20px_var(--shadow-dark),-10px_-10px_20px_var(--shadow-light)] cursor-pointer hover:-translate-y-1"
                    style={{ borderLeftColor: chronicle.status === 'Completed' ? 'var(--color-success)' : chronicle.status === 'Pending' ? 'var(--color-warning)' : 'var(--color-accent)' }}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <div className="min-w-0">
                          <h4 className="font-bold text-color-text truncate font-serif text-lg leading-tight">{chronicle.courseName}</h4>
                          <p className="text-[10px] font-bold tracking-wider font-mono uppercase text-color-muted mt-1">{chronicle.className}</p>
                        </div>
                        <span className={`shrink-0 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest ${
                          chronicle.status === 'Completed' ? 'bg-color-success/15 text-color-success' : 
                          chronicle.status === 'Pending' ? 'bg-color-warning/15 text-color-warning' : 
                          'bg-color-accent/15 text-color-accent'
                        }`}>
                          {chronicle.status}
                        </span>
                      </div>
                      
                      {/* Explicit Teacher & Quiz Info */}
                      <div className="space-y-1.5 mt-4 pt-4 border-t border-black/5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-color-muted font-bold">Teacher:</span>
                          <span className="text-color-text font-medium truncate max-w-[140px]">{chronicle.teacherName || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-color-muted font-bold">Module:</span>
                          <span className="text-color-text font-medium truncate max-w-[140px]">{chronicle.resourceName}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-color-muted font-bold">Activity:</span>
                          <span className="text-color-text font-medium truncate max-w-[140px]">{chronicle.quizTitle}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-black/5 flex flex-col gap-3">
                      <div className="bg-black/5 p-3 rounded-xl border border-black/5">
                        <span className="font-bold text-color-muted uppercase text-[9px] tracking-wider block mb-1">Latest Feedback</span>
                        <p className="text-xs font-semibold text-color-text/80 line-clamp-2 italic">
                          "{chronicle.latestFeedback}"
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-center gap-2 mt-2">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => handleMessageTeacher(chronicle.teacherId, chronicle.teacherName)} 
                          className="text-[10px] py-1.5 px-3 rounded-lg bg-color-background shadow-sm hover:bg-black/5 flex-1 justify-center"
                        >
                          <MessageCircle className="w-3.5 h-3.5 mr-1.5" /> Message
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => navigate('/resources', { state: { targetCourseId: chronicle.courseId, targetClassName: chronicle.className } })} 
                          className="text-[10px] py-1.5 px-3 rounded-lg bg-color-accent/10 text-color-accent shadow-sm hover:bg-color-accent/20 flex-1 justify-center"
                        >
                          Open Files
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* Chronicle Modal */}
      {selectedChronicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-color-surface neu-raised border-2 border-white/20 shadow-2xl overflow-hidden relative">
            
            {/* Header */}
            <div className="p-6 border-b border-black/5 bg-color-background/50 flex justify-between items-start shrink-0">
              <div>
                <h2 className="text-3xl font-black font-serif text-color-text mb-1 leading-tight">{selectedChronicle.courseName}</h2>
                <div className="flex items-center gap-3 text-sm font-bold">
                  <span className="text-color-accent uppercase tracking-widest bg-color-accent/10 px-2 py-0.5 rounded">{selectedChronicle.className}</span>
                  <span className="text-color-muted flex items-center gap-1">Instructor: <span className="text-color-text">{selectedChronicle.teacherName}</span></span>
                </div>
              </div>
              <Button variant="icon" onClick={() => setSelectedChronicle(null)} className="rounded-full hover:bg-black/5 p-2 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </Button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-8 custom-scrollbar">
              
              {/* Module & Quiz Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="neu-inset p-5 rounded-2xl bg-color-surface border border-white/50">
                  <div className="flex items-center gap-2 mb-3 text-color-muted font-bold text-xs uppercase tracking-widest">
                    <BookOpen className="w-4 h-4" /> Active Module
                  </div>
                  <p className="text-xl font-bold font-serif text-color-text">{selectedChronicle.resourceName}</p>
                </div>
                <div className="neu-inset p-5 rounded-2xl bg-color-surface border border-white/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-color-muted font-bold text-xs uppercase tracking-widest">
                      <Activity className="w-4 h-4" /> Current Task
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-widest ${
                      selectedChronicle.status === 'Completed' ? 'bg-color-success/15 text-color-success' : 
                      selectedChronicle.status === 'Pending' ? 'bg-color-warning/15 text-color-warning' : 
                      'bg-color-accent/15 text-color-accent'
                    }`}>
                      {selectedChronicle.status}
                    </span>
                  </div>
                  <p className="text-xl font-bold font-serif text-color-text">{selectedChronicle.quizTitle}</p>
                </div>
              </div>

              {/* Version History Log */}
              <div>
                <h3 className="text-lg font-bold font-serif text-color-text mb-4 flex items-center gap-2 border-b border-black/5 pb-2">
                  Submission History Log
                </h3>
                
                <div className="space-y-4">
                  {(() => {
                    const relatedSubs = submissions.filter(s => {
                      const matchesQuiz = s.quiz.title === selectedChronicle.quizTitle;
                      if (!matchesQuiz) return false;
                      const courseName = s.quiz.resource?.course?.name || s.quiz.subject;
                      return courseName === selectedChronicle.courseName;
                    })
                      .sort((a, b) => (b.attemptNumber || 1) - (a.attemptNumber || 1));

                    if (relatedSubs.length === 0) {
                      return <p className="text-color-muted italic text-sm py-4">No submissions recorded for this task yet.</p>;
                    }

                    return relatedSubs.map((sub, idx) => {
                      const isLatest = idx === 0;
                      return (
                        <div key={sub.id} className={`p-5 rounded-2xl border ${isLatest ? 'border-color-accent/30 bg-color-accent/5 neu-raised' : 'border-black/5 bg-black/[0.02] opacity-80'}`}>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-color-text text-lg">Attempt {sub.attemptNumber || 1}</span>
                                {isLatest && <span className="text-[10px] bg-color-accent text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Latest</span>}
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
                                <img src={sub.answerImageUrl.startsWith('http') ? sub.answerImageUrl : `http://localhost:8080${sub.answerImageUrl}`} alt="Submission file" className="max-w-xs rounded-xl border border-black/10 shadow-sm" />
                              </div>
                            )}
                          </div>

                          {sub.feedback && (
                            <div className="mt-4 p-4 bg-color-warning/10 border-l-4 border-color-warning rounded-r-xl">
                              <span className="text-[10px] font-bold text-color-warning uppercase block mb-1">Teacher Feedback:</span>
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
              <Button onClick={() => handleMessageTeacher(selectedChronicle.teacherId, selectedChronicle.teacherName)} className="bg-color-accent text-white font-bold flex items-center gap-2">
                <MessageCircle className="w-4 h-4" /> Message Instructor
              </Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
