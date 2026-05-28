import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Activity, CheckSquare, FileQuestion, ArrowRight } from 'lucide-react';

export function StudentHome() {
  return (
    <div className="animate-fade-in pb-20 max-w-7xl mx-auto space-y-8">
      
      {/* Risk Card */}
      <Card className="flex flex-col md:flex-row items-center p-8 gap-8 bg-color-surface">
        <div className="relative w-40 h-40 flex items-center justify-center neu-inset rounded-full shrink-0">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle cx="80" cy="80" r="70" fill="none" stroke="var(--color-background)" strokeWidth="12" />
            <circle 
              cx="80" cy="80" r="70" fill="none" 
              stroke="var(--color-success)" strokeWidth="12" 
              strokeDasharray="440" strokeDashoffset="110" 
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="text-center">
            <div className="text-sm font-bold text-color-muted">Status</div>
            <div className="text-lg font-bold text-color-success">Doing Well</div>
          </div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-bold font-serif text-color-text">You're doing great, Sara!</h2>
          <p className="text-color-muted mt-2 text-lg">Your engagement has been high this week. Keep up the momentum!</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <section>
          <h3 className="text-xl font-bold font-serif mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-color-accent" /> Recent Activity
          </h3>
          <Card className="p-0 overflow-hidden">
            <div className="p-4 flex flex-col gap-4">
              {[
                { text: 'You completed Biology Quiz 3', time: 'Yesterday', icon: FileQuestion },
                { text: 'Teacher Rahim uploaded "Newton Laws"', time: '2 days ago', icon: CheckSquare },
              ].map((act, i) => (
                <div key={i} className="flex items-center gap-4 p-3 neu-raised rounded-xl">
                  <div className="w-10 h-10 rounded-full neu-inset flex items-center justify-center shrink-0">
                    <act.icon className="w-5 h-5 text-color-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-color-text text-sm">{act.text}</p>
                    <p className="text-xs text-color-muted">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Pending Actions */}
        <section>
          <h3 className="text-xl font-bold font-serif mb-4 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-color-warning" /> Pending Actions
          </h3>
          <div className="flex flex-col gap-4">
            <Card className="p-5 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-color-text">Physics Unit 2 Quiz</h4>
                <p className="text-sm text-color-muted">Due in 2 days</p>
              </div>
              <Button>Take Quiz <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Card>
            <Card className="p-5 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-color-text">New Feedback</h4>
                <p className="text-sm text-color-muted">On Math Homework</p>
              </div>
              <Button variant="secondary">Review <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Card>
          </div>
        </section>
      </div>

    </div>
  );
}
