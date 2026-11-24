import { useState } from 'react';
import {  Check, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';

interface FeatureToggle {
  id: string;
  key: string;
  title: string;
  description: string;
  isEnabled: boolean;
}

const mockFeatures: FeatureToggle[] = [
  { id: '1', key: 'feature.transfers', title: 'Transfer Market', description: 'Allow users to make transfers during the season.', isEnabled: true },
  { id: '2', key: 'feature.wildcard', title: 'Wildcard Chip', description: 'Enable the wildcard chip for users.', isEnabled: false },
  { id: '3', key: 'feature.basketball', title: 'Basketball Mode', description: 'Allow users to play fantasy basketball.', isEnabled: true },
  { id: '4', key: 'ui.dark_mode_only', title: 'Force Dark Mode', description: 'Disable light mode option for all users.', isEnabled: false },
];

export default function AdminFeatures() {
  const { user } = useAuthStore();
  const [features, setFeatures] = useState<FeatureToggle[]>(mockFeatures);

  const isBasketball = user?.sportAccess === 'basketball';
  const sportColor = isBasketball ? 'text-amber-500' : 'text-brand';
  const sportBg = isBasketball ? 'bg-amber-500' : 'bg-brand';
  const sportBorder = isBasketball ? 'border-amber-500' : 'border-brand';
  const sportBgSoft = isBasketball ? 'bg-amber-500/5' : 'bg-brand/5';

  const toggleFeature = (id: string) => {
    setFeatures(prev => prev.map(f => f.id === id ? { ...f, isEnabled: !f.isEnabled } : f));
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-full animate-in fade-in">
      <div className="flex justify-between items-end mb-8">
        <div>
           <h2 className="text-3xl font-bold uppercase tracking-tighter mb-1">Features & Toggles</h2>
           <p className="text-xs font-mono text-text-secondary uppercase tracking-widest">Enable/Disable Application Features globally</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature) => (
          <div key={feature.id} className={cn("p-6 border flex flex-col justify-between transition-colors cursor-pointer", feature.isEnabled ? cn(sportBorder, sportBgSoft) : "border-border bg-surface hover:border-text-muted")}
            onClick={() => toggleFeature(feature.id)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                 <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary mb-1">{feature.title}</h3>
                 <p className="text-[10px] font-mono text-text-secondary w-11/12">{feature.description}</p>
                 <div className="text-[9px] font-mono text-text-muted mt-2">KEY: {feature.key}</div>
              </div>
              <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0 border", feature.isEnabled ? cn(sportBg, sportBorder, "text-bg") : "bg-bg border-border text-text-muted")}>
                {feature.isEnabled ? <Check size={12} strokeWidth={4} /> : <X size={12} strokeWidth={3} />}
              </div>
            </div>
            
            <div className="pt-4 border-t border-border/50 mt-4 flex items-center gap-2">
               <span className={cn("w-1.5 h-1.5 rounded-full inline-block", feature.isEnabled ? sportBg : "bg-text-muted")}></span>
               <span className={cn("text-[10px] font-mono tracking-widest uppercase font-bold", feature.isEnabled ? sportColor : "text-text-muted")}>
                 {feature.isEnabled ? 'Active' : 'Disabled'}
               </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
