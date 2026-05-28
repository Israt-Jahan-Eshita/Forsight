import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FileQuestion, CheckCircle, XCircle, ChevronLeft, Bot, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui/Badge';

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
}

export function StudentQuizzes() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const selectedQuizId = location.state?.quizId as number | undefined;

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // Quiz taking state
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  
  // Graded / Result state
  const [showResult, setShowResult] = useState(false);
  const [gradedResult, setGradedResult] = useState<any>(null);

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
        setQuizzes(mockQz);

        if (selectedQuizId) {
          const qz = mockQz.find(q => q.id === selectedQuizId);
          if (qz) {
            setActiveQuiz(qz);
            const parsedQ = JSON.parse(qz.questionsJson);
            setQuestions(parsedQ);
            setSelectedAnswers(new Array(parsedQ.length).fill(''));

            const localSub = localStorage.getItem('fs_mock_submissions');
            const submissions = localSub ? JSON.parse(localSub) : [];
            const existingSub = submissions.find((s: any) => s.quiz.id === selectedQuizId);
            if (existingSub) {
              setGradedResult(existingSub);
              setShowResult(true);
            }
          }
        }
        return;
      }

      // Fetch active quizzes
      const response = await fetch('http://localhost:8080/api/quizzes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data: Quiz[] = await response.json();
      setQuizzes(data);

      // Check if student has already submitted this specific quiz
      if (selectedQuizId) {
        const subResponse = await fetch('http://localhost:8080/api/submissions', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const submissions = await subResponse.json();
        const existingSub = submissions.find((s: any) => s.quiz.id === selectedQuizId);
        
        const qz = data.find(q => q.id === selectedQuizId);
        if (qz) {
          setActiveQuiz(qz);
          const parsedQ = JSON.parse(qz.questionsJson) as Question[];
          setQuestions(parsedQ);
          setSelectedAnswers(new Array(parsedQ.length).fill(''));

          if (existingSub) {
            setGradedResult(existingSub);
            setShowResult(true);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const startQuiz = (qz: Quiz) => {
    setActiveQuiz(qz);
    try {
      const parsedQ = JSON.parse(qz.questionsJson) as Question[];
      setQuestions(parsedQ);
      setSelectedAnswers(new Array(parsedQ.length).fill(''));
      setCurrentQ(0);
      setShowResult(false);
      setGradedResult(null);
    } catch (e) {
      console.error("Failed to parse quiz questions", e);
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
    // Validate that all questions are answered
    if (selectedAnswers.includes('')) {
      alert('Please answer all questions before submitting.');
      return;
    }
    setSubmitting(true);

    // Compute automatic MCQ score
    let score = 0;
    questions.forEach((q, idx) => {
      if (q.a === selectedAnswers[idx]) {
        score++;
      }
    });

    try {
      const payload = {
        quizId: activeQuiz?.id,
        answersJson: JSON.stringify(selectedAnswers),
        score,
        maxScore: questions.length
      };

      if (!token || token === 'mock-jwt-token') {
        // Preview mode mock submission
        const mockSub = {
          id: 999,
          quiz: activeQuiz,
          score,
          maxScore: questions.length,
          status: 'PENDING',
          answersJson: JSON.stringify(selectedAnswers),
          feedback: 'Great effort! Your answers are submitted for detailed review.'
        };
        
        const localSub = localStorage.getItem('fs_mock_submissions');
        const list = localSub ? JSON.parse(localSub) : [];
        const updated = [...list.filter((s: any) => s.quiz.id !== activeQuiz?.id), mockSub];
        localStorage.setItem('fs_mock_submissions', JSON.stringify(updated));
        
        setGradedResult(mockSub);
        setShowResult(true);
        setSubmitting(false);
        return;
      }

      const response = await fetch('http://localhost:8080/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const savedSub = await response.json();
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
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate('/resources')} className="flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Back to shelf
          </Button>
        </div>

        <div className="text-center py-6">
          <div className="relative w-40 h-40 mx-auto flex items-center justify-center neu-inset rounded-full shrink-0 mb-4">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="70" fill="none" stroke="var(--color-background)" strokeWidth="12" />
              <circle 
                cx="80" cy="80" r="70" fill="none" 
                stroke={isGraded ? "var(--color-success)" : "var(--color-warning)"} strokeWidth="12" 
                strokeDasharray="440" 
                strokeDashoffset={440 - (440 * (gradedResult.score / gradedResult.maxScore))} 
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
          {questions.map((q, idx) => {
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
          })}
        </div>
      </div>
    );
  }

  // Render Interactive Quiz Taking View
  if (activeQuiz && questions.length > 0) {
    const currentQuestion = questions[currentQ];
    
    return (
      <div className="animate-fade-in pb-20 max-w-3xl mx-auto flex flex-col items-center pt-8 space-y-6">
        <div className="w-full flex justify-between items-center">
          <Button variant="secondary" size="sm" onClick={() => { setActiveQuiz(null); }} className="flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Cancel
          </Button>
          <span className="font-bold text-color-muted text-xs uppercase">Question {currentQ + 1} of {questions.length}</span>
        </div>
        
        <div className="w-full h-2 neu-inset rounded-full bg-color-surface overflow-hidden">
          <div className="h-full bg-color-accent transition-all duration-300" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}></div>
        </div>

        <Card className="w-full p-8 md:p-10 text-center shadow-lg border border-white/50 bg-color-surface/95 neu-raised">
          <h2 className="text-xl md:text-2xl font-bold font-serif mb-8 text-color-text leading-relaxed">
            {currentQuestion.q}
          </h2>
          
          <div className="flex flex-col gap-4 max-w-md mx-auto text-left">
            {currentQuestion.options.map((opt) => (
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
        </Card>

        <div className="w-full flex justify-between items-center pt-4">
          <Button variant="secondary" className="px-6 h-10" onClick={handleBack} disabled={currentQ === 0}>
            Previous
          </Button>
          {currentQ < questions.length - 1 ? (
            <Button className="px-6 h-10" onClick={handleNext} disabled={!selectedAnswers[currentQ]}>
              Next Question
            </Button>
          ) : (
            <Button className="px-10 h-10 shadow-md font-bold" onClick={handleSubmit} disabled={submitting || !selectedAnswers[currentQ]}>
              {submitting ? 'Submitting Test...' : 'Submit Practice Quiz'}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Default List of Active Practice Quizzes (if accessed directly rather than resources path)
  return (
    <div className="animate-fade-in pb-20 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-color-text font-serif">My Practice Shelf</h1>
        <p className="text-color-muted mt-1">Review active practice assessments and self-tests.</p>
      </div>
      
      {quizzes.length === 0 ? (
        <Card className="h-60 flex flex-col items-center justify-center text-color-muted neu-raised bg-color-surface">
          <FileQuestion className="w-12 h-12 mb-2 opacity-25" />
          <p className="font-semibold text-sm">No practice quizzes available right now.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quizzes.map((qz) => (
            <Card key={qz.id} className="p-6 border border-white/50 bg-color-surface neu-raised flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="w-12 h-12 neu-inset bg-color-surface flex items-center justify-center rounded-xl text-color-accent mb-4">
                  <FileQuestion className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-xl mb-1 text-color-text font-serif">{qz.title}</h3>
                <p className="text-xs text-color-muted mb-6">{qz.description || 'Self-evaluation practice'}</p>
                <div className="flex gap-2">
                  <Badge variant="success">{qz.className}</Badge>
                  <Badge variant="default" className="text-black font-bold">{qz.subject}</Badge>
                </div>
              </div>
              <Button className="w-full mt-6 h-10 font-bold" onClick={() => startQuiz(qz)}>
                Start Practice Quiz
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
