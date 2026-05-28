import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FileText, Download, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const mockResources = [
  { id: 1, name: 'Biology_Chapter_4.pdf', subject: 'Biology', date: 'Oct 12' },
  { id: 2, name: 'Physics_Newton_Laws.pdf', subject: 'Physics', date: 'Oct 10' },
];

export function StudentResources() {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in pb-20 max-w-7xl mx-auto relative min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-color-text font-serif">Resource Shelf</h1>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-bold text-color-muted border-b border-black/5 pb-2 mb-4">Biology</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockResources.filter(r => r.subject === 'Biology').map(res => (
              <Card key={res.id} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 neu-inset bg-color-surface flex items-center justify-center rounded-xl text-color-accent mb-4">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-color-text leading-tight mb-1">{res.name}</h3>
                  <p className="text-xs text-color-muted">Uploaded {res.date}</p>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button variant="primary" className="flex-1 text-sm py-2" onClick={() => navigate('/ask-ai')}>Make AI Notes</Button>
                  <Button variant="secondary" className="px-3"><Download className="w-4 h-4" /></Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-color-muted border-b border-black/5 pb-2 mb-4">Physics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockResources.filter(r => r.subject === 'Physics').map(res => (
              <Card key={res.id} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 neu-inset bg-color-surface flex items-center justify-center rounded-xl text-color-accent mb-4">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-color-text leading-tight mb-1">{res.name}</h3>
                  <p className="text-xs text-color-muted">Uploaded {res.date}</p>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button variant="primary" className="flex-1 text-sm py-2" onClick={() => navigate('/ask-ai')}>Make AI Notes</Button>
                  <Button variant="secondary" className="px-3"><Download className="w-4 h-4" /></Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>

      <Button className="fixed bottom-8 right-24 rounded-full w-14 h-14 p-0 flex items-center justify-center shadow-lg" title="Request Resource">
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
}
