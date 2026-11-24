import { apiFetch } from '../../lib/apiFetch';
import { useState, useMemo } from 'react';
import { useCmsStore, Round } from '../../store/cmsStore';
import { Save, Link as LinkIcon, RefreshCcw, Search, Edit, Plus, Trash } from 'lucide-react';
import { cn } from '../../lib/utils';
import {  PlayerStats } from '../../types';
import { db } from '../../services/api';
import { Parser } from 'expr-eval';

export default function AdminStats() {
  const cms = useCmsStore();
  
  const sport = 'basketball';
  const players = cms.players.filter(p => p.sport === sport);
  
  const rounds = cms.rounds?.filter(r => r.sport === sport) || [];
  const [selectedRoundId, setSelectedRoundId] = useState<string>(rounds[0]?.id || '');

  const [fibaLink, setFibaLink] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [unmatchedFIBA, setUnmatchedFIBA] = useState<any[]>([]);
  const [mappingPlayer, setMappingPlayer] = useState<string | null>(null);
  
  // This holds our active editing session for the selected round
  const [tempStats, setTempStats] = useState<Record<string, PlayerStats>>({});

  // When changing round, we'd normally load stats. For this standalone preview we just clear them.
  const handleSelectRound = (id: string) => {
     setSelectedRoundId(id);
     
     // Auto-load stats from players if they exist:
     const loaded: Record<string, PlayerStats> = {};
     players.forEach(p => {
       if (p.statsHistory && p.statsHistory[id]) {
         loaded[p.id] = p.statsHistory[id];
       }
     });
     setTempStats(loaded);
     setUnmatchedFIBA([]);
  };

  const selectedRound = rounds.find(r => r.id === selectedRoundId);

  const handleCreateRound = () => {
    const newRound: Round = {
      id: `r-${Date.now()}`,
      name: `Gameweek ${rounds.length + 1}`,
      sport: 'basketball',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      isComplete: false
    };
    cms.addRound(newRound);
    setSelectedRoundId(newRound.id);
  };

  const normalizeName = (name: string | undefined | null) => {
    if (!name) return "";
    return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  const normalizedPlayers = useMemo(() => {
    return players.map(p => ({
      ...p,
      normalizedName: normalizeName(p.name)
    }));
  }, [players]);

  const handleExtract = async () => {
    if (!fibaLink) return;
    setIsExtracting(true);
    setUnmatchedFIBA([]);
    
    try {
      const res = await apiFetch('/api/fiba/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: fibaLink })
      });
      
      if (!res.ok) {
        throw new Error("Failed to fetch data from FIBA");
      }
      
      const data = await res.json();
      const mockExtracted = { ...tempStats };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unmatched: any[] = [];
      
      // Parse players from both teams
      if (data.tm) {
        Object.keys(data.tm).forEach(teamKey => {
          const team = data.tm[teamKey];
          if (team.pl) {
            Object.keys(team.pl).forEach(plKey => {
              const pData = team.pl[plKey];
              const fullname = pData.firstName && pData.familyName ? `${pData.firstName} ${pData.familyName}` : '';
              
              // Find matching player in CMS by name, shortName, or fibaId
              const pNames = [pData.name, pData.nameInternational, pData.scoreboardName, fullname]
                .filter(Boolean)
                .map(n => normalizeName(n as string));

              const match = normalizedPlayers.find(p => 
                (p.fibaId && p.fibaId === pData.name) ||
                pNames.includes(p.normalizedName)
              );
              
              let mins = 0;
              if (pData.sMinutes && pData.sMinutes.includes(':')) {
                mins = parseInt(pData.sMinutes.split(':')[0], 10);
              }
              
              const st = {
                points: pData.sPoints || 0,
                rebounds: pData.sReboundsTotal || 0,
                assists: pData.sAssists || 0,
                steals: pData.sSteals || 0,
                blocks: pData.sBlocks || 0,
                turnovers: pData.sTurnovers || 0,
                minutes: mins,
                fgMade: pData.sFieldGoalsMade || 0,
                fgAtt: pData.sFieldGoalsAttempted || 0,
              };

              if (match) {
                 mockExtracted[match.id] = st;
              } else {
                 unmatched.push({
                   fibaName: pData.name || pData.scoreboardName || fullname,
                   teamName: team.name,
                   position: pData.playingPosition,
                   stats: st,
                   raw: pData
                 });
              }
            });
          }
        });
      }
      
      setTempStats(mockExtracted);
      setUnmatchedFIBA(unmatched);
      if (unmatched.length > 0) {
        alert(`Extracted data! ${Object.keys(mockExtracted).length} players matched. ${unmatched.length} players from FIBA didn't match existing CMS players.`);
      }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert("Error extracting FIBA stats: " + err.message);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleStatChange = (playerId: string, field: keyof PlayerStats, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    setTempStats(prev => ({
      ...prev,
      [playerId]: {
        ...(prev[playerId] || { points:0, rebounds:0, assists:0, steals:0, blocks:0, turnovers:0, minutes:0 }),
        [field]: numValue
      }
    }));
  };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMapUnmatched = (unmatchedPl: any, cmsPlayerId: string) => {
    cms.updatePlayer(cmsPlayerId, { fibaId: unmatchedPl.fibaName });
    setTempStats(prev => ({
      ...prev,
      [cmsPlayerId]: unmatchedPl.stats
    }));
    setUnmatchedFIBA(prev => prev.filter(p => p !== unmatchedPl));
    setMappingPlayer(null);
  };
  
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCreateFromUnmatched = (unmatchedPl: any) => {
    const newId = `p-auto-${Date.now()}`;
    // Provide a simple mapping
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    let primaryBase: any = 'SG';
    if(unmatchedPl.position === 'PG') primaryBase = 'PG';
    if(unmatchedPl.position === 'SF') primaryBase = 'SF';
    if(unmatchedPl.position === 'PF') primaryBase = 'PF';
    if(unmatchedPl.position === 'C') primaryBase = 'C';

    cms.addPlayer({
      id: newId,
      name: unmatchedPl.fibaName,
      team: unmatchedPl.teamName,
      position: primaryBase,
      price: 5.0,
      totalPoints: 0,
      status: 'available',
      fixtureHistory: [],
      sport: 'basketball',
      basketballPosDetail: {
        type: 'fixed',
        primary: primaryBase,
        label: unmatchedPl.position || 'SG',
      },
      fibaId: unmatchedPl.fibaName
    });
    setTempStats(prev => ({
      ...prev,
      [newId]: unmatchedPl.stats
    }));
    setUnmatchedFIBA(prev => prev.filter(p => p !== unmatchedPl));
  };

  const handleSave = () => {
    if (!selectedRoundId) return;
    const formulaStr = cms.priceFormulas?.find(f => f.sport === 'basketball')?.formula;
    const parser = new Parser();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    let expr: any = null;
    if (formulaStr) {
       try { expr = parser.parse(formulaStr); } catch (e) { console.error(e); }
    }

    Object.entries(tempStats).forEach(([playerId, stats]) => {
      cms.addPlayerStats(playerId, selectedRoundId, stats);
      
      let fantasyPts = 0;
      if (expr) {
          try {
             fantasyPts = expr.evaluate({
                points: stats.points || 0,
                rebounds: stats.rebounds || 0,
                assists: stats.assists || 0,
                steals: stats.steals || 0,
                blocks: stats.blocks || 0,
                turnovers: stats.turnovers || 0,
                fgMade: stats.fgMade || 0,
                fgAtt: stats.fgAtt || 0,
                ftMade: stats.ftMade || 0,
                ftAtt: stats.ftAtt || 0,
                threePMade: stats.threePMade || 0,
                threePAtt: stats.threePAtt || 0,
                minutes: stats.minutes || 0
             });
          } catch(e) { console.error("Formula Eval Error", e); }
      } else {
         fantasyPts = (stats.points || 0) * 1 + (stats.rebounds || 0) * 1.2 + (stats.assists || 0) * 1.5 + ((stats.blocks || 0) + (stats.steals || 0)) * 3 - (stats.turnovers || 0) * 1;
      }
      
      const player = cms.players.find(p => p.id === playerId);
      if (player) {
         cms.updatePlayer(playerId, { totalPoints: player.totalPoints + fantasyPts });
      }
    });

    alert(`Stats saved for ${selectedRound?.name} successfully and player total points updated!`);
  };

  const [isCompleting, setIsCompleting] = useState(false);
  const handleCompleteGameweek = async () => {
    if (!selectedRound) return;
    if (selectedRound.isComplete) {
       alert("This gameweek is already completed.");
       return;
    }
    
    setIsCompleting(true);
    
    // Auto-save stats first
    handleSave();
    
    // Now apply points to all squads
    const squads = await db.getAllSquads();
    const basketSquads = squads.filter(s => s.sport === sport);
    
    const formulaStr = cms.priceFormulas?.find(f => f.sport === sport)?.formula;
    const parser = new Parser();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    let expr: any = null;
    if (formulaStr) {
       try { expr = parser.parse(formulaStr); } catch (e) { console.error(e); }
    }

    for (const squad of basketSquads) {
       let gameweekPoints = 0;
       
       for (const sp of squad.players) {
          if (!sp.isStarting) continue; // Bench players don't score
          
          const stats = tempStats[sp.playerId];
          if (stats) {
             let fantasyPts = 0;
             if (expr) {
                 try {
                    fantasyPts = expr.evaluate({
                       points: stats.points || 0,
                       rebounds: stats.rebounds || 0,
                       assists: stats.assists || 0,
                       steals: stats.steals || 0,
                       blocks: stats.blocks || 0,
                       turnovers: stats.turnovers || 0,
                       fgMade: stats.fgMade || 0,
                       fgAtt: stats.fgAtt || 0,
                       ftMade: stats.ftMade || 0,
                       ftAtt: stats.ftAtt || 0,
                       threePMade: stats.threePMade || 0,
                       threePAtt: stats.threePAtt || 0,
                       minutes: stats.minutes || 0
                    });
                 } catch(e) { console.error("Formula Eval Error", e); }
             } else {
                 fantasyPts = (stats.points || 0) * 1 + (stats.rebounds || 0) * 1.2 + (stats.assists || 0) * 1.5 + ((stats.blocks || 0) + (stats.steals || 0)) * 3 - (stats.turnovers || 0) * 1;
             }
             
             let multiplier = 1;
             if (sp.isCaptain) {
                if ((stats.minutes || 0) > 0) {
                    multiplier = 2;
                }
             } else if (sp.isViceCaptain) {
                const captain = squad.players.find(p => p.isCaptain);
                if (captain) {
                    const capStats = tempStats[captain.playerId];
                    if (!capStats || (capStats.minutes || 0) === 0) {
                        multiplier = 2; // Vice captain takes over
                    }
                } else {
                    multiplier = 2; // No captain defined, vice gets it
                }
             }
             
             fantasyPts *= multiplier;
             
             gameweekPoints += fantasyPts;
          }
       }
       
       await db.updateSquad(squad.id, { totalPoints: squad.totalPoints + gameweekPoints });
    }
    
    // Mark round complete
    cms.updateRound(selectedRound.id, { isComplete: true });
    setIsCompleting(false);
    alert(`Gameweek ${selectedRound.name} closed successfully! Squad points have been updated.`);
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-full animate-in fade-in pb-20 text-text-primary">
      <div className="flex justify-between items-end mb-8">
        <div>
           <h2 className="text-3xl font-bold uppercase tracking-tighter mb-1">Stats & Rounds Manager</h2>
           <p className="text-xs font-mono text-text-secondary uppercase tracking-widest">
             Gather per-round data to power fantasy accumulation
           </p>
        </div>
        <div className="flex gap-4">
          <button 
             onClick={handleSave}
             disabled={!selectedRoundId || selectedRound?.isComplete}
             className="flex items-center gap-2 px-6 py-2 border border-amber-500 text-amber-500 font-bold font-mono text-xs uppercase tracking-widest hover:bg-amber-500/10 transition-colors bg-surface disabled:opacity-50"
           >
             <Save size={14} /> Save Stats
           </button>
           <button 
             onClick={handleCompleteGameweek}
             disabled={!selectedRoundId || selectedRound?.isComplete || isCompleting}
             className="flex items-center gap-2 px-6 py-2 text-bg font-bold font-mono text-xs uppercase tracking-widest hover:bg-opacity-90 transition-colors bg-amber-500 hover:text-bg disabled:opacity-50"
           >
             <RefreshCcw size={14} className={cn(isCompleting && "animate-spin")} /> {selectedRound?.isComplete ? 'Gameweek Closed' : 'Close Gameweek'}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
         <div className="lg:col-span-1 border border-border bg-surface p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center mb-2">
               <h3 className="font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                 Rounds / Gameweeks
               </h3>
               <button onClick={handleCreateRound} className="w-6 h-6 flex items-center justify-center bg-bg border border-border text-amber-500 hover:bg-amber-500 hover:text-bg transition-colors">
                  <Plus size={14} />
               </button>
            </div>
            
            <div className="flex flex-col gap-2">
              {rounds.map(r => (
                 <button 
                   key={r.id} 
                   onClick={() => handleSelectRound(r.id)}
                   className={cn("px-4 py-3 text-left border text-xs font-mono font-bold uppercase tracking-widest transition-colors", 
                     selectedRoundId === r.id ? "border-amber-500 bg-amber-500/10 text-amber-500" : "border-border bg-bg text-text-secondary hover:border-amber-500/50 hover:text-text-primary"
                   )}
                 >
                   <div>{r.name}</div>
                   <div className="text-[10px] text-text-muted mt-1">{r.startDate} to {r.endDate}</div>
                 </button>
              ))}
              {rounds.length === 0 && (
                <div className="text-[10px] font-mono text-text-muted mt-4 border border-dashed border-border p-4 text-center">No rounds created.</div>
              )}
            </div>

            {selectedRoundId && (
              <>
                <h3 className="font-bold uppercase tracking-widest text-sm flex items-center gap-2 mt-6 pt-6 border-t border-border">
                   <LinkIcon size={16} className="text-amber-500" />
                   FIBA Auto-Sync
                </h3>
                <p className="text-[10px] font-mono text-text-secondary">
                  Paste a dcd.shared.geniussports.com link to extract stats for this round directly from FIBA LiveStats. Note: This simulates extraction for demo purposes.
                </p>
                <input 
                  type="text" 
                  placeholder="https://fibalivestats.dcd.shared.geniussports..."
                  value={fibaLink}
                  onChange={e => setFibaLink(e.target.value)}
                  className="w-full bg-bg border border-border px-4 py-2 text-[10px] font-mono focus:outline-none focus:border-amber-500 transition-colors text-text-primary"
                />
                <button 
                   onClick={handleExtract}
                   disabled={isExtracting || !fibaLink}
                   className="w-full flex justify-center items-center gap-2 py-3 bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500 hover:text-bg transition-colors font-bold tracking-widest uppercase text-xs disabled:opacity-50"
                >
                   {isExtracting ? <RefreshCcw size={14} className="animate-spin" /> : <Search size={14} />}
                   {isExtracting ? 'Extracting...' : 'Fetch FIBA Data'}
                </button>
              </>
            )}
         </div>
         
         <div className="lg:col-span-3 border border-border bg-surface p-6">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                  <Edit size={16} className="text-amber-500" />
                  {selectedRound ? `Edit Details: ${selectedRound.name}` : 'Select a round to edit'}
                </h3>
                {selectedRound && (
                  <button onClick={() => { cms.deleteRound(selectedRound.id); setSelectedRoundId(rounds[0]?.id || '') }} className="text-[10px] font-mono hover:text-danger flex items-center gap-1 transition-colors uppercase tracking-widest">
                    <Trash size={12}/> Delete Round
                  </button>
                )}
             </div>

             {!selectedRound ? (
               <div className="p-12 text-center text-[10px] font-mono uppercase tracking-widest text-text-muted border border-dashed border-border bg-bg">
                 Please select or create a round.
               </div>
             ) : (
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse min-w-[600px]">
                   <thead>
                     <tr className="border-b border-border/50 text-[10px] font-mono text-text-secondary uppercase tracking-widest">
                       <th className="py-2 px-2 font-medium w-48">Player</th>
                       <th className="py-2 px-2 font-medium w-16 text-center">PTS</th>
                       <th className="py-2 px-2 font-medium w-16 text-center">REB</th>
                       <th className="py-2 px-2 font-medium w-16 text-center">AST</th>
                       <th className="py-2 px-2 font-medium w-16 text-center">STL</th>
                       <th className="py-2 px-2 font-medium w-16 text-center">BLK</th>
                       <th className="py-2 px-2 font-medium w-16 text-center">TOV</th>
                       <th className="py-2 px-2 font-medium w-16 text-center">MIN</th>
                     </tr>
                   </thead>
                   <tbody>
                     {players.map(player => {
                       const currentStats = tempStats[player.id] || {};
                       // Check if this player has stats loaded either from history or temp
                       const hasStats = Object.keys(currentStats).length > 0;
                       return (
                         <tr key={player.id} className={cn("border-b border-border/50 hover:bg-bg/50", hasStats ? "bg-amber-500/5" : "")}>
                           <td className="py-3 px-2">
                             <div className="font-bold text-[10px] uppercase tracking-wider">{player.name}</div>
                             <div className="text-[8px] font-mono text-text-muted">{player.team}</div>
                           </td>
                           <td className="py-2 px-2">
                             <input type="number" 
                               className="w-12 bg-bg border border-border px-1 py-1 text-xs tabular-nums text-center focus:border-amber-500 focus:outline-none" 
                               value={currentStats.points ?? ''} 
                               onChange={e => handleStatChange(player.id, 'points', e.target.value)} 
                             />
                           </td>
                           <td className="py-2 px-2">
                             <input type="number" 
                               className="w-12 bg-bg border border-border px-1 py-1 text-xs tabular-nums text-center focus:border-amber-500 focus:outline-none" 
                               value={currentStats.rebounds ?? ''} 
                               onChange={e => handleStatChange(player.id, 'rebounds', e.target.value)} 
                             />
                           </td>
                           <td className="py-2 px-2">
                             <input type="number" 
                               className="w-12 bg-bg border border-border px-1 py-1 text-xs tabular-nums text-center focus:border-amber-500 focus:outline-none" 
                               value={currentStats.assists ?? ''} 
                               onChange={e => handleStatChange(player.id, 'assists', e.target.value)} 
                             />
                           </td>
                           <td className="py-2 px-2">
                             <input type="number" 
                               className="w-12 bg-bg border border-border px-1 py-1 text-xs tabular-nums text-center focus:border-amber-500 focus:outline-none" 
                               value={currentStats.steals ?? ''} 
                               onChange={e => handleStatChange(player.id, 'steals', e.target.value)} 
                             />
                           </td>
                           <td className="py-2 px-2">
                             <input type="number" 
                               className="w-12 bg-bg border border-border px-1 py-1 text-xs tabular-nums text-center focus:border-amber-500 focus:outline-none" 
                               value={currentStats.blocks ?? ''} 
                               onChange={e => handleStatChange(player.id, 'blocks', e.target.value)} 
                             />
                           </td>
                           <td className="py-2 px-2">
                             <input type="number" 
                               className="w-12 bg-bg border border-border px-1 py-1 text-xs tabular-nums text-center focus:border-amber-500 focus:outline-none" 
                               value={currentStats.turnovers ?? ''} 
                               onChange={e => handleStatChange(player.id, 'turnovers', e.target.value)} 
                             />
                           </td>
                           <td className="py-2 px-2">
                             <input type="number" 
                               className="w-12 bg-bg border border-border px-1 py-1 text-xs tabular-nums text-center focus:border-amber-500 focus:outline-none" 
                               value={currentStats.minutes ?? ''} 
                               onChange={e => handleStatChange(player.id, 'minutes', e.target.value)} 
                             />
                           </td>
                         </tr>
                       );
                     })}
                   </tbody>
                 </table>
               </div>
             )}

             {unmatchedFIBA.length > 0 && (
               <div className="mt-8 border-t border-border pt-6">
                 <h3 className="font-bold uppercase tracking-widest text-sm text-amber-500 mb-4 flex items-center gap-2">
                   Unmatched FIBA Players ({unmatchedFIBA.length})
                 </h3>
                 <p className="text-[10px] font-mono text-text-secondary mb-4">
                   These players were found in the FIBA link but did not match any players in your CMS. Map them or add them automatically to bring in their stats.
                 </p>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {unmatchedFIBA.map((up, idx) => (
                     <div key={idx} className="border border-border bg-bg p-3 flex flex-col gap-2">
                       <div className="flex justify-between items-start mb-2">
                         <div>
                           <input 
                             className="w-full bg-surface border border-border px-1 py-0.5 text-xs font-bold uppercase tracking-wider mb-1 text-text-primary focus:border-amber-500 focus:outline-none"
                             value={up.fibaName}
                             onChange={(e) => {
                               const newArr = [...unmatchedFIBA];
                               newArr[idx].fibaName = e.target.value;
                               setUnmatchedFIBA(newArr);
                             }}
                           />
                           <div className="text-[10px] font-mono text-text-muted">{up.teamName} • {up.position}</div>
                         </div>
                         <div className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-1 uppercase tracking-widest font-mono">
                           {up.stats.points} PTS
                         </div>
                       </div>
                       
                       {mappingPlayer === up.fibaName ? (
                         <div className="flex flex-col gap-2">
                           <select 
                             className="w-full bg-surface border border-border px-2 py-1 text-[10px] font-mono"
                             onChange={(e) => handleMapUnmatched(up, e.target.value)}
                           >
                             <option value="">Select CMS Player...</option>
                             {players.filter(p => !p.fibaId).map(p => (
                               <option key={p.id} value={p.id}>{p.name} ({p.team})</option>
                             ))}
                           </select>
                           <button onClick={() => setMappingPlayer(null)} className="text-[10px] text-text-muted hover:text-text-primary text-left">Cancel</button>
                         </div>
                       ) : (
                         <div className="flex gap-2">
                           <button 
                             onClick={() => setMappingPlayer(up.fibaName)}
                             className="flex-1 bg-surface border border-border px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest font-mono hover:border-amber-500 transition-colors"
                           >
                             Map to existing
                           </button>
                           <button 
                             onClick={() => handleCreateFromUnmatched(up)}
                             className="flex-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest font-mono hover:bg-amber-500 hover:text-bg transition-colors"
                           >
                             Create New
                           </button>
                         </div>
                       )}
                     </div>
                   ))}
                 </div>
               </div>
             )}
         </div>
      </div>
    </div>
  );
}
