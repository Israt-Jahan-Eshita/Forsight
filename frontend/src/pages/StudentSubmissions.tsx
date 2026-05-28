import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { UploadCloud } from 'lucide-react';

const mockSubmissions = [
  { id: 1, topic: 'Newton Law Homework', status: 'Reviewed', feedback: true, time: 'Yesterday' },
];

export function StudentSubmissions() {
  return (
    <div className="animate-fade-in pb-20 max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-color-text font-serif mb-6">My Submissions</h1>
      
      <Card className="p-8">
        <h2 className="text-xl font-bold font-serif mb-6">Submit New Assignment</h2>
        <div className="space-y-4 max-w-2xl">
          <input type="text" placeholder="Topic / Question" className="w-full neu-inset px-4 py-3 bg-color-surface focus:outline-none focus:ring-1 focus:ring-accent" />
          <select className="w-full neu-inset px-4 py-3 bg-color-surface focus:outline-none focus:ring-1 focus:ring-accent">
            <option>Select Subject</option>
            <option>Physics</option>
          </select>
          <div className="w-full h-32 neu-inset bg-color-surface border-2 border-dashed border-color-muted/30 rounded-xl flex flex-col items-center justify-center text-color-muted">
            <UploadCloud className="w-8 h-8 mb-2" />
            <p className="text-sm">Upload Image or Document</p>
          </div>
          <p className="text-center text-sm font-bold text-color-muted">OR</p>
          <textarea rows={4} placeholder="Type your answer here..." className="w-full neu-inset px-4 py-3 bg-color-surface focus:outline-none focus:ring-1 focus:ring-accent"></textarea>
          <Button className="w-full">Submit for Review</Button>
        </div>
      </Card>

      <h2 className="text-2xl font-bold font-serif mt-12 mb-4">Past Submissions</h2>
      <div className="space-y-4">
        {mockSubmissions.map((sub) => (
          <Card key={sub.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg">{sub.topic}</h3>
              <p className="text-xs text-color-muted mt-1">Submitted {sub.time}</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="success">{sub.status}</Badge>
              {sub.feedback && <Button variant="secondary" size="sm">View Feedback</Button>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
