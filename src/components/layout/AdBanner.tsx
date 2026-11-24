import React from 'react';
import { useCmsStore } from '../../store/cmsStore';

export default function AdBanner() {
  const { ads } = useCmsStore();

  if (!ads.bannerEnabled || !ads.bannerImage) return null;

  return (
    <div className="w-full my-6 bg-surface border-2 border-border shadow-md overflow-hidden relative">
      <div className="absolute top-0 right-0 bg-black/80 px-2 py-1 text-[8px] font-mono uppercase tracking-widest text-text-muted z-10">Advertisement</div>
      <a href={ads.bannerLink || '#'} target="_blank" rel="noopener noreferrer">
        {ads.bannerImage?.match(/\.(mp4|webm|ogg)$/i) ? (
          <video src={ads.bannerImage} autoPlay loop muted playsInline className="w-full h-auto object-cover max-h-32 block" />
        ) : (
          <img src={ads.bannerImage} alt="Advertisement" referrerPolicy="no-referrer" className="w-full h-auto object-cover max-h-32 block" />
        )}
      </a>
    </div>
  );
}
