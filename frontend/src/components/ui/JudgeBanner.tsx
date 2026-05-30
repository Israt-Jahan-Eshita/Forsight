import { useState } from 'react';
import { Info, X } from 'lucide-react';

interface JudgeBannerProps {
  title: string;
  description: string;
}

export function JudgeBanner({ title, description }: JudgeBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="w-full bg-indigo-900/10 border border-indigo-500/30 rounded-xl p-4 mb-6 relative overflow-hidden animate-fade-in flex gap-4 items-start">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
      <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
        <Info className="w-5 h-5 text-indigo-600" />
      </div>
      <div className="flex-1 pt-0.5">
        <h4 className="text-sm font-black text-indigo-900 font-serif mb-1 flex items-center gap-2">
          JUDGE CONTEXT: {title}
        </h4>
        <p className="text-xs text-indigo-900/80 leading-relaxed font-medium">
          {description}
        </p>
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        className="p-1.5 hover:bg-indigo-500/10 text-indigo-500/60 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
        title="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
