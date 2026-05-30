import { API_BASE_URL } from '../config';
import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FileText, Download, Eye, X, BookOpen, Clock, Lock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui/Badge';

interface Course {
  id: number;
  name: string;
  description: string;
  className: string;
  teacher?: { name: string; email: string; };
}

interface Resource {
  id: number;
  title: string;
  description: string;
  course?: Course;
  fileName: string;
  fileType: string;
  uploadDate: string;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  resource?: { id: number };
}

interface Enrollment {
  id: number;
  course: { id: number; };
  status: string;
}

export function StudentResources() {
  const navigate = useNavigate();
  const { token } = useAuth();
  
  // Navigation categories
  const [activeCategory, setActiveCategory] = useState('School');
  const [selectedClass, setSelectedClass] = useState('Class 10');
  
  // Dynamic courses and content
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  const [resources, setResources] = useState<Resource[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);

  // Preview state
  const [previewResource, setPreviewResource] = useState<{ id: number; name: string } | null>(null);
  const [previewTimeLeft, setPreviewTimeLeft] = useState<number | null>(null);
  const [lockModalOpen, setLockModalOpen] = useState(false);

  const categoriesMap: Record<string, string[]> = {
    School: Array.from({ length: 10 }, (_, i) => `Class ${i + 1}`),
    College: ['Class 11', 'Class 12'],
    University: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
    Masters: ['Masters']
  };

  const location = useLocation();

  useEffect(() => {
    if (location.state?.targetClassName) {
      // Find which category has this class
      const targetClass = location.state.targetClassName;
      for (const [category, classes] of Object.entries(categoriesMap)) {
        if (classes.includes(targetClass)) {
          setActiveCategory(category);
          setSelectedClass(targetClass);
          break;
        }
      }
    } else {
      const list = categoriesMap[activeCategory];
      if (list && list.length > 0) {
        setSelectedClass(list[0]);
      }
    }
  }, [activeCategory, location.state]);

  useEffect(() => {
    fetchAvailableCourses();
    setSelectedCourse(null);
    setResources([]);
    setQuizzes([]);
  }, [selectedClass, token]);

  useEffect(() => {
    if (selectedCourse) {
      fetchCourseContent();
    }
  }, [selectedCourse, token]);

  useEffect(() => {
    let timer: any;
    if (previewTimeLeft !== null && previewTimeLeft > 0) {
      timer = setInterval(() => {
        setPreviewTimeLeft(prev => prev! - 1);
      }, 1000);
    } else if (previewTimeLeft === 0) {
      setPreviewResource(null);
      setPreviewTimeLeft(null);
      setLockModalOpen(true);
    }
    return () => clearInterval(timer);
  }, [previewTimeLeft]);

  const fetchAvailableCourses = async () => {
    setLoading(true);
    try {
      if (!token || token === 'mock-jwt-token') {
        const savedCourses = localStorage.getItem('fs_mock_courses');
        if (savedCourses) {
          const parsed = JSON.parse(savedCourses) as Course[];
          setAvailableCourses(parsed.filter(c => c.className === selectedClass));
        } else {
          setAvailableCourses([]);
        }
        
        const savedEnrollments = localStorage.getItem('fs_mock_enrollments');
        if (savedEnrollments) setEnrollments(JSON.parse(savedEnrollments));
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json() as Course[];
        const filtered = data.filter(c => c.className === selectedClass);
        setAvailableCourses(filtered);
        
        if (location.state?.targetCourseId) {
          const target = filtered.find(c => c.id === location.state.targetCourseId);
          if (target) {
            setSelectedCourse(target);
          }
        }
      }

      const enrollResponse = await fetch(`${API_BASE_URL}/api/enrollments/student`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (enrollResponse.ok) {
        setEnrollments(await enrollResponse.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseContent = async () => {
    if (!selectedCourse) return;
    setLoading(true);
    try {
      if (!token || token === 'mock-jwt-token') {
        const savedRes = localStorage.getItem('fs_mock_resources');
        if (savedRes) {
          const parsed = JSON.parse(savedRes) as Resource[];
          setResources(parsed.filter(r => r.course?.id === selectedCourse.id));
        }
        const savedQuiz = localStorage.getItem('fs_mock_quizzes');
        if (savedQuiz) setQuizzes(JSON.parse(savedQuiz));
        return;
      }

      const resResponse = await fetch(`${API_BASE_URL}/api/resources?courseId=${selectedCourse.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resResponse.ok) {
        setResources(await resResponse.json());
      }

      const quizResponse = await fetch(`${API_BASE_URL}/api/quizzes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (quizResponse.ok) {
        setQuizzes(await quizResponse.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (id: number, name: string) => {
    localStorage.setItem(`opened_resource_${id}`, 'true');
    if (!token || token === 'mock-jwt-token') {
      alert(`Downloading ${name} in Preview Mode!`);
      return;
    }
    window.open(`${API_BASE_URL}/api/resources/${id}/download?access_token=${token}`, '_blank');
  };

  const handleEnroll = async (courseId: number) => {
    if (!token || token === 'mock-jwt-token') {
      const mockEnroll: Enrollment = {
        id: Date.now(),
        course: { id: courseId },
        status: 'Enrolled'
      };
      const updated = [...enrollments, mockEnroll];
      localStorage.setItem('fs_mock_enrollments', JSON.stringify(updated));
      setEnrollments(updated);
      alert('Enrolled successfully in preview mode!');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/enrollments/${courseId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEnrollments([...enrollments, data]);
      } else {
        alert('Failed to enroll.');
      }
    } catch (e) {
      console.error(e);
      alert('Error during enrollment.');
    }
  };

  const handlePreview = (res: Resource) => {
    localStorage.setItem(`opened_resource_${res.id}`, 'true');
    const isEnrolled = enrollments.some(e => e.course?.id === selectedCourse?.id);
    setPreviewResource({ id: res.id, name: res.fileName });
    if (!isEnrolled) {
      setPreviewTimeLeft(15);
    } else {
      setPreviewTimeLeft(null);
    }
  };

  return (
    <div className="animate-fade-in pb-20 max-w-7xl mx-auto relative min-h-screen space-y-8">
      
      {/* Category selector */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-color-text font-serif">Resource Shelf</h1>
          <p className="text-color-muted mt-1 text-sm">Select your class level, browse courses, and access materials.</p>
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
        
        {/* Dynamic Courses Drawer */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-bold font-serif text-color-text">Available Courses</h3>
          {loading && availableCourses.length === 0 ? (
            <p className="text-xs text-color-muted animate-pulse">Loading courses...</p>
          ) : availableCourses.length === 0 ? (
            <Card className="p-6 text-center text-xs text-color-muted font-medium neu-raised bg-color-surface/50">
              No courses found for {selectedClass} yet.
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {availableCourses.map((course) => {
                const isEnrolled = enrollments.some(e => e.course?.id === course.id);
                return (
                  <Card
                    key={course.id}
                    onClick={() => setSelectedCourse(course)}
                    className={`p-4 cursor-pointer transition-all border text-left select-none ${selectedCourse?.id === course.id ? 'neu-inset border-color-accent' : 'neu-raised hover:bg-black/[0.01]'}`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className={`font-bold font-serif ${selectedCourse?.id === course.id ? 'text-color-accent' : 'text-color-text'}`}>
                        {course.name}
                      </h4>
                      {isEnrolled && <Badge variant="success" className="text-[9px]">Enrolled</Badge>}
                    </div>
                    <p className="text-[10px] text-color-muted mt-1 line-clamp-1">{course.description}</p>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Dynamic Main Materials Grid */}
        <div className="lg:col-span-3 space-y-8">
          {!selectedCourse ? (
            <Card className="h-80 flex flex-col items-center justify-center p-8 text-center text-color-muted bg-color-surface/40 neu-raised">
              <BookOpen className="w-16 h-16 mb-4 text-color-accent opacity-20" />
              <h4 className="font-bold text-lg font-serif">Awaiting Course Selection</h4>
              <p className="text-sm opacity-70 mt-1 max-w-sm">Please choose one of the available courses from the sidebar to review resources.</p>
            </Card>
          ) : (
            <div className="space-y-6 animate-slide-up">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/5 pb-4">
                <div>
                  <h2 className="text-2xl font-bold font-serif text-color-text">
                    {selectedCourse.name}
                  </h2>
                  <p className="text-sm text-color-muted mt-1">{selectedCourse.description}</p>
                </div>
                {!enrollments.some(e => e.course?.id === selectedCourse.id) && (
                  <Button onClick={() => handleEnroll(selectedCourse.id)} className="font-bold shadow-md shrink-0">
                    Enroll in Course
                  </Button>
                )}
              </div>

              {resources.length === 0 ? (
                <p className="text-sm text-color-muted italic">No study materials uploaded for this course.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {resources.map((res) => {
                    const isEnrolled = enrollments.some(e => e.course?.id === selectedCourse.id);
                    const resourceQuizzes = quizzes.filter(q => q.resource?.id === res.id);
                    
                    return (
                    <Card key={res.id} className="p-5 flex flex-col justify-between neu-raised border border-white/50 bg-color-surface/90">
                      <div>
                        <div className="flex justify-between items-start">
                          <div className="w-12 h-12 neu-inset bg-color-surface flex items-center justify-center rounded-xl text-color-accent mb-4">
                            <FileText className="w-6 h-6" />
                          </div>
                        </div>
                        <h3 className="font-bold text-color-text text-lg leading-tight mb-1">{res.title}</h3>
                        <p className="text-xs text-color-muted font-medium mb-3">{res.description || 'No summary text.'}</p>
                      </div>

                      <div className="flex flex-col gap-2 mt-6 pt-4 border-t border-black/5">
                        {isEnrolled ? (
                          <>
                            <Button 
                              variant="primary" 
                              className="w-full text-xs py-2 h-9 font-bold" 
                              onClick={() => {
                                localStorage.setItem(`opened_resource_${res.id}`, 'true');
                                navigate('/ask-ai', { state: { resourceId: res.id, fileName: res.fileName } });
                              }}
                            >
                              AI Assistant & Notes
                            </Button>
                            {resourceQuizzes.length > 0 && (
                              <select 
                                className="w-full text-xs px-3 h-9 font-bold border-2 border-color-accent text-color-accent bg-transparent rounded-xl cursor-pointer focus:outline-none"
                                defaultValue=""
                                onChange={(e) => {
                                  if (e.target.value) navigate('/quizzes', { state: { quizId: parseInt(e.target.value) } })
                                }}
                              >
                                <option value="" disabled hidden>Practice Quiz ({resourceQuizzes.length})</option>
                                {resourceQuizzes.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
                              </select>
                            )}
                          </>
                        ) : (
                          <div className="w-full p-2 bg-color-surface neu-inset rounded-lg text-center text-[10px] text-color-muted font-bold flex items-center justify-center gap-1">
                            <Lock className="w-3 h-3" /> Enroll to unlock Quizzes & AI
                          </div>
                        )}
                        
                        <div className="flex gap-2 w-full">
                          <Button 
                            variant="secondary" 
                            className="flex-1 px-3 h-9 flex items-center justify-center gap-2"
                            onClick={() => handlePreview(res)}
                            title="Preview Study Document"
                          >
                            <Eye className="w-4 h-4" /> Preview
                          </Button>
                          <Button 
                            variant="secondary" 
                            className="flex-1 px-3 h-9 flex items-center justify-center gap-2"
                            onClick={() => {
                              if (!isEnrolled) {
                                alert("Please enroll in the course to download materials.");
                              } else {
                                handleDownload(res.id, res.fileName);
                              }
                            }}
                            title="Download Study Document"
                          >
                            <Download className="w-4 h-4" /> Download
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )})}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Message Teacher Icon */}
      <button 
        onClick={() => navigate('/messages')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-color-accent text-white rounded-full flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.2)] hover:scale-110 transition-transform z-50 neu-raised"
        title="Message Teacher"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      </button>

      {/* Preview Modal */}
      {previewResource && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-color-surface w-full max-w-5xl h-[85vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden relative animate-scale-in">
            <div className="flex items-center justify-between p-4 border-b border-black/10">
              <div className="flex items-center gap-4">
                <h3 className="font-bold text-lg font-serif">Preview: {previewResource.name}</h3>
                {previewTimeLeft !== null && (
                  <Badge variant="danger" className="animate-pulse flex items-center gap-1.5 px-3 py-1 text-sm font-bold tracking-widest bg-color-danger text-white border-none shadow-md">
                    <Clock className="w-4 h-4" /> {previewTimeLeft}s
                  </Badge>
                )}
              </div>
              <button onClick={() => { setPreviewResource(null); setPreviewTimeLeft(null); }} className="p-2 bg-black/5 hover:bg-color-danger/10 text-color-text hover:text-color-danger rounded-xl transition-all cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 w-full bg-color-background overflow-hidden relative p-4">
              <iframe 
                src={token && token !== 'mock-jwt-token' ? `${API_BASE_URL}/api/resources/${previewResource.id}/view?access_token=${token}` : ''}
                className="w-full h-full border-0 rounded-xl bg-white shadow-inner"
                title={previewResource.name}
              />
              {(!token || token === 'mock-jwt-token') && (
                 <div className="absolute inset-0 flex items-center justify-center text-color-muted">Preview not available in mock mode.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lock Modal */}
      {lockModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in">
          <Card className="max-w-md w-full p-8 text-center flex flex-col items-center neu-raised shadow-2xl scale-105 border-2 border-color-accent">
            <div className="w-16 h-16 bg-color-accent/10 rounded-full flex items-center justify-center text-color-accent mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold font-serif mb-2">Preview Time Expired</h3>
            <p className="text-sm text-color-muted mb-6">
              Your 15-second preview has ended. Please enroll in the course to unlock unlimited access, quizzes, and AI features.
            </p>
            <div className="flex items-center gap-3 w-full">
              <Button variant="secondary" className="flex-1 font-bold" onClick={() => setLockModalOpen(false)}>Close</Button>
              <Button 
                variant="primary" 
                className="flex-1 font-bold" 
                onClick={() => {
                  if (selectedCourse) handleEnroll(selectedCourse.id);
                  setLockModalOpen(false);
                }}
              >
                Enroll Now
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
