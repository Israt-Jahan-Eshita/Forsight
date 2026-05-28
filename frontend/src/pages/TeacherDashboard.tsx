import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Button } from '../components/ui/Button';
import { 
  Sparkles, TrendingUp, Calendar, BookOpen, ArrowUpRight, X, Activity 
} from 'lucide-react';

// Mock student data
const students = [
  { 
    id: 1, 
    name: 'Aarav Patel', 
    grade: 'Class 10', 
    risk: 85, 
    status: 'Critical', 
    trend: '+15% surge',
    initial: 'A',
    headline: 'Quiz performance drops 20% below standard threshold',
    bullets: ['Missed Newton\'s Law homework assignment', 'Average quiz score slumping to 42%', 'AI detects high risk of academic regression']
  },
  { 
    id: 2, 
    name: 'Priya Sharma', 
    grade: 'Class 10', 
    risk: 62, 
    status: 'At-Risk', 
    trend: '+5% rise',
    initial: 'P',
    headline: 'Sluggish resource engagement noted over 3 consecutive days',
    bullets: ['Spent less than 5 minutes on PDF syllabus', 'Failed to submit Chemistry quiz on time', 'Requires active teacher outreach and counsel']
  },
  { 
    id: 3, 
    name: 'Rahul Kumar', 
    grade: 'Class 10', 
    risk: 45, 
    status: 'Watch', 
    trend: '-2% reduction',
    initial: 'R',
    headline: 'Gradual recovery observed following message session',
    bullets: ['AI assistant reports positive engagement logs', 'Math practice scores increased to 72%', 'Watching closely for sustained progress']
  },
  { 
    id: 4, 
    name: 'Ananya Singh', 
    grade: 'Class 10', 
    risk: 15, 
    status: 'Safe', 
    trend: '-10% drop',
    initial: 'S',
    headline: 'Maintains high academic efficiency in all modules',
    bullets: ['Submitted all assignments 12 hours early', 'Engagement scores remain at peak 98%', 'AI prediction shows high mastery probabilities']
  },
  { 
    id: 5, 
    name: 'Vikram Das', 
    grade: 'Class 10', 
    risk: 90, 
    status: 'Critical', 
    trend: '+20% surge',
    initial: 'V',
    headline: 'Critical absence pattern sparks urgent learning alert',
    bullets: ['Has not logged into portal for 5 days', 'Missing 3 core science submissions', 'Urgent supervisor intervention recommended']
  },
];

const mockBriefings = [
  { id: 1, time: '10:45 AM', event: 'Student Vikram Das triggered CRITICAL risk threshold.' },
  { id: 2, time: '09:30 AM', event: 'System generated Biology Chapter 4 practice deck.' },
  { id: 3, time: 'Yesterday', event: 'Aarav Patel missed Newton Law homework submission.' },
  { id: 4, time: '2 days ago', event: 'Teacher Rahim provisioned new Student Student Account.' },
];

