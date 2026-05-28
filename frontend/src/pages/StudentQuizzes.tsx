import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FileQuestion, CheckCircle, XCircle } from 'lucide-react';

export function StudentQuizzes() {
  const [activeQuiz, setActiveQuiz] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);

  const startQuiz = () => setActiveQuiz(true);
  
  const submitAnswer = () => {
    if (currentQ === 0) {
      setCurrentQ(1);
    } else {
      setActiveQuiz(false);
      setShowResult(true);
    }
  };

  if (showResult) {
    return (
      <div className="animate-fade-in pb-20 max-w-3xl mx-auto space-y-6">
        <div className="text-center py-10">
          <div className="relative w-48 h-48 mx-auto flex items-center justify-center neu-inset rounded-full shrink-0 mb-6">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle cx="96" cy="96" r="86" fill="none" stroke="var(--color-background)" strokeWidth="16" />
              <circle 
                cx="96" cy="96" r="86" fill="none" 
                stroke="var(--color-success)" strokeWidth="16" 
                strokeDasharray="540" strokeDashoffset="270" 
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="text-center">
              <div className="text-sm font-bold text-color-muted">Score</div>
              <div className="text-3xl font-bold text-color-success">50%</div>
            </div>
          </div>
          <h1 className="text-3xl font-bold font-serif">Quiz Completed!</h1>
        </div>

        <Card>
          <div className="p-4 border-b border-black/5 flex justify-between items-start">
            <div>
              <p className="font-bold">Q1. What is the formula for force?</p>
              <p className="text-sm text-color-success flex items-center gap-1 mt-1"><CheckCircle className="w-4 h-4"/> You answered: F = ma</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4 flex justify-between items-start">
            <div>
              <p className="font-bold">Q2. What is the acceleration due to gravity?</p>
              <p className="text-sm text-color-danger flex items-center gap-1 mt-1"><XCircle className="w-4 h-4"/> You answered: 8.9 m/s^2</p>
            </div>
          </div>
          <div className="mt-2 p-4 neu-inset bg-color-surface/50 rounded-xl text-sm border-l-2 border-color-accent">
            <p className="font-bold text-color-accent mb-1">AI Explanation</p>
            <p>The correct answer is 9.8 m/s^2. You were close, but remember that standard Earth gravity is generally rounded to 9.8 or 9.81 m/s^2.</p>
          </div>
        </Card>

        <div className="text-center pt-8">
          <Button onClick={() => setShowResult(false)}>Back to Quizzes</Button>
        </div>
      </div>
    );
  }

  if (activeQuiz) {
    return (
      <div className="animate-fade-in pb-20 max-w-3xl mx-auto flex flex-col items-center pt-10">
        <div className="w-full flex justify-between items-center mb-6">
          <span className="font-bold text-color-muted">Question {currentQ + 1} of 2</span>
          <span className="font-bold text-color-danger neu-inset px-4 py-1 rounded-full bg-color-surface">09:59</span>
        </div>
        
        <div className="w-full h-2 neu-inset rounded-full bg-color-surface overflow-hidden mb-10">
          <div className="h-full bg-color-accent transition-all" style={{ width: `${(currentQ / 2) * 100}%` }}></div>
        </div>

        <Card className="w-full p-10 text-center mb-8 shadow-lg">
          <h2 className="text-2xl font-bold font-serif mb-8 leading-relaxed">
            {currentQ === 0 ? 'What is the formula for force according to Newton?' : 'What is the standard acceleration due to gravity on Earth?'}
          </h2>
          
          <div className="flex flex-col gap-4 max-w-md mx-auto">
            {['Option A', 'Option B', 'Option C', 'Option D'].map((_, i) => (
              <label key={i} className="flex items-center gap-4 p-4 neu-raised cursor-pointer hover:text-color-accent transition-colors">
                <input type="radio" name="quiz" className="w-5 h-5 accent-color-accent" />
                <span className="font-medium text-lg">{currentQ === 0 ? (i===0?'F = ma':'E = mc^2') : (i===0?'9.8 m/s^2':'8.9 m/s^2')}</span>
              </label>
            ))}
          </div>
        </Card>

        <Button size="lg" className="px-12" onClick={submitAnswer}>
          {currentQ === 0 ? 'Next Question' : 'Submit Quiz'}
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-20 max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-color-text font-serif mb-6">My Quizzes</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="w-12 h-12 neu-inset bg-color-surface flex items-center justify-center rounded-xl text-color-accent mb-4">
            <FileQuestion className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-xl mb-1">Physics Unit 2</h3>
          <p className="text-sm text-color-muted mb-6">10 Questions • Due in 2 days</p>
          <Button className="w-full" onClick={startQuiz}>Start Quiz</Button>
        </Card>
      </div>
    </div>
  );
}
