import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center p-24 text-center min-h-[60vh]">
      <AlertCircle size={48} className="text-text-muted mb-6" />
      <h1 className="text-4xl font-black uppercase tracking-tighter text-text-primary mb-4">Under Construction</h1>
      <p className="text-text-secondary font-mono text-sm max-w-md mx-auto mb-8">
        This area of the terminal is currently being upgraded or does not exist. Please return to your active dashboard.
      </p>
      <Link to="/" className="text-[10px] font-mono tracking-widest uppercase font-bold py-3 px-6 bg-surface border border-border hover:bg-border transition-colors text-text-primary">
        Return Home
      </Link>
    </div>
  );
}
