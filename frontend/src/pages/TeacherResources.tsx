import { useState } from 'react';
import { UploadCloud, FileText, Check, Download } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

const uploadedFiles = [
  { id: 1, name: 'Photosynthesis_Notes.pdf', subject: 'Biology', date: 'Today' },
  { id: 2, name: 'Newton_Laws.docx', subject: 'Physics', date: 'Yesterday' },
];

const studentRequests = [
  { id: 1, student: 'Sara Rahman', topic: 'Photosynthesis detailed breakdown', subject: 'Biology' },
];

export function TeacherResources() {
  const [dragActive, setDragActive] = useState(false);

  return (
    <div className="animate-fade-in pb-20 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
      {/* Left panel: Uploaded resources list */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-color-text font-serif">Resources Shelf</h1>
        </div>
        
        <div className="flex gap-2 flex-wrap mb-4">
          {['All', 'Physics', 'Biology', 'Chemistry'].map((filter) => (
            <Badge key={filter} className="neu-inset bg-color-surface px-4 py-2 cursor-pointer hover:text-color-accent">
              {filter}
            </Badge>
          ))}
        </div>

        <div className="space-y-4">
          {uploadedFiles.map((file) => (
            <Card key={file.id} className="p-4 flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 neu-raised bg-color-surface flex items-center justify-center rounded-xl text-color-accent">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-color-text">{file.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="success">{file.subject}</Badge>
                    <span className="text-xs text-color-muted">Uploaded {file.date}</span>
                  </div>
                </div>
              </div>
              <Button variant="icon">
                <Download className="w-5 h-5" />
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Right panel: Upload area & Requests */}
      <div className="w-full lg:w-96 space-y-8">
        <Card>
          <CardHeader>Upload New Resource</CardHeader>
          <CardContent className="space-y-4">
            <div 
              className={`w-full h-32 neu-inset bg-color-surface border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors ${dragActive ? 'border-color-accent text-color-accent' : 'border-color-muted/30 text-color-muted'}`}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => { e.preventDefault(); setDragActive(false); }}
            >
              <UploadCloud className="w-8 h-8 mb-2" />
              <p className="text-sm font-medium">Drag & Drop files here</p>
              <p className="text-xs opacity-70">or click to browse</p>
            </div>
            <select className="w-full neu-inset bg-color-surface px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent">
              <option value="">Select Subject</option>
              <option value="Physics">Physics</option>
              <option value="Biology">Biology</option>
            </select>
            <input type="text" placeholder="Description (optional)" className="w-full neu-inset bg-color-surface px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent" />
            <Button className="w-full">Upload File</Button>
          </CardContent>
        </Card>

        <section>
          <h3 className="font-bold font-serif text-xl mb-4 text-color-text">Student Requests</h3>
          <div className="space-y-4">
            {studentRequests.map((req) => (
              <Card key={req.id} className="p-4">
                <p className="text-sm mb-2"><span className="font-bold">{req.student}</span> requested notes on:</p>
                <p className="font-medium text-color-accent mb-3">"{req.topic}"</p>
                <Button size="sm" className="w-full gap-2 bg-color-success text-white">
                  <Check className="w-4 h-4" /> Accept & Upload
                </Button>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
