import { API_BASE_URL } from '../config';
import { useState, useEffect } from 'react';
import { UploadCloud, FileText, Download, Trash2, Bot, ChevronDown, ChevronUp, FileQuestion, Image as ImageIcon, Eye, X, BookOpen, Plus, FolderOpen, Users } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';

interface Course {
  id: number;
  name: string;
  description: string;
  className: string;
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
  questionText?: string;
  questionsJson?: string;
}

export function TeacherResources() {
  const { token } = useAuth();
  
  // Data State
  const [courses, setCourses] = useState<Course[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  
  // Create Course Form State
  const [courseName, setCourseName] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseCategory, setCourseCategory] = useState('School');
  const [courseClass, setCourseClass] = useState('Class 10');
  const [creatingCourse, setCreatingCourse] = useState(false);
  const [courseStatusMsg, setCourseStatusMsg] = useState('');

  // Course Expansion State
  const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null);

  // Upload Resource Form State
  const [dragActive, setDragActive] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState('');

  // Enrolled Students Drawer State
  const [expandedStudentsCourseId, setExpandedStudentsCourseId] = useState<number | null>(null);
  const [courseStudents, setCourseStudents] = useState<Record<number, any[]>>({});

  // Resource Quiz Expansion State
  const [expandedResourceId, setExpandedResourceId] = useState<number | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [questionImage, setQuestionImage] = useState<File | null>(null);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [quizStatusMsg, setQuizStatusMsg] = useState('');

  // Preview State
  const [previewResource, setPreviewResource] = useState<{ id: number; name: string } | null>(null);

  const categoriesMap: Record<string, string[]> = {
    School: Array.from({ length: 10 }, (_, i) => `Class ${i + 1}`),
    College: ['Class 11', 'Class 12'],
    University: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
    Masters: ['Masters']
  };

  useEffect(() => {
    fetchCourses();
    fetchResources();
    fetchQuizzes();
  }, [token]);

  useEffect(() => {
    const list = categoriesMap[courseCategory];
    if (list && list.length > 0) {
      setCourseClass(list[0]);
    }
  }, [courseCategory]);

  const fetchCourses = async () => {
    try {
      if (!token || token === 'mock-jwt-token') {
        const saved = localStorage.getItem('fs_mock_courses');
        if (saved) setCourses(JSON.parse(saved));
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/courses/teacher`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setCourses(await response.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchResources = async () => {
    try {
      if (!token || token === 'mock-jwt-token') {
        const saved = localStorage.getItem('fs_mock_resources');
        if (saved) setResources(JSON.parse(saved));
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/resources`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setResources(await response.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchQuizzes = async () => {
    try {
      if (!token || token === 'mock-jwt-token') {
        const saved = localStorage.getItem('fs_mock_quizzes');
        if (saved) setQuizzes(JSON.parse(saved));
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/quizzes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setQuizzes(await response.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName) {
      setCourseStatusMsg('Please enter a course name.');
      return;
    }
    setCreatingCourse(true);
    setCourseStatusMsg('');

    try {
      if (!token || token === 'mock-jwt-token') {
        const mockNew: Course = {
          id: courses.length + 1,
          name: courseName,
          description: courseDesc,
          className: courseClass
        };
        const updated = [...courses, mockNew];
        localStorage.setItem('fs_mock_courses', JSON.stringify(updated));
        setCourses(updated);
        setCourseName('');
        setCourseDesc('');
        setCourseStatusMsg('Success: Course created in Preview Mode!');
        setCreatingCourse(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/courses`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: courseName,
          description: courseDesc,
          className: courseClass
        })
      });

      if (response.ok) {
        setCourseStatusMsg('Success: Course created!');
        setCourseName('');
        setCourseDesc('');
        fetchCourses();
      } else {
        setCourseStatusMsg(`Error: Failed to create course`);
      }
    } catch (e) {
      setCourseStatusMsg(`Error: Server connection failed`);
    } finally {
      setCreatingCourse(false);
    }
  };

  const handleDeleteCourse = async (id: number) => {
    if (!confirm('Are you sure you want to delete this course and all its resources?')) return;
    try {
      if (!token || token === 'mock-jwt-token') {
        const updated = courses.filter(c => c.id !== id);
        localStorage.setItem('fs_mock_courses', JSON.stringify(updated));
        setCourses(updated);
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) fetchCourses();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUploadResource = async (e: React.FormEvent, courseId: number) => {
    e.preventDefault();
    if (!uploadTitle || !uploadFile) {
      setUploadStatusMsg('Please enter a Title and select a File.');
      return;
    }
    setUploading(true);
    setUploadStatusMsg('');

    try {
      if (!token || token === 'mock-jwt-token') {
        const mockNew: Resource = {
          id: resources.length + 1,
          title: uploadTitle, 
          description: uploadDesc,
          course: courses.find(c => c.id === courseId),
          fileName: uploadFile.name, 
          fileType: uploadFile.type,
          uploadDate: new Date().toISOString().split('T')[0]
        };
        const updated = [mockNew, ...resources];
        localStorage.setItem('fs_mock_resources', JSON.stringify(updated));
        setResources(updated);
        setUploadTitle('');
        setUploadDesc('');
        setUploadFile(null);
        setUploadStatusMsg('Success: Resource uploaded in Preview Mode!');
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadTitle);
      formData.append('description', uploadDesc);
      formData.append('courseId', courseId.toString());

      const response = await fetch(`${API_BASE_URL}/api/resources/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        setUploadStatusMsg('Success: Resource uploaded to database!');
        setUploadTitle('');
        setUploadDesc('');
        setUploadFile(null);
        fetchResources();
      } else {
        setUploadStatusMsg(`Error: Upload failed`);
      }
    } catch (e: any) {
      setUploadStatusMsg(`Error: Server connection failed`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResource = async (id: number) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    try {
      if (!token || token === 'mock-jwt-token') {
        const updated = resources.filter(r => r.id !== id);
        localStorage.setItem('fs_mock_resources', JSON.stringify(updated));
        setResources(updated);
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/resources/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) fetchResources();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = (id: number, name: string) => {
    if (!token || token === 'mock-jwt-token') {
      alert(`Download trigger for: ${name} (Preview Mode)`);
      return;
    }
    window.open(`${API_BASE_URL}/api/resources/${id}/download?access_token=${token}`, '_blank');
  };

  // Inline Quiz Logic
  const toggleQuizPanel = (resourceId: number) => {
    setExpandedResourceId(expandedResourceId === resourceId ? null : resourceId);
    setQuizStatusMsg('');
    setAiPrompt('');
  };

  const toggleStudentsPanel = async (courseId: number) => {
    if (expandedStudentsCourseId === courseId) {
      setExpandedStudentsCourseId(null);
      return;
    }
    setExpandedStudentsCourseId(courseId);
    if (!courseStudents[courseId]) {
      try {
        if (!token || token === 'mock-jwt-token') {
          setCourseStudents({ ...courseStudents, [courseId]: [
            { id: 1, student: { name: 'Mock Student A', email: 'mock_a@student.edu' } },
            { id: 2, student: { name: 'Mock Student B', email: 'mock_b@student.edu' } }
          ]});
          return;
        }
        const response = await fetch(`${API_BASE_URL}/api/enrollments/course/${courseId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setCourseStudents(prev => ({ ...prev, [courseId]: data }));
        }
      } catch (e) {
        console.error("Failed to fetch students", e);
        setCourseStudents(prev => ({ ...prev, [courseId]: [] }));
      }
    }
  };

  const handleGenerateAIQuiz = async () => {
    if (!aiPrompt) {
      setQuizStatusMsg('Please provide a prompt to generate questions.');
      return;
    }
    setGenerating(true);
    setQuizStatusMsg('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/generate-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      if (response.ok) {
        const text = await response.text();
        setQuestionText(text);
        setQuizStatusMsg('Success! Review and edit questions below.');
      } else {
        setQuizStatusMsg('Failed to generate. Check API key.');
      }
    } catch (e) {
      setQuizStatusMsg('Error communicating with AI service.');
    } finally {
      setGenerating(false);
    }
  };

  const handlePublishQuiz = async (res: Resource) => {
    if (!questionText && !questionImage) {
      setQuizStatusMsg('Provide questions (text or image) before publishing.');
      return;
    }
    setPublishing(true);
    setQuizStatusMsg('');

    try {
      if (!token || token === 'mock-jwt-token') {
        const mockQz: Quiz = {
          id: quizzes.length + 1,
          title: `Practice Quiz for ${res.title}`,
          description: `Assessment for ${res.title}`,
          resource: { id: res.id }
        };
        const updated = [...quizzes, mockQz];
        localStorage.setItem('fs_mock_quizzes', JSON.stringify(updated));
        setQuizzes(updated);
        setQuizStatusMsg('Success: Quiz attached in Preview Mode!');
        setPublishing(false);
        setExpandedResourceId(null);
        return;
      }

      const formData = new FormData();
      formData.append('title', `Quiz: ${res.title}`);
      formData.append('description', `Practice Assessment covering ${res.course?.name || 'Subject'}`);
      formData.append('className', res.course?.className || '');
      formData.append('subject', res.course?.name || '');
      formData.append('resourceId', res.id.toString());
      if (questionText) formData.append('questionText', questionText);
      if (questionImage) formData.append('file', questionImage);

      const response = await fetch(`${API_BASE_URL}/api/quizzes`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        setQuizStatusMsg('Success: Quiz published to this resource!');
        fetchQuizzes();
        setExpandedResourceId(null);
      } else {
        setQuizStatusMsg('Failed to publish quiz.');
      }
    } catch (e) {
      setQuizStatusMsg('Server connection failed.');
    } finally {
      setPublishing(false);
    }
  };

  const handleDeleteQuiz = async (quizId: number) => {
    if (!confirm('Delete this attached quiz?')) return;
    try {
      if (!token || token === 'mock-jwt-token') {
        const updated = quizzes.filter(q => q.id !== quizId);
        localStorage.setItem('fs_mock_quizzes', JSON.stringify(updated));
        setQuizzes(updated);
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) fetchQuizzes();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="animate-fade-in pb-20 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
      {/* Left panel: Courses and Resources */}
      <div className="flex-1 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-color-text font-serif">Courses & Resources</h1>
          <p className="text-color-muted mt-1">Manage your courses, study materials, and interactive practice quizzes.</p>
        </div>

        <div className="space-y-4">
          {courses.length === 0 ? (
            <Card className="h-60 flex flex-col items-center justify-center text-color-muted neu-raised">
              <BookOpen className="w-12 h-12 mb-2 opacity-25" />
              <p className="font-semibold text-sm">No courses created yet.</p>
            </Card>
          ) : (
            courses.map((course) => {
              const courseResources = resources.filter(r => r.course?.id === course.id);
              const isCourseExpanded = expandedCourseId === course.id;

              return (
                <Card key={course.id} className="p-0 overflow-hidden flex flex-col neu-raised hover:shadow-md transition-all duration-300">
                  {/* Course Header */}
                  <div 
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-black/[0.02]"
                    onClick={() => setExpandedCourseId(isCourseExpanded ? null : course.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 neu-raised bg-color-surface flex items-center justify-center rounded-xl text-color-accent shrink-0">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-color-text text-lg leading-tight flex items-center gap-2">
                          {course.name}
                        </h4>
                        <p className="text-xs text-color-muted font-medium mt-0.5">{course.description || 'No description provided.'}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="success" className="px-2 py-0.5 text-[10px]">{course.className}</Badge>
                          <span className="text-[10px] text-color-muted font-semibold ml-1">{courseResources.length} Resources</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); toggleStudentsPanel(course.id); }} className="p-2 border-none bg-black/5 hover:bg-black/10 text-color-text rounded-xl" title="View Students">
                        <Users className="w-4 h-4" />
                      </Button>
                      <Button variant="icon" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course.id); }} className="bg-color-danger/10 text-color-danger hover:bg-color-danger/20 rounded-xl p-2 border-none" title="Delete Course">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <div className="w-8 h-8 flex items-center justify-center bg-color-accent/10 text-color-accent rounded-full">
                        {isCourseExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Course Details */}
                  {isCourseExpanded && (
                    <div className="border-t border-black/5 bg-black/[0.01]">
                      
                      {/* Upload Resource Form for this Course */}
                      <div className="p-5 border-b border-black/5 bg-color-surface">
                        <h5 className="font-bold text-sm text-color-text mb-3 flex items-center gap-2"><FolderOpen className="w-4 h-4 text-color-accent" /> Upload Resource to {course.name}</h5>
                        {uploadStatusMsg && (
                          <div className={`p-2 mb-3 text-xs font-semibold rounded-xl text-center neu-inset ${uploadStatusMsg.startsWith('Success') ? 'bg-color-success/15 text-color-success' : 'bg-color-danger/15 text-color-danger'}`}>
                            {uploadStatusMsg}
                          </div>
                        )}
                        <form onSubmit={(e) => handleUploadResource(e, course.id)} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                          <div className="md:col-span-4 space-y-3">
                            <Input placeholder="Resource Title" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} required />
                            <textarea placeholder="Description (Optional)" value={uploadDesc} onChange={(e) => setUploadDesc(e.target.value)} className="w-full text-xs neu-inset bg-color-surface text-color-text focus:outline-none focus:ring-1 focus:ring-accent rounded-xl p-2.5 min-h-[50px]"/>
                          </div>
                          <div className="md:col-span-5">
                            <div 
                              className={`w-full h-full min-h-[90px] neu-inset bg-color-surface border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors cursor-pointer relative ${dragActive ? 'border-color-accent text-color-accent' : 'border-color-muted/30 text-color-muted'}`}
                              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                              onDragLeave={() => setDragActive(false)}
                              onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) setUploadFile(e.dataTransfer.files[0]); }}
                            >
                              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={(e) => { if (e.target.files?.[0]) setUploadFile(e.target.files[0]); }} />
                              <UploadCloud className="w-5 h-5 mb-1 text-color-accent" />
                              <p className="text-[10px] font-semibold">{uploadFile ? uploadFile.name : 'Drag & Drop file here'}</p>
                            </div>
                          </div>
                          <div className="md:col-span-3 flex flex-col h-full justify-end gap-2">
                            <Button type="submit" size="sm" className="w-full h-10 shadow-sm font-bold" disabled={uploading}>
                              {uploading ? 'Uploading...' : 'Upload'}
                            </Button>
                            <Button type="button" variant="secondary" size="sm" className="w-full h-10 font-bold" onClick={() => setExpandedCourseId(null)}>
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </div>

                      {/* Course Resources List */}
                      <div className="p-5 space-y-4">
                        <h5 className="font-bold text-sm text-color-muted uppercase tracking-wider mb-2">Course Materials</h5>
                        {courseResources.length === 0 ? (
                          <p className="text-xs text-color-muted italic">No materials uploaded yet.</p>
                        ) : (
                          courseResources.map(file => {
                            const resourceQuizzes = quizzes.filter(q => q.resource?.id === file.id);
                            const isResourceExpanded = expandedResourceId === file.id;

                            return (
                              <div key={file.id} className="bg-color-surface neu-inset rounded-xl p-4 transition-all">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-color-accent/10 rounded-lg flex items-center justify-center text-color-accent shrink-0">
                                      <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <h6 className="font-bold text-sm flex items-center gap-2">
                                        {file.title}
                                        {resourceQuizzes.length > 0 && <Badge variant="success" className="text-[9px] py-0 px-1.5"><FileQuestion className="w-3 h-3 mr-1 inline"/> {resourceQuizzes.length} Quizzes</Badge>}
                                      </h6>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] text-color-muted">{file.fileName}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Button variant="secondary" size="sm" onClick={() => toggleQuizPanel(file.id)} className="flex items-center gap-1 py-1 px-2 text-xs">
                                      {isResourceExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />} Quiz Actions
                                    </Button>
                                    <Button variant="secondary" size="sm" onClick={() => setPreviewResource({ id: file.id, name: file.fileName })} title="Preview" className="px-2 py-1 flex items-center justify-center">
                                      <Eye className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button variant="secondary" size="sm" onClick={() => handleDownload(file.id, file.fileName)} title="Download" className="px-2 py-1 flex items-center justify-center">
                                      <Download className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button variant="icon" size="sm" onClick={() => handleDeleteResource(file.id)} className="bg-color-danger/10 text-color-danger hover:bg-color-danger/20 rounded-lg p-1.5 border-none" title="Delete">
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Quiz Panel */}
                                {isResourceExpanded && (
                                  <div className="mt-4 pt-4 border-t border-black/5 animate-slide-up">
                                    {resourceQuizzes.length > 0 && (
                                      <div className="mb-4 space-y-2">
                                        <h6 className="text-xs font-bold text-color-text">Active Practice Quizzes</h6>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                          {resourceQuizzes.map(qz => (
                                            <div key={qz.id} className="p-3 bg-color-success/5 rounded-lg border border-color-success/20 flex flex-col gap-2">
                                              <div className="flex items-center justify-between">
                                                <p className="text-xs font-bold text-color-text truncate pr-2">{qz.title}</p>
                                                <Button variant="icon" size="sm" onClick={() => handleDeleteQuiz(qz.id)} className="text-color-danger hover:bg-color-danger/10 border-none w-6 h-6 p-0 shrink-0" title="Delete Quiz">
                                                  <Trash2 className="w-3 h-3" />
                                                </Button>
                                              </div>
                                              {qz.questionText && <p className="text-[10px] text-color-muted line-clamp-2">{qz.questionText}</p>}
                                              {qz.questionsJson && (
                                                <p className="text-[10px] text-color-muted line-clamp-2">
                                                  {(() => {
                                                    try {
                                                      const parsed = JSON.parse(qz.questionsJson);
                                                      return parsed.map((q: any) => q.q).join(' | ');
                                                    } catch(e) { return qz.questionsJson; }
                                                  })()}
                                                </p>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    <div className="p-4 bg-color-background neu-inset rounded-xl space-y-4 border border-black/5">
                                      <div className="flex items-center justify-between">
                                        <h5 className="font-bold text-sm flex items-center gap-1.5 text-color-accent">
                                          <Bot className="w-4 h-4" /> AI Quiz Generator
                                        </h5>
                                        {quizStatusMsg && <span className="text-[10px] font-bold text-color-accent">{quizStatusMsg}</span>}
                                      </div>
                                      
                                      <div className="space-y-3">
                                        <div className="p-2 bg-color-accent/10 border border-color-accent/20 rounded-lg flex flex-col gap-0.5">
                                          <span className="text-xs font-bold text-color-accent">Token Saving Mode</span>
                                          <span className="text-[10px] text-color-muted">Paste your text/summary to generate MCQs.</span>
                                        </div>
                                        <textarea 
                                          placeholder="e.g. 'Generate 5 MCQs on...'" 
                                          value={aiPrompt}
                                          onChange={(e) => setAiPrompt(e.target.value)}
                                          className="w-full text-xs neu-inset bg-color-surface p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent min-h-[60px]"
                                        />
                                        <Button size="sm" onClick={handleGenerateAIQuiz} disabled={generating} className="w-full text-xs font-bold h-8">
                                          {generating ? 'Generating...' : 'Generate Questions'}
                                        </Button>
                                      </div>

                                      <div className="pt-3 border-t border-black/5 space-y-3">
                                        <h5 className="font-bold text-xs text-color-muted">Review & Publish</h5>
                                        <textarea 
                                          placeholder="Edit questions here..." 
                                          value={questionText}
                                          onChange={(e) => setQuestionText(e.target.value)}
                                          className="w-full text-xs neu-inset bg-color-surface p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent min-h-[80px]"
                                        />
                                        <div className="flex items-center gap-2">
                                          <label className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-color-muted neu-inset bg-color-surface p-2 rounded-lg cursor-pointer">
                                            <ImageIcon className="w-3.5 h-3.5 text-color-accent" />
                                            <span className="truncate max-w-[100px]">{questionImage ? questionImage.name : 'Attach Image'}</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => setQuestionImage(e.target.files?.[0] || null)} />
                                          </label>
                                          <Button onClick={() => handlePublishQuiz(file)} disabled={publishing} className="flex-1 text-xs font-bold h-8">
                                            {publishing ? 'Publishing...' : 'Publish New Quiz'}
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Right panel: Create Course Form */}
      <div className="w-full lg:w-80 space-y-8 shrink-0">
        <Card className="neu-raised border border-white/50 bg-color-surface/90 sticky top-6">
          <CardHeader className="border-b border-black/5 pb-3 font-bold flex items-center gap-2">
            <Plus className="w-5 h-5 text-color-accent" /> Create New Course
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {courseStatusMsg && (
              <div className={`p-2.5 text-xs font-semibold rounded-xl text-center neu-inset ${courseStatusMsg.startsWith('Success') ? 'bg-color-success/15 text-color-success' : 'bg-color-danger/15 text-color-danger'}`}>
                {courseStatusMsg}
              </div>
            )}

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <Input 
                label="Course Name" 
                placeholder="e.g., Physics 101" 
                value={courseName} 
                onChange={(e) => setCourseName(e.target.value)}
                required
              />

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-color-muted ml-1">Description</label>
                <textarea 
                  placeholder="Course summary..." 
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                  className="w-full mt-1 neu-inset px-3 py-2 bg-color-surface text-color-text focus:outline-none focus:ring-1 focus:ring-accent rounded-xl text-xs min-h-[60px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-color-muted ml-1">Category</label>
                  <select 
                    value={courseCategory}
                    onChange={(e) => setCourseCategory(e.target.value)}
                    className="w-full mt-1 neu-inset px-2 py-2 bg-color-surface text-color-text focus:outline-none focus:ring-1 focus:ring-accent rounded-lg text-xs cursor-pointer"
                  >
                    <option value="School">School</option>
                    <option value="College">College</option>
                    <option value="University">University</option>
                    <option value="Masters">Masters</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-color-muted ml-1">Class Level</label>
                  <select 
                    value={courseClass}
                    onChange={(e) => setCourseClass(e.target.value)}
                    className="w-full mt-1 neu-inset px-2 py-2 bg-color-surface text-color-text focus:outline-none focus:ring-1 focus:ring-accent rounded-lg text-xs cursor-pointer"
                  >
                    {(categoriesMap[courseCategory] || []).map(lvl => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Button type="submit" className="w-full h-10 shadow-sm mt-2 font-bold text-sm" disabled={creatingCourse}>
                {creatingCourse ? 'Creating...' : 'Create Course'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Preview Modal */}
      {previewResource && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-color-surface w-full max-w-5xl h-[85vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden relative animate-scale-in">
            <div className="flex items-center justify-between p-4 border-b border-black/10">
              <h3 className="font-bold text-lg font-serif">Preview: {previewResource.name}</h3>
              <button onClick={() => setPreviewResource(null)} className="p-2 bg-black/5 hover:bg-color-danger/10 text-color-text hover:text-color-danger rounded-xl transition-all cursor-pointer">
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
      {/* Enrolled Students Modal */}
      {expandedStudentsCourseId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-color-surface w-full max-w-lg max-h-[85vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden relative animate-scale-in">
            <div className="flex items-center justify-between p-4 border-b border-black/10">
              <h3 className="font-bold text-lg font-serif flex items-center gap-2"><Users className="w-5 h-5 text-color-accent" /> Enrolled Students</h3>
              <button onClick={() => setExpandedStudentsCourseId(null)} className="p-2 bg-black/5 hover:bg-color-danger/10 text-color-text hover:text-color-danger rounded-xl transition-all cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {(courseStudents[expandedStudentsCourseId] || []).length === 0 ? (
                <p className="text-center text-color-muted text-sm italic py-8">No students enrolled yet.</p>
              ) : (
                (courseStudents[expandedStudentsCourseId] || []).map((enrollment: any) => (
                  <div key={enrollment.id} className="p-3 bg-color-background rounded-xl border border-black/5 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-color-text">{enrollment.student?.name}</h4>
                      <p className="text-[10px] text-color-muted">{enrollment.student?.email}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
