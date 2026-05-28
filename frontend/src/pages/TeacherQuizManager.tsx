import { useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Bot, Check, X, FileText } from 'lucide-react';

export function TeacherQuizManager() {
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<{q: string, a: string}[]>([]);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setQuestions([
        { q: 'What is the formula for force?', a: 'F = ma' },
        { q: 'What is the acceleration due to gravity?', a: '9.8 m/s^2' },
      ]);
    }, 1500);
  };

  return (
    <div className="animate-fade-in pb-20 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-color-text font-serif">Quiz Manager</h1>
          <p className="text-color-muted mt-1">Generate AI quizzes or manage active ones.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Generate Panel */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center gap-2">
            <Bot className="w-5 h-5 text-color-accent" /> AI Generator
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-color-muted ml-1">Topic</label>
              <input type="text" placeholder="e.g. Newton's Laws" className="w-full mt-1 neu-inset px-4 py-2 bg-color-surface focus:outline-none focus:ring-1 focus:ring-accent" />
            </div>
            <div>
              <label className="text-sm font-medium text-color-muted ml-1">Difficulty</label>
              <select className="w-full mt-1 neu-inset px-4 py-2 bg-color-surface focus:outline-none focus:ring-1 focus:ring-accent">
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-color-muted ml-1">Number of Questions: 5</label>
              <input type="range" min="1" max="10" defaultValue="5" className="w-full mt-2 accent-color-accent" />
            </div>
            <Button className="w-full mt-2" onClick={handleGenerate} disabled={generating}>
              {generating ? 'Generating...' : 'Generate with AI'}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Questions */}
        <div className="lg:col-span-2 space-y-4">
          {questions.length === 0 && !generating ? (
            <Card className="h-full flex flex-col items-center justify-center p-10 text-center text-color-muted min-h-[300px]">
              <FileText className="w-12 h-12 mb-4 opacity-20" />
              <p>Generated questions will appear here.</p>
            </Card>
          ) : (
            <>
              {questions.map((q, i) => (
                <Card key={i} className="p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="font-bold mb-2">Q{i+1}. {q.q}</p>
                      <p className="text-sm text-color-success">Answer: {q.a}</p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button variant="secondary" size="sm" className="bg-color-success/10 text-color-success hover:bg-color-success/20 border-none"><Check className="w-4 h-4" /></Button>
                      <Button variant="secondary" size="sm" className="bg-color-danger/10 text-color-danger hover:bg-color-danger/20 border-none"><X className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </Card>
              ))}
              {questions.length > 0 && (
                <Button className="w-full mt-4">Publish Quiz</Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Active Quizzes */}
      <h2 className="text-2xl font-bold font-serif text-color-text mt-12 mb-6">Active Quizzes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg font-serif">Physics Unit 1</h3>
              <p className="text-xs text-color-muted mt-1">Due: Tomorrow</p>
            </div>
            <Badge variant="warning">In Progress</Badge>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Completion</span>
              <span className="font-bold">65%</span>
            </div>
            <div className="w-full h-2 neu-inset rounded-full bg-color-surface overflow-hidden">
              <div className="h-full bg-color-accent w-[65%] rounded-full"></div>
            </div>
          </div>
        </Card>
      </div>

    </div>
  );
}
