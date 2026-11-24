import { Link, useNavigate } from 'react-router-dom';
import { useThemeStore } from '../../store/themeStore';
import { Moon, Sun, FileDown } from 'lucide-react';
import { downloadBasketballGuidePdf } from '../../lib/downloadGuide';

export default function Portal() {
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const handleDownloadPdf = async () => {
    const ok = await downloadBasketballGuidePdf();
    if (!ok) {
      navigate('/guide');
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col font-sans relative overflow-hidden text-text-primary">
      {/* Top Utility */}
      <div className="absolute top-0 inset-x-0 h-16 border-b border-border bg-surface/80 backdrop-blur-md flex justify-between items-center px-6 z-50">
        <div className="flex items-baseline gap-2">
           <span className="text-xl font-bold font-sans tracking-tight uppercase">SYNDICATE</span>
           <span className="text-[10px] font-mono text-brand uppercase tracking-widest">// FANTASY PORTAL</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/guide"
            className="hidden sm:inline-flex items-center gap-1.5 border border-border px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-text-secondary hover:text-amber-500 hover:border-amber-500 transition-colors"
          >
            View Guide
          </Link>
          <button
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 border border-amber-500/40 px-3 py-1.5 text-[10px] font-mono font-semibold uppercase tracking-widest text-amber-500 hover:bg-amber-500 hover:text-black transition-colors"
          >
            <FileDown size={13} /> Guide PDF
          </button>
          <button onClick={toggleTheme} className="hover:text-brand transition-colors flex items-center justify-center p-1.5">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>

      {/* Main Split */}
      <div className="flex-1 flex flex-col md:flex-row mt-16">
        
        {/* FOOTBALL */}
        <Link 
          to="/football" 
          className="flex-1 group relative overflow-hidden flex flex-col justify-center items-center p-12 border-b md:border-b-0 md:border-r border-border hover:bg-surface/50 transition-colors duration-500"
        >
          <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          
          {/* Faint Background graphic */}
          <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-1000 bg-[url('https://images.unsplash.com/photo-1518605368461-1e125222058c?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-luminosity grayscale"></div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-4 h-4 bg-brand rounded-full animate-pulse mb-6"></div>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 group-hover:scale-105 transition-transform duration-500">
              LEB<br/>
              <span className="text-brand">FOOTBALL</span>
            </h2>
            <div className="text-[12px] font-mono tracking-[0.3em] uppercase text-text-secondary mb-10">
              LEBANESE FOOTBALL FANTASY LEAGUE
            </div>
            <div className="border border-brand/40 text-brand px-8 py-3 text-[12px] font-bold font-mono tracking-widest uppercase group-hover:bg-brand group-hover:text-black transition-colors">
              ENTER LFFL →
            </div>
          </div>
        </Link>

        {/* BASKETBALL */}
        <Link 
          to="/basketball" 
          className="flex-1 group relative overflow-hidden flex flex-col justify-center items-center p-12 hover:bg-surface/50 transition-colors duration-500"
        >
          <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

          {/* Faint Background graphic */}
          <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-1000 bg-[url('https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-luminosity grayscale"></div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-4 h-4 bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)] mb-6 rotate-45"></div>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 group-hover:scale-105 transition-transform duration-500">
              LEB<br/>
              <span className="text-amber-500">BASKETBALL</span>
            </h2>
            <div className="text-[12px] font-mono tracking-[0.3em] uppercase text-text-secondary mb-10">
              LEBANESE BASKETBALL FANTASY LEAGUE
            </div>
            <div className="border border-amber-500/40 text-amber-500 px-8 py-3 text-[12px] font-bold font-mono tracking-widest uppercase group-hover:bg-amber-500 group-hover:text-black transition-colors">
              ENTER LBFL →
            </div>
          </div>
        </Link>
        
      </div>
    </div>
  )
}
