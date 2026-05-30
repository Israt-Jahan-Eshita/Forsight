import { API_BASE_URL } from '../config';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FileText, MessageSquare, Send, Sparkles, BookOpen, Download, Copy, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ChatMessage {
  sender: 'user' | 'ai';
  content: string;
}

interface Course {
  id: number;
  name: string;
  className: string;
}

interface Resource {
  id: number;
  title: string;
  description: string;
  course?: Course;
  fileName: string;
  fileType: string;
}

export function StudentAskAI() {
  const { token } = useAuth();
  const location = useLocation();
  const [mode, setMode] = useState<'notes' | 'chat'>('notes');
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [notesCache, setNotesCache] = useState<Record<number, string>>({});
  const [copied, setCopied] = useState(false);
  
  // Resources list for dropdown selection
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState<number | null>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [fileName, setFileName] = useState('Biology_Chapter_4.pdf');

  // Chatbot State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [botTyping, setBotTyping] = useState(false);

  // Load all available resources to populate the dropdown
  useEffect(() => {
    fetchResourcesList();
  }, [token]);

  // Set the selected resource based on dropdown changes or route navigation state
  useEffect(() => {
    if (resources.length > 0) {
      const stateResourceId = location.state?.resourceId as number | undefined;
      const targetId = stateResourceId || selectedResourceId || resources[0].id;
      
      const targetRes = resources.find(r => r.id === targetId) || resources[0];
      setSelectedResourceId(targetRes.id);
      setSelectedResource(targetRes);
      setFileName(targetRes.fileName);
      
      // Reset notes & chat messages for the newly selected PDF
      if (notesCache[targetRes.id]) {
        setNotes(notesCache[targetRes.id]);
      } else {
        setNotes('');
      }
      setChatMessages([
        { sender: 'ai', content: `Hello! I have loaded the study guide "${targetRes.title}" (${targetRes.fileName}) for ${targetRes.course?.className || ''} ${targetRes.course?.name || ''}. What would you like to learn or analyze about this document today?` }
      ]);
    }
  }, [resources, selectedResourceId, location.state?.resourceId]);

  const fetchResourcesList = async () => {
    try {
      if (!token || token === 'mock-jwt-token') {
        const saved = localStorage.getItem('fs_mock_resources');
        const mockList: Resource[] = saved ? JSON.parse(saved) : [
          { id: 1, title: 'Photosynthesis Notes', description: 'Detailed breakdown of chemical processes in leaves', course: { id: 1, name: 'Biology', className: 'Class 10' }, fileName: 'Photosynthesis_Notes.pdf', fileType: 'application/pdf' },
          { id: 2, title: 'Newton Laws Summary', description: 'Quick cheat sheet for Newton\'s first, second, and third laws', course: { id: 2, name: 'Physics', className: 'Class 10' }, fileName: 'Newton_Laws.docx', fileType: 'application/docx' },
        ];
        setResources(mockList);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/resources`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setResources(data);
      } else {
        throw new Error("API not ok");
      }
    } catch (e) {
      console.error("Failed to fetch resources, using preview mode", e);
      const saved = localStorage.getItem('fs_mock_resources');
      if (saved) {
        setResources(JSON.parse(saved));
      } else {
        setResources([
          { id: 1, title: 'Photosynthesis Notes', description: 'Detailed breakdown of chemical processes in leaves', course: { id: 1, name: 'Biology', className: 'Class 10' }, fileName: 'Photosynthesis_Notes.pdf', fileType: 'application/pdf' },
          { id: 2, title: 'Newton Laws Summary', description: 'Quick cheat sheet for Newton\'s first, second, and third laws', course: { id: 2, name: 'Physics', className: 'Class 10' }, fileName: 'Newton_Laws.docx', fileType: 'application/docx' },
        ]);
      }
    }
  };

  const generateNotes = async () => {
    if (!selectedResourceId) return;
    setLoading(true);

    try {
      if (!token || token === 'mock-jwt-token') {
        // Fallback local dynamic notes generator (looks up current selected resource detail)
        setTimeout(() => {
          setLoading(false);
          if (selectedResource) {
            setNotes(`## 📚 Smart Notes: ${selectedResource.title}\n\n` +
              `### 1. Curriculum Overview\n` +
              `* **Subject Area:** ${selectedResource.course?.name || 'General'}\n` +
              `* **Class Cohort:** ${selectedResource.course?.className || 'General'}\n` +
              `* **Document File:** ${selectedResource.fileName}\n\n` +
              `### 2. Main Abstract Summary\n` +
              `"${selectedResource.description || 'Comprehensive study resource compiled by your instructor.'}"\n\n` +
              `### 3. Glossary & Conceptual Definitions\n` +
              `* **Core Concept:** Fundamental equations and structural insights regarding ${selectedResource.course?.name || 'General'}.\n` +
              `* **Instructional Guidelines:** Review definitions, verify practice tests in the Resources Shelf, and chat with the AI assistant for custom queries.`);
          }
        }, 1000);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/ai/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ resourceId: selectedResourceId })
      });

      if (response.ok) {
        const text = await response.text();
        setNotes(text);
        setNotesCache(prev => ({ ...prev, [selectedResourceId]: text }));
      } else {
        const err = await response.text();
        setNotes(`Failed to generate notes: ${err || 'Server error'}`);
      }
    } catch (e: any) {
      setNotes(`Connection Offline. Dynamic fallback summary:\n\n## 📚 Study Notes: ${selectedResource?.title}\n- ${selectedResource?.description || 'Study guide overview'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedResourceId || !selectedResource) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', content: userMsg }]);
    setChatInput('');
    setBotTyping(true);

    try {
      if (!token || token === 'mock-jwt-token') {
        // Fallback local dynamic chatbot engine (tailored to selected resource context)
        setTimeout(() => {
          let botResponse = '';
          const query = userMsg.toLowerCase();

          if (query.includes('photosynthesis') || query.includes('light') || query.includes('chlorophyll')) {
            botResponse = `### 🌿 Photosynthesis Pathway\n$$\\text{6CO}_2 + \\text{6H}_2\\text{O} + \\text{light} \\longrightarrow \\text{C}_6\\text{H}_{12}\\text{O}_6 + \\text{6O}_2$$\nCarbon dioxide and water split to form glucose and oxygen inside leaf thylakoid membranes.`;
          } else if (query.includes('force') || query.includes('newton') || query.includes('gravity')) {
            botResponse = `### ⚖️ Forces & Mechanics\nNewton's Second Law is governed by the equation:\n$$F = ma$$\nWhere force equals mass times acceleration ($a = 9.8 \\text{ m/s}^2$ on Earth).`;
          } else {
            botResponse = `### 🧠 Study Companion Response (Topic: ${selectedResource.title})\n` +
              `Regarding your question: *"${userMsg}"* in relation to the study guide **"${selectedResource.title}"**:\n\n` +
              `* This relates to core **${selectedResource.course?.name || 'General'}** topics for **${selectedResource.course?.className || 'General'}**.\n` +
              `* **Guide Abstract:** "*${selectedResource.description || 'Interactive curriculum learning guide'}*".\n` +
              `* Let me know if you would like me to define key terms or walk you through specific formulas!`;
          }

          setChatMessages(prev => [...prev, { sender: 'ai', content: botResponse }]);
          setBotTyping(false);
        }, 1000);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          resourceId: selectedResourceId,
          message: userMsg,
          historyJson: JSON.stringify(chatMessages.slice(-5))
        })
      });

      if (response.ok) {
        const text = await response.text();
        setChatMessages(prev => [...prev, { sender: 'ai', content: text }]);
      } else {
        const err = await response.text();
        setChatMessages(prev => [...prev, { sender: 'ai', content: `Error: ${err}` }]);
      }
    } catch (err: any) {
      setChatMessages(prev => [...prev, { sender: 'ai', content: `AI Server offline. Bypassed to mock assistant.` }]);
    } finally {
      setBotTyping(false);
    }
  };

  const handleCopyNotes = () => {
    navigator.clipboard.writeText(notes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadNotes = () => {
    const blob = new Blob([notes], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Smart_Notes_${fileName.split('.')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in pb-20 h-[calc(100vh-120px)] flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
      
      {/* PDF Viewer */}
      <div className="flex-1 neu-inset bg-color-surface rounded-xl overflow-hidden flex flex-col border border-white/50 shadow-sm">
        
        {/* Resource Header & Dropdown Selector */}
        <div className="p-4 border-b border-black/5 bg-color-surface/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-color-accent" />
            <span className="font-bold text-color-text text-sm font-serif">Active Document:</span>
          </div>

          <select 
            value={selectedResourceId || ''} 
            onChange={(e) => setSelectedResourceId(parseInt(e.target.value) || null)}
            className="neu-inset px-4 py-2 bg-color-surface text-xs font-bold text-color-text focus:outline-none focus:ring-2 focus:ring-accent rounded-xl cursor-pointer min-w-[200px]"
          >
            {resources.map(res => (
              <option key={res.id} value={res.id}>
                {res.title} ({res.fileName})
              </option>
            ))}
          </select>
        </div>

        {/* Mock Document Sheet */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-8 bg-black/5 overflow-y-auto">
          <div className="w-full h-full max-w-2xl bg-white shadow-lg flex flex-col p-8 select-none border border-black/10 rounded-lg min-h-[400px]">
            <h2 className="text-xl font-bold font-serif border-b border-black/10 pb-2 mb-4 text-black">{selectedResource?.title || 'Biology Chapter 4'}</h2>
            <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-5/6 bg-gray-200 rounded mb-8"></div>
            <div className="h-32 w-full bg-gray-100 rounded mb-6 flex flex-col items-center justify-center text-gray-500 font-serif border border-dashed border-gray-300 p-4 text-center">
              <span className="font-bold text-black text-xs">{fileName}</span>
              <span className="text-[10px] opacity-75 mt-1 text-black">Course Material • {selectedResource?.course?.name}</span>
            </div>
            <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-4/5 bg-gray-200 rounded mb-2"></div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-[400px] flex flex-col gap-4 shrink-0">
        
        {/* Toggle Mode */}
        <div className="flex p-1 neu-inset rounded-full bg-color-surface shadow-sm shrink-0">
          <button 
            className={`flex-1 py-2 rounded-full text-xs md:text-sm font-bold transition-all cursor-pointer ${mode === 'notes' ? 'neu-raised text-color-accent' : 'text-color-muted hover:text-color-text'}`}
            onClick={() => setMode('notes')}
          >
            <FileText className="w-4 h-4 inline-block mr-1.5" /> Smart Notes
          </button>
          <button 
            className={`flex-1 py-2 rounded-full text-xs md:text-sm font-bold transition-all cursor-pointer ${mode === 'chat' ? 'neu-raised text-color-accent' : 'text-color-muted hover:text-color-text'}`}
            onClick={() => setMode('chat')}
          >
            <MessageSquare className="w-4 h-4 inline-block mr-1.5" /> Ask AI
          </button>
        </div>

        <Card className="flex-1 p-0 flex flex-col overflow-hidden border border-white/50 bg-color-surface/90 shadow-sm">
          {mode === 'notes' ? (
            <div className="p-5 flex-1 flex flex-col overflow-y-auto">
              {!notes && !loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                  <FileText className="w-12 h-12 text-color-muted opacity-20 mb-4" />
                  <p className="text-color-muted text-xs font-semibold mb-6">Extract structured notes, cheat sheets, and summaries instantly.</p>
                  <Button onClick={generateNotes} className="flex items-center gap-1.5 font-bold h-10 px-6">
                    <Sparkles className="w-4 h-4" /> Generate Notes
                  </Button>
                </div>
              )}
              {loading && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-color-accent border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-color-muted text-xs font-semibold">Reading document...</p>
                  </div>
                </div>
              )}
              {notes && !loading && (
                <div className="flex flex-col h-full animate-fade-in">
                  <div className="flex items-center justify-end gap-2 mb-4 shrink-0 border-b border-black/5 pb-2">
                    <Button variant="secondary" size="sm" onClick={handleCopyNotes} className="h-8 text-xs px-3 font-bold bg-color-background">
                      {copied ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                    <Button variant="secondary" size="sm" onClick={handleDownloadNotes} className="h-8 text-xs px-3 font-bold bg-color-background">
                      <Download className="w-3.5 h-3.5 mr-1" /> Download
                    </Button>
                  </div>
                  <div className="prose prose-sm max-w-none text-color-text whitespace-pre-wrap leading-relaxed overflow-y-auto pl-1 pr-2">
                    {notes}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Chat bubble stream */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-color-background/40">
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`max-w-[85%] p-3 rounded-2xl text-xs font-medium border-l-2 leading-relaxed shadow-sm ${msg.sender === 'user' ? 'self-end rounded-tr-sm bg-color-accent text-black border-color-accent' : 'self-start rounded-tl-sm bg-color-surface text-black border-color-accent/30 neu-raised'}`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="flex items-center gap-1 mb-1 text-[10px] uppercase font-bold tracking-wider text-color-accent">
                        <Sparkles className="w-3 h-3" /> Study Guide Assistant
                      </div>
                    )}
                    <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                  </div>
                ))}
                {botTyping && (
                  <div className="self-start max-w-[85%] p-3 rounded-2xl rounded-tl-sm bg-color-surface text-color-muted text-xs border-l-2 border-color-accent/30 neu-raised animate-pulse-soft font-bold flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-color-accent rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-color-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1.5 h-1.5 bg-color-accent rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    <span>Analyzing text...</span>
                  </div>
                )}
              </div>
              
              {/* Textbox input */}
              <form onSubmit={handleSendChat} className="p-3 bg-color-surface border-t border-black/5 flex items-center gap-2 shrink-0">
                <input 
                  type="text" 
                  placeholder="Ask any question about this guide..." 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 neu-inset px-4 py-2.5 rounded-xl bg-color-background text-xs text-color-text focus:outline-none focus:ring-2 focus:ring-accent" 
                />
                <Button type="submit" className="rounded-xl w-9 h-9 p-0 flex items-center justify-center shrink-0 shadow-sm" disabled={!chatInput.trim() || botTyping}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          )}
        </Card>
      </div>
      
    </div>
  );
}
