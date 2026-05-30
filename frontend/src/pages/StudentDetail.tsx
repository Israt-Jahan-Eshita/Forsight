import { API_BASE_URL } from '../config';
import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Bot, ArrowLeft, Languages, Copy, CheckCircle2, Activity } from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  BarChart, Bar, AreaChart, Area, Cell
} from 'recharts';

export function StudentDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { token } = useAuth();
  
  const studentData = location.state?.student || {
    id: Number(id), name: 'Loading...', email: '', status: 'Safe', riskScore: 0, courseName: '', behavioralFlags: []
  };

  const [logs, setLogs] = useState<any[]>([]);
  const [insightGenerating, setInsightGenerating] = useState(false);
  const [insightWhy, setInsightWhy] = useState('');
  const [insightWhat, setInsightWhat] = useState('');
  
  const [translationGenerating, setTranslationGenerating] = useState(false);
  const [translationText, setTranslationText] = useState('');
  const [showTranslateModal, setShowTranslateModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Real data from API (replaces mock arrays)
  const [scoreTrendData, setScoreTrendData] = useState<any[]>([]);
  const [engagementRadarData, setEngagementRadarData] = useState<any[]>([]);
  const [cohortCompareData, setCohortCompareData] = useState<any[]>([]);
  const [chartsLoading, setChartsLoading] = useState(true);


  useEffect(() => {
    fetchLogs();
    fetchStudentAnalytics();
  }, [token]);

  const fetchStudentAnalytics = async () => {
    setChartsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/analytics/student/${id}/detail`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setScoreTrendData(data.scoreTrend || []);
        setEngagementRadarData(data.engagementRadar || []);
        setCohortCompareData(data.cohortCompare || []);
      }
    } catch (e) {
      console.error('Failed to fetch student analytics', e);
    } finally {
      setChartsLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const logsRes = await fetch(`${API_BASE_URL}/api/logs/recent`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (logsRes.ok) {
        setLogs(await logsRes.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const generateInsight = async () => {
    setInsightGenerating(true);
    try {
      const flagsStr = studentData.behavioralFlags?.length > 0 ? studentData.behavioralFlags.join(', ') : 'None';
      const promptText = `Student ${studentData.name} has a Risk Score of ${studentData.riskScore}. Course: ${studentData.courseName}. Behavioral flags detected: ${flagsStr}. Write a strict, 1-sentence intervention strategy for the teacher.`;
      
      const response = await fetch(`${API_BASE_URL}/api/ai/intervention-insight`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText })
      });
      if (response.ok) {
        setInsightWhy('');
        setInsightWhat(await response.text());
      }
    } catch (e) {
      setInsightWhat("Error fetching insights.");
    } finally {
      setInsightGenerating(false);
    }
  };

  const handleTranslate = async () => {
    setShowTranslateModal(true);
    if (translationText || translationGenerating) return;
    setTranslationGenerating(true);
    try {
      const contentToTranslate = `${insightWhy} ${insightWhat}`;
      const response = await fetch(`${API_BASE_URL}/api/ai/translate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: contentToTranslate })
      });
      if (response.ok) {
        setTranslationText(await response.text());
      }
    } catch (e) {
      setTranslationText("Translation failed.");
    } finally {
      setTranslationGenerating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Critical': return 'text-color-danger bg-color-danger/10 border-color-danger';
      case 'At-Risk': return 'text-color-warning bg-color-warning/10 border-color-warning';
      case 'Watch': return 'text-color-accent bg-color-accent/10 border-color-accent';
      default: return 'text-color-success bg-color-success/10 border-color-success';
    }
  };

  const getRingColor = (score: number) => {
    if (score >= 80) return 'stroke-color-danger';
    if (score >= 60) return 'stroke-color-warning';
    if (score >= 30) return 'stroke-color-accent';
    return 'stroke-color-success';
  };

  return (
    <div className="animate-fade-in pb-20 max-w-6xl mx-auto space-y-6">
      
      {/* Top Nav */}
      <div className="flex items-center gap-4">
        <Button variant="icon" onClick={() => navigate(-1)} className="bg-color-surface neu-raised border-none text-color-text">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-color-text font-serif">Deep Dive Analytics</h1>
      </div>

      {/* 1. Header Card */}
      <Card className="p-8 flex flex-col md:flex-row items-center justify-between gap-8 bg-color-surface neu-raised border border-white/50 relative overflow-hidden">
        <div className={`absolute inset-0 opacity-5 ${studentData.riskScore > 60 ? 'bg-color-danger' : 'bg-color-success'}`} />
        
        <div className="flex items-center gap-6 z-10 w-full md:w-auto">
          <Avatar fallback={studentData.name[0]} size="lg" className="w-24 h-24 border-4 border-white shadow-md" />
          <div>
            <h2 className="text-3xl font-extrabold text-color-text font-serif leading-tight">{studentData.name}</h2>
            <p className="text-sm font-mono text-color-muted uppercase mt-1 mb-3">{studentData.courseName}</p>
            <span className={`px-3 py-1 rounded-md text-xs font-black tracking-wider uppercase border ${getStatusColor(studentData.status)}`}>
              {studentData.status}
            </span>
            <div className="flex flex-wrap gap-2 mt-3">
              {studentData.behavioralFlags?.map((flag: string, idx: number) => (
                <Badge key={idx} className="bg-color-background/50 border-white text-[10px] text-color-text font-bold shadow-sm">
                  {flag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Animated Risk Gauge */}
        <div className="relative w-32 h-32 shrink-0 flex items-center justify-center z-10 flex-col">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="64" cy="64" r="58" className="stroke-black/5 fill-none stroke-[8px]" />
            <circle 
              cx="64" cy="64" r="58" 
              className={`fill-none stroke-[8px] transition-all duration-1000 ${getRingColor(studentData.riskScore)}`}
              strokeDasharray={`${(studentData.riskScore / 100) * 364} 364`}
              strokeLinecap="round"
            />
          </svg>
          <span className="text-2xl font-extrabold font-serif">{studentData.riskScore}%</span>
          <span className="text-[9px] font-bold text-color-muted uppercase tracking-wider">Risk Score</span>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. Behavior Timeline (Left Column) */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-bold font-serif text-lg flex items-center gap-2"><Activity className="w-5 h-5 text-color-accent" /> Behavior Timeline</h3>
          <Card className="p-0 bg-color-surface neu-inset border border-black/5 h-[600px] overflow-y-auto">
            <div className="relative p-6">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-black/5 via-black/10 to-transparent"></div>
              <div className="space-y-6">
                {logs.length > 0 ? logs.map((log, i) => (
                  <div key={i} className="relative flex items-start gap-4 z-10">
                    <div className={`w-4 h-4 rounded-full mt-1 shrink-0 border-2 border-white shadow-sm ${log.eventType === 'CRITICAL' || log.eventType === 'WARNING' ? 'bg-color-danger' : 'bg-color-accent'}`} />
                    <div>
                      <p className="text-[10px] font-bold text-color-accent mb-0.5">
                        {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                      <div className="text-xs font-medium text-color-text bg-white/60 p-3 rounded-xl border border-black/5 shadow-sm">
                        {log.eventDescription}
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-color-muted italic pl-8">No recent activities recorded.</p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* 3. Asymmetric Charts Grid & AI Insight (Right Columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 2. Three Column Analytics */}
          {chartsLoading ? (
            <div className="py-20 text-center text-color-muted font-bold text-xl animate-pulse">
              Loading Analytics Data...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Score Trend (Full Width) */}
            <Card className="md:col-span-2 p-4 bg-color-surface border border-white/60 neu-raised">
              <h4 className="text-xs font-bold text-color-muted uppercase mb-4">30-Day Score Trend</h4>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={scoreTrendData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#888'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#888'}} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Engagement Radar (50%) */}
            <Card className="p-4 bg-color-surface border border-white/60 neu-raised flex flex-col">
              <h4 className="text-xs font-bold text-color-muted uppercase mb-0">Engagement Radar</h4>
              <div className="h-48 w-full -mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={engagementRadarData}>
                    <PolarGrid stroke="rgba(0,0,0,0.05)" />
                    <PolarAngleAxis dataKey="subject" tick={{fontSize: 9, fill: '#888'}} />
                    <Radar name="Student" dataKey="A" stroke="#818cf8" fill="#818cf8" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Cohort Compare (50%) */}
            <Card className="p-4 bg-color-surface border border-white/60 neu-raised flex flex-col">
              <h4 className="text-xs font-bold text-color-muted uppercase mb-4">Cohort Comparison</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cohortCompareData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-muted)', fontWeight: 'bold' }} width={80} />
                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={16}>
                      {
                        cohortCompareData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--color-accent)' : 'var(--color-success)'} />
                        ))
                      }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
          )}

          {/* 4. AI Insight Panel */}
          <Card className="p-0 bg-color-surface neu-raised border border-color-accent/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-color-accent/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
            
            <div className="p-5 border-b border-black/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-color-accent" />
                <h3 className="font-bold font-serif text-color-text">AI Diagnostic Insight</h3>
              </div>
              <div className="flex items-center gap-2">
                {insightWhat && (
                  <Button variant="secondary" size="sm" onClick={handleTranslate} className="text-[10px] h-8 bg-color-background font-bold px-3">
                    <Languages className="w-3 h-3 mr-1" /> Translate to Bangla
                  </Button>
                )}
                <Button size="sm" onClick={generateInsight} disabled={insightGenerating} className="text-[10px] h-8 bg-color-accent text-white font-bold px-4 hover:brightness-110">
                  {insightGenerating ? 'Analyzing...' : 'Generate Insight'}
                </Button>
              </div>
            </div>

            <div className="p-6 bg-color-background/50 min-h-[150px]">
              {!insightWhat && !insightGenerating && (
                <div className="h-full flex flex-col items-center justify-center text-center text-color-muted py-8">
                  <Bot className="w-12 h-12 opacity-10 mb-2" />
                  <p className="text-sm">Click generate to run predictive behavioral diagnostics.</p>
                </div>
              )}

              {insightGenerating && (
                <div className="h-full flex flex-col items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-color-accent border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-xs font-bold text-color-accent animate-pulse">Running advanced diagnostic model...</p>
                </div>
              )}

              {insightWhat && !insightGenerating && (
                <div className="animate-slide-up bg-white/60 p-5 rounded-xl border-l-4 border-color-accent shadow-sm relative overflow-hidden">
                  <h5 className="font-bold text-xs text-color-accent mb-2 uppercase tracking-wide">1-Sentence AI Intervention</h5>
                  <p className="text-sm text-color-text font-serif font-medium leading-relaxed">"{insightWhat}"</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* 5. Translate Modal */}
      {showTranslateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setShowTranslateModal(false)} />
          <Card className="w-full max-w-lg p-6 bg-color-surface border border-white/60 shadow-[20px_20px_40px_var(--shadow-dark),-20px_-20px_40px_var(--shadow-light)] rounded-2xl relative z-10">
            <h3 className="font-bold font-serif text-lg mb-4 flex items-center gap-2">
              <Languages className="w-5 h-5 text-color-accent" /> Formal Parent Briefing (Bangla)
            </h3>
            
            <div className="p-5 bg-color-background neu-inset rounded-xl min-h-[150px] mb-4 text-sm leading-relaxed text-color-text font-serif">
              {translationGenerating ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="w-6 h-6 border-2 border-color-accent border-t-transparent rounded-full animate-spin mb-2" />
                  <span className="text-xs text-color-muted">Translating context...</span>
                </div>
              ) : (
                <p>{translationText}</p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowTranslateModal(false)}>Close</Button>
              <Button 
                className="bg-color-accent text-white" 
                onClick={() => { navigator.clipboard.writeText(translationText); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                disabled={!translationText || translationGenerating}
              >
                {copied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />} 
                {copied ? 'Copied' : 'Copy to Clipboard'}
              </Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
