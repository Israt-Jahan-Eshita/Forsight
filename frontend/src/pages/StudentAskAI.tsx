import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FileText, MessageSquare } from 'lucide-react';

export function StudentAskAI() {
  const [mode, setMode] = useState<'notes' | 'chat'>('notes');
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');

  const generateNotes = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setNotes(`## Key Concepts\n- Photosynthesis is the process by which green plants transform light energy into chemical energy.\n\n## Definitions\n- **Chlorophyll**: Green pigment responsible for the capture of light energy.\n\n## Summary\nPlants take in carbon dioxide and water and produce oxygen and glucose.`);
    }, 1500);
  };

  return (
    <div className="animate-fade-in pb-20 h-[calc(100vh-120px)] flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
      
      {/* PDF Viewer (Mock) */}
      <div className="flex-1 neu-inset bg-color-surface rounded-xl overflow-hidden flex flex-col border border-white/50">
        <div className="p-4 border-b border-black/5 bg-color-surface/50 flex justify-between items-center">
          <h2 className="font-bold font-serif">Biology_Chapter_4.pdf</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-8 bg-color-background">
          <div className="w-full h-full max-w-2xl bg-white shadow-md flex flex-col p-8 opacity-50 select-none">
            <div className="h-6 w-3/4 bg-gray-200 rounded mb-6"></div>
            <div className="h-4 w-full bg-gray-100 rounded mb-2"></div>
            <div className="h-4 w-full bg-gray-100 rounded mb-2"></div>
            <div className="h-4 w-5/6 bg-gray-100 rounded mb-8"></div>
            <div className="h-40 w-full bg-gray-100 rounded mb-6 flex items-center justify-center text-gray-400">Image Diagram</div>
            <div className="h-4 w-full bg-gray-100 rounded mb-2"></div>
            <div className="h-4 w-4/5 bg-gray-100 rounded mb-2"></div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-[400px] flex flex-col gap-4">
        
        {/* Toggle Mode */}
        <div className="flex p-1 neu-inset rounded-full bg-color-surface">
          <button 
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${mode === 'notes' ? 'neu-raised text-color-accent' : 'text-color-muted hover:text-color-text'}`}
            onClick={() => setMode('notes')}
          >
            <FileText className="w-4 h-4 inline-block mr-2" /> Smart Notes
          </button>
          <button 
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${mode === 'chat' ? 'neu-raised text-color-accent' : 'text-color-muted hover:text-color-text'}`}
            onClick={() => setMode('chat')}
          >
            <MessageSquare className="w-4 h-4 inline-block mr-2" /> Ask AI
          </button>
        </div>

        <Card className="flex-1 p-0 flex flex-col overflow-hidden">
          {mode === 'notes' ? (
            <div className="p-6 flex-1 flex flex-col overflow-y-auto">
              {!notes && !loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <FileText className="w-12 h-12 text-color-muted opacity-20 mb-4" />
                  <p className="text-color-muted mb-6">Generate structured notes directly from this document.</p>
                  <Button onClick={generateNotes}>Generate Notes</Button>
                </div>
              )}
              {loading && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-color-accent border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-color-muted text-sm">Reading document...</p>
                  </div>
                </div>
              )}
              {notes && !loading && (
                <div className="prose prose-sm max-w-none text-color-text whitespace-pre-wrap">
                  {notes}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                <div className="self-start max-w-[85%] p-3 rounded-2xl rounded-tl-sm neu-raised bg-color-surface text-sm">
                  What would you like to know about this document?
                </div>
              </div>
              <div className="p-4 border-t border-black/5 bg-color-surface/50">
                <input type="text" placeholder="Ask a question..." className="w-full neu-inset px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-accent bg-color-background" />
              </div>
            </div>
          )}
        </Card>
      </div>
      
    </div>
  );
}
