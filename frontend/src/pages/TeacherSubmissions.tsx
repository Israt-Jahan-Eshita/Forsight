import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Check, MessageCircle, AlertCircle, FileText, CheckCircle, XCircle } from 'lucide-react';
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
}

interface QuizSubmission {
  id: number;
  quiz: Quiz;
  student: User;
  answersJson: string;
  score: number;
  maxScore: number;
  status: string; // "PENDING", "GRADED"
  feedback: string;
  evaluationDate?: string;
}

interface Question {
  q: string;
  a: string;
  options: string[];
}

export function TeacherSubmissions() {
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [selectedSub, setSelectedSub] = useState<QuizSubmission | null>(null);
  
  // Evaluation inputs
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [grading, setGrading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, [token]);

  useEffect(() => {
    if (selectedSub) {
      setScore(selectedSub.score || 0);
      setFeedback(selectedSub.feedback || '');
      setStatusMsg('');
    }
  }, [selectedSub]);

  const fetchSubmissions = async () => {
    try {
      if (!token || token === 'mock-jwt-token') {
        const mockSubs: QuizSubmission[] = [
          {
            id: 1,
            quiz: { id: 1, title: 'Physics Unit 1 Practice', description: 'Forces and Kinematics', className: 'Class 10', subject: 'Physics', questionsJson: '[{"q":"What is the formula for force?","a":"F = ma","options":["F = ma","E = mc^2","V = IR","P = IV"]},{"q":"What is the standard acceleration due to gravity on Earth?","a":"9.8 m/s^2","options":["9.8 m/s^2","8.9 m/s^2","10.5 m/s^2","7.2 m/s^2"]}]' },
            student: { id: 2, name: 'Sara Rahman', email: 'sara@student.edu' },
            answersJson: '["F = ma", "8.9 m/s^2"]',
            score: 1,
            maxScore: 2,
            status: 'PENDING',
            feedback: ''
          }
        ];
        setSubmissions(mockSubs);
        setSelectedSub(mockSubs[0]);
        return;
      }


      const response = await fetch('http://localhost:8080/api/submissions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
        if (data.length > 0) {
          setSelectedSub(data[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    setGrading(true);
    setStatusMsg('');

    try {
      if (!token || token === 'mock-jwt-token') {
        const updated = submissions.map(s => {
          if (s.id === selectedSub.id) {
            return { ...s, score, feedback, status: 'GRADED' };
          }
          return s;
        });
        setSubmissions(updated);
        setSelectedSub({ ...selectedSub, score, feedback, status: 'GRADED' });
        setStatusMsg('Success: Grade recorded in Preview Mode!');
        setGrading(false);
        return;
      }

      const response = await fetch(`http://localhost:8080/api/submissions/${selectedSub.id}/grade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ score, feedback })
      });

      if (response.ok) {
        setStatusMsg('Success: Grade recorded successfully!');
        fetchSubmissions();
      } else {
        const err = await response.text();
        setStatusMsg(`Error: ${err || 'Failed to submit grade'}`);
      }
    } catch (e: any) {
      setStatusMsg(`Error: ${e.message || 'Server connection offline'}`);
    } finally {
      setGrading(false);
    }
  };

  // Helper to parse questions safely
  const getQuestions = (sub: QuizSubmission): Question[] => {
    try {
      return JSON.parse(sub.quiz.questionsJson || '[]');
    } catch (e) {
      return [];
    }
  };

  // Helper to parse answers safely
  const getAnswers = (sub: QuizSubmission): string[] => {
    try {
      return JSON.parse(sub.answersJson || '[]');
    } catch (e) {
      return [];
    }
  };

  return (
    <div className="animate-fade-in pb-20 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 h-[calc(100vh-120px)]">
      
      {/* Submissions Feed List */}
      <div className="w-full lg:w-[400px] flex flex-col space-y-4 overflow-y-auto pr-2 pb-10 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-color-text font-serif">Submissions</h1>
          <p className="text-color-muted mt-1 text-sm">Review student answers and file grades.</p>
        </div>

        {submissions.length === 0 ? (
          <Card className="h-60 flex flex-col items-center justify-center text-color-muted neu-raised bg-color-surface">
            <AlertCircle className="w-12 h-12 mb-2 opacity-25" />
            <p className="font-semibold text-sm">No student submissions yet.</p>
          </Card>
        ) : (
          submissions.map((sub) => (
            <Card 
              key={sub.id} 
              className={`p-4 cursor-pointer transition-all border border-white/50 bg-color-surface/90 hover:shadow-sm ${selectedSub?.id === sub.id ? 'neu-inset ring-2 ring-color-accent' : 'neu-raised'}`}
              onClick={() => setSelectedSub(sub)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Avatar fallback={sub.student.name[0]} size="sm" />
                  <div>
                    <h4 className="font-bold text-color-text text-sm">{sub.student.name}</h4>
                    <p className="text-xs text-color-muted font-medium mt-0.5">{sub.quiz.title}</p>
                  </div>
                </div>
                <Badge variant={sub.status === 'PENDING' ? 'warning' : 'success'}>
                  {sub.status === 'PENDING' ? 'Pending' : 'Graded'}
                </Badge>
              </div>
              <div className="mt-4 flex items-center justify-between text-[10px] text-color-muted font-bold">
                <span className="bg-color-accent/15 text-color-accent px-2 py-0.5 rounded-full text-black font-bold">
                  {sub.quiz.subject}
                </span>
                <span>Score: {sub.score}/{sub.maxScore}</span>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Detail & Action View */}
      {selectedSub ? (
        <Card className="flex-1 flex flex-col p-0 overflow-hidden border border-white/50 bg-color-surface/80 neu-raised">
          
          {/* Header Panel */}
          <div className="p-6 border-b border-black/5 bg-color-surface/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-color-text font-serif leading-tight">{selectedSub.quiz.title}</h2>
              <p className="text-xs text-color-muted font-semibold mt-1">Submitted by <span className="text-color-text font-bold">{selectedSub.student.name}</span> ({selectedSub.student.email})</p>
            </div>
            <Button 
              size="sm" 
              variant="secondary" 
              className="flex items-center gap-1.5 font-bold self-start md:self-center bg-color-accent/15 text-color-accent hover:bg-color-accent/20 border-none font-bold text-black"
              onClick={() => navigate('/messages', { state: { targetUser: selectedSub.student } })}
            >
              <MessageCircle className="w-4.5 h-4.5" /> Direct Chat with Student
            </Button>
          </div>
          
          <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
            
            {/* Student's detailed answer sheet */}
            <div className="flex-1 p-6 overflow-y-auto border-r border-black/5 space-y-6">
              <h3 className="text-md font-bold font-serif text-color-text border-b border-black/5 pb-2">Student Answer Sheet</h3>
              {getQuestions(selectedSub).map((q, idx) => {
                const studentAns = getAnswers(selectedSub)[idx];
                const isCorrect = q.a === studentAns;
                return (
                  <div key={idx} className="p-4 bg-color-surface border border-black/5 rounded-xl space-y-3">
                    <p className="font-bold text-xs text-color-text">Q{idx + 1}. {q.q}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2">
                      <div className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${isCorrect ? 'bg-color-success/15 text-color-success' : 'bg-color-danger/15 text-color-danger'}`}>
                        {isCorrect ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>Answer: {studentAns || 'No Answer'}</span>
                      </div>
                      {!isCorrect && (
                        <div className="p-2 rounded-lg text-xs font-semibold bg-color-success/15 text-color-success flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Correct: {q.a}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Action panel (Evaluation Desk) */}
            <div className="w-full lg:w-80 p-6 flex flex-col space-y-6 bg-color-background overflow-y-auto shrink-0">
              <h3 className="font-bold font-serif text-sm border-b border-black/5 pb-2 text-color-text uppercase tracking-wide">
                Evaluation Desk
              </h3>
              
              {statusMsg && (
                <div className={`p-3 text-xs font-semibold rounded-xl text-center neu-inset ${statusMsg.startsWith('Success') ? 'bg-color-success/15 text-color-success' : 'bg-color-danger/15 text-color-danger'}`}>
                  {statusMsg}
                </div>
              )}

              <form onSubmit={handleGrade} className="space-y-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-color-muted uppercase ml-1">Awarded Score</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input 
                      type="number" 
                      min="0" 
                      max={selectedSub.maxScore}
                      value={score} 
                      onChange={(e) => setScore(parseInt(e.target.value) || 0)}
                      required 
                      className="w-20 neu-inset px-3 py-2 text-center font-bold text-sm bg-color-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-accent" 
                    />
                    <span className="text-sm font-bold text-color-muted">/ {selectedSub.maxScore} Max</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-color-muted uppercase ml-1">Evaluation Feedback</label>
                  <textarea 
                    placeholder="Enter assessment comments..." 
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    required
                    className="w-full mt-1 neu-inset px-4 py-2.5 bg-color-surface text-sm text-color-text focus:outline-none focus:ring-2 focus:ring-accent rounded-xl min-h-[140px]" 
                  />
                </div>

                <Button type="submit" className="w-full h-11 flex items-center justify-center gap-2 font-bold mt-4" disabled={grading}>
                  <Check className="w-4 h-4" /> {grading ? 'Saving Grade...' : 'Publish Evaluation Grade'}
                </Button>
              </form>
            </div>

          </div>
        </Card>
      ) : (
        <Card className="flex-1 flex flex-col items-center justify-center p-10 text-center text-color-muted bg-color-surface/40 neu-raised">
          <FileText className="w-16 h-16 mb-4 opacity-20 text-color-accent" />
          <h4 className="font-bold text-lg font-serif">Awaiting Submission Selection</h4>
          <p className="text-sm opacity-70 mt-1 max-w-sm">Please select a student submission from the list on the left to grade.</p>
        </Card>
      )}
    </div>
  );
}
