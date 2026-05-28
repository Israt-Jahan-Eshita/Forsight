import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FileText, Download, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui/Badge';

interface Resource {
  id: number;
  title: string;
  description: string;
  className: string;
  subject: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
  teacher?: {
    name: string;
    email: string;
  };
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  className: string;
  subject: string;
  questionsJson: string;
}

interface Submission {
  id: number;
  quiz: {
    id: number;
  };
  score: number;
  maxScore: number;
  status: string;
  feedback: string;
}

export function StudentResources() {
  const navigate = useNavigate();
  const { token } = useAuth();
  
  // Navigation categories
  const [activeCategory, setActiveCategory] = useState('School');
  const [selectedClass, setSelectedClass] = useState('Class 10');
  
  // Dynamic subjects and content
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  
  const [resources, setResources] = useState<Resource[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);

  const categoriesMap: Record<string, string[]> = {
    School: Array.from({ length: 10 }, (_, i) => `Class ${i + 1}`),
    College: ['Class 11', 'Class 12'],
    University: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
    Masters: ['Masters']
  };

  useEffect(() => {
    // Set default class when category changes
    const list = categoriesMap[activeCategory];
    if (list && list.length > 0) {
      setSelectedClass(list[0]);
    }
  }, [activeCategory]);

  // Load available subjects when class changes
  useEffect(() => {
    fetchAvailableSubjects();
    setSelectedSubject(null);
    setResources([]);
    setQuizzes([]);
  }, [selectedClass, token]);

  // Load materials & quizzes when subject changes
  useEffect(() => {
    if (selectedSubject) {
      fetchSubjectContent();
    }
  }, [selectedSubject, token]);

  const fetchAvailableSubjects = async () => {
    try {
      if (!token || token === 'mock-jwt-token') {
        const localRes = localStorage.getItem('fs_mock_resources');
        const localQz = localStorage.getItem('fs_mock_quizzes');
        
        const resList = localRes ? JSON.parse(localRes) : [];
        const qzList = localQz ? JSON.parse(localQz) : [];
        
        const resSubj = resList.filter((r: any) => r.className === selectedClass).map((r: any) => r.subject);
        const qzSubj = qzList.filter((q: any) => q.className === selectedClass).map((q: any) => q.subject);
        
        const combined = Array.from(new Set([...resSubj, ...qzSubj])) as string[];
        setAvailableSubjects(combined);
        return;
      }

      setLoading(true);
      // Query distinct subjects with resources or quizzes for selected class
      const resSubj = await fetch(`http://localhost:8080/api/resources/subjects?className=${selectedClass}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const qzSubj = await fetch(`http://localhost:8080/api/quizzes/subjects?className=${selectedClass}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      let subjects: string[] = [];
      if (resSubj.ok) {
        const rs = await resSubj.json();
        subjects = [...subjects, ...rs];
      }
      if (qzSubj.ok) {
        const qs = await qzSubj.json();
        subjects = [...subjects, ...qs];
      }

      // Deduplicate
      const uniqueSubjects = Array.from(new Set(subjects));
      setAvailableSubjects(uniqueSubjects);
    } catch (e) {
      console.error(e);
      setAvailableSubjects(['Physics', 'Biology']); // Mock fallback
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectContent = async () => {
    try {
      if (!token || token === 'mock-jwt-token') {
        const localRes = localStorage.getItem('fs_mock_resources');
        const localQz = localStorage.getItem('fs_mock_quizzes');
        const localSub = localStorage.getItem('fs_mock_submissions');
        
        const resList = localRes ? JSON.parse(localRes) : [];
        const qzList = localQz ? JSON.parse(localQz) : [];
        const subList = localSub ? JSON.parse(localSub) : [];
        
        const matchedRes = resList.filter((r: any) => r.className === selectedClass && r.subject === selectedSubject);
        const matchedQz = qzList.filter((q: any) => q.className === selectedClass && q.subject === selectedSubject);
        
        setResources(matchedRes);
        setQuizzes(matchedQz);
        setSubmissions(subList);
        return;
      }

      setLoading(true);
      // Fetch dynamic materials
      const resResponse = await fetch(`http://localhost:8080/api/resources?className=${selectedClass}&subject=${selectedSubject}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await resResponse.json();
      setResources(resData);

      // Fetch dynamic quizzes
      const qzResponse = await fetch(`http://localhost:8080/api/quizzes?className=${selectedClass}&subject=${selectedSubject}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const qzData = await qzResponse.json();
      setQuizzes(qzData);

      // Fetch student submissions
      const subResponse = await fetch('http://localhost:8080/api/submissions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const subData = await subResponse.json();
      setSubmissions(subData);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (id: number, name: string) => {
    if (!token || token === 'mock-jwt-token') {
      alert(`Downloading ${name} in Preview Mode!`);
      return;
    }
    window.open(`http://localhost:8080/api/resources/${id}/download?access_token=${token}`, '_blank');
  };

  const getQuizState = (quizId: number) => {
    const sub = submissions.find(s => s.quiz.id === quizId);
    if (!sub) return { label: 'Take Practice Quiz', variant: 'primary', icon: Play };
    if (sub.status === 'PENDING') return { label: 'Awaiting Evaluation', variant: 'secondary', icon: AlertCircle };
    return { label: `Graded: ${sub.score}/${sub.maxScore}`, variant: 'success', icon: CheckCircle2 };
  };

  return (
    <div className="animate-fade-in pb-20 max-w-7xl mx-auto relative min-h-screen space-y-8">
      
      {/* Category selector */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-color-text font-serif">Resource Shelf</h1>
          <p className="text-color-muted mt-1 text-sm">Select your class level, check available subjects, study, and take practice assessments.</p>
        </div>

        <div className="flex bg-color-surface p-1 rounded-xl neu-inset gap-1 shrink-0 w-full md:w-auto overflow-x-auto">
          {['School', 'College', 'University', 'Masters'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${activeCategory === cat ? 'bg-color-accent text-white shadow-sm' : 'text-color-muted hover:text-color-text'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Class Level selector */}
      <div className="flex flex-wrap gap-2 py-1 border-b border-black/5">
        {(categoriesMap[activeCategory] || []).map((lvl) => (
          <Badge
            key={lvl}
            onClick={() => setSelectedClass(lvl)}
            className={`px-4 py-2 cursor-pointer font-bold transition-all border-none ${selectedClass === lvl ? 'bg-color-accent text-white shadow-inner scale-95' : 'bg-color-surface hover:text-color-accent neu-raised text-black'}`}
          >
            {lvl}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Dynamic Subjects Drawer */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-bold font-serif text-color-text">Available Subjects</h3>
          {loading && availableSubjects.length === 0 ? (
            <p className="text-xs text-color-muted animate-pulse">Loading active subjects...</p>
          ) : availableSubjects.length === 0 ? (
            <Card className="p-6 text-center text-xs text-color-muted font-medium neu-raised bg-color-surface/50">
              No subjects have resources uploaded by teachers for {selectedClass} yet.
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {availableSubjects.map((sub) => (
                <Card
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`p-4 cursor-pointer transition-all border font-serif font-bold text-center select-none ${selectedSubject === sub ? 'neu-inset border-color-accent text-color-accent' : 'neu-raised hover:bg-black/[0.01] text-color-text'}`}
                >
                  {sub}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Main Materials Grid */}
        <div className="lg:col-span-3 space-y-8">
          {!selectedSubject ? (
            <Card className="h-80 flex flex-col items-center justify-center p-8 text-center text-color-muted bg-color-surface/40 neu-raised">
              <FileText className="w-16 h-16 mb-4 text-color-accent opacity-20" />
              <h4 className="font-bold text-lg font-serif">Awaiting Subject Selection</h4>
              <p className="text-sm opacity-70 mt-1 max-w-sm">Please choose one of the available subjects from the sidebar to review resources and quizzes.</p>
            </Card>
          ) : (
            <div className="space-y-8 animate-slide-up">
              
              {/* Learning Shelf */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold font-serif text-color-text border-b border-black/5 pb-2">
                  Learning Shelf • {selectedSubject}
                </h2>
                {resources.length === 0 ? (
                  <p className="text-sm text-color-muted italic">No study guides or resources uploaded for this topic.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {resources.map((res) => (
                      <Card key={res.id} className="p-5 flex flex-col justify-between neu-raised border border-white/50 bg-color-surface/90">
                        <div>
                          <div className="w-12 h-12 neu-inset bg-color-surface flex items-center justify-center rounded-xl text-color-accent mb-4">
                            <FileText className="w-6 h-6" />
                          </div>
                          <h3 className="font-bold text-color-text text-lg leading-tight mb-1">{res.title}</h3>
                          <p className="text-xs text-color-muted font-medium mb-3">{res.description || 'No summary text.'}</p>
                          
                          {res.teacher && (
                            <div className="mt-4 p-3 bg-color-background rounded-xl neu-inset text-[10px] space-y-0.5">
                              <p className="font-bold text-color-muted uppercase tracking-wider">Uploading Instructor</p>
                              <p className="font-bold text-color-text text-xs mt-0.5">{res.teacher.name}</p>
                              <p className="text-color-muted">{res.teacher.email}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 mt-6 pt-4 border-t border-black/5">
                          <Button 
                            variant="primary" 
                            className="flex-1 text-xs py-2 h-9 font-bold" 
                            onClick={() => navigate('/ask-ai', { state: { resourceId: res.id, fileName: res.fileName } })}
                          >
                            AI Study Assistant
                          </Button>
                          <Button 
                            variant="secondary" 
                            className="px-3 h-9"
                            onClick={() => handleDownload(res.id, res.fileName)}
                            title="Download Study Document"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </section>

              {/* Practice Quizzes Shelf */}
              <section className="space-y-4 pt-4">
                <h2 className="text-2xl font-bold font-serif text-color-text border-b border-black/5 pb-2">
                  Practice Assessments
                </h2>
                {quizzes.length === 0 ? (
                  <p className="text-sm text-color-muted italic">No practice quizzes published for this subject.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {quizzes.map((qz) => {
                      const qState = getQuizState(qz.id);
                      return (
                        <Card key={qz.id} className="p-5 flex flex-col justify-between neu-raised border border-white/50 bg-color-surface">
                          <div>
                            <h3 className="font-bold text-color-text text-lg leading-tight mb-1">{qz.title}</h3>
                            <p className="text-xs text-color-muted mb-4">{qz.description || 'Interactive evaluation practice.'}</p>
                          </div>

                          <Button 
                            variant={qState.variant as any} 
                            onClick={() => navigate('/quizzes', { state: { quizId: qz.id } })}
                            className="w-full flex items-center justify-center gap-2 h-10 mt-4 font-bold"
                          >
                            <qState.icon className="w-4 h-4" /> {qState.label}
                          </Button>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </section>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
