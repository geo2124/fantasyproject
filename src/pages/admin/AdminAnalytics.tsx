import { useState } from 'react';
import { useCmsStore } from '../../store/cmsStore';
import { useAuthStore } from '../../store/authStore';
import { Save, Code } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AdminAnalytics() {
  const { user } = useAuthStore();
  const cms = useCmsStore();
  const [data, setData] = useState(cms.analytics);

  const isBasketball = user?.sportAccess === 'basketball';
  const sportColor = isBasketball ? 'text-amber-500' : 'text-brand';
  const sportBg = isBasketball ? 'bg-amber-500' : 'bg-brand';
  const sportFocus = isBasketball ? 'focus:border-amber-500' : 'focus:border-brand';

  const handleSave = () => {
    cms.updateAnalytics(data);
  };

  const handleChange = (key: keyof typeof data, value: string) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-full animate-in fade-in">
      <div className="flex justify-between items-end mb-8">
        <div>
           <h2 className="text-3xl font-bold uppercase tracking-tighter mb-1">Analytics</h2>
           <p className="text-xs font-mono text-text-secondary uppercase tracking-widest">Manage Tracking Scripts and Pixels</p>
        </div>
      </div>

      <div className="bg-surface border border-border flex flex-col group">
        <div className="p-3 border-b border-border bg-bg/50 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <Code size={14} className={sportColor} />
             <span className="text-xs font-bold uppercase tracking-wider">Tracking IDs</span>
           </div>
        </div>
        <div className="p-6 flex flex-col gap-6">
           <div>
              <label className="block text-[10px] font-mono text-text-muted uppercase tracking-widest mb-2">Google Analytics Measurement ID</label>
              <input 
                type="text" 
                value={data.googleAnalyticsId}
                onChange={(e) => handleChange('googleAnalyticsId', e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className={cn("w-full bg-bg border border-border px-4 py-2 text-sm font-mono text-text-primary focus:outline-none transition-colors", sportFocus)}
              />
           </div>
           <div>
              <label className="block text-[10px] font-mono text-text-muted uppercase tracking-widest mb-2">Meta Pixel ID</label>
              <input 
                type="text" 
                value={data.metaPixelId}
                onChange={(e) => handleChange('metaPixelId', e.target.value)}
                placeholder="0000000000000000"
                className={cn("w-full bg-bg border border-border px-4 py-2 text-sm font-mono text-text-primary focus:outline-none transition-colors", sportFocus)}
              />
           </div>
           <div>
              <label className="block text-[10px] font-mono text-text-muted uppercase tracking-widest mb-2">Custom Scripts (Injected into &lt;head&gt;)</label>
              <textarea 
                value={data.customScripts}
                onChange={(e) => handleChange('customScripts', e.target.value)}
                rows={6}
                placeholder="<script>...</script>"
                className={cn("w-full bg-bg border border-border px-4 py-2 text-sm font-mono text-text-muted focus:outline-none transition-colors resize-none", sportFocus)}
              />
           </div>
           
           <div className="pt-6 border-t border-border flex justify-end">
             <button 
               onClick={handleSave}
               className={cn("flex items-center gap-2 px-6 py-2 text-bg font-bold font-mono text-xs uppercase tracking-widest hover:bg-opacity-90 transition-colors", sportBg)}
             >
               <Save size={14} /> Save Config
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}
