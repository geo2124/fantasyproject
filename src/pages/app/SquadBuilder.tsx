import { apiFetch } from '../../lib/apiFetch';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCmsStore } from '../../store/cmsStore';
import { db } from '../../services/api';
import { Player, Squad, Fixture } from '../../types';
import { cn } from '../../lib/utils';
import {   User as UserIcon, Layout } from 'lucide-react';

type FormationType = '4-4-2' | '3-5-2' | '4-3-3' | '5-3-2';

interface PositionCoord {
  id: string;
  pos: string;
  x: number; // percentage
  y: number; // percentage
}

const FOOTBALL_FORMATIONS: Record<FormationType, PositionCoord[]> = {
  '4-4-2': [
    { id: 'g1', pos: 'GKP', x: 50, y: 90 },
    { id: 'd1', pos: 'DEF', x: 20, y: 72 }, { id: 'd2', pos: 'DEF', x: 40, y: 72 }, { id: 'd3', pos: 'DEF', x: 60, y: 72 }, { id: 'd4', pos: 'DEF', x: 80, y: 72 },
    { id: 'm1', pos: 'MID', x: 20, y: 45 }, { id: 'm2', pos: 'MID', x: 40, y: 45 }, { id: 'm3', pos: 'MID', x: 60, y: 45 }, { id: 'm4', pos: 'MID', x: 80, y: 45 },
    { id: 'f1', pos: 'FWD', x: 35, y: 18 }, { id: 'f2', pos: 'FWD', x: 65, y: 18 },
  ],
  '3-5-2': [
    { id: 'g1', pos: 'GKP', x: 50, y: 90 },
    { id: 'd1', pos: 'DEF', x: 25, y: 72 }, { id: 'd2', pos: 'DEF', x: 50, y: 72 }, { id: 'd3', pos: 'DEF', x: 75, y: 72 },
    { id: 'm1', pos: 'MID', x: 15, y: 45 }, { id: 'm2', pos: 'MID', x: 32, y: 45 }, { id: 'm3', pos: 'MID', x: 50, y: 45 }, { id: 'm4', pos: 'MID', x: 68, y: 45 }, { id: 'm5', pos: 'MID', x: 85, y: 45 },
    { id: 'f1', pos: 'FWD', x: 35, y: 18 }, { id: 'f2', pos: 'FWD', x: 65, y: 18 },
  ],
  '4-3-3': [
    { id: 'g1', pos: 'GKP', x: 50, y: 90 },
    { id: 'd1', pos: 'DEF', x: 20, y: 72 }, { id: 'd2', pos: 'DEF', x: 40, y: 72 }, { id: 'd3', pos: 'DEF', x: 60, y: 72 }, { id: 'd4', pos: 'DEF', x: 80, y: 72 },
    { id: 'm1', pos: 'MID', x: 30, y: 45 }, { id: 'm2', pos: 'MID', x: 50, y: 45 }, { id: 'm3', pos: 'MID', x: 70, y: 45 },
    { id: 'f1', pos: 'FWD', x: 20, y: 18 }, { id: 'f2', pos: 'FWD', x: 50, y: 18 }, { id: 'f3', pos: 'FWD', x: 80, y: 18 },
  ],
  '5-3-2': [
    { id: 'g1', pos: 'GKP', x: 50, y: 90 },
    { id: 'd1', pos: 'DEF', x: 15, y: 72 }, { id: 'd2', pos: 'DEF', x: 32, y: 72 }, { id: 'd3', pos: 'DEF', x: 50, y: 72 }, { id: 'd4', pos: 'DEF', x: 68, y: 72 }, { id: 'd5', pos: 'DEF', x: 85, y: 72 },
    { id: 'm1', pos: 'MID', x: 30, y: 45 }, { id: 'm2', pos: 'MID', x: 50, y: 45 }, { id: 'm3', pos: 'MID', x: 70, y: 45 },
    { id: 'f1', pos: 'FWD', x: 35, y: 18 }, { id: 'f2', pos: 'FWD', x: 65, y: 18 },
  ],
};

