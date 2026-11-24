import { apiFetch } from '../../lib/apiFetch';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCmsStore } from '../../store/cmsStore';
import { db } from '../../services/api';
import { Player, Squad, Fixture } from '../../types';
import { cn } from '../../lib/utils';
import { Search, Filter, Plus, Minus, ArrowRight } from 'lucide-react';
import { FantasyEngine } from '../../services/engine/fantasyEngine';

export default function Transfers({ sport }: { sport: 'football' | 'basketball' }) {
  const [searchParams] = useSearchParams();
  const draftLeagueId = searchParams.get('draftLeagueId') || undefined;
  const user = useAuthStore(state => state.user);
  const cms = useCmsStore();
  const [squad, setSquad] = useState<Squad | null>(null);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [draftRoom, setDraftRoom] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);

  // Transfer state
  const [transfersOut, setTransfersOut] = useState<string[]>([]);
  const [transfersIn, setTransfersIn] = useState<string[]>([]);

  const allPlayers = cms.players.filter(pl => pl.sport === sport);
  const squadPlayerIds = squad?.players.map(p => p.playerId) || [];

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      const [s, f] = await Promise.all([
        db.getSquad(user.id, sport, draftLeagueId),
        db.getFixtures()
      ]);
      setSquad(s);
      setFixtures(f.filter(x => x.sport === sport));

      if (draftLeagueId) {
        try {
          const res = await apiFetch(`/api/drafts/${draftLeagueId}`);
          if (res.ok) {
            setDraftRoom(await res.json());
          }
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
    };
    fetchAll();
  }, [user, sport, draftLeagueId]);

  const isPlayerLocked = (p: Player) => {
    // LBFL locking: lock 1 hour before game, or if game is live/finished
    const playerFixtures = fixtures.filter(f => f.homeTeam === p.team || f.awayTeam === p.team);
    return playerFixtures.some(f => {
      if (f.status === 'live' || f.status === 'finished') return true;
      const gameTime = new Date(f.date).getTime();
      const now = new Date().getTime();
      const oneHour = 60 * 60 * 1000;
      if (gameTime - now < oneHour && gameTime - now > -oneHour) return true;
      return false;
    });
  };

  const handleOut = (pid: string) => {
    const p = allPlayers.find(x => x.id === pid);
    if (p && isPlayerLocked(p)) {
      alert("This player is locked and cannot be transferred out.");
      return;
    }
    if (!transfersOut.includes(pid)) setTransfersOut([...transfersOut, pid]);
  };

  const handleIn = (pid: string) => {
    if (!transfersIn.includes(pid)) {
      const result = FantasyEngine.validateTransfer(squad, allPlayers, transfersIn, transfersOut, pid, sport);
      if (!result.valid) {
        alert(result.reason);
        return;
      }

      setTransfersIn([...transfersIn, pid]);
    }
  };

  const handleFavoriteClubSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val && squad) {
      try {
        const newSquad = await db.updateSquad(squad.id, { favoriteClub: val });
        setSquad(newSquad);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Extract unique teams
  const sportTeams = Array.from(new Set(allPlayers.map(p => p.team))).sort();

  const cancelOut = (pid: string) => {
    setTransfersOut(transfersOut.filter(id => id !== pid));
  };

  const cancelIn = (pid: string) => {
    setTransfersIn(transfersIn.filter(id => id !== pid));
  };

  const commitTransfers = async () => {
    if (!squad) return;
    try {
      const remainingPlayers = squad.players.filter(p => !transfersOut.includes(p.playerId));
      
      const maxBenchCount = sport === 'basketball' ? 5 : 4;
      let currentBenchCount = remainingPlayers.filter(p => !p.isStarting && p.role === 'bench').length;
      
      const newSquadPlayers = [
        ...remainingPlayers,
        ...transfersIn.map(id => {
          let targetRole: 'bench' | 'roster' = 'bench';
          if (currentBenchCount >= maxBenchCount) {
             targetRole = 'roster';
          } else {
             currentBenchCount++;
          }
          return { 
            playerId: id, 
            isStarting: false, 
            isCaptain: false, 
            isViceCaptain: false, 
            role: targetRole,
            positionIndex: 0 
          };
        })
      ];
      
      if (draftLeagueId) {
        // Send waivers to draft backend
        const res = await apiFetch(`/api/drafts/${draftLeagueId}/waivers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user?.id, players: newSquadPlayers })
        });
        if (!res.ok) {
           const err = await res.json();
           alert("Waiver Error: " + err.error);
           return;
        }
      }

      const newSquad = await db.updateSquad(squad.id, {
        players: newSquadPlayers,
        bank: newBank,
        totalPoints: (squad.totalPoints || 0) - cost
      });
      setSquad(newSquad);
      alert(draftLeagueId ? "Waiver process completed." : `Committed transfers successfully. Cost: ${cost} pts.`);
      setTransfersIn([]);
      setTransfersOut([]);
    } catch (error) {
      console.error(error);
      alert("Error committing transfers.");
    }
  };

  if (loading) return <div className="p-12 text-center text-text-secondary uppercase tracking-widest text-sm">Loading Market...</div>;

  const sportColor = sport === 'basketball' ? 'text-amber-500' : 'text-brand';
  const sportBg = sport === 'basketball' ? 'bg-amber-500' : 'bg-brand';
  const sportBorder = sport === 'basketball' ? 'border-amber-500' : 'border-brand';
  
  let availableToBuy = allPlayers.filter(p => !squadPlayerIds.includes(p.id) && !transfersIn.includes(p.id));
  
  if (draftLeagueId && draftRoom) {
     // In a draft league, free agents are those NOT owned by ANY member
     const allOwnedIds = new Set<string>();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
     draftRoom.members.forEach((m: any) => {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
        m.roster.forEach((rp: any) => allOwnedIds.add(rp.id));
     });
     availableToBuy = availableToBuy.filter(p => !allOwnedIds.has(p.id));
  }
  
  const filteredPlayers = availableToBuy.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (sport === 'basketball' 
      ? (p.basketballPosDetail?.primary.toLowerCase().includes(searchQuery.toLowerCase()) || 
         p.basketballPosDetail?.secondary.toLowerCase().includes(searchQuery.toLowerCase()) ||
         p.basketballPosDetail?.label.toLowerCase().includes(searchQuery.toLowerCase()))
      : p.position.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Current Squad processing
  const currentSquadFiltered = allPlayers.filter(p => squadPlayerIds.includes(p.id) && !transfersOut.includes(p.id));

  // Determine costs
  const valueOut = transfersOut.reduce((sum, id) => sum + (allPlayers.find(p => p.id === id)?.price || 0), 0);
  const valueIn = transfersIn.reduce((sum, id) => sum + (allPlayers.find(p => p.id === id)?.price || 0), 0);
  
  const initialBudget = sport === 'football' ? 100.0 : 100.0;
  const currentSquadValue = squadPlayerIds.reduce((sum, id) => {
    return sum + (allPlayers.find(p => p.id === id)?.price || 0);
  }, 0);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentBank = draftLeagueId ? (draftRoom?.members.find((m: any) => m.userId === user?.id)?.budget || 0) : (initialBudget - currentSquadValue);
  const newBank = draftLeagueId ? currentBank : (currentBank + valueOut - valueIn);
  const isOverBudget = newBank < 0 && !draftLeagueId; // Relax budget for drafts (waivers are usually free or use FAAB)
  
  const transferCount = transfersIn.length; // Simple count for basketball
  const squadSize = squad?.players.length || 0;
  const targetSize = sport === 'basketball' ? 10 : 15;
  
  // If squad is not full, it's considered building phase, so free
  // Otherwise, all transfers cost points
  const cost = draftLeagueId ? 0 : ((squadSize + transfersIn.length - transfersOut.length < targetSize) 
    ? 0 
    : transferCount * 4);
  
  const canConfirm = (transfersIn.length > 0 || transfersOut.length > 0) && !isOverBudget;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      
      {/* Header Stats */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary uppercase tracking-tighter">
             {draftLeagueId ? "Waiver Wire" : "Transfer Market"}
          </h1>
          <p className="text-sm font-mono text-text-secondary mt-1 tracking-widest uppercase mb-4">
             {draftLeagueId ? "Free Agents" : "Gameweek 11 Deadline: FRI 18:30"}
          </p>
          
          {squad && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono tracking-widest uppercase text-text-secondary">Favorite Club:</span>
              {squad.favoriteClub ? (
                <span className={cn("text-xs font-bold uppercase tracking-widest", sportColor)}>{squad.favoriteClub}</span>
              ) : (
                <select 
                  onChange={handleFavoriteClubSelect}
                  className={cn("bg-bg border border-border px-2 py-1 text-xs font-mono uppercase focus:outline-none transition-colors", sport === 'basketball' ? "focus:border-amber-500" : "focus:border-brand")}
                  defaultValue=""
                >
                  <option value="" disabled>Select Club</option>
                  {sportTeams.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>
        
        <div className="flex gap-6 text-right">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-text-secondary mb-1">In The Bank</div>
            <div className={cn("text-2xl tabular-data", newBank >= 0 ? sportColor : "text-danger")}>
              €{newBank.toFixed(1)}m
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
        
        {/* Market List */}
        <div className="flex-[2] bg-surface border border-border flex flex-col min-h-0">
          <div className="p-4 border-b border-border bg-bg flex gap-4 items-center">
             <div className="flex-1 relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input 
                  type="text" 
                  placeholder="SEARCH PLAYERS, TEAMS..." 
                  className="w-full bg-surface border border-border py-2 pl-9 pr-4 text-xs font-mono uppercase tracking-widest text-text-primary focus:outline-none focus:border-text-secondary"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
             </div>
             <button className="flex items-center gap-2 border border-border bg-surface px-4 py-2 hover:bg-bg transition-colors">
               <Filter size={14} className="text-text-secondary" />
               <span className="text-xs font-mono uppercase tracking-widest">Filter</span>
             </button>
          </div>
          
          <div className="flex-1 flex flex-col lg:flex-row min-h-0">
            {/* SQUAD SIDE */}
            <div className="flex-1 border-b lg:border-b-0 lg:border-r border-border overflow-y-auto custom-scrollbar h-[50vh] lg:h-auto">
               <div className="sticky top-0 bg-bg/90 backdrop-blur z-10 border-b border-border p-2">
                 <div className="text-[10px] uppercase font-mono tracking-widest text-center text-text-secondary">Current Squad</div>
               </div>
               {currentSquadFiltered.map(p => (
                 <div key={p.id} className="flex items-center justify-between p-3 border-b border-border hover:bg-bg/50">
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        <img src={p.image} className={cn("w-8 h-8 rounded-full object-cover border", sportBorder)} alt={p.name} />
                      ) : (
                        <div className={cn("w-8 h-8 rounded-full border bg-bg flex items-center justify-center text-[10px]", sportBorder)}>{p.name.charAt(0)}</div>
                      )}
                      <div>
                        <div className="text-xs font-bold uppercase">{p.name}</div>
                        <div className="text-[10px] font-mono text-text-secondary" style={{color: p.team === 'AHE' ? '#eab308' : ''}}>
                          {sport === 'basketball' ? p.basketballPosDetail?.label : p.position} // {p.team}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                       <span className="tabular-data text-xs mono-label">€{p.price.toFixed(1)}m</span>
                       <button onClick={() => handleOut(p.id)} className="w-5 h-5 flex items-center justify-center border border-border text-text-secondary hover:text-danger hover:border-danger transition-colors">
                         <Minus size={12} />
                       </button>
                    </div>
                 </div>
               ))}
            </div>

            {/* MARKET SIDE */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
               <div className="sticky top-0 bg-bg/90 backdrop-blur border-b border-border p-2">
                 <div className="text-[10px] uppercase font-mono tracking-widest text-center text-text-secondary">Market</div>
               </div>
               {filteredPlayers.map(p => (
                 <div key={p.id} className="flex items-center justify-between p-3 border-b border-border hover:bg-bg/50">
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        <img src={p.image} className={cn("w-8 h-8 rounded-full object-cover border", sportBorder)} alt={p.name} />
                      ) : (
                        <div className={cn("w-8 h-8 rounded-full border bg-bg flex items-center justify-center text-[10px]", sportBorder)}>{p.name.charAt(0)}</div>
                      )}
                      <div>
                        <div className="text-xs font-bold uppercase">{p.name}</div>
                        <div className="text-[10px] font-mono text-text-secondary">
                          {sport === 'basketball' ? p.basketballPosDetail?.label : p.position} // {p.team}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                       <span className="tabular-data text-xs mono-label">€{p.price.toFixed(1)}m</span>
                       <button onClick={() => handleIn(p.id)} className={cn("w-5 h-5 flex items-center justify-center border border-border text-text-secondary transition-colors", sport === 'basketball' ? "hover:text-amber-500 hover:border-amber-500" : "hover:text-brand hover:border-brand")}>
                         <Plus size={12} />
                       </button>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Current Squad Changes */}
        <div className="flex-1 bg-surface border border-border flex flex-col min-h-0 relative">
          <div className="p-4 border-b border-border bg-bg/50 flex justify-between items-center">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary">PLANNED CHANGES</h2>
            <span className="text-[10px] font-mono bg-border px-2 py-0.5 text-text-secondary">{transfersIn.length + transfersOut.length} PENDING</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
             {transfersOut.length === 0 && transfersIn.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 opacity-40">
                   <ArrowRight size={24} className="text-text-muted mb-4 opacity-50" />
                   <p className="text-xs font-mono uppercase tracking-widest text-text-secondary leading-relaxed">
                     Remove players from your squad.<br/>Add replacements from the market.
                   </p>
                </div>
             )}

             {/* Out */}
             {transfersOut.map(id => {
               const p = allPlayers.find(x => x.id === id);
               if (!p) return null;
               return (
                 <div key={id} className="border border-danger/30 bg-danger/5 p-3 flex justify-between items-center relative">
                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-danger/50"></div>
                    <div>
                      <div className="text-[10px] tracking-widest uppercase text-danger mb-1 font-mono">OUT</div>
                      <div className="text-xs font-bold uppercase">{p.name}</div>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="text-xs font-mono">+€{p.price.toFixed(1)}m</span>
                       <button onClick={() => cancelOut(id)} className="text-text-secondary hover:text-text-primary"><Minus size={12} /></button>
                    </div>
                 </div>
               )
             })}

             {/* In */}
             {transfersIn.map(id => {
               const p = allPlayers.find(x => x.id === id);
               if (!p) return null;
               return (
                 <div key={id} className={cn("border p-3 flex justify-between items-center relative bg-opacity-10", sportBorder)} style={{ backgroundColor: sport === 'basketball' ? 'rgba(245, 158, 11, 0.05)' : 'rgba(34, 211, 238, 0.05)' }}>
                    <div className={cn("absolute top-0 left-0 bottom-0 w-1 opacity-50", sportBg)}></div>
                    <div>
                      <div className={cn("text-[10px] tracking-widest uppercase mb-1 font-mono", sportColor)}>IN</div>
                      <div className="text-xs font-bold uppercase">{p.name}</div>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="text-xs font-mono">-€{p.price.toFixed(1)}m</span>
                       <button onClick={() => cancelIn(id)} className="text-text-secondary hover:text-text-primary"><Minus size={12} /></button>
                    </div>
                 </div>
               )
             })}

          </div>
          
          <div className="p-4 border-t border-border bg-bg/50 flex flex-col gap-3">
             <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-text-secondary uppercase tracking-widest">Cost</span>
                <span className={cn("tabular-data", cost > 0 ? "text-danger" : "text-text-primary")}>{cost} pts</span>
             </div>
             <button 
               disabled={!canConfirm}
               onClick={commitTransfers}
               className={cn("w-full py-3 text-xs font-bold font-mono tracking-widest uppercase transition-colors", 
                 canConfirm ? `${sportBg} text-bg hover:opacity-90` : "border border-border bg-bg text-text-muted opacity-50 cursor-not-allowed"
               )}>
               CONFIRM TRANSFERS
             </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
