import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Save, Plus, Trash } from 'lucide-react';

interface DocsConfig {
  id: number;
  public: boolean;
  availableFrom: string;
  availableUntil: string;
  contentJson: string;
}

export function AdminDocsEditor() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [config, setConfig] = useState<DocsConfig | null>(null);
  const [content, setContent] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/docs/admin`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        if (data.contentJson) {
          try {
            setContent(JSON.parse(data.contentJson));
          } catch (e) {
            console.error("Failed to parse JSON content", e);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const payload = {
        ...config,
        contentJson: JSON.stringify(content)
      };
      const res = await fetch(`${API_BASE_URL}/api/docs/admin`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("Docs Configuration Saved Successfully");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const updateContent = (key: string, value: any) => {
    setContent((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleTeamMemberChange = (index: number, field: string, value: string) => {
    const newTeam = [...(content.team || [])];
    newTeam[index] = { ...newTeam[index], [field]: value };
    updateContent('team', newTeam);
  };

  const addTeamMember = () => {
    const newTeam = [...(content.team || []), { name: '', role: '', email: '', imageUrl: '' }];
    updateContent('team', newTeam);
  };

  const removeTeamMember = (index: number) => {
    const newTeam = [...(content.team || [])];
    newTeam.splice(index, 1);
    updateContent('team', newTeam);
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading Docs Configuration...</div>;

  return (
    <div className="pb-20 max-w-4xl mx-auto space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-black/10 pb-4">
        <div className="flex items-center gap-4">
          <Button variant="icon" onClick={() => navigate('/admin')} className="neu-inset p-2 rounded-full">
            <ArrowLeft className="w-5 h-5 text-color-muted" />
          </Button>
          <div>
            <h1 className="text-2xl font-black text-color-text font-serif italic">Docs Editor</h1>
            <p className="text-xs font-bold text-color-muted uppercase">Pitch Deck & System Status Configuration</p>
          </div>
        </div>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving}
          className="neu-raised flex items-center gap-2 bg-color-success text-white py-2 px-6 rounded-xl font-bold shadow-sm active:scale-95 transition-all"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>

      {/* Access Control Panel */}
      <Card className="p-6 bg-color-surface border-l-4 border-color-accent">
        <h2 className="text-lg font-bold text-color-text mb-4">Access Control & Scheduling</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-color-muted uppercase mb-2">Public Visibility</label>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config?.public || false}
                onChange={(e) => setConfig(prev => prev ? { ...prev, public: e.target.checked } : null)}
                className="w-5 h-5 accent-color-accent"
              />
              <span className="text-sm font-bold text-color-text">Enable Public Route (/docs)</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-color-muted uppercase mb-2">Available From (ISO)</label>
            <input
              type="text"
              value={config?.availableFrom || ''}
              onChange={(e) => setConfig(prev => prev ? { ...prev, availableFrom: e.target.value } : null)}
              placeholder="e.g. 2026-06-10T00:00:00"
              className="w-full neu-inset px-4 py-2 rounded-xl text-sm bg-color-background"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-color-muted uppercase mb-2">Available Until (ISO)</label>
            <input
              type="text"
              value={config?.availableUntil || ''}
              onChange={(e) => setConfig(prev => prev ? { ...prev, availableUntil: e.target.value } : null)}
              placeholder="e.g. 2026-06-14T23:59:59"
              className="w-full neu-inset px-4 py-2 rounded-xl text-sm bg-color-background"
            />
          </div>
        </div>
      </Card>

      {/* Pitch Deck Sections */}
      <Card className="p-6 bg-color-surface">
        <h2 className="text-lg font-bold text-color-text mb-4">Pitch Deck Sections</h2>
        <div className="space-y-4">
          {['problem', 'solution', 'market', 'businessModel'].map((section) => (
            <div key={section}>
              <label className="block text-xs font-bold text-color-muted uppercase mb-1">{section}</label>
              <textarea
                value={content[section] || ''}
                onChange={(e) => updateContent(section, e.target.value)}
                className="w-full neu-inset p-3 rounded-xl text-sm bg-color-background min-h-[80px]"
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Tech Docs Markdown Editor */}
      <Card className="p-6 bg-color-surface">
        <h2 className="text-lg font-bold text-color-text mb-4">Architecture & Tech Docs (Markdown)</h2>
        <textarea 
          value={content.techDocs || ''}
          onChange={(e) => updateContent('techDocs', e.target.value)}
          placeholder="Use Markdown for Data Flow, Architecture, and API listings..."
          className="w-full neu-inset p-3 rounded-xl text-sm bg-color-background min-h-[200px] font-mono"
        />
      </Card>

      {/* Team Editor */}
      <Card className="p-6 bg-color-surface">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-color-text">Team Configuration</h2>
          <Button variant="secondary" onClick={addTeamMember} className="text-xs px-3 py-1 flex items-center gap-1 neu-raised rounded-lg border-white/50 bg-color-background">
            <Plus className="w-3 h-3" /> Add Member
          </Button>
        </div>

        <div className="space-y-4">
          {(content.team || []).map((member: any, i: number) => (
            <div key={i} className="p-4 bg-color-background/50 rounded-xl border border-black/5 flex flex-col md:flex-row gap-4 items-start relative group">
              <Button
                variant="icon"
                onClick={() => removeTeamMember(i)}
                className="absolute top-2 right-2 p-1 text-color-danger opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash className="w-4 h-4" />
              </Button>
              <div className="w-full md:w-1/4">
                <input
                  type="text" placeholder="Name" value={member.name}
                  onChange={(e) => handleTeamMemberChange(i, 'name', e.target.value)}
                  className="w-full text-sm font-bold bg-transparent border-b border-black/10 p-1 mb-2 focus:outline-none focus:border-color-accent"
                />
                <input
                  type="text" placeholder="Role" value={member.role}
                  onChange={(e) => handleTeamMemberChange(i, 'role', e.target.value)}
                  className="w-full text-xs font-mono uppercase bg-transparent border-b border-black/10 p-1 focus:outline-none focus:border-color-accent"
                />
              </div>
              <div className="w-full md:w-3/4 space-y-2">
                <input
                  type="text" placeholder="Email Address" value={member.email}
                  onChange={(e) => handleTeamMemberChange(i, 'email', e.target.value)}
                  className="w-full text-sm bg-color-surface neu-inset px-3 py-1.5 rounded-lg"
                />
                <input
                  type="text" placeholder="Image URL (e.g. https://imgur.com/...)" value={member.imageUrl}
                  onChange={(e) => handleTeamMemberChange(i, 'imageUrl', e.target.value)}
                  className="w-full text-sm bg-color-surface neu-inset px-3 py-1.5 rounded-lg"
                />
              </div>
            </div>
          ))}
          {(!content.team || content.team.length === 0) && (
            <p className="text-xs text-color-muted text-center italic py-4">No team members added yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
