import { useState, useEffect } from 'react';
import { UploadCloud, FileText, Download, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';

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

export function TeacherResources() {
  const { token } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  
  // Upload form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('School');
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [subject, setSubject] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Class list selections based on category
  const categoriesMap: Record<string, string[]> = {
    School: Array.from({ length: 10 }, (_, i) => `Class ${i + 1}`),
    College: ['Class 11', 'Class 12'],
    University: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
    Masters: ['Masters']
  };

  useEffect(() => {
    fetchResources();
  }, [token]);

  // Update default selected class when category changes
  useEffect(() => {
    const list = categoriesMap[category];
    if (list && list.length > 0) {
      setSelectedClass(list[0]);
    }
  }, [category]);

  const fetchResources = async () => {
    try {
      if (!token || token === 'mock-jwt-token') {
        const saved = localStorage.getItem('fs_mock_resources');
        if (saved) {
          setResources(JSON.parse(saved));
        } else {
          const initial = [
            { id: 1, title: 'Photosynthesis Notes', description: 'Detailed breakdown of chemical processes in leaves', className: 'Class 10', subject: 'Biology', fileName: 'Photosynthesis_Notes.pdf', fileType: 'application/pdf', uploadDate: '2026-05-28' },
            { id: 2, title: 'Newton Laws Summary', description: 'Quick cheat sheet for Newton\'s first, second, and third laws', className: 'Class 10', subject: 'Physics', fileName: 'Newton_Laws.docx', fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', uploadDate: '2026-05-27' },
          ];
          localStorage.setItem('fs_mock_resources', JSON.stringify(initial));
          setResources(initial);
        }
        return;
      }

      const response = await fetch('http://localhost:8080/api/resources', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setResources(data);
      } else {
        throw new Error("API not ok");
      }
    } catch (e) {
      console.error("Failed to fetch resources, using preview mode");
      const saved = localStorage.getItem('fs_mock_resources');
      if (saved) setResources(JSON.parse(saved));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subject || !file) {
      setStatusMsg('Please enter a Title, Subject and select a File to upload.');
      return;
    }
    setUploading(true);
    setStatusMsg('');

    try {
      if (!token || token === 'mock-jwt-token') {
        // Preview mode mock upload
        const mockNew: Resource = {
          id: resources.length + 1,
          title,
          description,
          className: selectedClass,
          subject,
          fileName: file.name,
          fileType: file.type,
          uploadDate: new Date().toISOString().split('T')[0]
        };
        const updated = [mockNew, ...resources];
        localStorage.setItem('fs_mock_resources', JSON.stringify(updated));
        setResources(updated);
        resetForm();
        setStatusMsg('Success: Resource uploaded in Preview Mode!');
        setUploading(false);
        return;
      }

      // Real multipart API request
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('className', selectedClass);
      formData.append('subject', subject);

      const response = await fetch('http://localhost:8080/api/resources/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        setStatusMsg('Success: Resource uploaded to database!');
        resetForm();
        fetchResources();
      } else {
        const err = await response.text();
        setStatusMsg(`Error: ${err || 'Upload failed'}`);
      }
    } catch (e: any) {
      setStatusMsg(`Error: ${e.message || 'Server connection failed'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    try {
      if (!token || token === 'mock-jwt-token') {
        const updated = resources.filter(r => r.id !== id);
        localStorage.setItem('fs_mock_resources', JSON.stringify(updated));
        setResources(updated);
        return;
      }

      const response = await fetch(`http://localhost:8080/api/resources/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchResources();
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
    setFile(null);
  };

  const handleDownload = (id: number, name: string) => {
    if (!token || token === 'mock-jwt-token') {
      alert(`Download trigger for: ${name} (Preview Mode)`);
      return;
    }
    // Perform browser download request
    window.open(`http://localhost:8080/api/resources/${id}/download?access_token=${token}`, '_blank');
  };

  return (
    <div className="animate-fade-in pb-20 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
      {/* Left panel: Uploaded resources list */}
      <div className="flex-1 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-color-text font-serif">Resources Shelf</h1>
          <p className="text-color-muted mt-1">Manage study materials and educational dossiers.</p>
        </div>

        <div className="space-y-4">
          {resources.length === 0 ? (
            <Card className="h-60 flex flex-col items-center justify-center text-color-muted neu-raised">
              <FileText className="w-12 h-12 mb-2 opacity-25" />
              <p className="font-semibold text-sm">No resources uploaded yet.</p>
            </Card>
          ) : (
            resources.map((file) => (
              <Card key={file.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 neu-raised hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 neu-raised bg-color-surface flex items-center justify-center rounded-xl text-color-accent shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-color-text text-lg leading-tight">{file.title}</h4>
                    <p className="text-xs text-color-muted font-medium mt-0.5">{file.description || 'No description provided.'}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant="success">{file.className}</Badge>
                      <Badge variant="default" className="bg-color-accent/10 text-color-accent hover:bg-color-accent/20 border-none font-bold text-black">{file.subject}</Badge>
                      <span className="text-[10px] text-color-muted font-semibold ml-1">File: {file.fileName}</span>
                      <span className="text-[10px] text-color-muted font-semibold ml-1">• Uploaded {file.uploadDate ? file.uploadDate.substring(0, 10) : 'Today'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <Button variant="secondary" size="sm" onClick={() => handleDownload(file.id, file.fileName)} title="Download Resource" className="flex items-center gap-1.5 py-1.5 px-3">
                    <Download className="w-4 h-4" /> Download
                  </Button>
                  <Button variant="icon" size="sm" onClick={() => handleDelete(file.id)} className="bg-color-danger/10 text-color-danger hover:bg-color-danger/20 rounded-xl p-2 cursor-pointer border-none" title="Delete Resource">
                    <Trash2 className="w-4.5 h-4.5" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Right panel: Upload form */}
      <div className="w-full lg:w-96 space-y-8 shrink-0">
        <Card className="neu-raised border border-white/50 bg-color-surface/90">
          <CardHeader className="border-b border-black/5 pb-3">Upload New Resource</CardHeader>
          <CardContent className="space-y-4 pt-4">
            {statusMsg && (
              <div className={`p-3 text-xs font-semibold rounded-xl text-center neu-inset ${statusMsg.startsWith('Success') ? 'bg-color-success/15 text-color-success' : 'bg-color-danger/15 text-color-danger'}`}>
                {statusMsg}
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              <Input 
                label="Resource Title" 
                placeholder="e.g., Photosynthesis Notes" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-color-muted ml-1">Description (Optional)</label>
                <textarea 
                  placeholder="Summary of resources content..." 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full mt-1 neu-inset px-4 py-2.5 bg-color-surface text-color-text focus:outline-none focus:ring-2 focus:ring-accent rounded-xl text-sm min-h-[70px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-color-muted ml-1">Class Type</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full mt-1 neu-inset px-4 py-2.5 bg-color-surface text-color-text focus:outline-none focus:ring-2 focus:ring-accent rounded-xl text-sm font-medium cursor-pointer"
                  >
                    <option value="School">School</option>
                    <option value="College">College</option>
                    <option value="University">University</option>
                    <option value="Masters">Masters</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-color-muted ml-1">Class Level</label>
                  <select 
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full mt-1 neu-inset px-4 py-2.5 bg-color-surface text-color-text focus:outline-none focus:ring-2 focus:ring-accent rounded-xl text-sm font-medium cursor-pointer"
                  >
                    {(categoriesMap[category] || []).map(lvl => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Input 
                label="Subject Name" 
                placeholder="e.g., Biology, Physics" 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)}
                required
              />

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-color-muted ml-1">File Upload</label>
                <div 
                  className={`w-full h-28 neu-inset bg-color-surface border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors cursor-pointer relative ${dragActive ? 'border-color-accent text-color-accent' : 'border-color-muted/30 text-color-muted'}`}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]); }}
                >
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={(e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); }}
                  />
                  <UploadCloud className="w-8 h-8 mb-1 text-color-accent" />
                  <p className="text-xs font-semibold">{file ? `Selected: ${file.name}` : 'Drag & Drop files here'}</p>
                  <p className="text-[10px] opacity-70 mt-0.5">{file ? `Size: ${(file.size / 1024).toFixed(1)} KB` : 'or click to browse'}</p>
                </div>
              </div>

              <Button type="submit" className="w-full h-11 shadow-sm mt-4 font-bold" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload Resource to Shelf'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
