import { apiFetch } from '../../lib/apiFetch';
import { useState, useEffect } from 'react';
import { db } from '../../services/api';
import { Player } from '../../types';
import { cn } from '../../lib/utils';
import { Search } from 'lucide-react';

export default function Players({ sport }: { sport: 'football' | 'basketball' }) {
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const sportColor = sport === 'basketball' ? 'text-amber-500' : 'text-brand';
  const sportBorder = sport === 'basketball' ? 'border-amber-500' : 'border-brand';

  useEffect(() => {
    const fetchData = async () => {
      const p = await db.getPlayers();
      setAllPlayers(p.filter(pl => pl.sport === sport));
      setLoading(false);
    };
    fetchData();
  }, [sport]);

  if (loading) return <div className="p-12 text-center text-text-secondary uppercase tracking-widest text-sm">Loading Stats...</div>;

  const filteredPlayers = allPlayers.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
           <h1 className="text-3xl font-bold text-text-primary uppercase tracking-tighter">Player Statistics</h1>
        </div>
      </div>

      <div className="bg-surface border border-border flex flex-col flex-1 min-h-[600px]">
        <div className="p-4 border-b border-border bg-bg/50">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="SEARCH PLAYERS OR TEAMS..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-bg border border-border pl-10 pr-4 py-2 text-xs font-mono uppercase tracking-widest text-text-primary focus:outline-none focus:border-text-secondary transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-bg/80 backdrop-blur-sm sticky top-0 z-10 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-[10px] font-mono uppercase tracking-widest text-text-secondary font-semibold">Player</th>
                <th className="px-6 py-3 text-[10px] font-mono uppercase tracking-widest text-text-secondary font-semibold">Team</th>
                <th className="px-6 py-3 text-[10px] font-mono uppercase tracking-widest text-text-secondary font-semibold">Position</th>
                <th className="px-6 py-3 text-[10px] font-mono uppercase tracking-widest text-text-secondary font-semibold text-right w-24">Price</th>
                <th className="px-6 py-3 text-[10px] font-mono uppercase tracking-widest text-text-secondary font-semibold text-right w-24">Sel %</th>
                <th className={cn("px-6 py-3 text-[10px] font-mono uppercase tracking-widest font-semibold text-right w-24", sportColor)}>Total Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
// eslint-disable-next-line @typescript-eslint/no-unused-vars
              {filteredPlayers.map((p) => (
                <tr key={p.id} className="hover:bg-bg/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        <img src={p.image} className={cn("w-10 h-10 rounded-full object-cover border", sportBorder)} alt={p.name} referrerPolicy="no-referrer" />
                      ) : (
                        <div className={cn("w-10 h-10 rounded-full border bg-bg flex items-center justify-center text-xs", sportBorder)}>{p.name.charAt(0)}</div>
                      )}
                      <div>
                        <div className="text-sm font-bold uppercase tracking-wider text-text-primary">{p.name}</div>
                        <div className="text-[10px] font-mono text-text-secondary mt-1 tracking-widest">{p.status === 'available' ? 'Available' : p.status}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono font-bold uppercase">{p.team}</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-text-secondary">{p.position}</td>
                  <td className="px-6 py-4 text-right text-xs font-mono tabular-data text-text-primary font-bold">
                    €{p.price.toFixed(1)}m
                  </td>
                  <td className="px-6 py-4 text-right text-xs font-mono tabular-data text-text-secondary">
                    {Math.floor(Math.random() * 400)/10}%
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-mono tabular-data font-bold">
                    <span className={sportColor}>{p.totalPoints}</span>
                  </td>
                </tr>
              ))}
              {filteredPlayers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs font-mono text-text-muted uppercase tracking-widest">
                    No matching players found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
