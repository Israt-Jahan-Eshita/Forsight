import { API_BASE_URL } from '../config';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FileQuestion, CheckCircle, XCircle, ChevronLeft, Bot, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Question {
  q: string;
  a: string;
  options: string[];
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
  resource?: { id: number };
}

export function StudentQuizzes() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const selectedQuizId = location.state?.quizId as number | undefined;

  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // Quiz taking state
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  
  // Free text / image answer state
  const [answerText, setAnswerText] = useState('');
  const [answerImage, setAnswerImage] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  
  // Graded / Result state
  const [showResult, setShowResult] = useState(false);
  const [gradedResult, setGradedResult] = useState<any>(null);
  const [allSubmissions, setAllSubmissions] = useState<any[]>([]);

  const [quizStartTime, setQuizStartTime] = useState<string>('');

  useEffect(() => {
    fetchQuizzesAndSubmissions();
  }, [token, selectedQuizId]);

  const fetchQuizzesAndSubmissions = async () => {
    try {
      if (!token || token === 'mock-jwt-token') {
        const localQz = localStorage.getItem('fs_mock_quizzes');
        const mockQz: Quiz[] = localQz ? JSON.parse(localQz) : [
          { id: 1, title: 'Physics Unit 1 Practice', description: 'Kinematics and Forces', className: 'Class 10', subject: 'Physics', questionsJson: '[{"q":"What is the formula for force?","a":"F = ma","options":["F = ma","E = mc^2","V = IR","P = IV"]},{"q":"What is the standard acceleration due to gravity on Earth?","a":"9.8 m/s^2","options":["9.8 m/s^2","8.9 m/s^2","10.5 m/s^2","7.2 m/s^2"]}]' }
        ];

        if (selectedQuizId) {
          const qz = mockQz.find(q => q.id === selectedQuizId);
          if (qz) {
            setActiveQuiz(qz);
            setQuizStartTime(new Date().toISOString());
            const parsedQ = JSON.parse(qz.questionsJson || '[]');
            setQuestions(parsedQ);
            setSelectedAnswers(new Array(parsedQ.length).fill(''));

            const localSub = localStorage.getItem('fs_mock_submissions');
            const submissions = localSub ? JSON.parse(localSub) : [];
            const existingSubs = submissions.filter((s: any) => s.quiz.id === selectedQuizId).sort((a: any, b: any) => b.id - a.id);
            if (existingSubs.length > 0) {
              setAllSubmissions(existingSubs);
              setGradedResult(existingSubs[0]);
              setShowResult(true);
            }
          }
        }
        return;
      }

      // Fetch active quizzes
      const response = await fetch(`${API_BASE_URL}/api/quizzes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data: Quiz[] = await response.json();

      // Check if student has already submitted this specific quiz
      if (selectedQuizId) {
        const subResponse = await fetch(`${API_BASE_URL}/api/submissions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const submissions = await subResponse.json();
        const existingSubs = submissions.filter((s: any) => s.quiz.id === selectedQuizId).sort((a: any, b: any) => b.id - a.id);
        
        const qz = data.find(q => q.id === selectedQuizId);
        if (qz) {
          setActiveQuiz(qz);
          setQuizStartTime(new Date().toISOString());
          const parsedQ = JSON.parse(qz.questionsJson || '[]') as Question[];
          setQuestions(parsedQ);
          setSelectedAnswers(new Array(parsedQ.length).fill(''));

          if (existingSubs.length > 0) {
            setAllSubmissions(existingSubs);
            setGradedResult(existingSubs[0]);
            setShowResult(true);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectOption = (opt: string) => {
    const updated = [...selectedAnswers];
    updated[currentQ] = opt;
    setSelectedAnswers(updated);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    }
  };

  const handleBack = () => {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1);
    }
  };

  const handleSubmit = async () => {
    const hasQuestions = questions.length > 0;
    if (hasQuestions && selectedAnswers.includes('')) {
      alert('Please answer all multiple-choice questions before submitting.');
      return;
    }
    if (!hasQuestions && !answerText && !answerImage) {
      alert('Please provide an answer text or upload an image.');
      return;
    }

    setSubmitting(true);

    let score = 0;
    if (hasQuestions) {
      questions.forEach((q, idx) => {
        if (q.a === selectedAnswers[idx]) {
          score++;
        }
      });
    }

    try {
      const formData = new FormData();
      if (activeQuiz?.id) formData.append('quizId', activeQuiz.id.toString());
      if (hasQuestions) formData.append('answersJson', JSON.stringify(selectedAnswers));
      if (answerText) formData.append('answerText', answerText);
      if (answerImage) formData.append('file', answerImage);
      formData.append('score', score.toString());
      formData.append('maxScore', (hasQuestions ? questions.length : 10).toString());
      if (quizStartTime) formData.append('startTime', quizStartTime);
      
      const resourceId = activeQuiz?.resource?.id;
      const resourceOpened = resourceId ? localStorage.getItem(`opened_resource_${resourceId}`) === 'true' : false;
      formData.append('resourceOpened', resourceOpened ? 'true' : 'false');

      if (!token || token === 'mock-jwt-token') {
        const mockSub = {
          id: 999,
          quiz: activeQuiz,
          score,
          maxScore: hasQuestions ? questions.length : 10,
          status: 'PENDING',
          answersJson: hasQuestions ? JSON.stringify(selectedAnswers) : '',
          answerText,
          feedback: 'Great effort! Your answers are submitted for detailed review.'
        };
        
        const localSub = localStorage.getItem('fs_mock_submissions');
        const list = localSub ? JSON.parse(localSub) : [];
        const updated = [...list.filter((s: any) => s.quiz.id !== activeQuiz?.id), mockSub]; // Replace mock
        localStorage.setItem('fs_mock_submissions', JSON.stringify(updated));
        
        setAllSubmissions([mockSub]);
        setGradedResult(mockSub);
        setShowResult(true);
        setSubmitting(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/submissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const savedSub = await response.json();
        setAllSubmissions(prev => [savedSub, ...prev]);
        setGradedResult(savedSub);
        setShowResult(true);
      } else {
        const err = await response.text();
        alert(`Submission failed: ${err || 'Server error'}`);
      }
    } catch (e: any) {
      alert(`Submission failed: ${e.message || 'Server connection offline'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Render Graded Result View
  if (showResult && gradedResult) {
    const studentAnswers = JSON.parse(gradedResult.answersJson || '[]');
    const isGraded = gradedResult.status === 'GRADED';
    
    return (
      <div className="animate-fade-in pb-20 max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-black/5 pb-4">
          <Button variant="secondary" size="sm" onClick={() => navigate('/resources')} className="flex items-center gap-1 shrink-0 self-start sm:self-auto">
            <ChevronLeft className="w-4 h-4" /> Back to shelf
          </Button>
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {allSubmissions.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-color-muted uppercase tracking-wider hidden sm:inline">History:</span>
                <select 
                  id="submission-history"
                  value={gradedResult?.id || ''}
                  onChange={(e) => {
                    const selected = allSubmissions.find(s => s.id.toString() === e.target.value);
                    if (selected) setGradedResult(selected);
                  }}
                  className="bg-color-surface neu-inset text-xs font-bold text-color-text px-3 py-1.5 rounded-lg border-none focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer max-w-[180px]"
                >
                  {allSubmissions.map((sub, idx) => {
                    const date = new Date(sub.submissionDate);
                    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
                    return (
                      <option key={sub.id} value={sub.id}>
                        Attempt {allSubmissions.length - idx} • {formattedDate}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
            <Button 
              size="sm" 
              className="bg-color-accent text-white font-bold shrink-0"
              onClick={() => {
                setShowResult(false);
                setGradedResult(null);
                setCurrentQ(0);
                setSelectedAnswers(new Array(questions.length).fill(''));
                setAnswerText('');
                setAnswerImage(null);
                setQuizStartTime(new Date().toISOString());
              }}
            >
              Take Again
            </Button>
          </div>
        </div>

        <div className="text-center py-6">
          <div className="relative w-40 h-40 mx-auto flex items-center justify-center neu-inset rounded-full shrink-0 mb-4">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="70" fill="none" stroke="var(--color-background)" strokeWidth="12" />
              <circle 
                cx="80" cy="80" r="70" fill="none" 
                stroke={isGraded ? "var(--color-success)" : "var(--color-warning)"} strokeWidth="12" 
                strokeDasharray="440" 
                strokeDashoffset={440 - (440 * (gradedResult.score / (gradedResult.maxScore || 1)))} 
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="text-center">
              <div className="text-[10px] font-bold text-color-muted uppercase">Grade Score</div>
              <div className="text-2xl font-bold text-color-text">
                {gradedResult.score} / {gradedResult.maxScore}
              </div>
              <span className="text-[10px] opacity-75 font-semibold">
                {isGraded ? 'Graded' : 'Awaiting Grade'}
              </span>
            </div>
          </div>
          <h1 className="text-2xl font-bold font-serif text-color-text">Practice Assessment Complete!</h1>
          <p className="text-xs text-color-muted mt-1">Review your results and instructor feedback below.</p>

        </div>

        {/* Teacher Feedback Section */}
        <Card className="p-5 border-l-4 border-color-accent bg-color-surface neu-raised">
          <h4 className="font-bold text-color-accent flex items-center gap-1.5 text-sm uppercase tracking-wide">
            <Bot className="w-4 h-4" /> Instructor Evaluation & Feedback
          </h4>
          <p className="text-sm text-color-text font-medium mt-2 leading-relaxed">
            {gradedResult.feedback || 'Your submission has been filed successfully. The teacher will evaluate your free responses and provide feedback shortly.'}
          </p>
          {gradedResult.quiz?.teacher && (
            <div className="mt-4 pt-4 border-t border-black/5 flex items-center justify-between">
              <div className="text-xs text-color-muted">
                Instructor: <span className="font-bold text-color-text">{gradedResult.quiz.teacher.name}</span>
              </div>
              <Button 
                size="sm" 
                variant="secondary" 
                className="flex items-center gap-1"
                onClick={() => navigate('/messages', { state: { targetUser: gradedResult.quiz.teacher } })}
              >
                <MessageCircle className="w-4 h-4" /> Chat with Teacher
              </Button>
            </div>
          )}
        </Card>

        {/* Review Questions Grid */}
        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-bold font-serif text-color-text">Detailed Answer Sheet</h3>
          
          {questions.length === 0 ? (
            <Card className="p-5 border border-white/50 bg-color-surface neu-raised space-y-4">
              {gradedResult.answerText && (
                <div>
                  <h4 className="text-xs font-bold text-color-muted uppercase mb-2">Your Text Answer</h4>
                  <p className="text-sm font-mono whitespace-pre-wrap p-3 bg-color-surface neu-inset rounded-xl">{gradedResult.answerText}</p>
                </div>
              )}
              {gradedResult.answerImageUrl && (
                <div>
                  <h4 className="text-xs font-bold text-color-muted uppercase mb-2">Your Uploaded Image</h4>
                  <img src={`${API_BASE_URL}${gradedResult.answerImageUrl}`} alt="Submitted Work" className="max-w-full rounded-lg border border-black/10" />
                </div>
              )}
            </Card>
          ) : (
            questions.map((q, idx) => {
              const isCorrect = q.a === studentAnswers[idx];
              return (
                <Card key={idx} className="p-5 border border-white/50 bg-color-surface neu-raised">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-bold text-color-text text-sm">Q{idx + 1}. {q.q}</h4>
                      <div className="mt-3 space-y-2">
                        <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${isCorrect ? 'bg-color-success/15 text-color-success' : 'bg-color-danger/15 text-color-danger'}`}>
                          {isCorrect ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          <span>Your Answer: {studentAnswers[idx]}</span>
                        </div>
                        {!isCorrect && (
                          <div className="p-2.5 rounded-xl text-xs font-semibold bg-color-success/15 text-color-success flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4" />
                            <span>Correct Answer: {q.a}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // Render Interactive Quiz Taking View
  if (activeQuiz && (questions.length > 0 || activeQuiz.questionText || activeQuiz.questionImageUrl)) {
    const isMCQ = questions.length > 0;
    
    return (
      <div className="animate-fade-in pb-20 max-w-3xl mx-auto flex flex-col items-center pt-8 space-y-6">
        <div className="w-full flex justify-between items-center">
          <Button variant="secondary" size="sm" onClick={() => { setActiveQuiz(null); }} className="flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Cancel
          </Button>
          <span className="font-bold text-color-muted text-xs uppercase">
            {isMCQ ? `Question ${currentQ + 1} of ${questions.length}` : 'Free Response Question'}
          </span>
        </div>
        
        {isMCQ && (
          <div className="w-full h-2 neu-inset rounded-full bg-color-surface overflow-hidden">
            <div className="h-full bg-color-accent transition-all duration-300" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}></div>
          </div>
        )}

        <Card className="w-full p-8 md:p-10 text-center shadow-lg border border-white/50 bg-color-surface/95 neu-raised">
          {isMCQ ? (
            <>
              <h2 className="text-xl md:text-2xl font-bold font-serif mb-8 text-color-text leading-relaxed">
                {questions[currentQ].q}
              </h2>
              
              <div className="flex flex-col gap-4 max-w-md mx-auto text-left">
                {questions[currentQ].options.map((opt) => (
                  <label 
                    key={opt}
                    onClick={() => handleSelectOption(opt)} 
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 select-none ${selectedAnswers[currentQ] === opt ? 'neu-inset border-color-accent text-color-accent font-bold scale-[0.98]' : 'neu-raised hover:bg-black/[0.01] text-color-text'}`}
                  >
                    <input 
                      type="radio" 
                      name="quiz-options" 
                      checked={selectedAnswers[currentQ] === opt}
                      onChange={() => {}} // Controlled by label click
                      className="w-5 h-5 accent-color-accent cursor-pointer" 
                    />
                    <span className="text-sm font-medium">{opt}</span>
                  </label>
                ))}
              </div>
            </>
          ) : (
            <div className="text-left space-y-6">
              {activeQuiz.questionText && (
                <div>
                  <h2 className="text-xl font-bold font-serif mb-2 text-color-text leading-relaxed">
                    Question Prompt
                  </h2>
                  <p className="text-sm font-mono whitespace-pre-wrap p-4 neu-inset bg-color-surface rounded-xl">
                    {activeQuiz.questionText}
                  </p>
                </div>
              )}
              {activeQuiz.questionImageUrl && (
                <div>
                  <img src={`${API_BASE_URL}${activeQuiz.questionImageUrl}`} alt="Question Prompt" className="max-w-full rounded-lg border border-black/10 mx-auto" />
                </div>
              )}
              
              <div className="pt-6 border-t border-black/10">
                <h3 className="font-bold text-color-text mb-3">Your Answer</h3>
                <textarea 
                  placeholder="Type your detailed answer here..." 
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  className="w-full neu-inset px-4 py-3 bg-color-surface text-sm text-color-text focus:outline-none focus:ring-2 focus:ring-accent rounded-xl min-h-[150px] mb-4" 
                />
                
                <div>
                  <label className="text-xs font-bold text-color-muted uppercase mb-1 block">Upload Work Image (Optional)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setAnswerImage(e.target.files?.[0] || null)}
                    className="w-full neu-inset px-4 py-2 bg-color-surface text-sm text-color-muted focus:outline-none rounded-xl cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-color-accent/10 file:text-color-accent hover:file:bg-color-accent/20 transition-all"
                  />
                </div>
              </div>
            </div>
          )}
        </Card>

        <div className="w-full flex justify-between items-center pt-4">
          {isMCQ && (
            <Button variant="secondary" className="px-6 h-10" onClick={handleBack} disabled={currentQ === 0}>
              Previous
            </Button>
          )}
          
          <div className="flex-1"></div>

          {isMCQ && currentQ < questions.length - 1 ? (
            <Button className="px-6 h-10" onClick={handleNext} disabled={!selectedAnswers[currentQ]}>
              Next Question
            </Button>
          ) : (
            <Button className="px-10 h-10 shadow-md font-bold" onClick={handleSubmit} disabled={submitting || (isMCQ && !selectedAnswers[currentQ])}>
              {submitting ? 'Submitting Test...' : 'Submit Practice Quiz'}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Fallback if accessed without a specific quiz ID
  return (
    <div className="animate-fade-in pb-20 max-w-5xl mx-auto space-y-8 h-[70vh] flex flex-col items-center justify-center text-center">
      <FileQuestion className="w-16 h-16 text-color-muted opacity-30 mb-4" />
      <h1 className="text-3xl font-bold text-color-text font-serif">Practice Assessment Missing</h1>
      <p className="text-color-muted mt-1 max-w-sm">Please navigate to your Resources page to select and practice a specific topic's assessment.</p>
      <Button className="mt-4 px-8" onClick={() => navigate('/resources')}>
        Go to My Resources
      </Button>
    </div>
  );
}
