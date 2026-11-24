import { useState } from 'react';
import { useCmsStore } from '../../store/cmsStore';
import { useAuthStore } from '../../store/authStore';
import { Save } from 'lucide-react';
import { cn } from '../../lib/utils';
import MediaUpload from '../../components/ui/MediaUpload';

export default function AdminBlocks() {
  const { user } = useAuthStore();
  const cms = useCmsStore();

  const [activeTab, setActiveTab] = useState<'football' | 'basketball'>(
    user?.sportAccess === 'basketball' ? 'basketball' : 'football'
  );

  const [footballData, setFootballData] = useState(cms.footballHome);
  const [basketballData, setBasketballData] = useState(cms.basketballHome);

  const handleSave = () => {
    if (activeTab === 'football') {
      cms.updateFootballHome(footballData);
    } else {
      cms.updateBasketballHome(basketballData);
    }
  };

  const data = activeTab === 'football' ? footballData : basketballData;
  const setData = activeTab === 'football' ? setFootballData : setBasketballData;

  const sportColor = activeTab === 'basketball' ? 'text-amber-500' : 'text-brand';
  const sportBg = activeTab === 'basketball' ? 'bg-amber-500' : 'bg-brand';
  const sportFocus = activeTab === 'basketball' ? 'focus:border-amber-500' : 'focus:border-brand';

  const handleChange = (key: keyof typeof data, value: string) => {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    setData((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-full animate-in fade-in">
      <div className="flex justify-between items-end mb-8">
        <div>
           <h2 className="text-3xl font-bold uppercase tracking-tighter mb-1">Home Blocks</h2>
           <p className="text-xs font-mono text-text-secondary uppercase tracking-widest">Manage Home Page Content</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        {(user?.sportAccess === 'all' || user?.sportAccess === 'football') && (
          <button 
            onClick={() => setActiveTab('football')}
            className={cn("px-4 py-2 text-xs font-mono font-bold uppercase tracking-widest border transition-colors", 
              activeTab === 'football' ? "bg-brand text-bg border-brand" : "bg-surface border-border text-text-secondary hover:text-text-primary")}
          >
            Football
          </button>
        )}
        {(user?.sportAccess === 'all' || user?.sportAccess === 'basketball') && (
          <button 
            onClick={() => setActiveTab('basketball')}
             className={cn("px-4 py-2 text-xs font-mono font-bold uppercase tracking-widest border transition-colors", 
             activeTab === 'basketball' ? "bg-amber-500 text-bg border-amber-500" : "bg-surface border-border text-text-secondary hover:text-text-primary")}
          >
            Basketball
          </button>
        )}
      </div>

      <div className="bg-surface border border-border p-6 flex flex-col gap-6">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <MediaUpload 
             label="Hero Background Image" 
             value={data.heroImage} 
             onChange={(v) => handleChange('heroImage', v)} 
             type="image" 
             sportColor={sportColor}
           />
           <MediaUpload 
             label="Hero Background Video (Optional)" 
             value={data.heroVideo} 
             onChange={(v) => handleChange('heroVideo', v)} 
             type="video" 
             sportColor={sportColor}
           />
         </div>

         <div>
            <label className="block text-[10px] font-mono text-text-muted uppercase tracking-widest mb-2">Hero Title 1</label>
            <input 
              type="text" 
              value={data.heroTitle1}
              onChange={(e) => handleChange('heroTitle1', e.target.value)}
              className={cn("w-full bg-bg border border-border px-4 py-2 text-sm font-bold uppercase tracking-wider text-text-primary focus:outline-none transition-colors", sportFocus)}
            />
         </div>
         <div>
            <label className="block text-[10px] font-mono text-text-muted uppercase tracking-widest mb-2">Hero Title 2</label>
            <input 
              type="text" 
              value={data.heroTitle2}
              onChange={(e) => handleChange('heroTitle2', e.target.value)}
              className={cn("w-full bg-bg border border-border px-4 py-2 text-sm font-bold uppercase tracking-wider text-text-primary focus:outline-none transition-colors", sportFocus)}
            />
         </div>
         <div>
            <label className="block text-[10px] font-mono text-text-muted uppercase tracking-widest mb-2">Hero Subtitle</label>
            <textarea 
              value={data.heroSubtitle}
              onChange={(e) => handleChange('heroSubtitle', e.target.value)}
              rows={3}
              className={cn("w-full bg-bg border border-border px-4 py-2 text-sm font-mono text-text-primary focus:outline-none transition-colors resize-none", sportFocus)}
            />
         </div>
         <div>
            <label className="block text-[10px] font-mono text-text-muted uppercase tracking-widest mb-2">League Ticker Text</label>
            <input 
              type="text" 
              value={data.tickerText}
              onChange={(e) => handleChange('tickerText', e.target.value)}
              className={cn("w-full bg-bg border border-border px-4 py-2 text-sm font-mono text-text-primary focus:outline-none transition-colors", sportFocus)}
            />
         </div>
         <div>
            <label className="block text-[10px] font-mono text-text-muted uppercase tracking-widest mb-2">Stats Highlight</label>
            <input 
              type="text" 
              value={data.statsHighlight}
              onChange={(e) => handleChange('statsHighlight', e.target.value)}
              className={cn("w-full bg-bg border border-border px-4 py-2 text-sm font-mono text-text-primary focus:outline-none transition-colors", sportFocus)}
            />
         </div>

         <div className="pt-6 border-t border-border flex justify-end">
           <button 
             onClick={handleSave}
             className={cn("flex items-center gap-2 px-6 py-2 text-bg font-bold font-mono text-xs uppercase tracking-widest hover:bg-opacity-90 transition-colors", sportBg)}
           >
             <Save size={14} /> Save Content
           </button>
         </div>
      </div>
    </div>
  );
}
