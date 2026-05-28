import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Bot, FileText, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Quiz {
  id: number;
  title: string;
  description: string;
  className: string;
  subject: string;
  questionsJson: string;
  createdDate: string;
}

export function TeacherQuizManager() {
  const { token } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('School');
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [subject, setSubject] = useState('');
  const [questions, setQuestions] = useState<{q: string, a: string, options: string[]}[]>([]);

  const categoriesMap: Record<string, string[]> = {
    School: Array.from({ length: 10 }, (_, i) => `Class ${i + 1}`),
    College: ['Class 11', 'Class 12'],
    University: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
    Masters: ['Masters']
  };

  useEffect(() => {
    fetchQuizzes();
  }, [token]);

  useEffect(() => {
    const list = categoriesMap[category];
    if (list && list.length > 0) {
      setSelectedClass(list[0]);
    }
  }, [category]);

  const fetchQuizzes = async () => {
    try {
      if (!token || token === 'mock-jwt-token') {
        const saved = localStorage.getItem('fs_mock_quizzes');
        if (saved) {
          setQuizzes(JSON.parse(saved));
        } else {
          const initial = [
            { id: 1, title: 'Physics Quiz 1', description: 'Elementary kinematics test', className: 'Class 10', subject: 'Physics', questionsJson: '[{"q":"What is the mathematical equation for Newton\'s Second Law of Motion?","a":"F = ma","options":["F = ma","E = mc^2","V = IR","P = IV"]},{"q":"What is the standard acceleration due to gravity on Earth?","a":"9.8 m/s^2","options":["9.8 m/s^2","8.9 m/s^2","10.5 m/s^2","7.2 m/s^2"]}]', createdDate: '2026-05-28' }
          ];
          localStorage.setItem('fs_mock_quizzes', JSON.stringify(initial));
          setQuizzes(initial);
        }
        return;
      }

      const response = await fetch('http://localhost:8080/api/quizzes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerate = () => {
    if (!title || !subject) {
      setStatusMsg('Please provide a Quiz Title and Subject before generating.');
      return;
    }
    setGenerating(true);
    setStatusMsg('');
    
    // Simulate smart AI Quiz Generation
    setTimeout(() => {
      setGenerating(false);
      setQuestions([
        { 
          q: 'What is the mathematical equation for Newton\'s Second Law of Motion?', 
          a: 'F = ma', 
          options: ['F = ma', 'E = mc^2', 'V = IR', 'P = IV'] 
        },
        { 
          q: 'What is the standard acceleration due to gravity on Earth?', 
          a: '9.8 m/s^2', 
          options: ['9.8 m/s^2', '8.9 m/s^2', '10.5 m/s^2', '7.2 m/s^2'] 
        },
      ]);
      setStatusMsg('AI generated 2 relevant multiple choice questions!');
    }, 1200);
  };

  const handlePublish = async () => {
    if (questions.length === 0) {
      setStatusMsg('Please generate or add questions before publishing.');
      return;
    }
    setPublishing(true);
    setStatusMsg('');

    try {
      const payload = {
        title,
        description,
        className: selectedClass,
        subject,
        questionsJson: JSON.stringify(questions)
      };

      if (!token || token === 'mock-jwt-token') {
        const mockNew: Quiz = {
          id: quizzes.length + 1,
          title,
          description,
          className: selectedClass,
          subject,
          questionsJson: JSON.stringify(questions),
          createdDate: new Date().toISOString().split('T')[0]
        };
        const updated = [mockNew, ...quizzes];
        localStorage.setItem('fs_mock_quizzes', JSON.stringify(updated));
        setQuizzes(updated);
        resetForm();
        setStatusMsg('Success: Quiz published in Preview Mode!');
        setPublishing(false);
        return;
      }

      const response = await fetch('http://localhost:8080/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setStatusMsg('Success: Quiz published successfully to database!');
        resetForm();
        fetchQuizzes();
      } else {
        const err = await response.text();
        setStatusMsg(`Error: ${err || 'Failed to publish'}`);
      }
    } catch (e: any) {
      setStatusMsg(`Error: ${e.message || 'Server offline'}`);
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    try {
      if (!token || token === 'mock-jwt-token') {
        const updated = quizzes.filter(q => q.id !== id);
        localStorage.setItem('fs_mock_quizzes', JSON.stringify(updated));
        setQuizzes(updated);
        return;
      }

      const response = await fetch(`http://localhost:8080/api/quizzes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchQuizzes();
      } else {
        const err = await response.text();
        alert(`Failed to delete: ${err}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSubject('');
    setQuestions([]);
  };

  return (
    <div className="animate-fade-in pb-20 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-color-text font-serif">Quiz Manager</h1>
          <p className="text-color-muted mt-1">Configure study practice assessments and quizzes for students.</p>
        </div>
      </div>

      {statusMsg && (
        <div className={`p-4 text-sm font-semibold rounded-xl text-center neu-inset ${statusMsg.startsWith('Success') ? 'bg-color-success/15 text-color-success' : 'bg-color-accent/15 text-color-accent'}`}>
          {statusMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Setup and Generator Panel */}
        <Card className="lg:col-span-1 border border-white/50 bg-color-surface/90 neu-raised">
          <CardHeader className="flex flex-row items-center gap-2 border-b border-black/5 pb-3">
            <Bot className="w-5 h-5 text-color-accent" /> Configure Practice Quiz
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div>
              <label className="text-xs font-bold text-color-muted uppercase ml-1">Quiz Title</label>
              <input 
                type="text" 
                placeholder="e.g. Physics Unit 1" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full mt-1.5 neu-inset px-4 py-2.5 bg-color-surface text-sm text-color-text focus:outline-none focus:ring-2 focus:ring-accent rounded-xl" 
              />
            </div>

            <div>
              <label className="text-xs font-bold text-color-muted uppercase ml-1">Description</label>
              <textarea 
                placeholder="Details or guidelines..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full mt-1.5 neu-inset px-4 py-2.5 bg-color-surface text-sm text-color-text focus:outline-none focus:ring-2 focus:ring-accent rounded-xl min-h-[60px]" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-color-muted uppercase ml-1">Class Type</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full mt-1.5 neu-inset px-4 py-2.5 bg-color-surface text-sm text-color-text focus:outline-none focus:ring-2 focus:ring-accent rounded-xl font-medium cursor-pointer"
                >
                  <option value="School">School</option>
                  <option value="College">College</option>
                  <option value="University">University</option>
                  <option value="Masters">Masters</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-color-muted uppercase ml-1">Class Level</label>
                <select 
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full mt-1.5 neu-inset px-4 py-2.5 bg-color-surface text-sm text-color-text focus:outline-none focus:ring-2 focus:ring-accent rounded-xl font-medium cursor-pointer"
                >
                  {(categoriesMap[category] || []).map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-color-muted uppercase ml-1">Subject Name</label>
              <input 
                type="text" 
                placeholder="e.g. Physics" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full mt-1.5 neu-inset px-4 py-2.5 bg-color-surface text-sm text-color-text focus:outline-none focus:ring-2 focus:ring-accent rounded-xl" 
              />
            </div>

            <Button className="w-full mt-4 h-11" onClick={handleGenerate} disabled={generating}>
              {generating ? 'Generating Questions...' : 'Generate Questions with AI'}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Questions Preview & Publish */}
        <div className="lg:col-span-2 space-y-4">
          {questions.length === 0 && !generating ? (
            <Card className="h-full flex flex-col items-center justify-center p-10 text-center text-color-muted min-h-[300px] neu-raised bg-color-surface">
              <FileText className="w-12 h-12 mb-4 opacity-20 text-color-accent" />
              <p className="font-semibold">Interactive practice questions will appear here.</p>
              <p className="text-xs opacity-75 mt-1">Configure the form on the left and click Generate.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-serif text-color-text">Questions Preview ({questions.length})</h3>
              {questions.map((q, i) => (
                <Card key={i} className="p-5 neu-raised bg-color-surface border border-white/50">
                  <p className="font-bold text-color-text mb-3">Q{i+1}. {q.q}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2">
                    {q.options.map((opt, oIdx) => (
                      <div key={opt} className={`p-3 rounded-xl text-xs font-semibold neu-inset ${opt === q.a ? 'bg-color-success/15 text-color-success' : 'bg-color-background/50 text-color-muted'}`}>
                        {String.fromCharCode(65 + oIdx)}. {opt} {opt === q.a && '✓ (Correct)'}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
              <Button className="w-full mt-6 h-12 shadow-sm font-bold text-base" onClick={handlePublish} disabled={publishing}>
                {publishing ? 'Publishing practice quiz...' : 'Publish Practice Quiz to Subject Shelf'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Active Quizzes */}
      <h2 className="text-2xl font-bold font-serif text-color-text mt-12 mb-6">Active Practice Quizzes</h2>
      {quizzes.length === 0 ? (
        <p className="text-sm text-color-muted italic">No active practice quizzes found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((qz) => (
            <Card key={qz.id} className="p-5 border border-white/50 bg-color-surface neu-raised flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg font-serif text-color-text leading-tight">{qz.title}</h3>
                  <Badge variant="warning">{qz.className}</Badge>
                </div>
                <p className="text-xs text-color-muted font-medium mb-4">{qz.description || 'Practice questionnaire'}</p>
                <div className="flex flex-wrap gap-2 text-[10px] text-color-muted font-semibold">
                  <span className="bg-color-accent/15 text-color-accent px-2 py-0.5 rounded-full text-black font-bold">{qz.subject}</span>
                  <span className="mt-0.5">Published {qz.createdDate ? qz.createdDate.substring(0, 10) : 'Today'}</span>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button variant="icon" size="sm" onClick={() => handleDelete(qz.id)} className="bg-color-danger/10 text-color-danger hover:bg-color-danger/20 rounded-xl p-2 cursor-pointer border-none" title="Delete Quiz">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