const BASKETBALL_FORMATION: PositionCoord[] = [
  { id: 'pg', pos: 'PG', x: 50, y: 75 },
  { id: 'sg', pos: 'SG', x: 20, y: 60 },
  { id: 'sf', pos: 'SF', x: 80, y: 60 },
  { id: 'pf', pos: 'PF', x: 30, y: 25 },
  { id: 'c', pos: 'C', x: 70, y: 25 },
];

export default function SquadBuilder({ sport }: { sport: 'football' | 'basketball' }) {
  const [searchParams] = useSearchParams();
  const draftLeagueId = searchParams.get('draftLeagueId') || undefined;
  const user = useAuthStore(state => state.user);
  const cms = useCmsStore();
  const [squad, setSquad] = useState<Squad | null>(null);
  const [loading, setLoading] = useState(true);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [formation, setFormation] = useState<FormationType>('4-4-2');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const allPlayers = cms.players.filter(pl => pl.sport === sport);

  const toggleReserveRole = async (e: React.MouseEvent, playerId: string) => {
    e.stopPropagation();
    if (!squad || isUpdating) return;
    
    const pDetails = getPlayerDetails(playerId);
    if (pDetails && isPlayerLocked(pDetails)) {
       alert("This player is locked.");
       return;
    }

    const player = squad.players.find(p => p.playerId === playerId);
    if (!player) return;

    if (player.isStarting) return; // Only toggle reserves

    const currentRole = player.role || 'bench';
    const newRole: 'roster' | 'bench' = currentRole === 'roster' ? 'bench' : 'roster';

    if (newRole === 'bench') {
      const maxBenchCount = sport === 'basketball' ? 5 : 4;
      const currentBenchCount = squad.players.filter(p => !p.isStarting && p.role === 'bench').length;
      if (currentBenchCount >= maxBenchCount) {
        alert("Bench is full, please move someone out first.");
        return;
      }
    }
    
    const updatedPlayers = squad.players.map(p => 
      p.playerId === playerId ? { ...p, role: newRole as 'roster' | 'bench' | 'starting' } : p
    );

    setIsUpdating(true);
    try {
      const newSquad = await db.updateSquad(squad.id, { players: updatedPlayers });
      setSquad(newSquad);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMakeCaptain = async (playerId: string, isViceCaptain = false) => {
    if (!squad || isUpdating) return;
    
    const updatedPlayers = squad.players.map(p => {
      if (p.playerId === playerId) {
        return { 
          ...p, 
          isCaptain: !isViceCaptain, 
          isViceCaptain: isViceCaptain 
        };
      }
      // Reset whoever currently has the conflicting role
      if (isViceCaptain && p.isViceCaptain) return { ...p, isViceCaptain: false };
      if (!isViceCaptain && p.isCaptain) return { ...p, isCaptain: false };
      return p;
    });

    setIsUpdating(true);
    try {
      const newSquad = await db.updateSquad(squad.id, { players: updatedPlayers });
      setSquad(newSquad);
      setSelectedPlayerId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMoveToBench = async (playerId: string) => {
    if (!squad || isUpdating) return;
    const player = squad.players.find(p => p.playerId === playerId);
    if (!player || !player.isStarting) return;

    // Check if bench is full
    const maxBenchCount = sport === 'basketball' ? 5 : 4;
    const benchCount = squad.players.filter(p => !p.isStarting && p.role === 'bench').length;
    let targetRole: 'bench' | 'roster' = 'bench';
    if (benchCount >= maxBenchCount) {
      targetRole = 'roster';
    }

    const updatedPlayers = squad.players.map(p => 
      p.playerId === playerId ? { ...p, isStarting: false, role: targetRole, positionIndex: undefined } : p
    );

    setIsUpdating(true);
    try {
      const newSquad = await db.updateSquad(squad.id, { players: updatedPlayers });
      setSquad(newSquad);
      setSelectedPlayerId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const activeCoords = useMemo(() => {
    return sport === 'football' ? FOOTBALL_FORMATIONS[formation] : BASKETBALL_FORMATION;
  }, [sport, formation]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [s, f] = await Promise.all([
        db.getSquad(user.id, sport, draftLeagueId),
        db.getFixtures()
      ]);
      setSquad(s);
      setFixtures(f.filter(x => x.sport === sport));
      setLoading(false);
    };
    fetchData();
  }, [user, sport, draftLeagueId]);

  const isPlayerLocked = (p: Player) => {
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

  const getPlayerDetails = (playerId: string) => allPlayers.find(p => p.id === playerId);

  // ... (keeping other methods intact up to handlePlayerClick)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _getStartingPlayersByPos = (pos: string) => {
    if (!squad) return [];
    return squad.players
      .filter(sp => sp.isStarting)
      .map(sp => ({ sp, p: getPlayerDetails(sp.playerId) }))
      .filter(wrapper => {
        if (!wrapper.p) return false;
        if (sport === 'football') return wrapper.p.position === pos;
        
        // Basketball Position Logic: Primary or Secondary match
        const detail = wrapper.p.basketballPosDetail;
        return detail?.primary === pos || detail?.secondary === pos;
      });
  };

  const getPlayersInSlots = () => {
    if (!squad) return {};

    const isCompatible = (p: Player, pos: string) => {
      if (sport === 'football') return p.position === pos;
      if (p.position === pos) return true;
      if (['FLEX', 'UTIL', 'G/F'].includes(pos)) return true;
      const detail = p.basketballPosDetail;
      return detail?.primary === pos || detail?.secondary === pos;
    };

    const starting = squad.players
      .filter(sp => sp.isStarting)
      .map(sp => ({ sp, p: getPlayerDetails(sp.playerId) }))
      .filter(w => !!w.p);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: Record<string, any> = {};
    const assignedIds = new Set<string>();

    // Pass 1: explicit spot assignments via positionIndex
    activeCoords.forEach((coord, i) => {
      const expl = starting.find(w => w.sp.positionIndex === i && !assignedIds.has(w.sp.playerId));
      if (expl) {
        result[coord.id] = expl;
        assignedIds.add(expl.sp.playerId);
      }
    });

    // Pass 2: fallback compatibility logic
// eslint-disable-next-line @typescript-eslint/no-unused-vars
    activeCoords.forEach((coord, i) => {
      if (result[coord.id]) return;
      const compatible = starting.find(w => {
        if (assignedIds.has(w.sp.playerId)) return false;
        return isCompatible(w.p!, coord.pos);
      });

      if (compatible) {
        result[coord.id] = compatible;
        assignedIds.add(compatible.sp.playerId);
      }
    });

    return result;
  };

  const playersInSlots = useMemo(() => getPlayersInSlots(), [squad, activeCoords]);

  const handlePlayerClick = async (playerId: string) => {
    if (!squad) return;
    
    const clickedPlayer = squad.players.find(p => p.playerId === playerId);
    if (!clickedPlayer) return;

    const pDetails = getPlayerDetails(playerId);
    if (pDetails && isPlayerLocked(pDetails)) {
      alert("This player's game is locked (starting within 1 hour or already played).");
      return;
    }

    if (!selectedPlayerId) {
      // Logic: If clicking a bench player, try to find an empty spot for them automatically
      if (!clickedPlayer.isStarting) {
        const isCompatible = (p: Player, pos: string) => {
          if (sport === 'football') return p.position === pos;
          if (p.position === pos) return true;
          if (['FLEX', 'UTIL', 'G/F'].includes(pos)) return true;
          const detail = p.basketballPosDetail;
          return detail?.primary === pos || detail?.secondary === pos;
        };

        const slots = playersInSlots;
        const emptyCompatibleCoord = activeCoords.find(coord => {
          if (slots[coord.id]) return false; // Spot already taken
          const pDetails = getPlayerDetails(playerId);
          if (!pDetails) return false;
          return isCompatible(pDetails, coord.pos);
        });

        if (emptyCompatibleCoord) {
          const updatedPlayers = squad.players.map(p => 
            p.playerId === playerId ? { ...p, isStarting: true } : p
          );
          try {
            const newSquad = await db.updateSquad(squad.id, { players: updatedPlayers });
            setSquad(newSquad);
            return;
          } catch (e) {
            console.error(e);
          }
        }
      }

      setSelectedPlayerId(playerId);
      return;
    }

    if (selectedPlayerId === playerId) {
      setSelectedPlayerId(null);
      return;
    }

    // Attempt to swap selectedPlayerId and playerId
    const player1 = squad.players.find(p => p.playerId === selectedPlayerId);
    const player2 = squad.players.find(p => p.playerId === playerId);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isReserve = (p: any) => !p.isStarting && p.role !== 'bench';

    if (player1 && player2) {
      if (player1.isStarting && player2.isStarting) {
         alert("To swap starting players, click their spots on the pitch.");
         setSelectedPlayerId(null);
         return;
      }

      if ((isReserve(player1) && player2.isStarting) || (isReserve(player2) && player1.isStarting)) {
         alert("Cannot swap a Reserve player directly into the starting lineup. Promote to Bench first.");
         setSelectedPlayerId(null);
         return;
      }
      
      const updatedPlayers = squad.players.map(p => {
        if (p.playerId === selectedPlayerId) {
           return { ...p, isStarting: player2.isStarting, role: player2.role || 'bench', positionIndex: player2.positionIndex };
        }
        if (p.playerId === playerId) {
           return { ...p, isStarting: player1.isStarting, role: player1.role || 'bench', positionIndex: player1.positionIndex };
        }
        return p;
      });

      if (isUpdating) return;
      setIsUpdating(true);
      try {
        const newSquad = await db.updateSquad(squad.id, { players: updatedPlayers });
        setSquad(newSquad);
      } catch (e) {
        console.error(e);
      } finally {
        setIsUpdating(false);
      }
    }

    setSelectedPlayerId(null);
  };

  const handleSpotClick = async (coordId: string, pos: string) => {
    if (!squad || !selectedPlayerId) return;

    const currentAtSpot = playersInSlots[coordId];
    if (currentAtSpot) {
       const spotPlayerDetails = getPlayerDetails(currentAtSpot.sp.playerId);
       if (spotPlayerDetails && isPlayerLocked(spotPlayerDetails)) {
         alert("The player currently in this spot is locked.");
         setSelectedPlayerId(null);
         return;
       }
    }

    const playerToMove = squad.players.find(p => p.playerId === selectedPlayerId);
    if (!playerToMove) return;

    const pDetails = getPlayerDetails(selectedPlayerId);
    if (!pDetails) return;

    // Validate position compatibility
    let isCompatible = false;
    if (sport === 'football') {
      isCompatible = pDetails.position === pos;
    } else {
      isCompatible = pDetails.position === pos || 
                     pDetails.basketballPosDetail?.primary === pos || 
                     pDetails.basketballPosDetail?.secondary === pos;
    }

    if (!isCompatible) {
      alert(`This player cannot play as ${pos}`);
      setSelectedPlayerId(null);
      return;
    }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isReserve = (p: any) => !p.isStarting && p.role !== 'bench';

    if (isReserve(playerToMove)) {
      alert("Cannot move a Reserve player directly into the starting lineup. Promote to Bench first.");
      setSelectedPlayerId(null);
      return;
    }

    const coordIndex = activeCoords.findIndex(c => c.id === coordId);

    // Move logic
    const updatedPlayers = squad.players.map(p => {
      if (p.playerId === selectedPlayerId) {
        return { ...p, isStarting: true, role: 'starting' as const, positionIndex: coordIndex };
      }
      if (currentAtSpot && p.playerId === currentAtSpot.sp.playerId) {
        return { ...p, isStarting: playerToMove.isStarting, role: (playerToMove.role || 'bench') as 'bench' | 'roster' | 'starting', positionIndex: playerToMove.positionIndex };
      }
      return p;
    });

    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const newSquad = await db.updateSquad(squad.id, { players: updatedPlayers });
      setSquad(newSquad);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
    
    setSelectedPlayerId(null);
  };

  if (loading) return <div className="p-12 text-center text-text-secondary uppercase tracking-widest text-sm">Loading Pitch...</div>;

  const sportColor = sport === 'basketball' ? 'text-amber-500' : 'text-brand';
  const sportBg = sport === 'basketball' ? 'bg-amber-500' : 'bg-brand';
  const sportBorder = sport === 'basketball' ? 'border-amber-500' : 'border-brand';

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      
      {/* VIZ AREA */}
      <div className="flex-1 bg-surface border border-border relative overflow-hidden flex flex-col items-center min-h-[450px] sm:min-h-[600px]">
        {/* Background graphic */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-20">
          {sport === 'football' ? (
            <div className="w-full h-full border-4 border-white/20 m-2 sm:m-4 relative">
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-24 h-24 sm:w-32 sm:h-32 border-2 border-white/20 rounded-full"></div>
                 <div className="w-full h-0.5 bg-white/20"></div>
               </div>
               <div className="absolute top-0 left-1/4 right-1/4 h-24 border-x-2 border-b-2 border-white/20"></div>
               <div className="absolute bottom-0 left-1/4 right-1/4 h-24 border-x-2 border-t-2 border-white/20"></div>
            </div>
          ) : (
            <div className="w-full h-full border-4 border-white/20 m-4 relative flex flex-col">
               {/* Basketball court lines */}
               <div className="absolute top-0 left-1/4 right-1/4 h-48 border-x-2 border-b-2 border-white/20 rounded-b-[100px]"></div>
               <div className="absolute bottom-0 left-1/4 right-1/4 h-48 border-x-2 border-t-2 border-white/20 rounded-t-[100px]"></div>
               <div className="absolute inset-x-0 bottom-0 top-1/2 flex items-center justify-center">
                 <div className="w-48 h-48 border-2 border-white/20 rounded-full"></div>
               </div>
               <div className="absolute top-1/2 inset-x-0 h-0.5 bg-white/20"></div>
            </div>
          )}
        </div>

        <div className="relative z-10 w-full p-4 border-b border-border bg-bg/80 backdrop-blur-sm flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-bold tracking-widest text-text-secondary uppercase">Budget ITB</span>
            <span className={cn("text-xs font-mono font-bold tabular-data", (squad?.bank || 0) >= 0 ? sportColor : "text-danger")}>
              €{(squad?.bank || 0).toFixed(1)}m
            </span>
          </div>
          
          {sport === 'football' && (
            <div className="flex items-center gap-2">
              <Layout size={14} className="text-text-secondary" />
              <select 
                value={formation}
                onChange={(e) => setFormation(e.target.value as FormationType)}
                className="bg-bg border border-border text-[10px] font-mono font-bold tracking-widest uppercase px-2 py-1 outline-none text-text-primary focus:border-brand transition-colors"
              >
                {Object.keys(FOOTBALL_FORMATIONS).map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          )}

          {sport === 'basketball' && (
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono font-bold tracking-widest text-text-secondary uppercase">UNIT</span>
              <span className={cn("text-xs font-mono font-bold tracking-widest uppercase", sportColor)}>
                5-MAN
              </span>
            </div>
          )}
        </div>

        {/* Pitch / Court Grid */}
        <div className="relative z-10 flex-1 w-full max-w-2xl">
          {activeCoords.map((coord) => {
            const pos = coord.pos;
            const draftedPlayer = playersInSlots[coord.id];

            return (
              <div 
                key={coord.id} 
                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center w-20 sm:w-28"
                style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
              >
                {draftedPlayer ? (
                  <>
                    <div 
                      onClick={() => handlePlayerClick(draftedPlayer.sp.playerId)}
                      className={cn("w-11 h-11 sm:w-14 sm:h-14 rounded-full border-2 bg-bg flex flex-col items-center justify-center relative cursor-pointer hover:scale-105 transition-transform shadow-xl shrink-0 touch-manipulation", 
                      sportBorder, selectedPlayerId === draftedPlayer.sp.playerId ? cn("ring-2 ring-offset-2", sport === 'basketball' ? "ring-amber-500" : "ring-brand") : "")}>
                       {draftedPlayer.p?.image ? (
                         <img src={draftedPlayer.p.image} alt={draftedPlayer.p.name} referrerPolicy="no-referrer" className="w-full h-full object-cover rounded-full" />
                       ) : (
                         <UserIcon size={20} className={cn("opacity-80", sportColor)} />
                       )}
                       {draftedPlayer.sp.isCaptain && <div className={cn("absolute -top-2 -right-2 text-[10px] font-bold text-bg w-5 h-5 rounded-full flex items-center justify-center", sportBg)}>C</div>}
                       {draftedPlayer.sp.isViceCaptain && <div className="absolute -top-2 -right-2 text-[10px] font-bold text-bg w-5 h-5 rounded-full flex items-center justify-center bg-gray-500">V</div>}
                    </div>
                    <div className="mt-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-text-primary px-1 bg-bg border border-border text-center truncate w-full shadow-sm">
                      {draftedPlayer.p?.name.split(' ').pop()}
                    </div>
                    <div className="text-[10px] tabular-data text-text-secondary bg-bg/50 px-1 mt-0.5">{draftedPlayer.p?.totalPoints} pts</div>
                  </>
                ) : (
                  <>
                    <div 
                      onClick={() => handleSpotClick(coord.id, pos)}
                      className="w-11 h-11 sm:w-14 sm:h-14 rounded-full border border-dashed border-border/40 bg-bg/30 flex flex-col items-center justify-center cursor-pointer hover:border-text-primary transition-colors group shrink-0 touch-manipulation">
                       <span className="text-[10px] sm:text-xs font-mono text-text-muted group-hover:text-text-primary">{pos}</span>
                    </div>
                    <div className="mt-2 text-[8px] font-mono text-text-muted uppercase tracking-tighter">EMPTY</div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SQUAD LIST */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
        
        {/* BENCH SECTION */}
        <div className="bg-surface border border-border flex flex-col h-[350px]">
          <div className="p-4 border-b border-border bg-bg/50 flex justify-between items-center">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary">BENCH</h2>
            <span className="text-[10px] font-mono text-text-secondary">
              {squad?.players.filter(sp => !sp.isStarting && sp.role === 'bench').length} / {sport === 'basketball' ? 5 : 4}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 custom-scrollbar">
            {squad?.players.filter(sp => !sp.isStarting && sp.role === 'bench').map(sp => {
              const p = getPlayerDetails(sp.playerId);
              if (!p) return null;
              return (
                <div 
                  key={sp.playerId} 
                  onClick={() => handlePlayerClick(sp.playerId)}
                  className={cn("flex justify-between items-center p-3 border hover:border-text-secondary transition-colors cursor-pointer group", 
                    selectedPlayerId === sp.playerId ? (sport === 'basketball' ? "border-amber-500 bg-amber-500/5" : "border-brand bg-brand/5") : "border-border bg-bg")}
                >
                  <div className="flex items-center gap-3">
                     {p.image ? (
                       <img src={p.image} className="w-8 h-8 rounded-full object-cover border border-border" alt="" />
                     ) : (
                       <div className="w-8 h-8 rounded-full border border-border bg-bg flex items-center justify-center">
                         <UserIcon size={14} className="text-text-muted" />
                        </div>
                     )}
                     <div>
                      <div className={cn("text-xs font-bold uppercase tracking-wide text-text-primary transition-colors", sport === 'basketball' ? "group-hover:text-amber-500" : "group-hover:text-brand")}>{p.name}</div>
                      <div className="text-[10px] font-mono text-text-secondary mt-1">{p.team} // {p.position}</div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <div className="text-xs font-mono tabular-data text-text-primary">€{p.price}m</div>
                    <button 
                      onClick={(e) => toggleReserveRole(e, sp.playerId)}
                      className="text-[9px] font-mono tracking-widest uppercase border border-border px-2 py-1 mt-1 hover:border-text-secondary transition-colors"
                    >
                      MOVE TO RESERVES
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RESERVES SECTION */}
        <div className="bg-surface border border-border flex flex-col h-[230px]">
          <div className="p-4 border-b border-border bg-bg/50 flex justify-between items-center">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary">RESERVES</h2>
            <span className="text-[10px] font-mono text-text-secondary">{squad?.players.filter(sp => !sp.isStarting && sp.role === 'roster').length} / 3</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 custom-scrollbar">
            {squad?.players.filter(sp => !sp.isStarting && sp.role === 'roster').map(sp => {
              const p = getPlayerDetails(sp.playerId);
              if (!p) return null;
              return (
                <div 
                  key={sp.playerId} 
                  onClick={() => handlePlayerClick(sp.playerId)}
                  className={cn("flex justify-between items-center p-3 border hover:border-text-secondary transition-colors cursor-pointer group", 
                    selectedPlayerId === sp.playerId ? (sport === 'basketball' ? "border-amber-500 bg-amber-500/5" : "border-brand bg-brand/5") : "border-border bg-bg")}
                >
                  <div className="flex items-center gap-3">
                     {p.image ? (
                       <img src={p.image} className="w-8 h-8 rounded-full object-cover border border-border" alt="" />
                     ) : (
                       <div className="w-8 h-8 rounded-full border border-border bg-bg flex items-center justify-center">
                         <UserIcon size={14} className="text-text-muted" />
                        </div>
                     )}
                     <div>
                      <div className={cn("text-xs font-bold uppercase tracking-wide text-text-primary transition-colors", sport === 'basketball' ? "group-hover:text-amber-500" : "group-hover:text-brand")}>{p.name}</div>
                      <div className="text-[10px] font-mono text-text-secondary mt-1">{p.team} // {p.position}</div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <div className="text-xs font-mono tabular-data text-text-primary">€{p.price}m</div>
                    <button 
                      onClick={(e) => toggleReserveRole(e, sp.playerId)}
                      className="text-[9px] font-mono tracking-widest uppercase border border-border px-2 py-1 mt-1 hover:border-text-secondary transition-colors"
                    >
                      MOVE TO BENCH
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    
      {selectedPlayerId && (
        <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border p-4 z-50 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
           {(() => {
             const sp = squad?.players.find(p => p.playerId === selectedPlayerId);
             const p = getPlayerDetails(selectedPlayerId);
             if (!sp || !p) return null;
             
             return (
               <>
                 <div className="flex items-center gap-4">
                   {p.image ? (
                     <img src={p.image} className="w-12 h-12 rounded-full border border-border object-cover" alt="" referrerPolicy="no-referrer" />
                   ) : (
                     <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center bg-bg"><UserIcon className="text-text-muted"/></div>
                   )}
                   <div>
                     <div className="font-bold uppercase tracking-widest text-text-primary text-sm">{p.name}</div>
                     <div className="text-xs font-mono text-text-secondary">{p.team} // {p.position}</div>
                   </div>
                 </div>
                 
                 <div className="flex flex-wrap items-center gap-2">
                   {sp.isStarting && (
                     <>
                       <button onClick={() => handleMakeCaptain(sp.playerId, false)} className="px-4 py-2 bg-bg border border-border text-[10px] font-bold uppercase tracking-widest hover:border-brand transition-colors text-text-primary">
                         Make Captain
                       </button>
                       {sport === 'football' && (
                         <button onClick={() => handleMakeCaptain(sp.playerId, true)} className="px-4 py-2 bg-bg border border-border text-[10px] font-bold uppercase tracking-widest hover:border-brand transition-colors text-text-primary">
                           Make Vice Captain
                         </button>
                       )}
                       <button onClick={() => handleMoveToBench(sp.playerId)} className="px-4 py-2 bg-red-500/10 border border-red-500/50 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-500/20 transition-colors">
                         Move to Bench
                       </button>
                     </>
                   )}
                   <button onClick={() => setSelectedPlayerId(null)} className="px-4 py-2 bg-text-primary text-bg text-[10px] font-bold uppercase tracking-widest hover:bg-text-secondary transition-colors ml-4">
                     Cancel Selection
                   </button>
                 </div>
               </>
             )
           })()}
        </div>
      )}
    </div>
  );
}
