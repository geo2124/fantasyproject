import { apiFetch } from '../../lib/apiFetch';
import React, { useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
// import { cn } from '../../lib/utils';

interface MediaUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  type?: 'image' | 'video' | 'any';
  sportColor?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function MediaUpload({ value, onChange, label, type = 'any', sportColor = 'text-brand' }: MediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('media', file);

    try {
      const res = await apiFetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        onChange(data.url);
      } else {
        alert(data.error || 'Failed to upload file');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const isVideo = value?.match(/\.(mp4|webm|ogg)$/i) || false;

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="block text-[10px] font-mono text-text-muted uppercase tracking-widest">{label}</label>}
      <div className="flex flex-col gap-3">
        <input 
          ref={fileInputRef}
          type="file" 
          accept={type === 'image' ? 'image/*' : type === 'video' ? 'video/*' : 'image/*,video/*'}
          onChange={handleFileChange} 
          className="hidden" 
        />
        
        {value ? (
           <div className="relative group w-full border border-border">
              {isVideo ? (
                <video src={value} autoPlay loop muted playsInline className="w-full h-auto max-h-48 object-cover object-center" />
              ) : (
                <img src={value} alt="Uploaded Media" referrerPolicy="no-referrer" className="w-full h-auto max-h-48 object-cover object-center" />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="p-2 bg-surface text-text-primary hover:bg-brand hover:text-bg transition-colors"
                   title="Replace"
                 >
                   <Upload size={16} />
                 </button>
                 <button 
                   onClick={() => onChange('')}
                   className="p-2 bg-surface text-text-primary hover:bg-red-500 hover:text-bg transition-colors"
                   title="Remove"
                 >
                   <X size={16} />
                 </button>
              </div>
           </div>
        ) : (
           <button 
             onClick={() => fileInputRef.current?.click()}
             className="w-full h-24 border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:bg-surface transition-colors text-text-muted hover:text-text-primary"
             disabled={isUploading}
           >
             {isUploading ? <Loader2 className="animate-spin" size={24} /> : <Upload size={24} />}
             <span className="text-xs font-mono uppercase">{isUploading ? 'Uploading...' : 'Click to Upload Media'}</span>
           </button>
        )}
      </div>
    </div>
  );
}
