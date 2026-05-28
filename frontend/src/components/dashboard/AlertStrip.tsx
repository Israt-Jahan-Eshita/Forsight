import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

export function AlertStrip() {
  return (
    <div className="w-full neu-raised bg-color-accent mb-8 p-4 flex items-center justify-between rounded-xl shadow-[4px_4px_8px_rgba(0,0,0,0.15),-4px_-4px_8px_rgba(255,255,255,0.8)] border border-white/50">
      <div className="flex items-center gap-3">
        <div className="bg-white/50 p-2 rounded-full neu-inset">
          <AlertTriangle className="w-6 h-6 text-color-danger" />
        </div>
        <div>
          <h3 className="font-bold text-color-text">Critical Students Alert</h3>
          <p className="text-sm text-color-text/80">12 students have shown severe engagement drops this week.</p>
        </div>
      </div>
      <Button variant="secondary" className="bg-white hover:bg-white/90 gap-2 shrink-0">
        Review Now
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
