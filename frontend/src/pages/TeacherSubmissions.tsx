import { API_BASE_URL } from '../config';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Check, MessageCircle, FileText, CheckCircle, RotateCcw, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  className: string;
  subject: string;
  questionsJson: string;
  questionText?: string;
  questionImageUrl?: string;
  course?: { id: number; name: string; className: string; };
}

interface QuizSubmission {
  id: number;
  quiz: Quiz;
  student: User;
  answersJson: string;
  answerText?: string;
  answerImageUrl?: string;
  score: number;
  maxScore: number;
  status: string; // "PENDING", "GRADED", "RESUBMISSION_REQUESTED"
  feedback: string;
  evaluationDate?: string;
  attemptNumber: number;
}

interface Question {
  q: string;
  a: string;
  options: string[];
}

interface SubmissionGroup {
  studentId: number;
  quizId: number;
  activeSubmission: QuizSubmission;
  history: QuizSubmission[];
}

export function TeacherSubmissions() {
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [submissionGroups, setSubmissionGroups] = useState<SubmissionGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<SubmissionGroup | null>(null);
  
  // Evaluation inputs
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [grading, setGrading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, [token]);

  useEffect(() => {
    if (selectedGroup) {
      setScore(selectedGroup.activeSubmission.score || 0);
      setFeedback(selectedGroup.activeSubmission.feedback || '');
      setStatusMsg('');
    }
  }, [selectedGroup]);

  const fetchSubmissions = async () => {
    try {
      if (!token || token === 'mock-jwt-token') {
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/submissions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data: QuizSubmission[] = await response.json();
        
        // Group by studentId and quizId
        const groupsMap = new Map<string, QuizSubmission[]>();
        data.forEach(sub => {
          const key = `${sub.student.id}-${sub.quiz.id}`;
          if (!groupsMap.has(key)) {
            groupsMap.set(key, []);
          }
          groupsMap.get(key)!.push(sub);
        });

        const groups: SubmissionGroup[] = [];
        groupsMap.forEach((subs) => {
          subs.sort((a, b) => b.attemptNumber - a.attemptNumber);
          const activeSubmission = subs[0];
          const history = subs.slice(1);
          groups.push({
            studentId: activeSubmission.student.id,
            quizId: activeSubmission.quiz.id,
            activeSubmission,
            history
          });
        });

        groups.sort((a, b) => b.activeSubmission.id - a.activeSubmission.id);
        setSubmissionGroups(groups);
        
        if (groups.length > 0 && !selectedGroup) {
          setSelectedGroup(groups[0]);
        } else if (selectedGroup) {
          const updatedSelected = groups.find(g => g.studentId === selectedGroup.studentId && g.quizId === selectedGroup.quizId);
          setSelectedGroup(updatedSelected || null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAction = async (e: React.FormEvent, action: 'GRADE' | 'REQUEST_RESUBMISSION') => {
    e.preventDefault();
    if (!selectedGroup) return;
    setGrading(true);
    setStatusMsg('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/submissions/${selectedGroup.activeSubmission.id}/grade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ score, feedback, action })
      });

      if (response.ok) {
        setStatusMsg(action === 'GRADE' ? 'Success: Grade published!' : 'Success: Resubmission requested!');
        fetchSubmissions();
      } else {
        const err = await response.text();
        setStatusMsg(`Error: ${err || 'Failed to process request'}`);
      }
    } catch (e: any) {
      setStatusMsg(`Error: ${e.message || 'Server connection offline'}`);
    } finally {
      setGrading(false);
    }
  };

  const renderActiveSubmissionDetails = (sub: QuizSubmission) => {
    let questions: Question[] = [];
    try {
      if (sub.quiz.questionsJson) questions = JSON.parse(sub.quiz.questionsJson);
    } catch (e) {}

    let answers: string[] = [];
    try {
      if (sub.answersJson) answers = JSON.parse(sub.answersJson);
    } catch (e) {}

    return (
      <div className="space-y-6 animate-fade-in">
        
        {/* Dynamic Resubmission Badge */}
        {sub.attemptNumber > 1 && (
          <div className="bg-color-warning/10 border-l-4 border-color-warning p-4 rounded-r-xl flex items-center justify-between mb-4 shadow-[0_0_15px_rgba(var(--color-warning-rgb),0.15)]">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-color-warning animate-[spin_4s_linear_infinite]" />
              <h4 className="font-bold text-color-warning text-sm uppercase tracking-wide">RESUBMISSION (Attempt #{sub.attemptNumber})</h4>
            </div>
            <p className="text-sm font-bold text-color-warning">Reviewing revised work.</p>
          </div>
        )}

        {/* Free Text / Image Output */}
        {(sub.answerText || sub.answerImageUrl) && (
          <Card className="p-6 border border-black/5 neu-inset bg-color-surface space-y-4">
            <h4 className="font-bold text-sm text-color-muted uppercase tracking-widest font-mono border-b border-black/5 pb-2">Student Response Document</h4>
            {sub.answerText && (
              <p className="text-sm text-color-text whitespace-pre-wrap leading-relaxed">{sub.answerText}</p>
            )}
            {sub.answerImageUrl && (
              <div className="mt-4">
                <p className="text-xs font-bold text-color-muted uppercase mb-2">Attached Document:</p>
                <img src={sub.answerImageUrl.startsWith('http') ? sub.answerImageUrl : `${API_BASE_URL}${sub.answerImageUrl}`} alt="Student attachment" className="max-w-full rounded-xl border border-black/10 shadow-sm" />
              </div>
            )}
          </Card>
        )}

        {/* MCQs Output */}
        {questions.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-color-muted uppercase tracking-widest font-mono border-b border-black/5 pb-2">Multiple Choice Responses</h4>
            {questions.map((q, i) => {
              const studentAnswer = answers[i] || 'Not answered';
              const isCorrect = studentAnswer === q.a;
              return (
                <div key={i} className={`p-4 rounded-xl border ${isCorrect ? 'border-color-success/50 bg-color-success/5' : 'border-color-warning/50 bg-color-warning/5'}`}>
                  <p className="font-bold text-color-text mb-3">{i + 1}. {q.q}</p>
                  <div className="space-y-2 pl-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-bold text-color-muted w-24">Student:</span>
                      <span className={isCorrect ? 'text-color-success font-bold' : 'text-color-warning font-bold'}>{studentAnswer}</span>
                      {isCorrect ? <CheckCircle className="w-4 h-4 text-color-success" /> : <AlertTriangle className="w-4 h-4 text-color-warning" />}
                    </div>
                    {!isCorrect && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-bold text-color-muted w-24">Correct:</span>
                        <span className="text-color-text font-bold">{q.a}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderHistoryLog = (history: QuizSubmission[]) => {
    if (history.length === 0) return null;

    return (
      <div className="mt-12 space-y-4">
        <h3 className="font-bold text-sm text-color-muted flex items-center gap-2 tracking-wide uppercase">
          <RotateCcw className="w-5 h-5" /> History Log (Previous Attempts)
        </h3>
        {history.map(sub => (
          <Card key={sub.id} className="p-6 bg-black/[0.02] border border-black/5 opacity-80 space-y-4">
            <div className="flex justify-between items-center border-b border-black/5 pb-3">
              <h4 className="font-bold text-color-text">Attempt #{sub.attemptNumber}</h4>
              <Badge variant="warning">REJECTED / REQUESTED RESUBMISSION</Badge>
            </div>
            
            {(sub.answerText || sub.answerImageUrl) && (
              <div className="space-y-3">
                {sub.answerText && (
                  <p className="text-xs text-color-text whitespace-pre-wrap">{sub.answerText}</p>
                )}
                {sub.answerImageUrl && (
                  <img src={sub.answerImageUrl.startsWith('http') ? sub.answerImageUrl : `${API_BASE_URL}${sub.answerImageUrl}`} alt="History attachment" className="max-w-[200px] rounded-lg border border-black/10" />
                )}
              </div>
            )}
            
            {sub.feedback && (
              <div className="mt-4 p-3 bg-color-warning/10 rounded-lg text-xs italic text-color-warning border border-color-warning/20">
                <span className="font-bold block mb-1">Feedback Given:</span>
                "{sub.feedback}"
              </div>
            )}
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto h-[calc(100vh-8rem)] flex gap-6">
      
      {/* Left Sidebar: Submission Queue */}
      <div className="w-96 flex flex-col gap-4 bg-color-surface neu-raised border border-white/50 rounded-2xl p-4 overflow-hidden">
        <div className="pb-3 border-b border-black/5 shrink-0">
          <h2 className="text-sm font-bold text-color-text flex items-center gap-2 uppercase tracking-wide">
            <FileText className="w-4 h-4" /> Submissions Queue
          </h2>
          <p className="text-[10px] text-color-muted uppercase font-mono mt-1 tracking-widest">{submissionGroups.length} Item(s)</p>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {submissionGroups.map(group => {
            const isSelected = selectedGroup?.activeSubmission.id === group.activeSubmission.id;
            const sub = group.activeSubmission;
            const isResub = sub.attemptNumber > 1;

            return (
              <div 
                key={sub.id} 
                onClick={() => setSelectedGroup(group)}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${
                  isSelected ? 'bg-color-accent/10 text-color-text border-color-accent shadow-md scale-[1.02]' : 'bg-white hover:bg-black/5 border-black/10'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar fallback={sub.student.name.charAt(0)} size="sm" />
                    <div>
                      <h4 className="font-bold text-sm text-color-text">{sub.student.name}</h4>
                      <p className={`text-[10px] font-mono uppercase ${isSelected ? 'text-color-accent' : 'text-color-muted'}`}>{sub.quiz.course?.name || sub.quiz.title}</p>
                    </div>
                  </div>
                  {isResub && (
                    <Badge variant={isSelected ? 'default' : 'warning'} className="text-[8px] px-1.5 py-0.5">RESUB</Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs font-bold text-color-text">
                    {sub.quiz.title}
                  </span>
                  <div className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${
                    sub.status === 'PENDING' ? 'bg-color-warning text-black' :
                    sub.status === 'RESUBMISSION_REQUESTED' ? 'bg-color-warning/50 text-black' :
                    'bg-color-success text-white'
                  }`}>
                    {sub.status === 'RESUBMISSION_REQUESTED' ? 'WAITING' : sub.status}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Panel: Grading Workspace */}
      <div className="flex-1 flex flex-col bg-color-surface neu-raised border border-white/50 rounded-2xl overflow-hidden relative">
        {selectedGroup ? (
          <div className="absolute inset-0 flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b border-black/5 flex items-center justify-between bg-color-surface/50 backdrop-blur-md shrink-0">
              <div>
                <h2 className="text-xl font-bold text-color-text">{selectedGroup.activeSubmission.quiz.title}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm font-bold text-color-accent">{selectedGroup.activeSubmission.student.name}</span>
                  <span className="text-color-muted text-xs">•</span>
                  <span className="text-xs text-color-muted">{selectedGroup.activeSubmission.quiz.course?.name || selectedGroup.activeSubmission.quiz.subject}</span>
                </div>
              </div>
              <Button size="sm" variant="secondary" onClick={() => navigate('/messages', { state: { targetUser: selectedGroup.activeSubmission.student } })}>
                <MessageCircle className="w-4 h-4 mr-2" /> Message Student
              </Button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              
              {/* Submission Details */}
              {renderActiveSubmissionDetails(selectedGroup.activeSubmission)}
              
              {/* History Log */}
              {renderHistoryLog(selectedGroup.history)}

            </div>

            {/* Footer Grading Form */}
            <div className="p-4 border-t border-black/10 bg-white shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
              <form className="flex items-end gap-4">
                <div className="w-24 shrink-0">
                  <label className="block text-[10px] font-bold text-color-muted uppercase tracking-widest mb-1.5">Score</label>
                  <div className="relative flex items-center border border-black/20 rounded-lg bg-color-surface overflow-hidden">
                    <input 
                      type="number" 
                      value={score}
                      onChange={(e) => setScore(Number(e.target.value))}
                      className="w-full pl-3 pr-8 py-2 bg-transparent focus:outline-none text-sm font-bold text-color-text"
                      min="0"
                      max={selectedGroup.activeSubmission.maxScore || 100}
                    />
                    <span className="absolute right-2 text-xs text-color-muted font-bold">/{selectedGroup.activeSubmission.maxScore || '-'}</span>
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-color-muted uppercase tracking-widest mb-1.5">Feedback</label>
                  <input 
                    type="text" 
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide constructive feedback..."
                    className="w-full px-3 py-2 border border-black/20 bg-color-surface rounded-lg focus:outline-none focus:border-color-accent text-sm"
                  />
                </div>

                <div className="w-64 shrink-0 flex gap-2 h-[38px]">
                  <Button 
                    onClick={(e) => handleAction(e, 'REQUEST_RESUBMISSION')}
                    disabled={grading}
                    variant="secondary"
                    className="flex-1 px-0 text-xs py-0 bg-white border border-color-warning text-color-warning hover:bg-color-warning hover:text-black font-bold rounded-lg shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mx-auto" /> 
                  </Button>
                  <Button 
                    onClick={(e) => handleAction(e, 'GRADE')}
                    disabled={grading}
                    className="flex-[3] text-xs py-0 bg-color-accent text-white font-bold rounded-lg shadow-sm hover:brightness-110"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" /> 
                    {grading ? '...' : 'Publish'}
                  </Button>
                </div>
              </form>
              
              {statusMsg && (
                <div className={`mt-4 p-3 rounded-xl text-sm font-bold text-center animate-fade-in ${statusMsg.startsWith('Error') ? 'bg-color-warning/20 text-color-warning' : 'bg-color-success/20 text-color-success'}`}>
                  {statusMsg}
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-color-muted">
            <CheckCircle className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-xl font-bold text-color-text">You're all caught up!</p>
            <p className="text-sm">No submissions require your attention.</p>
          </div>
        )}
      </div>
    </div>
  );
}
