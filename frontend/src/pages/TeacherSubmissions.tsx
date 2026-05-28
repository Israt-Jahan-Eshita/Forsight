import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Image, FileText, Check, Paperclip, Send } from 'lucide-react';

const mockSubmissions = [
  { id: 1, student: 'Sara Rahman', topic: 'Newton Law Homework', type: 'image', status: 'Pending', time: '2 hours ago' },
  { id: 2, student: 'Aarav Patel', topic: 'Biology Essay', type: 'text', status: 'Reviewed', time: '1 day ago' },
];

export function TeacherSubmissions() {
  const [selected, setSelected] = useState(mockSubmissions[0]);

  return (
    <div className="animate-fade-in pb-20 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 h-[calc(100vh-120px)]">
      
      {/* Feed List */}
      <div className="w-full lg:w-[400px] flex flex-col space-y-4 overflow-y-auto pr-2 pb-10">
        <h1 className="text-3xl font-bold text-color-text font-serif">Submissions</h1>
        {mockSubmissions.map((sub) => (
          <Card 
            key={sub.id} 
            className={`p-4 cursor-pointer transition-all ${selected.id === sub.id ? 'neu-inset ring-2 ring-color-accent' : ''}`}
            onClick={() => setSelected(sub)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar fallback={sub.student[0]} size="sm" />
                <div>
                  <h4 className="font-bold text-color-text text-sm">{sub.student}</h4>
                  <p className="text-xs text-color-muted mt-0.5">{sub.topic}</p>
                </div>
              </div>
              <Badge variant={sub.status === 'Pending' ? 'warning' : 'success'}>{sub.status}</Badge>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-color-muted">
              <span className="flex items-center gap-1">
                {sub.type === 'image' ? <Image className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                {sub.type}
              </span>
              <span>{sub.time}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Detail & Action View */}
      <Card className="flex-1 flex flex-col p-0 overflow-hidden">
        <div className="p-6 border-b border-black/5 bg-color-surface/50">
          <h2 className="text-xl font-bold text-color-text font-serif">{selected.topic}</h2>
          <p className="text-sm text-color-muted">Submitted by {selected.student}</p>
        </div>
        
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          {/* Submission content */}
          <div className="flex-1 p-6 overflow-y-auto border-r border-black/5">
            {selected.type === 'image' ? (
              <div className="w-full h-96 neu-inset bg-color-surface rounded-xl flex items-center justify-center text-color-muted flex-col gap-2">
                <Image className="w-12 h-12 opacity-20" />
                <p>Image preview here</p>
              </div>
            ) : (
              <div className="w-full p-6 neu-inset bg-color-surface rounded-xl text-color-text leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </div>
            )}
          </div>
          
          {/* Action panel */}
          <div className="w-full lg:w-80 p-6 flex flex-col space-y-6 bg-color-background">
            <div>
              <Button className="w-full bg-color-success gap-2">
                <Check className="w-4 h-4" /> Approve Submission
              </Button>
            </div>
            <div className="flex-1 flex flex-col">
              <h3 className="font-bold text-sm mb-3">Feedback Thread</h3>
              <div className="flex-1 neu-inset bg-color-surface rounded-xl p-4 overflow-y-auto mb-4">
                <p className="text-sm text-color-muted text-center italic mt-10">No feedback yet.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="icon" className="shrink-0"><Paperclip className="w-4 h-4" /></Button>
                <input type="text" placeholder="Type feedback..." className="flex-1 neu-inset px-4 py-2 text-sm bg-color-surface focus:outline-none focus:ring-1 focus:ring-accent" />
                <Button variant="primary" className="p-2 shrink-0 rounded-xl"><Send className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
