import React, { useState, useEffect } from 'react';
import { useCmsStore } from '../../store/cmsStore';
import { X } from 'lucide-react';

export default function GlobalAdPopup() {
  const { ads } = useCmsStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (ads.popupEnabled && ads.popupImage) {
       // Show after a brief delay
       const timer = setTimeout(() => setIsVisible(true), !sessionStorage.getItem('ad_shown') ? 3000 : 900000); // 3s normally, or not at all unless long delay
       
       if (!sessionStorage.getItem('ad_shown')) {
         sessionStorage.setItem('ad_shown', 'true');
       }
       
       return () => clearTimeout(timer);
    }
  }, [ads.popupEnabled, ads.popupImage]);

  if (!isVisible || !ads.popupEnabled) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-bg/80 backdrop-blur-sm flex items-center justify-center p-4">
       <div className="relative max-w-lg w-full bg-surface border-2 border-amber-500 shadow-[0_0_50px_-12px_rgba(245,158,11,0.5)]">
         <button 
           onClick={() => setIsVisible(false)}
           className="absolute -top-4 -right-4 w-8 h-8 bg-bg border border-border text-white flex items-center justify-center rounded-full hover:bg-surface hover:text-red-500 transition-colors z-10"
         >
           <X size={16} />
         </button>
         
         <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 text-[8px] font-mono uppercase tracking-widest text-text-muted z-10">Advertisement</div>
         
         <a href={ads.popupLink || '#'} target="_blank" rel="noopener noreferrer" onClick={() => setIsVisible(false)}>
           {ads.popupImage?.match(/\.(mp4|webm|ogg)$/i) ? (
             <video src={ads.popupImage} autoPlay loop muted playsInline className="w-full h-auto object-cover max-h-[60vh] block" />
           ) : (
             <img src={ads.popupImage} alt="Advertisement" referrerPolicy="no-referrer" className="w-full h-auto object-cover max-h-[60vh] block" />
           )}
         </a>
       </div>
    </div>
  );
}
