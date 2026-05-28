import { useState } from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Bot, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function StudentDetail() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [insight, setInsight] = useState('');

  const generateInsight = () => {
    setIsGenerating(true);
    setInsight('');
    
    // Simulate streaming text
    const text = "Aarav has missed 3 assignments in the last 2 weeks and his quiz scores dropped by 15%. This sudden change in behavior might be due to external factors. Recommend a 1-on-1 check-in.";
    let i = 0;
    
    const interval = setInterval(() => {
      setInsight(text.substring(0, i));
      i++;
      if (i > text.length) {
        clearInterval(interval);
        setIsGenerating(false);
      }
    }, 30);
  };

  return (
    <div className="animate-fade-in pb-20 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-color-text">Student Profile</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Student Meta Card */}
        <Card className="md:col-span-1 p-8 items-center text-center">
          <Avatar fallback="AP" size="lg" className="w-24 h-24 mb-2" />
          <h2 className="text-xl font-bold">Aarav Patel</h2>
          <p className="text-color-muted text-sm mb-4">Class 10 - Science</p>
          <Badge variant="danger" className="mb-6 px-4 py-1 text-sm">Critical Risk</Badge>
          
          <div className="w-full bg-color-background neu-inset p-4 rounded-xl flex justify-between items-center mt-auto">
            <span className="text-sm font-medium">Risk Score</span>
            <span className="text-2xl font-bold text-color-danger">85%</span>
          </div>
        </Card>

        {/* AI Insight Panel */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-color-accent" />
              <span>AI Behavioral Insight</span>
            </div>
            <Button 
              size="sm" 
              onClick={generateInsight} 
              disabled={isGenerating || insight.length > 0}
            >
              Generate Insight
            </Button>
          </CardHeader>
          <CardContent className="bg-color-background neu-inset rounded-xl p-6 min-h-[160px] flex flex-col justify-center">
            {!insight && !isGenerating ? (
              <div className="text-center text-color-muted flex flex-col items-center gap-2">
                <AlertTriangle className="w-8 h-8 opacity-20" />
                <p>Click generate to analyze recent behavior patterns.</p>
              </div>
            ) : (
              <p className="text-color-text leading-relaxed">
                {insight}
                {isGenerating && <span className="inline-block w-2 h-4 ml-1 bg-color-accent animate-pulse"></span>}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Behavior Timeline */}
      <Card>
        <CardHeader>Recent Activity Timeline</CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-col gap-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-black/10 before:to-transparent">
            {/* Timeline Item */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-color-surface neu-raised text-color-danger shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl neu-raised bg-color-surface">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-sm">Missed Science Quiz</h4>
                  <span className="text-xs text-color-muted">Today</span>
                </div>
                <p className="text-sm text-color-muted">Did not submit the weekly physics assessment.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
