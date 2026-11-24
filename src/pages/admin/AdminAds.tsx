import React from 'react';
import { useCmsStore } from '../../store/cmsStore';
// import { Plus, Trash2 } from 'lucide-react';
import MediaUpload from '../../components/ui/MediaUpload';

export default function AdminAds() {
  const { ads, updateAds } = useCmsStore();

  return (
    <div className="p-8 pb-32">
       <div className="flex justify-between items-end mb-8">
         <div>
           <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Advertisements</h1>
           <p className="text-sm font-mono text-text-secondary">Control global popups and banners.</p>
         </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-sm font-mono">
         <div className="bg-surface border border-border p-6 flex flex-col gap-6">
            <h2 className="font-bold text-amber-500 uppercase tracking-widest text-sm border-b border-border/50 pb-2">Global Popup Ad</h2>
            
            <div className="flex items-center gap-3">
               <input 
                 type="checkbox" 
                 checked={ads.popupEnabled} 
                 onChange={e => updateAds({ popupEnabled: e.target.checked })}
                 className="w-4 h-4 bg-bg border-border text-amber-500 rounded-none focus:ring-amber-500 focus:ring-offset-bg"
               />
               <label className="text-text-primary uppercase">Enable Popup ad site-wide</label>
            </div>
            
            <MediaUpload 
              label="Popup Image/Video" 
              value={ads.popupImage}
              onChange={(url) => updateAds({ popupImage: url })}
            />

            <div>
               <label className="block text-text-muted uppercase mb-1">Target Link</label>
               <input 
                 type="text" 
                 value={ads.popupLink} 
                 onChange={e => updateAds({ popupLink: e.target.value })}
                 className="w-full bg-bg border border-border px-3 py-2 text-text-primary"
                 placeholder="https://..."
               />
            </div>
         </div>

         <div className="bg-surface border border-border p-6 flex flex-col gap-6">
            <h2 className="font-bold text-brand uppercase tracking-widest text-sm border-b border-border/50 pb-2">In-App Banner Ad</h2>
            
            <div className="flex items-center gap-3">
               <input 
                 type="checkbox" 
                 checked={ads.bannerEnabled} 
                 onChange={e => updateAds({ bannerEnabled: e.target.checked })}
                 className="w-4 h-4 bg-bg border-border text-brand rounded-none focus:ring-brand focus:ring-offset-bg"
               />
               <label className="text-text-primary uppercase">Enable Banner in Match Center / Drafts</label>
            </div>
            
            <MediaUpload 
              label="Banner Image/Video" 
              value={ads.bannerImage}
              onChange={(url) => updateAds({ bannerImage: url })}
            />

            <div>
               <label className="block text-text-muted uppercase mb-1">Target Link</label>
               <input 
                 type="text" 
                 value={ads.bannerLink} 
                 onChange={e => updateAds({ bannerLink: e.target.value })}
                 className="w-full bg-bg border border-border px-3 py-2 text-text-primary"
                 placeholder="https://..."
               />
            </div>
         </div>
       </div>

    </div>
  );
}