export function TeacherDashboard() {
  const navigate = useNavigate();
  
  // State for popups
  const [showBriefings, setShowBriefings] = useState(false);
  const [showTelegram, setShowTelegram] = useState(false);

  return (
    <div className="pb-20 max-w-7xl mx-auto space-y-6">
      
      {/* 1. Compact and Sleek Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/10 pb-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-color-text font-serif italic tracking-tight">
            The Forsight Chronicle
          </h1>
          <div className="flex items-center gap-2 text-xs text-color-muted font-mono uppercase mt-1">
            <span className="flex items-center gap-1 font-bold">
              <Calendar className="w-3.5 h-3.5" /> Thursday, May 28, 2026
            </span>
            <span>•</span>
            <span className="text-color-accent font-bold">Class 10 - Science Department</span>
          </div>
        </div>
        
        {/* Clickable Quick Action Popup Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Button 
            onClick={() => setShowBriefings(true)}
            className="neu-raised text-xs py-2 px-4 gap-1.5 flex items-center bg-color-accent text-white font-bold rounded-xl cursor-pointer transition-all hover:brightness-105 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Op-Ed & Health Seal
          </Button>
          <Button 
            onClick={() => setShowTelegram(true)}
            className="neu-raised text-xs py-2 px-4 gap-1.5 flex items-center bg-color-surface text-color-text font-bold rounded-xl cursor-pointer transition-all hover:bg-black/[0.02] active:scale-95 border border-black/5"
          >
            <Activity className="w-3.5 h-3.5 text-color-accent" /> Daily Telegram Logs
          </Button>
        </div>
      </div>

      {/* 2. Main Content Grid (Spacious Full-Width Student Dossiers) */}
      <div className="space-y-6">
        <div className="border-b border-black/5 pb-2">
          <h2 className="text-xl font-bold text-color-text font-serif">Classified Dossiers</h2>
          <p className="text-color-muted text-[10px] font-mono uppercase">Student learning files active under predictive surveillance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <Card 
              key={student.id}
              onClick={() => navigate(`/students/${student.id}`)}
              className="p-6 cursor-pointer border border-white/50 bg-color-surface flex flex-col justify-between relative group overflow-hidden transition-all duration-200 hover:shadow-[10px_10px_20px_var(--shadow-dark),-10px_-10px_20px_var(--shadow-light)]"
            >
              {/* Visual indicator corner */}
              <div className={`absolute top-0 right-0 w-20 h-20 -mr-10 -mt-10 rounded-full opacity-10 blur-lg ${
                student.status === 'Critical' ? 'bg-color-danger' :
                student.status === 'At-Risk' ? 'bg-color-warning' :
                student.status === 'Watch' ? 'bg-color-accent' : 'bg-color-success'
              }`} />

              <div className="space-y-4">
                {/* Dossier Header */}
                <div className="flex items-center gap-3 border-b border-black/5 pb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold font-serif text-base text-black neu-raised shadow-inner shrink-0">
                    {student.initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-color-text text-sm leading-tight font-serif truncate group-hover:text-color-accent transition-colors">
                      {student.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] text-color-muted font-mono uppercase">{student.grade}</span>
                      <span className="text-[9px] text-color-muted font-mono">•</span>
                      <span className="text-[9px] text-color-danger font-mono font-bold uppercase tracking-tight flex items-center gap-0.5">
                        <TrendingUp className="w-2.5 h-2.5 animate-pulse-soft" /> {student.trend}
                      </span>
                    </div>
                  </div>
                  <Badge variant={
                    student.status === 'Critical' ? 'danger' :
                    student.status === 'At-Risk' ? 'warning' :
                    student.status === 'Safe' ? 'success' : 'default'
                  }>
                    {student.status}
                  </Badge>
                </div>

                {/* Editorial Headline */}
                <div>
                  <h4 className="font-bold text-xs text-color-text font-serif leading-snug italic text-color-text/90">
                    "{student.headline}"
                  </h4>
                </div>

                {/* Danger Intensity Gauge */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-bold text-color-muted tracking-wide uppercase">
                    <span>Intensity Level</span>
                    <span className={
                      student.risk >= 80 ? 'text-color-danger font-black' :
                      student.risk >= 60 ? 'text-color-warning' : 'text-color-accent'
                    }>{student.risk}% Risk</span>
                  </div>
                  <ProgressBar 
                     value={student.risk} 
                     color={
                       student.risk >= 80 ? 'bg-color-danger' : 
                       student.risk >= 60 ? 'bg-color-warning' : 
                       student.risk >= 40 ? 'bg-color-accent' : 'bg-color-success'
                     } 
                  />
                </div>

                {/* Bullet Dossier Items */}
                <ul className="space-y-1 text-[11px] text-color-muted border-t border-black/5 pt-2">
                  {student.bullets.map((bullet, i) => (
                    <li key={i} className="flex items-start gap-1 font-medium leading-relaxed">
                      <span className="text-color-accent font-bold">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action link */}
              <div className="mt-5 pt-2.5 border-t border-black/5 flex justify-end">
                <Button 
                  variant="secondary"
                  size="sm"
                  className="text-[10px] bg-transparent border-none neu-raised shadow-inner group-hover:bg-color-accent group-hover:text-white transition-all gap-1 py-1 px-3.5 cursor-pointer rounded-lg font-bold"
                >
                  Read Dossier <ArrowUpRight className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 3. Popup Modal: Classroom Registry Health Seal & AI Weekly Op-Ed */}
      {showBriefings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setShowBriefings(false)} />
          <Card className="w-full max-w-lg p-6 bg-color-surface border border-white/60 shadow-[20px_20px_40px_var(--shadow-dark),-20px_-20px_40px_var(--shadow-light)] rounded-2xl relative z-10">
            <button 
              onClick={() => setShowBriefings(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/5 text-color-muted transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-6 pt-2">
              <div className="flex items-center gap-2 border-b border-black/5 pb-2">
                <Sparkles className="w-5 h-5 text-color-accent" />
                <h3 className="text-lg font-bold font-serif text-color-text">Registry Certificate & AI Op-Ed</h3>
              </div>

              {/* Ink Stamp Style Registry Seal (Static, elegant) */}
              <div className="flex flex-col items-center justify-center text-center p-4 border border-black/5 rounded-xl bg-color-background/30">
                <div className="w-32 h-32 rounded-full border-4 border-dashed border-color-accent/40 flex items-center justify-center p-2 shadow-inner bg-color-surface">
                  <div className="w-full h-full rounded-full border-2 border-color-accent/80 flex flex-col items-center justify-center p-2">
                    <span className="text-[8px] font-black tracking-widest text-color-accent font-mono uppercase">Status</span>
                    <span className="text-2xl font-extrabold font-serif italic text-color-accent py-0.5">Watch</span>
                    <span className="text-[8px] font-black tracking-widest text-color-accent font-mono uppercase">Health 74%</span>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <h4 className="font-bold text-xs text-color-text">Classroom Health Certificate</h4>
                  <p className="text-[11px] text-color-muted leading-relaxed max-w-sm">
                    Moderate performance variance is certified. Five science dossiers are flagged for predictive risk metrics.
                  </p>
                </div>
              </div>

              {/* AI Weekly Opinion Editorial */}
              <div className="p-4 bg-color-background rounded-xl space-y-2 neu-inset">
                <div className="flex items-center gap-1.5 text-xs text-color-accent font-bold uppercase tracking-wider mb-1">
                  <BookOpen className="w-3.5 h-3.5" /> AI Op-Ed Briefing
                </div>
                <div className="prose prose-sm font-serif leading-relaxed text-color-text/90 italic text-[11px] space-y-2">
                  <p>
                    "A distinct divergence is forming within the student body. While the general learning trajectory remains stable (850 students safe, 230 watch), a small cluster of 5 priority cases warrants direct action."
                  </p>
                  <p>
                    "The drop in science performance is primarily traced to skipped homework submission gates. Dispatching direct messages to Aarav Patel and Vikram Das is predicted to yield a 42% recovery probability."
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-black/5 flex justify-end">
              <Button 
                onClick={() => setShowBriefings(false)}
                className="py-2 px-6 bg-color-accent text-white hover:brightness-105 rounded-xl font-bold cursor-pointer"
              >
                Done
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* 4. Popup Modal: Daily Telegram Logs Ledger */}
      {showTelegram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setShowTelegram(false)} />
          <Card className="w-full max-w-md p-6 bg-color-surface border border-white/60 shadow-[20px_20px_40px_var(--shadow-dark),-20px_-20px_40px_var(--shadow-light)] rounded-2xl relative z-10">
            <button 
              onClick={() => setShowTelegram(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/5 text-color-muted transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 border-b border-black/5 pb-2">
                <Activity className="w-5 h-5 text-color-accent" />
                <h3 className="text-lg font-bold font-serif text-color-text">Daily Telegram Logs</h3>
              </div>
              <p className="text-[10px] text-color-muted font-mono uppercase tracking-wide">Chronological surveillance ledger and action audit</p>

              <div className="p-4 bg-color-background rounded-xl space-y-4 neu-inset max-h-80 overflow-y-auto">
                {mockBriefings.map((log) => (
                  <div key={log.id} className="flex gap-3 text-[11px] border-b border-black/5 pb-3 last:border-0 last:pb-0">
                    <div className="font-mono font-bold text-color-accent shrink-0 w-16">
                      {log.time}
                    </div>
                    <div className="text-color-text leading-snug font-medium">
                      {log.event}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-black/5 flex justify-end">
              <Button 
                onClick={() => setShowTelegram(false)}
                className="py-2 px-6 bg-color-surface text-color-text hover:bg-black/[0.02] border border-black/5 rounded-xl font-bold cursor-pointer"
              >
                Close Logs
              </Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
