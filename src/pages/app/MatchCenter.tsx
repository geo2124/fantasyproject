import { cn } from '../../lib/utils';
import { Activity, Clock } from 'lucide-react';
import AdBanner from '../../components/layout/AdBanner';

export default function MatchCenter({ sport }: { sport: 'football' | 'basketball' }) {
  const sportColor = sport === 'basketball' ? 'text-amber-500' : 'text-brand';
  const sportBg = sport === 'basketball' ? 'bg-amber-500' : 'bg-brand';

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto">
      <AdBanner />
      <div className="flex items-center gap-4 mb-8">
        <Activity size={32} className={sportColor} />
        <h1 className="text-3xl font-bold text-text-primary uppercase tracking-tighter">Live Match Center</h1>
        <span className={cn("px-3 py-1 font-mono text-[10px] uppercase font-bold tracking-widest leading-none ml-2", sportBg, "text-bg")}>GW 04 LIVE</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[600px]">
        
        {/* Live Matches List */}
        <div className="lg:col-span-1 bg-surface border border-border flex flex-col">
          <div className="p-4 border-b border-border bg-bg/50">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary">Today's Matches</h2>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
            {[1,2,3].map((match) => (
               <button key={match} className={cn("p-4 border-b border-border text-left hover:bg-bg/50 transition-colors", match === 1 ? 'bg-bg/50 border-l-2 border-l-brand' : '')}>
                 <div className="flex justify-between items-center mb-3">
                   <span className="text-[10px] font-mono tracking-widest uppercase text-text-secondary flex items-center gap-1">
                     <Clock size={10} /> {match === 1 ? '64\'' : 'Finished'}
                   </span>
                   {match === 1 && <span className={cn("w-2 h-2 rounded-full animate-pulse", sportBg)}></span>}
                 </div>
                 <div className="flex justify-between items-center font-mono font-bold text-sm">
                   <span>TEAM A</span>
                   <span className="tabular-data">{match === 1 ? '2' : '1'}</span>
                 </div>
                 <div className="flex justify-between items-center font-mono font-bold text-sm mt-2 text-text-secondary">
                   <span>TEAM B</span>
                   <span className="tabular-data">{match === 1 ? '1' : '0'}</span>
                 </div>
               </button>
            ))}
          </div>
        </div>

        {/* Live Event Feed & Stats */}
        <div className="lg:col-span-2 bg-surface border border-border flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-brand/5 blur-3xl rounded-full pointer-events-none"></div>
          
          <div className="p-6 border-b border-border bg-bg/50 relative z-10 flex justify-between items-center">
            <div className="flex items-center gap-8">
              <div className="text-center">
                <span className="block text-2xl font-bold font-mono tracking-tighter">TEAM A</span>
                <span className="text-[10px] font-mono text-text-secondary uppercase">League Leader</span>
              </div>
              <div className="text-4xl tabular-data font-bold font-mono px-4 py-2 bg-surface border border-border">
                2 - 1
              </div>
              <div className="text-center">
                <span className="block text-2xl font-bold font-mono tracking-tighter text-text-secondary">TEAM B</span>
                <span className="text-[10px] font-mono text-text-secondary uppercase">Challenger</span>
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 relative z-10 overflow-y-auto custom-scrollbar">
             <div className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-6 block border-b border-border pb-2">Fantasy Points Live Feed</div>
             
             <div className="space-y-4">
               <div className="flex gap-4">
                 <div className="w-12 text-right text-[10px] font-mono text-text-secondary font-bold pt-1">62'</div>
                 <div className={cn("w-2 h-2 mt-1.5 rounded-full", sportBg)}></div>
                 <div className="flex-1">
                   <div className="text-sm font-bold uppercase tracking-wider mb-1">Goal Scored!</div>
                   <div className="text-xs font-mono text-text-secondary">Player Name (+5 pts)</div>
                 </div>
               </div>
               <div className="flex gap-4">
                 <div className="w-12 text-right text-[10px] font-mono text-text-secondary font-bold pt-1">62'</div>
                 <div className="w-2 h-2 mt-1.5 rounded-full bg-border"></div>
                 <div className="flex-1">
                   <div className="text-sm font-bold uppercase tracking-wider mb-1">Assist</div>
                   <div className="text-xs font-mono text-text-secondary">Midfielder Name (+3 pts)</div>
                 </div>
               </div>
               <div className="flex gap-4 opacity-70">
                 <div className="w-12 text-right text-[10px] font-mono text-text-secondary font-bold pt-1">45'</div>
                 <div className="w-2 h-2 mt-1.5 bg-[#eab308]"></div>
                 <div className="flex-1">
                   <div className="text-sm font-bold uppercase tracking-wider mb-1 text-[#eab308]">Yellow Card</div>
                   <div className="text-xs font-mono text-text-secondary">Defender Name (-1 pts)</div>
                 </div>
               </div>
               <div className="flex gap-4 opacity-50">
                 <div className="w-12 text-right text-[10px] font-mono text-text-secondary font-bold pt-1">12'</div>
                 <div className="w-2 h-2 mt-1.5 bg-border rounded-full"></div>
                 <div className="flex-1">
                   <div className="text-sm font-bold uppercase tracking-wider mb-1">Clean Sheet Broken</div>
                   <div className="text-xs font-mono text-text-secondary">Team B Defense (-4 pts expected)</div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
