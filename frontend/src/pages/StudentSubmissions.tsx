import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, FileText, CheckCircle, UploadCloud, RotateCcw, AlertTriangle, X } from 'lucide-react';

interface QuizSubmission {
  id: number;
  quiz: {
    id: number;
    title: string;
    course?: {
      name: string;
      teacher?: {
        id: number;
        name: string;
        email: string;
        role: string;
      };
    };
  };
  score?: number;
  maxScore?: number;
  status: string; // "PENDING", "GRADED", "RESUBMISSION_REQUESTED"
  feedback?: string;
  evaluationDate?: string;
  attemptNumber?: number;
  resubmissionNote?: string;
  answerText?: string;
  answerImageUrl?: string;
}

export function StudentSubmissions() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  
  // Resubmission Modal State
  const [resubmitQuiz, setResubmitQuiz] = useState<QuizSubmission | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [resubmissionNote, setResubmissionNote] = useState('');
  const [answerImage, setAnswerImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchSubmissions = async () => {
    try {
      if (!token || token === 'mock-jwt-token') {
        return;
      }
      const res = await fetch('http://localhost:8080/api/submissions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data: QuizSubmission[] = await res.json();
        
        // Group by quizId to find the latest attempt
        const groupsMap = new Map<number, QuizSubmission[]>();
        data.forEach(sub => {
          if (!groupsMap.has(sub.quiz.id)) {
            groupsMap.set(sub.quiz.id, []);
          }
          groupsMap.get(sub.quiz.id)!.push(sub);
        });

        const activeSubmissions: QuizSubmission[] = [];
        const pastSubmissions: QuizSubmission[] = [];

        groupsMap.forEach(subs => {
          subs.sort((a, b) => (b.attemptNumber || 1) - (a.attemptNumber || 1));
          const latest = subs[0];
          activeSubmissions.push(latest);
          
          if (subs.length > 1) {
            pastSubmissions.push(...subs.slice(1));
          }
        });

        // Store latest as main list, and past attempts as separate state or just keep them all.
        // Actually, let's store all of them in submissions, but mark the active ones.
        setSubmissions(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [token]);

  // Group submissions by Quiz to identify the active attempt
  const latestSubmissionsMap = new Map<number, QuizSubmission>();
  const pastAttempts: QuizSubmission[] = [];

  submissions.forEach(sub => {
    const existing = latestSubmissionsMap.get(sub.quiz.id);
    if (!existing || (sub.attemptNumber || 1) > (existing.attemptNumber || 1)) {
      if (existing) pastAttempts.push(existing);
      latestSubmissionsMap.set(sub.quiz.id, sub);
    } else {
      pastAttempts.push(sub);
    }
  });

  const activeSubmissions = Array.from(latestSubmissionsMap.values());

  const pendingSubs = activeSubmissions.filter(s => s.status === 'PENDING');
  const evaluatedSubs = activeSubmissions.filter(s => s.status === 'GRADED');
  const requestedSubs = activeSubmissions.filter(s => s.status === 'RESUBMISSION_REQUESTED');
  
  // Merge past attempts into evaluated list for history view
  const allEvaluatedAndPast = [...evaluatedSubs, ...pastAttempts].sort((a, b) => (b.id - a.id));

  const handleChat = (teacher?: any) => {
    if (teacher) {
      navigate('/messages', { state: { targetUser: teacher } });
    } else {
      navigate('/messages');
    }
  };

  const handleResubmitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resubmitQuiz || (!answerText && !answerImage)) return;
    
    setSubmitting(true);
    const formData = new FormData();
    formData.append('quizId', resubmitQuiz.quiz.id.toString());
    if (answerText) formData.append('answerText', answerText);
    if (resubmissionNote) formData.append('resubmissionNote', resubmissionNote);
    if (answerImage) formData.append('file', answerImage);
    
    try {
      const response = await fetch('http://localhost:8080/api/submissions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (response.ok) {
        setResubmitQuiz(null);
        setAnswerText('');
        setResubmissionNote('');
        setAnswerImage(null);
        fetchSubmissions();
      } else {
        alert('Failed to submit. Error: ' + await response.text());
      }
    } catch (error) {
      console.error('Error submitting', error);
      alert('Error submitting');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in pb-10 max-w-5xl mx-auto space-y-6 relative">
      <div>
        <h1 className="text-3xl font-bold text-color-text font-serif">My Submissions</h1>
        <p className="text-color-muted mt-1 text-sm">Track your past assignments and teacher feedback.</p>
      </div>

      {requestedSubs.length > 0 && (
        <section>
          <h2 className="text-xl font-bold font-serif mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-color-warning" /> Resubmission Requested
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {requestedSubs.map(sub => (
              <Card key={sub.id} className="p-5 flex flex-col justify-between border border-color-warning/50 shadow-[0_0_10px_rgba(var(--color-warning-rgb),0.1)] bg-color-surface">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-color-text">{sub.quiz.title}</h3>
                    <p className="text-xs text-color-muted uppercase font-mono mt-1">{sub.quiz.course?.name || 'General'}</p>
                  </div>
                  <Badge variant="warning">RESUBMISSION REQUESTED</Badge>
                </div>
                {sub.feedback && (
                  <div className="mt-3 p-3 bg-color-warning/10 border-l-4 border-color-warning rounded-r-xl">
                    <p className="text-xs font-bold text-color-warning mb-1">Teacher's Note:</p>
                    <p className="text-sm italic text-color-text">"{sub.feedback}"</p>
                  </div>
                )}
                <div className="mt-4 flex justify-end gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleChat(sub.quiz.course?.teacher)}
                    variant="secondary"
                  >
                    <MessageCircle className="w-3.5 h-3.5 mr-1" /> Connect with Chat
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => setResubmitQuiz(sub)}
                    className="bg-color-warning text-black font-bold shadow-sm hover:brightness-105"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" /> Submit Again
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {pendingSubs.length > 0 && (
        <section>
          <h2 className="text-xl font-bold font-serif mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-color-muted" /> Awaiting Review
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingSubs.map(sub => (
              <Card key={sub.id} className="p-4 flex flex-col justify-between border-l-4 border-l-color-muted neu-raised bg-color-surface opacity-80">
                <div>
                  <h3 className="font-bold text-color-text">{sub.quiz.title}</h3>
                  <p className="text-[10px] text-color-muted uppercase font-mono mt-1">{sub.quiz.course?.name || 'General'}</p>
                  <p className="text-[10px] text-color-muted mt-2">Attempt #{sub.attemptNumber || 1}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Badge variant="secondary">PENDING (LOCKED)</Badge>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-bold font-serif mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-color-success" /> Past Submissions
        </h2>
        
        {allEvaluatedAndPast.length === 0 ? (
          <Card className="p-8 text-center text-color-muted border border-dashed border-black/10 bg-color-surface/50">
            No graded or past submissions found.
          </Card>
        ) : (
          <div className="space-y-3">
            {allEvaluatedAndPast.map(sub => {
              const isPastAttempt = pastAttempts.some(p => p.id === sub.id);
              return (
              <Card key={sub.id} className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-black/5 bg-color-surface ${isPastAttempt ? 'opacity-70 bg-black/[0.02]' : 'neu-raised'}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-color-text leading-tight">{sub.quiz.title}</h3>
                    {isPastAttempt && <Badge variant="secondary" className="text-[10px]">PREVIOUS ATTEMPT</Badge>}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-color-muted font-bold">{sub.quiz.course?.name || 'General'}</span>
                    <span className="text-color-muted">•</span>
                    <span className="text-[10px] uppercase font-mono text-color-muted">
                      Evaluated {sub.evaluationDate ? new Date(sub.evaluationDate).toLocaleDateString() : 'Unknown'}
                    </span>
                    <span className="text-color-muted">•</span>
                    <span className="text-[10px] uppercase font-mono text-color-muted">
                      Attempt #{sub.attemptNumber || 1}
                    </span>
                  </div>
                  
                  {sub.resubmissionNote && (
                    <div className="mt-3 p-3 bg-color-accent/5 rounded-xl text-sm border border-color-accent/10">
                      <span className="font-bold block mb-1 text-color-accent text-xs uppercase">Resubmission Note:</span>
                      {sub.resubmissionNote}
                    </div>
                  )}

                  {(sub.answerText || sub.answerImageUrl) && (
                    <div className="mt-3 p-3 bg-black/[0.02] rounded-xl text-sm border border-black/5 space-y-2">
                      <span className="font-bold block text-color-muted text-xs uppercase">Submitted Work:</span>
                      {sub.answerText && <p className="whitespace-pre-wrap">{sub.answerText}</p>}
                      {sub.answerImageUrl && (
                        <img src={sub.answerImageUrl.startsWith('http') ? sub.answerImageUrl : `http://localhost:8080${sub.answerImageUrl}`} alt="Submission file" className="max-w-[200px] rounded border border-black/10 mt-2" />
                      )}
                    </div>
                  )}

                  {sub.feedback && (
                    <div className="mt-3 p-3 bg-black/[0.02] rounded-xl text-sm italic text-color-text border border-black/5">
                      <span className="font-bold block mb-1 not-italic text-color-muted text-xs uppercase">Teacher Feedback:</span>
                      "{sub.feedback}"
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end shrink-0 gap-3">
                  <div className="flex items-end gap-1 font-serif">
                    <span className="text-3xl font-bold text-color-text leading-none">{sub.score !== undefined ? sub.score : '-'}</span>
                    <span className="text-sm font-bold text-color-muted mb-1">/ {sub.maxScore || '-'}</span>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {!isPastAttempt && (
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => setResubmitQuiz(sub)}
                        className="bg-color-background shadow-sm border border-black/5 text-xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1" /> Resubmit by Own
                      </Button>
                    )}
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => window.dispatchEvent(new CustomEvent('open-notes-panel'))}
                      className="bg-color-background shadow-sm border border-black/5 text-xs"
                    >
                      <FileText className="w-3.5 h-3.5 mr-1" /> Add on note
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleChat(sub.quiz.course?.teacher)}
                      className="bg-color-accent text-white font-bold text-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5 mr-1" /> Connected with chat
                    </Button>
                  </div>
                </div>
              </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Resubmission Modal */}
      {resubmitQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-2xl bg-color-background p-0 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-black/10 bg-color-surface flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg font-serif">Submit Attempt #{((resubmitQuiz.attemptNumber || 1) + 1)}</h3>
                <p className="text-xs text-color-muted">{resubmitQuiz.quiz.title}</p>
              </div>
              <button onClick={() => setResubmitQuiz(null)} className="p-2 hover:bg-black/5 rounded-full text-color-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleResubmitSubmit} className="p-6 space-y-6 overflow-y-auto">
              
              <div>
                <label className="block text-sm font-bold text-color-text mb-2">Resubmission Note (Optional)</label>
                <textarea 
                  rows={2} 
                  maxLength={500}
                  placeholder="Explain what you updated in this attempt (max 500 chars)..." 
                  value={resubmissionNote}
                  onChange={(e) => setResubmissionNote(e.target.value)}
                  className="w-full neu-inset px-4 py-3 bg-color-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                ></textarea>
                <p className="text-right text-[10px] text-color-muted mt-1">{resubmissionNote.length}/500</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-color-text mb-1">Written Response</label>
                <textarea 
                  rows={4} 
                  placeholder="Type your revised answer here..." 
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  className="w-full neu-inset px-3 py-2 bg-color-surface rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-color-text mb-1">Upload File/Image (Optional)</label>
                <div className="w-full h-24 neu-inset bg-color-surface border-2 border-dashed border-color-muted/30 rounded-lg flex flex-col items-center justify-center text-color-muted relative cursor-pointer hover:bg-black/5 transition-colors">
                  <input 
                    type="file" 
                    onChange={(e) => setAnswerImage(e.target.files ? e.target.files[0] : null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-6 h-6 mb-1" />
                  <p className="text-xs font-medium">{answerImage ? answerImage.name : 'Click to Upload Document'}</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setResubmitQuiz(null)}>Cancel</Button>
                <Button type="submit" disabled={submitting || (!answerText && !answerImage)} className="bg-color-warning text-black font-bold">
                  {submitting ? 'Submitting...' : 'Submit Revision'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
