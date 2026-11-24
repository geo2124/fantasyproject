import { apiFetch } from '../../lib/apiFetch';
import { useState, useEffect } from 'react';
import { db } from '../../services/api';
import { Fixture } from '../../types';
import { cn } from '../../lib/utils';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Fixtures({ sport }: { sport: 'football' | 'basketball' }) {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameweek, setGameweek] = useState(11);

  const sportColor = sport === 'basketball' ? 'text-amber-500' : 'text-brand';
  const sportBg = sport === 'basketball' ? 'bg-amber-500' : 'bg-brand';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _sportBorder = sport === 'basketball' ? 'border-amber-500' : 'border-brand';

  useEffect(() => {
    const fetchData = async () => {
      const f = await db.getFixtures();
      // In a real app we'd filter by sport. For demo, we just use the mocked array
      setFixtures(f);
      setLoading(false);
    };
    fetchData();
  }, [sport]);

  if (loading) return <div className="p-12 text-center text-text-secondary uppercase tracking-widest text-sm">Loading Fixtures...</div>;

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-text-primary uppercase tracking-tighter">Fixtures & Results</h1>
      </div>

      <div className="bg-surface border border-border flex flex-col mb-8">
        <div className="flex justify-between items-center p-4 border-b border-border bg-bg/50">
          <button onClick={() => setGameweek(Math.max(1, gameweek - 1))} className="p-2 hover:bg-bg transition-colors text-text-secondary hover:text-text-primary border border-border">
            <ChevronLeft size={16} />
          </button>
          
          <div className="text-center">
            <h2 className={cn("text-lg font-bold tracking-widest uppercase mb-1", sportColor)}>Gameweek {gameweek}</h2>
            <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
              14 Oct 2026 - 17 Oct 2026
            </p>
          </div>

          <button onClick={() => setGameweek(gameweek + 1)} className="p-2 hover:bg-bg transition-colors text-text-secondary hover:text-text-primary border border-border">
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex flex-col">
// eslint-disable-next-line @typescript-eslint/no-unused-vars
          {fixtures.map((f) => (
             <div key={f.id} className="flex flex-col sm:flex-row items-center border-b border-border last:border-0 hover:bg-bg/50 transition-colors p-4 sm:p-6 group">
                
                {/* Date/Time */}
                <div className="w-full sm:w-1/4 flex items-center gap-2 text-[10px] font-mono text-text-secondary uppercase tracking-widest mb-4 sm:mb-0">
                  <Calendar size={12} />
                  <span>Sat 14 Oct</span>
                  <span className="mx-1">•</span>
                  <span>18:30</span>
                </div>

                {/* Matchup */}
                <div className="flex-1 flex justify-center items-center gap-4 w-full">
                   <div className="flex-1 text-right">
                     <span className="text-sm font-bold uppercase tracking-wider">{f.homeTeam}</span>
                   </div>
                   
                   <div className="shrink-0 w-24 flex justify-center">
                     {f.status === 'finished' ? (
                       <div className="tabular-data font-bold text-lg px-4 py-1 bg-bg border border-border">
                         {f.homeScore} - {f.awayScore}
                       </div>
                     ) : (
                       <div className={cn("px-4 py-1 text-[10px] font-mono tracking-widest uppercase font-bold border", 
                         f.status === 'live' ? `${sportBg} text-bg` : `bg-bg border-border text-text-secondary`
                       )}>
                         {f.status === 'live' ? 'LIVE' : 'VS'}
                       </div>
                     )}
                   </div>

                   <div className="flex-1 text-left">
                     <span className="text-sm font-bold uppercase tracking-wider">{f.awayTeam}</span>
                   </div>
                </div>

                {/* Action */}
                <div className="w-full sm:w-1/4 flex justify-end mt-4 sm:mt-0 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="text-[10px] font-mono text-text-secondary border border-border px-3 py-1 hover:text-text-primary hover:border-text-primary transition-colors uppercase tracking-widest">
                     Match Center <span className="ml-1">→</span>
                   </button>
                </div>

             </div>
          ))}

          {fixtures.length === 0 && (
            <div className="p-12 text-center text-text-secondary text-sm font-mono uppercase tracking-widest">
              No fixtures scheduled.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
