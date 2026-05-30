import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { Lock, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export function PublicDocs() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('pitch');

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/docs/public`);
      if (res.status === 403) {
        setError("Platform Access Closed");
        setLoading(false);
        return;
      }
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        setError("Unable to load documentation.");
      }
    } catch (e) {
      setError("System offline.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E5E5E5] flex items-center justify-center">
        <div className="text-color-accent animate-pulse font-mono uppercase font-bold tracking-widest text-sm">
          Initializing Documentation Data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#E5E5E5] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="max-w-md w-full neu-raised bg-color-surface p-10 rounded-3xl border border-white/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-color-danger"></div>
          <div className="w-16 h-16 rounded-full neu-inset mx-auto flex items-center justify-center mb-6 bg-color-background">
            <Lock className="w-8 h-8 text-color-danger" />
          </div>
          <h1 className="text-2xl font-black text-color-text font-serif italic mb-2">Access Denied</h1>
          <p className="text-sm font-bold text-color-muted uppercase mb-6">{error}</p>
          <p className="text-xs text-color-text mb-8">
            The documentation module and pitch deck are currently outside of their scheduled availability window. Please contact the administrator.
          </p>
          <button onClick={() => window.location.href = '/'} className="neu-inset px-6 py-2 rounded-xl text-xs font-bold text-color-accent hover:bg-color-accent hover:text-white transition-all cursor-pointer">
            Return to Portal
          </button>
        </div>
      </div>
    );
  }

  const content = data?.config?.contentJson ? JSON.parse(data.config.contentJson) : {};
  const liveData = data?.liveData || {};
  const team = content.team || [];

  return (
    <div className="min-h-screen bg-[#E5E5E5] text-color-text font-sans selection:bg-color-accent selection:text-white pb-20">
      
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#E5E5E5]/80 backdrop-blur-md border-b border-black/10 py-4 px-6 md:px-12 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-color-accent text-white flex items-center justify-center font-serif italic font-black shadow-[2px_2px_4px_var(--shadow-dark)]">F</div>
          <span className="text-xl font-extrabold tracking-tight font-serif italic">Forsight Docs</span>
        </div>
        <div className="flex gap-4 items-center">
          <button onClick={() => setActiveSection('pitch')} className={`text-xs font-bold uppercase transition-all ${activeSection === 'pitch' ? 'text-color-accent' : 'text-color-muted hover:text-color-text'}`}>Pitch Deck</button>
          <button onClick={() => setActiveSection('tech')} className={`text-xs font-bold uppercase transition-all ${activeSection === 'tech' ? 'text-color-accent' : 'text-color-muted hover:text-color-text'}`}>Architecture</button>
          <button onClick={() => setActiveSection('live')} className={`text-xs font-bold uppercase transition-all ${activeSection === 'live' ? 'text-color-accent' : 'text-color-muted hover:text-color-text'}`}>Live Status</button>
          <button onClick={() => setActiveSection('guide')} className={`text-xs font-bold uppercase transition-all ${activeSection === 'guide' ? 'text-color-accent' : 'text-color-muted hover:text-color-text'}`}>Judge Guide</button>
          <a href="/login" className="ml-4 px-5 py-2 rounded-xl text-xs font-black text-white bg-[#111111] shadow-[0_4px_14px_0_rgb(0,0,0,39%)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:bg-[#000000] transition-all flex items-center gap-2 tracking-wide">
            Launch Dashboard <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-12 animate-fade-in">
        
        {/* Section: Pitch Deck */}
        {activeSection === 'pitch' && (
          <div className="space-y-16">
            
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h1 className="text-6xl md:text-7xl font-black font-sans tracking-tighter text-color-text leading-[1.1]">
                Predictive Intelligence for Education.
              </h1>
              <p className="text-lg md:text-xl text-color-muted font-medium tracking-tight">
                A behavioral analytics engine that prevents student failure before it happens.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-color-surface p-6 rounded-2xl shadow-[4px_4px_10px_var(--shadow-dark),-4px_-4px_10px_var(--shadow-light)] border border-white/60">
                <h3 className="text-sm font-bold text-color-danger uppercase mb-3 tracking-widest flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-color-danger"></span> The Problem</h3>
                <p className="text-color-text leading-relaxed text-sm whitespace-pre-wrap">{content.problem}</p>
              </div>
              <div className="bg-color-surface p-6 rounded-2xl shadow-[4px_4px_10px_var(--shadow-dark),-4px_-4px_10px_var(--shadow-light)] border border-white/60">
                <h3 className="text-sm font-bold text-color-success uppercase mb-3 tracking-widest flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-color-success"></span> The Solution</h3>
                <p className="text-color-text leading-relaxed text-sm whitespace-pre-wrap">{content.solution}</p>
              </div>
            </div>

            <div className="neu-inset bg-color-background p-6 rounded-2xl border border-black/5 mt-6">
              <h3 className="text-sm font-bold text-color-accent uppercase mb-3 tracking-widest">Market & Business Model</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold mb-2 text-sm">Market Opportunity</h4>
                  <p className="text-sm text-color-muted leading-relaxed whitespace-pre-wrap">{content.market}</p>
                </div>
                <div>
                  <h4 className="font-bold mb-2 text-sm">Business Model</h4>
                  <p className="text-sm text-color-muted leading-relaxed whitespace-pre-wrap">{content.businessModel}</p>
                </div>
              </div>
            </div>

            {/* Team Grid */}
            <div className="pt-8 border-t border-black/10">
              <h3 className="text-2xl font-black font-serif italic mb-2 text-center">The Team</h3>
              <p className="text-center text-xs font-bold text-color-muted uppercase tracking-widest mb-10">Ahsanullah University of Science and Technology</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {team.map((member: any, i: number) => (
                  <div key={i} className="bg-color-surface p-5 rounded-2xl shadow-[4px_4px_10px_var(--shadow-dark),-4px_-4px_10px_var(--shadow-light)] border border-white/60 flex flex-col items-center text-center transition-all hover:-translate-y-1 group">
                    <div className="w-20 h-20 rounded-full neu-inset p-1 mb-3 overflow-hidden border border-color-background bg-color-background">
                      {member.imageUrl ? (
                        <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full rounded-full bg-color-accent/10 flex items-center justify-center text-xl font-black text-color-accent">{member.name ? member.name.charAt(0) : '?'}</div>
                      )}
                    </div>
                    <h4 className="text-base font-bold text-color-text">{member.name || 'Member Name'}</h4>
                    <span className="text-[9px] font-bold text-color-accent uppercase tracking-widest block mt-0.5">{member.role || 'Role'}</span>
                    <a href={`mailto:${member.email}`} className="text-xs text-color-muted mt-2 hover:text-color-text transition-colors">{member.email || 'email@example.com'}</a>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Section: Technical Architecture */}
        {activeSection === 'tech' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-black font-serif italic">System Architecture</h2>
            
            <div className="bg-color-surface p-8 rounded-2xl shadow-[4px_4px_10px_var(--shadow-dark),-4px_-4px_10px_var(--shadow-light)] border border-white/60">
               <h3 className="text-sm font-bold text-color-muted uppercase mb-4 tracking-widest">Architecture & API Specifications</h3>
               <div className="prose prose-sm max-w-none text-color-text font-sans prose-headings:font-bold prose-headings:text-color-text prose-a:text-color-accent prose-code:bg-color-background prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-color-accent">
                 {content.techDocs ? (
                   <ReactMarkdown>{content.techDocs}</ReactMarkdown>
                 ) : (
                   <p className="text-color-muted italic">No architecture documentation provided.</p>
                 )}
               </div>
            </div>
          </div>
        )}

        {/* Section: Live Status */}
        {activeSection === 'live' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-black font-serif italic mb-2">Live System Telemetry</h2>
              <p className="text-xs font-bold text-color-success uppercase tracking-widest flex justify-center items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-color-success animate-pulse"></span> Connected to Production Database
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              <div className="bg-color-surface p-6 rounded-2xl shadow-[4px_4px_10px_var(--shadow-dark),-4px_-4px_10px_var(--shadow-light)] border border-white/60 text-center relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="text-4xl font-black text-color-text mb-2">{liveData.totalUsers}</div>
                  <div className="text-xs font-bold text-color-muted uppercase mb-3">Total Active Users</div>
                </div>
                <div className="text-[10px] text-color-muted leading-relaxed border-t border-black/5 pt-3">Students and teachers currently monitored by our behavioral tracking engine.</div>
              </div>
              <div className="bg-color-surface p-6 rounded-2xl shadow-[4px_4px_10px_var(--shadow-dark),-4px_-4px_10px_var(--shadow-light)] border border-white/60 text-center relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="text-4xl font-black text-color-text mb-2">{liveData.totalCourses}</div>
                  <div className="text-xs font-bold text-color-muted uppercase mb-3">Total Courses</div>
                </div>
                <div className="text-[10px] text-color-muted leading-relaxed border-t border-black/5 pt-3">Active classrooms generating real-time transactional data for AI analysis.</div>
              </div>
              <div className="bg-color-surface p-6 rounded-2xl shadow-[4px_4px_10px_var(--shadow-dark),-4px_-4px_10px_var(--shadow-light)] border border-white/60 text-center border-b-4 border-b-color-accent flex flex-col justify-between">
                <div>
                  <div className="text-4xl font-black text-color-accent mb-2">{liveData.aiInterventions}</div>
                  <div className="text-xs font-bold text-color-muted uppercase mb-3">AI Interventions</div>
                </div>
                <div className="text-[10px] text-color-muted leading-relaxed border-t border-black/5 pt-3">Personalized strategies generated by Groq LLM to prevent student failure.</div>
              </div>
              <div className="bg-color-surface p-6 rounded-2xl shadow-[4px_4px_10px_var(--shadow-dark),-4px_-4px_10px_var(--shadow-light)] border border-white/60 text-center border-b-4 border-b-color-danger flex flex-col justify-between">
                <div>
                  <div className="text-4xl font-black text-color-danger mb-2">{liveData.avgRiskScore}<span className="text-lg">/100</span></div>
                  <div className="text-xs font-bold text-color-muted uppercase mb-3">System Risk Avg</div>
                </div>
                <div className="text-[10px] text-color-muted leading-relaxed border-t border-black/5 pt-3">Current severity of struggling students requiring immediate teacher attention.</div>
              </div>
            </div>

          </div>
        )}

        {/* Section: Judge Guide */}
        {activeSection === 'guide' && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-3xl font-black font-serif italic mb-4">Platform Walkthrough</h2>
              <p className="text-color-muted text-sm leading-relaxed">
                A quick step-by-step walkthrough of the platform's core mechanics to help you understand how our predictive engine works from end-to-end.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-color-surface p-6 rounded-2xl shadow-[4px_4px_10px_var(--shadow-dark),-4px_-4px_10px_var(--shadow-light)] border border-white/60 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-color-accent"></div>
                <h3 className="text-lg font-bold text-color-text mb-2">1. 1-Click Fast Login</h3>
                <p className="text-sm text-color-text leading-relaxed mb-4">
                  Click the <strong>Launch Dashboard 🚀</strong> button on the top right. You'll see three dedicated quick-access cards: <strong>Teacher View</strong>, <strong>Student View</strong>, and <strong>Admin View</strong>. Click <strong>Teacher View</strong> to jump straight into the Teacher Analytics Dashboard.
                </p>
                <ul className="text-xs text-color-muted space-y-2 list-disc list-inside">
                  <li><strong>What you'll see:</strong> A ranked list of students sorted by their real-time "Risk Score" (0-100).</li>
                  <li><strong>How it works:</strong> The backend calculates this score using behavioral heuristics (missed deadlines, time-variance, grade drops).</li>
                </ul>
              </div>

              <div className="bg-color-surface p-6 rounded-2xl shadow-[4px_4px_10px_var(--shadow-dark),-4px_-4px_10px_var(--shadow-light)] border border-white/60 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-color-success"></div>
                <h3 className="text-lg font-bold text-color-text mb-2">2. The "Demo Switcher" (Seamless Role Swap)</h3>
                <p className="text-sm text-color-text leading-relaxed mb-4">
                  We know your time is valuable. You don't need to log out or open incognito windows to see the student's perspective.
                </p>
                <ul className="text-xs text-color-muted space-y-2 list-disc list-inside">
                  <li><strong>Action:</strong> Click the <strong>"Demo Switcher"</strong> button in the top right Navbar from any dashboard.</li>
                  <li><strong>Result:</strong> Instantly hot-swap between the Teacher Dashboard, a "Safe" Student (Sara), or a "Critical Risk" Student (Vikram) with a single click.</li>
                </ul>
              </div>

              <div className="bg-color-surface p-6 rounded-2xl shadow-[4px_4px_10px_var(--shadow-dark),-4px_-4px_10px_var(--shadow-light)] border border-white/60 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-color-danger"></div>
                <h3 className="text-lg font-bold text-color-text mb-2">3. Groq AI Interventions</h3>
                <p className="text-sm text-color-text leading-relaxed mb-4">
                  In the Teacher Dashboard, find a student with a High Risk score (red badge). Click the <strong>Ask AI</strong> button next to their name.
                </p>
                <ul className="text-xs text-color-muted space-y-2 list-disc list-inside">
                  <li><strong>What you'll see:</strong> The system sends the student's exact behavioral flags to our integrated Groq AI LLM.</li>
                  <li><strong>The Result:</strong> Groq generates a highly personalized, single-sentence intervention strategy for the teacher to immediately apply.</li>
                </ul>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <a href="/login" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-black text-white bg-[#111111] shadow-[0_4px_14px_0_rgb(0,0,0,39%)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:-translate-y-1 transition-all tracking-wide">
                Explore Platform <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
