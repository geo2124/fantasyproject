import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Trophy, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { db } from '../../services/api';
import { Squad } from '../../types';

export default function Standings({ sport }: { sport: 'football' | 'basketball' }) {
  const [tab, setTab] = useState<'global' | 'mini'>('global');
  const [squads, setSquads] = useState<Squad[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    db.getAllSquads().then(all => {
       const sorted = all.filter(s => s.sport === sport).sort((a, b) => b.totalPoints - a.totalPoints);
       setSquads(sorted);
    });
  }, [sport]);

  const sportColor = sport === 'basketball' ? 'text-amber-500' : 'text-brand';
  const sportBg = sport === 'basketball' ? 'bg-amber-500' : 'bg-brand';

  
  // Use the actual squads for standings
  const displayStandings = squads.map((s, i) => ({
    rank: i + 1,
    prevRank: s.overallRank || i + 1,
    teamName: s.name,
    manager: s.userId.replace('u', 'Manager '), // just mock manager name for dev
    gwPoints: 0, // In a real app we'd track points per gameweek
    totalPoints: s.totalPoints,
  }));

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
           <h1 className="text-3xl font-bold text-text-primary uppercase tracking-tighter">League Standings</h1>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setTab('global')} 
          className={cn("px-6 py-3 font-mono text-[10px] uppercase tracking-widest font-bold border transition-colors", 
            tab === 'global' ? "bg-text-primary text-bg border-text-primary" : "bg-surface text-text-secondary border-border hover:border-text-primary"
          )}
        >
          Overall Global League
        </button>
        <button 
          onClick={() => setTab('mini')} 
          className={cn("px-6 py-3 font-mono text-[10px] uppercase tracking-widest font-bold border transition-colors", 
            tab === 'mini' ? "bg-text-primary text-bg border-text-primary" : "bg-surface text-text-secondary border-border hover:border-text-primary"
          )}
        >
          My Mini-Leagues
        </button>
      </div>

      <div className="bg-surface border border-border flex flex-col flex-1 min-h-0">
        <div className="p-4 border-b border-border bg-bg/50">
          <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary">
            {tab === 'global' ? 'Global Ranking Phase 1' : 'Private Leagues'}
          </h2>
        </div>

        {tab === 'global' ? (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-bg/80 backdrop-blur-sm sticky top-0 z-10 border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-[10px] font-mono uppercase tracking-widest text-text-secondary font-semibold w-24">Rank</th>
                  <th className="px-6 py-3 text-[10px] font-mono uppercase tracking-widest text-text-secondary font-semibold">Team & Manager</th>
                  <th className="px-6 py-3 text-[10px] font-mono uppercase tracking-widest text-text-secondary font-semibold text-right">GW</th>
                  <th className={cn("px-6 py-3 text-[10px] font-mono uppercase tracking-widest font-semibold text-right", sportColor)}>Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {displayStandings.map((s, i) => (
                  <tr key={i} className={cn("hover:bg-bg/50 transition-colors", i === 12 ? (sport === 'basketball' ? "bg-amber-500/5 border-l-2 border-l-amber-500" : "bg-brand/5 border-l-2 border-l-brand") : "")}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold font-mono tabular-data">{s.rank}</span>
                        {s.rank < s.prevRank ? (
                          <ArrowUp className="text-[#10b981]" size={14} />
                        ) : s.rank > s.prevRank ? (
                          <ArrowDown className="text-danger" size={14} />
                        ) : (
                          <Minus className="text-text-muted" size={14} />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold uppercase tracking-wider text-text-primary">{s.teamName}</div>
                      <div className="text-[10px] font-mono text-text-secondary mt-1">{s.manager}</div>
                    </td>
                    <td className="px-6 py-4 text-right text-xs font-mono tabular-data text-text-secondary">
                      {s.gwPoints}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-mono tabular-data text-text-primary font-bold">
                      {s.totalPoints}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <Trophy size={48} className="text-text-muted mb-6 opacity-30" />
            <h3 className="text-lg font-bold uppercase tracking-tighter text-text-primary mb-2">Create a Mini-League</h3>
            <p className="text-xs font-mono text-text-secondary max-w-sm mb-6 leading-relaxed">
              Invite your friends to compete in private H2H or Classic scoring leagues.
            </p>
            <button 
              onClick={() => navigate(`/${sport}/leagues`)}
              className={cn("px-6 py-3 font-mono text-xs uppercase tracking-widest font-bold transition-colors text-bg hover:opacity-90", sportBg)}
            >
              Create New League
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
