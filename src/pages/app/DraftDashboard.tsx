import { apiFetch } from '../../lib/apiFetch';
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Users,    Trophy, Activity, ArrowLeftRight } from 'lucide-react';
import { cn } from '../../lib/utils';
// import AdBanner from '../../components/layout/AdBanner';

export default function DraftDashboard({ sport }: { sport: 'football' | 'basketball' }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
 
  const [draft, setDraft] = useState<any>(null);
  const [tab, setTab] = useState<'standings' | 'games' | 'rosters' | 'trades'>('standings');
  const [notification, setNotification] = useState<string | null>(null);

  const sportBg = sport === 'football' ? 'bg-brand' : 'bg-amber-500';
  const sportBorder = sport === 'football' ? 'border-brand' : 'border-amber-500';
  const sportText = sport === 'football' ? 'text-brand' : 'text-amber-500';

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchDraft = () => {
    apiFetch(`/api/drafts/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data || data.error) {
           showNotification("Draft not found");
        } else {
           setDraft(data);
        }
      });
  };

  useEffect(() => {
    fetchDraft();
    const inv = setInterval(fetchDraft, 5000);
    return () => clearInterval(inv);
  }, [id]);

  if (!draft) return <div className="p-12 text-center font-mono">Loading Draft...</div>;

  return (
    <div className="flex flex-col h-full gap-8 relative max-w-7xl mx-auto p-4 md:p-8">
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-bg border border-text-primary px-4 py-3 shadow-lg flex items-center gap-3 w-80 animate-in fade-in slide-in-from-top-4">
           <div className={`w-2 h-2 rounded-full ${sportBg}`} />
           <p className="text-xs font-mono uppercase text-text-primary flex-1 break-words">{notification}</p>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-text-primary uppercase tracking-tighter cursor-pointer" onClick={() => navigate(`/${sport}/dashboard/drafts`)}>
          &larr; {draft.name}
        </h1>
        <div className="flex gap-4 mt-2">
           <span className={`text-xs font-mono px-2 py-1 uppercase ${sportBg} text-bg font-bold`}>{draft.sport}</span>
           <span className="text-xs font-mono px-2 py-1 uppercase border border-border text-text-secondary">Scoring: {draft.scoringSystem || 'h2h'}</span>
           <span className="text-xs font-mono px-2 py-1 uppercase border border-border text-text-secondary">Roster: {draft.rosterConfig || 'consistent'}</span>
        </div>
      </div>
      
      <div className="flex border-b border-border overflow-x-auto no-scrollbar">
        {[
          { id: 'standings', label: 'Standings', icon: Trophy },
          { id: 'games', label: 'Games', icon: Activity },
          { id: 'rosters', label: 'Rosters', icon: Users },
          { id: 'trades', label: 'Trades', icon: ArrowLeftRight }
        ].map(t => (
          <button
            key={t.id}
 
            onClick={() => setTab(t.id as any)}
            className={cn(
              "px-6 py-4 font-mono text-xs uppercase tracking-widest font-bold whitespace-nowrap flex items-center gap-2",
              tab === t.id ? `border-b-2 ${sportBorder} ${sportText}` : "text-text-muted hover:text-text-primary"
            )}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'standings' && <StandingsTab draft={draft} sportText={sportText} sportBg={sportBg} />}
        {tab === 'games' && <GamesTab draft={draft} sportText={sportText} sportBg={sportBg} />}
        {tab === 'rosters' && <RostersTab draft={draft} sportText={sportText} sportBg={sportBg} sport={sport} />}
        {tab === 'trades' && <TradesTab draft={draft} user={user} sportText={sportText} sportBg={sportBg} onTradeUpdated={fetchDraft} showNotification={showNotification} />}
      </div>
    </div>
  );
}

 
 
function StandingsTab({ draft, sportText, _sportBg }: any) {
  // Calculate stats per member
 
  const memberStats = draft.members.map((m: any) => {
     let points = 0;
     let w = 0, d = 0, l = 0;
     
     // Rotisserie
     if (draft.scoringSystem === 'rotisserie') {
 
         points = m.roster.reduce((sum: number, p: any) => {
             // Fetch actual gameweek points cumulatively (goals, assists, clean sheets translated to fantasy points)
 
             const derived = p.fixtureHistory?.reduce((fs: number, f: any) => {
                 // For football let's say goals=4, assists=3, clean sheet=4
                 // For basketball points=1
                 let pts = f.points || 0;
                 if (f.goals) pts += f.goals * 4;
                 if (f.assists) pts += f.assists * 3;
                 if (f.cleanSheet) pts += 4;
                 return fs + pts;
             }, 0) || 0;
             
             // If fixture history is totally empty but player has total points in DB, fallback to their base totalPoints
             return sum + Math.max(derived, p.totalPoints || 0);
         }, 0);
     } else if (draft.scoringSystem === 'h2h' && draft.h2hSchedule) {
         // H2H
 
         draft.h2hSchedule.forEach((gw: any) => {
 
             gw.matches.forEach((match: any) => {
                 if (match.homeId === m.userId || match.awayId === m.userId) {
                     const isHome = match.homeId === m.userId;
                     const myScore = isHome ? match.homeScore : match.awayScore;
                     const oppScore = isHome ? match.awayScore : match.homeScore;
                     
                     // If both 0, assume it hasn't been played if gameweek > 1, 
                     // but for simplicity, we count any non-zero as played, or just sum it if there are real values.
                     // Actually let's assume if both are 0 it hasn't been played, to avoid counting 38 draws.
                     if (myScore !== 0 || oppScore !== 0) {
                         if (myScore > oppScore) w++;
                         else if (myScore < oppScore) l++;
                         else d++;
                         points += myScore; // total Points For as tie-breaker
                     }
                 }
             });
         });
     }
     
     return { ...m, points, w, d, l };
  });

 
 
  const standings = memberStats.sort((a: any, b: any) => {
      if (draft.scoringSystem === 'h2h') {
          const aTeamPts = a.w * 3 + a.d;
          const bTeamPts = b.w * 3 + b.d;
          if (aTeamPts !== bTeamPts) return bTeamPts - aTeamPts;
          return b.points - a.points; // PF tie-breaker
      }
      return b.points - a.points;
  });

  return (
    <div className="bg-surface border border-border p-6 rounded shadow max-w-4xl mx-auto">
       <h2 className="text-lg uppercase tracking-widest font-bold mb-6">League Standings</h2>
       <table className="w-full text-left">
         <thead className="border-b border-border text-[10px] uppercase font-mono text-text-muted">
           <tr>
             <th className="pb-3 w-16 px-4">Rank</th>
             <th className="pb-3">Manager</th>
             <th className="pb-3 text-right">Points / W-L</th>
           </tr>
         </thead>
         <tbody className="font-mono text-sm">
// eslint-disable-next-line @typescript-eslint/no-explicit-any
            {standings.map((m: any, i: number) => (
              <tr key={m.userId} className="border-b border-border/50 hover:bg-bg/50">
                <td className="py-4 px-4 font-bold">{i + 1}</td>
                <td className="py-4 flex flex-col justify-center">
                    <span>{m.email}</span>
                    {m.userId === draft.creatorId && <span className={`text-[10px] ${sportText} uppercase mt-1`}>Creator</span>}
                </td>
                <td className="py-4 text-right">
                    {draft.scoringSystem === 'h2h' 
                        ? `${m.w}-${m.d}-${m.l} (${m.w * 3 + m.d} Pts)` 
                        : `${m.points.toFixed(0)} pts`}
                </td>
              </tr>
            ))}
         </tbody>
       </table>
    </div>
  );
}

 
function GamesTab({ draft }: any) {
  if (draft.scoringSystem === 'rotisserie') return <div className="text-center font-mono py-12">No head-to-head games in Rotisserie mode.</div>;
  if (!draft.h2hSchedule) return <div className="text-center font-mono py-12">Schedule has not been generated yet.</div>;
  
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      {draft.h2hSchedule.map((gw: any) => (
         <div key={gw.gameweek}>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 border-b border-border pb-2">Gameweek {gw.gameweek}</h3>
            <div className="space-y-2">
// eslint-disable-next-line @typescript-eslint/no-explicit-any
               {gw.matches.map((m: any, idx: number) => {
 
                  const homeUser = draft.members.find((u: any) => u.userId === m.homeId);
 
                  const awayUser = draft.members.find((u: any) => u.userId === m.awayId);
                  return (
                      <div key={idx} className="flex items-center justify-between bg-surface p-4 border border-border">
                         <div className="w-1/3 text-right font-mono truncate">{m.homeId === 'BYE' ? 'BYE' : (homeUser ? homeUser.email : 'Unknown')}</div>
                         <div className="w-1/3 text-center font-bold font-mono">
                            {m.homeScore} - {m.awayScore}
                         </div>
                         <div className="w-1/3 text-left font-mono truncate">{m.awayId === 'BYE' ? 'BYE' : (awayUser ? awayUser.email : 'Unknown')}</div>
                      </div>
                  );
               })}
            </div>
         </div>
      ))}
    </div>
  );
}

 
function RostersTab({ draft, sport, sportBg }: any) {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      {draft.members.map((m: any) => (
         <div key={m.userId} className="bg-surface border border-border p-6">
            <h3 className="font-bold uppercase tracking-widest text-sm mb-4 border-b border-border pb-2 flex justify-between">
               <span>{m.email}</span>
               <span className="text-[10px] text-text-muted">{m.roster.length} Players</span>
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2 no-scrollbar">
// eslint-disable-next-line @typescript-eslint/no-explicit-any
              {m.roster.map((p: any) => (
                <div key={p.id} className="flex justify-between items-center bg-bg p-2 border border-border">
                  <div className="flex flex-col">
                     <span className="text-xs font-bold">{p.name}</span>
                     <span className="text-[9px] uppercase font-mono text-text-muted">{p.position} | {p.team}</span>
                  </div>
                  <span className="text-xs font-mono">{p.price}</span>
                </div>
              ))}
              {m.roster.length === 0 && <div className="text-[10px] font-mono text-text-muted py-2">Empty Roster</div>}
            </div>
            
            <button 
               onClick={() => navigate(`/${sport}/dashboard/squad?draftLeagueId=${draft.leagueId}&userId=${m.userId}`)}
               className={`w-full mt-4 text-[10px] uppercase tracking-widest font-bold py-2 ${sportBg} text-bg`}
            >
               View Full Pitch
            </button>
         </div>
      ))}
    </div>
  );
}

 
 
function TradesTab({ draft, user, _sportText, sportBg, onTradeUpdated, showNotification }: any) {
  const [proposing, setProposing] = useState(false);
  const [targetId, setTargetId] = useState('');
  const [offerIds, setOfferIds] = useState<string[]>([]);
  const [receiveIds, setReceiveIds] = useState<string[]>([]);

 
  const myRoster = draft.members.find((m: any) => m.userId === user?.id)?.roster || [];
 
  const targetRoster = draft.members.find((m: any) => m.userId === targetId)?.roster || [];

  const handlePropose = async () => {
    if (!targetId || offerIds.length === 0 || receiveIds.length === 0) {
      return showNotification("Select user and players to swap");
    }
    const res = await apiFetch(`/api/drafts/${draft.leagueId}/trades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
         initiatorId: user.id,
         targetId,
         offerPlayerIds: offerIds,
         receivePlayerIds: receiveIds
      })
    });
    const data = await res.json();
    if (res.ok) {
       showNotification(data.needsVote ? "Trade proposed. Awaiting league vote." : "Trade proposed. Waiting for target to accept.");
       setProposing(false);
       setTargetId('');
       setOfferIds([]);
       setReceiveIds([]);
       onTradeUpdated();
    } else {
       showNotification(data.error);
    }
  };

  const handleVote = async (tradeId: string, isFair: boolean) => {
    const res = await apiFetch(`/api/drafts/${draft.leagueId}/trades/${tradeId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user?.id, isFair })
    });
    const data = await res.json();
    if (res.ok) {
       showNotification("Vote casted");
       onTradeUpdated();
    } else {
       showNotification(data.error);
    }
  };

  const handleRespond = async (tradeId: string, action: 'accept' | 'reject') => {
     const res = await apiFetch(`/api/drafts/${draft.leagueId}/trades/${tradeId}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user?.id, action })
    });
    const data = await res.json();
    if (res.ok) {
       showNotification(`Trade ${action}ed!`);
       onTradeUpdated();
    } else {
       showNotification(data.error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
       <div className="flex justify-between items-center border-b border-border pb-4">
         <h2 className="uppercase font-bold tracking-widest text-sm">League Trades</h2>
         <button 
           onClick={() => setProposing(!proposing)}
           className={`px-4 py-2 font-mono text-[10px] font-bold uppercase ${sportBg} text-bg`}
         >
           {proposing ? 'Cancel Trade' : 'Propose Trade'}
         </button>
       </div>

       {proposing && (
         <div className="bg-surface border border-border p-6 mb-8">
           <h3 className="uppercase text-xs font-bold mb-4">New Trade Proposal</h3>
           <div className="mb-4">
             <label className="block text-[10px] font-mono uppercase mb-2">Trade Partner</label>
             <select 
               className="w-full bg-bg border border-border p-2 text-sm font-mono"
               value={targetId} onChange={e => { setTargetId(e.target.value); setReceiveIds([]); }}
             >
               <option value="">Select Manager</option>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
               {draft.members.filter((m: any) => m.userId !== user?.id).map((m: any) => (
                 <option key={m.userId} value={m.userId}>{m.email}</option>
               ))}
             </select>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <h4 className="text-[10px] font-mono uppercase border-b border-border pb-2 mb-2">You Give</h4>
                <div className="space-y-1">
// eslint-disable-next-line @typescript-eslint/no-explicit-any
                   {myRoster.map((p: any) => (
                     <label key={p.id} className="flex items-center gap-2 p-2 border border-border hover:bg-bg cursor-pointer">
                        <input type="checkbox" checked={offerIds.includes(p.id)} onChange={e => {
                           if (e.target.checked) setOfferIds([...offerIds, p.id]);
                           else setOfferIds(offerIds.filter(id => id !== p.id));
                        }} />
                        <span className="text-xs">{p.name} <span className="text-text-muted">(${p.price})</span></span>
                     </label>
                   ))}
                </div>
             </div>
             <div>
                <h4 className="text-[10px] font-mono uppercase border-b border-border pb-2 mb-2">You Get</h4>
                <div className="space-y-1">
// eslint-disable-next-line @typescript-eslint/no-explicit-any
                   {targetId ? targetRoster.map((p: any) => (
                     <label key={p.id} className="flex items-center gap-2 p-2 border border-border hover:bg-bg cursor-pointer">
                        <input type="checkbox" checked={receiveIds.includes(p.id)} onChange={e => {
                           if (e.target.checked) setReceiveIds([...receiveIds, p.id]);
                           else setReceiveIds(receiveIds.filter(id => id !== p.id));
                        }} />
                        <span className="text-xs">{p.name} <span className="text-text-muted">(${p.price})</span></span>
                     </label>
                   )) : <div className="text-[10px] text-text-muted font-mono">Select a partner first</div>}
                </div>
             </div>
           </div>

           <button 
             onClick={handlePropose}
             className={`w-full mt-6 py-3 font-mono font-bold uppercase tracking-widest text-[10px] ${sportBg} text-bg`}
           >
             Submit Proposal
           </button>
           <p className="text-[9px] font-mono text-text-muted text-center mt-2 leading-relaxed">
              Trades with a value difference &gt; 30% are automatically rejected.
              <br/>Trades with a difference &gt; 5% will trigger a league-wide voting process (Requires 75% approval).
           </p>
         </div>
       )}

       <div className="space-y-6">
// eslint-disable-next-line @typescript-eslint/no-explicit-any
          {(draft.trades || []).map((t: any) => {
 
             const initEmail = draft.members.find((m: any) => m.userId === t.initiatorId)?.email;
 
             const targEmail = draft.members.find((m: any) => m.userId === t.targetId)?.email;
             const hasIrrelevantApproval = t.status === 'voting' && t.votes && t.votes[user?.id || ''] !== undefined;

             return (
               <div key={t.id} className="border border-border p-4 bg-surface flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                     <p className="text-[10px] font-mono text-text-muted mb-2 uppercase">Status: <span className="font-bold text-text-primary">{t.status}</span></p>
                     <div className="flex items-center gap-4 mb-2">
                         <div className="flex-1 pr-4 border-r border-border">
                            <span className="text-xs font-bold">{initEmail} gets:</span>
                            <div className="text-[10px] font-mono text-text-muted mt-1">
// eslint-disable-next-line @typescript-eslint/no-explicit-any
                              {t.receive.map((p: any) => p.name).join(', ')}
                            </div>
                         </div>
                         <div className="flex-1 pl-4">
                            <span className="text-xs font-bold">{targEmail} gets:</span>
                            <div className="text-[10px] font-mono text-text-muted mt-1">
// eslint-disable-next-line @typescript-eslint/no-explicit-any
                              {t.offer.map((p: any) => p.name).join(', ')}
                            </div>
                         </div>
                     </div>
                  </div>
                  <div className="flex flex-col gap-2 min-w-[120px]">
                     {t.status === 'pending' && t.targetId === user?.id && (
                        <>
                           <button onClick={() => handleRespond(t.id, 'accept')} className={`w-full py-2 text-[10px] uppercase font-bold ${sportBg} text-bg tracking-widest hover:opacity-80`}>
                              Accept Trade
                           </button>
                           <button onClick={() => handleRespond(t.id, 'reject')} className="w-full py-2 text-[10px] uppercase font-bold border border-red-900/50 text-red-500 tracking-widest hover:bg-red-900/20">
                              Reject Trade
                           </button>
                        </>
                     )}
                     {t.status === 'voting' && user?.id !== t.initiatorId && user?.id !== t.targetId && !hasIrrelevantApproval && (
                        <>
                           <button onClick={() => handleVote(t.id, true)} className="w-full py-1.5 border border-border text-[10px] font-bold uppercase hover:bg-bg">
                              Vote Fair
                           </button>
                           <button onClick={() => handleVote(t.id, false)} className="w-full py-1.5 border border-red-900/50 text-red-500 text-[10px] font-bold uppercase hover:bg-red-900/20">
                              Vote Veto
                           </button>
                        </>
                     )}
                     {t.status === 'voting' && hasIrrelevantApproval && (
                        <div className="text-[10px] font-mono uppercase text-center border border-border py-2 px-4 whitespace-nowrap">Vote Casted</div>
                     )}
                  </div>
               </div>
             )
          })}
          {(!draft.trades || draft.trades.length === 0) && (
            <div className="text-center font-mono text-[10px] py-12 text-text-muted border border-dashed border-border uppercase">
               No active or historical trades.
            </div>
          )}
       </div>
    </div>
  );
}
