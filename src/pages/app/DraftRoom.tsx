import { apiFetch } from '../../lib/apiFetch';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Shield,  Clock } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import AdBanner from '../../components/layout/AdBanner';
import { FantasyEngine } from '../../services/engine/fantasyEngine';

export default function DraftRoom() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [socket, setSocket] = useState<Socket | null>(null);
 
  const [roomState, setRoomState] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  
  // Filters
  const [filterPosition, setFilterPosition] = useState<string>('ALL');
  const [filterTeam, setFilterTeam] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL'); // ALL, LOCAL, IMPORT
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [customBid, setCustomBid] = useState<number | ''>('');

  // Idle tracking
  const lastActivityRef = useRef<number>(Date.now());
  const popupStateRef = useRef(false);
  const [showIdlePopup, setShowIdlePopup] = useState(false);
  const [idleSecondsLeft, setIdleSecondsLeft] = useState(5);
 
  const amAutoBid = roomState?.members.find((m: any) => m.userId === user?.id)?.isAutoBid;

  useEffect(() => {
    if (!roomState || !user || !socket || roomState.status !== 'drafting') return;
    const idleTimeTotal = (roomState.idleTime || 30) * 1000;
    const popupDuration = 5000;
    
    const interval = setInterval(() => {
      if (amAutoBid) {
         if (showIdlePopup) {
           setShowIdlePopup(false);
           popupStateRef.current = false;
         }
         return;
      }
      
      const timeSinceActivity = Date.now() - lastActivityRef.current;
      
      if (timeSinceActivity > idleTimeTotal + popupDuration) {
         socket.emit('toggle_auto_bid', { draftId: id, userId: user.id, isAutoBid: true });
         setShowIdlePopup(false);
         popupStateRef.current = false;
         lastActivityRef.current = Date.now(); // reset so it doesn't instantly retrigger if turned off
      } else if (timeSinceActivity > idleTimeTotal) {
         setShowIdlePopup(true);
         popupStateRef.current = true;
         setIdleSecondsLeft(Math.ceil(((idleTimeTotal + popupDuration) - timeSinceActivity) / 1000));
      } else {
         setShowIdlePopup(false);
         popupStateRef.current = false;
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [roomState?.idleTime, roomState?.status, amAutoBid, user, socket, id, showIdlePopup]);

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;
    const handleActivity = () => {
      if (popupStateRef.current) return; // don't reset if popup is waiting
      if (timeout) return;
      timeout = setTimeout(() => {
        lastActivityRef.current = Date.now();
        timeout = null;
      }, 500);
    };
    
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('scroll', handleActivity, { capture: true, passive: true });
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity, { passive: true });
    
    return () => {
      if (timeout) clearTimeout(timeout);
      window.removeEventListener('mousemove', handleActivity);
 
      window.removeEventListener('scroll', handleActivity, { capture: true } as any);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, []);

  const confirmPresence = () => {
    lastActivityRef.current = Date.now();
    setShowIdlePopup(false);
    popupStateRef.current = false;
  };

  useEffect(() => {
    if (!user || !id) return;
    
    // Auto-detect production port or dev port (usually on same host)
    const newSocket = io();
    
    newSocket.on('connect', () => {
      newSocket.emit('join_draft', { draftId: id, userId: user.id, email: user.email });
    });
    
    newSocket.on('draft_state_update', (state) => {
      setRoomState(state);
      setTimeLeft(state.timeLeft);
    });
    
    newSocket.on('draft_timer_sync', ({ timeLeft }) => {
      setTimeLeft(timeLeft);
    });
    
    newSocket.on('draft_error', (err) => {
      alert(err.message);
      const sportUrl = window.location.pathname.split('/')[1] || 'basketball';
      navigate(`/${sportUrl}/dashboard/drafts`);
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.disconnect();
    };
  }, [id, user]);

  const handleStart = async () => {
    try {
      const res = await apiFetch('/api/drafts/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftId: id, userId: user?.id })
      });
      if (!res.ok) {
        const error = await res.json();
        alert("Failed to start draft: " + error.error);
      }
    } catch(e) {
      console.error(e);
    }
  };

  const handleBid = (amount: number) => {
    if (socket && user && amMember && roomState?.currentPlayerOut) {
      const result = FantasyEngine.validateDraftPick(amMember.roster, roomState.currentPlayerOut, roomState.sport);
      if (!result.valid) {
        alert(result.reason);
        return;
      }
      socket.emit('place_bid', { draftId: id, userId: user.id, amount });
    }
  };

  const handleFold = () => {
    if (socket && user) {
      socket.emit('fold_bid', { draftId: id, userId: user.id });
    }
  };

  const handleToggleAutoBid = () => {
    if (socket && user) {
      socket.emit('toggle_auto_bid', { draftId: id, userId: user.id, isAutoBid: !amAutoBid });
    }
  };

  const handleToggleShortlist = (playerId: string) => {
    if (socket && user && amMember) {
      const currentShortlist = amMember.shortlist || [];
      const newShortlist = currentShortlist.includes(playerId)
        ? currentShortlist.filter((id: string) => id !== playerId)
        : [...currentShortlist, playerId];
      socket.emit('update_shortlist', { draftId: id, userId: user.id, shortlist: newShortlist });
    }
  };

  const handleSnakePick = (playerId: string) => {
    if (socket && user && amMember) {
 
      const playerObj = roomState.playerPool.find((p: any) => p.id === playerId);
      if (playerObj) {
        const result = FantasyEngine.validateDraftPick(amMember.roster, playerObj, roomState.sport);
        if (!result.valid) {
          alert(`Cannot pick: ${result.reason}`);
          return;
        }
        socket.emit('snake_pick', { draftId: id, userId: user.id, playerId });
      }
    }
  };

  const filteredPool = useMemo(() => {
    if (!roomState?.playerPool) return [];
 
    return roomState.playerPool.filter((p: any) => {
      if (filterPosition !== 'ALL' && p.position !== filterPosition) return false;
      if (filterTeam !== 'ALL' && p.team !== filterTeam) return false;
      if (filterType === 'LOCAL' && p.isImport) return false;
      if (filterType === 'IMPORT' && !p.isImport) return false;
      if (maxPrice !== '' && p.price > maxPrice) return false;
      return true;
    });
  }, [roomState?.playerPool, filterPosition, filterTeam, filterType, maxPrice]);

 
  const uniquePositions = useMemo(() => Array.from(new Set(roomState?.playerPool?.map((p: any) => p.position) || [])), [roomState?.playerPool]);
 
  const uniqueTeams = useMemo(() => Array.from(new Set(roomState?.playerPool?.map((p: any) => p.team) || [])).filter(Boolean), [roomState?.playerPool]);

  if (!roomState) return <div className="p-12 text-center text-text-muted animate-pulse">Loading Draft Room...</div>;

  
  const maxRosterSize = roomState.sport === 'football' ? 25 : 15;
  const isFb = roomState.sport === 'football';
  const cText = isFb ? 'text-brand' : 'text-amber-500';
  const cBg = isFb ? 'bg-brand' : 'bg-amber-500';
  const cBorder = isFb ? 'border-brand' : 'border-amber-500';
  const cShadowS = isFb ? 'shadow-[0_0_10px_rgba(38,182,177,0.2)]' : 'shadow-[0_0_10px_rgba(245,158,11,0.2)]';
  const cShadowL = isFb ? 'shadow-[0_0_50px_-12px_rgba(38,182,177,0.2)]' : 'shadow-[0_0_50px_-12px_rgba(245,158,11,0.2)]';
  const cShadowA = isFb ? 'shadow-[0_0_20px_rgba(38,182,177,0.3)]' : 'shadow-[0_0_20px_rgba(245,158,11,0.3)]';
  const bgGrad = isFb ? 'before:bg-[radial-gradient(ellipse_at_center,rgba(38,182,177,0.15),transparent_70%)]' : 'before:bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.15),transparent_70%)]';

  const getRosterSlotLabel = (idx: number) => {
    if (roomState.sport === 'football') {
       if (idx < 11) return 'STARTER';
       if (idx >= 11 && idx < 19) return 'BENCH';
       return 'RESERVE';
    }
    if (idx === 0) return 'PG';
    if (idx === 1) return 'SG';
    if (idx === 2) return 'SF';
    if (idx === 3) return 'PF';
    if (idx === 4) return 'C';
    if (idx >= 5 && idx <= 11) return 'BENCH';
    return 'RESERVE';
  };

 
  const amMember = roomState.members.find((m: any) => m.userId === user?.id);
  const isCreator = roomState.creatorId === user?.id;

  const maxPossibleBid = amMember ? amMember.budget - (maxRosterSize - amMember.roster.length - 1) : 0;
  
 
  const currentImports = amMember?.roster.filter((p: any) => p && p.isImport).length || 0;
  const isCurrentPlayerImport = roomState.currentPlayerOut?.isImport;
  const wouldExceedImports = isCurrentPlayerImport && currentImports >= 3;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 relative">
      {showIdlePopup && (
        <div className="fixed inset-0 z-50 bg-bg/80 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-surface border ${cBorder} p-8 max-w-sm w-full text-center ${cShadowS}">
              <h2 className="text-xl font-bold uppercase tracking-widest ${cText} mb-4">Are you still there?</h2>
              <p className="font-mono text-xs text-text-secondary mb-6">
                 No activity detected. Auto-bid will be enabled in <span className="font-bold text-white text-lg">{idleSecondsLeft}</span> seconds.
              </p>
              <button 
                onClick={confirmPresence}
                className="w-full bg-orange-500 text-bg py-3 font-bold uppercase tracking-widest hover:bg-orange-400 transition-colors"
              >
                I'm still here
              </button>
           </div>
        </div>
      )}
      <AdBanner />
      <div className="flex justify-between items-center mb-8 bg-surface p-6 border border-border">
        <div>
          <h1 className={`font-bold text-3xl uppercase tracking-tighter ${cText}`}>{roomState.name}</h1>
          <p className="text-sm font-mono text-text-secondary mt-2">
            Status: <span className="text-text-primary px-2 py-1 bg-bg/50 uppercase tracking-widest">{roomState.status}</span>
          </p>
        </div>
        
        {roomState.status === 'pending' && isCreator && (
           <button 
             onClick={handleStart}
             className={`${cBg} text-bg px-6 py-3 font-bold uppercase tracking-widest text-sm`}
           >
             Start Draft Now
           </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-surface border border-border p-4">
             <h3 className="font-bold uppercase tracking-widest text-xs mb-4 text-text-secondary">Members ({roomState.members.length}/{roomState.maxTeams})</h3>
             <ul className="flex flex-col gap-2">
// eslint-disable-next-line @typescript-eslint/no-explicit-any
               {roomState.members.map((m: any) => {
                 const isHighest = roomState.highestBid?.userId === m.userId;
                  const isOut = roomState.outUsers?.includes(m.userId);
                  const isActiveSnake = roomState.draftType === 'snake' && roomState.status === 'drafting' && roomState.currentSnakeRoute?.[roomState.currentSnakeIndex || 0]?.userId === m.userId;
                  const lastPick = m.roster?.[m.roster.length - 1];
                  return (
                  <li key={m.userId} className={`text-sm flex flex-col p-2 border transition-colors ${isActiveSnake || isHighest ? cBorder + ' ' + cBg + '/10 ' + cShadowS : 'border-border bg-bg'} ${isOut ? 'opacity-40 grayscale' : ''}`}>
                    <div className="flex items-center justify-between font-mono">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${m.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        {m.email.split('@')[0]}
                        {isHighest && roomState.draftType !== 'snake' && <span className="ml-2 text-[10px] bg-brand text-bg px-1 font-bold uppercase animate-bounce">Leading</span>}
                        {isOut && roomState.draftType !== 'snake' && <span className="ml-2 text-[10px] bg-red-500 text-bg px-1 font-bold uppercase">Out</span>}
                        {m.isAutoBid && <span className="ml-2 text-[10px] bg-orange-500 text-bg px-1 font-bold uppercase">Auto Pick</span>}
                        {isActiveSnake && (
                          <span className={`ml-2 text-[10px] ${cBg} text-bg px-1 font-bold uppercase animate-pulse`}>Drafting...</span>
                        )}
                      </div>
                      {roomState.draftType !== 'snake' && <div className={`${cText} font-bold`}>${m.budget}</div>}
                    </div>
                    {roomState.draftType === 'snake' && lastPick && (
                      <div className="mt-2 text-[10px] font-mono text-text-muted border-t border-border/50 pt-1 flex justify-between items-center bg-surface/50 px-1 py-1">
                        <span className="uppercase text-text-secondary tracking-widest">Last Pick:</span>
                        <span className="font-bold text-text-primary uppercase truncate max-w-[120px]">{lastPick.name || lastPick}</span>
                      </div>
                    )}
                  </li>
                  );
                })}
              </ul>
          </div>
          
          {(amMember || roomState.members.length > 0) && (
            <div className="bg-surface border border-border p-4">
               <div className="flex justify-between items-center mb-4">
                  <h3 className={`font-bold uppercase tracking-widest text-xs ${cText}`}>Rosters</h3>
                  <select 
                    className="bg-bg border border-border text-[10px] font-mono p-1 uppercase outline-none"
                    value={viewingUserId || (amMember ? amMember.userId : roomState.members[0]?.userId)}
                    onChange={e => setViewingUserId(e.target.value)}
                  >
// eslint-disable-next-line @typescript-eslint/no-explicit-any
                    {roomState.members.map((m: any) => (
                      <option key={m.userId} value={m.userId}>
                        {m.userId === user?.id ? 'My Roster' : m.email.split('@')[0]}
                      </option>
                    ))}
                  </select>
               </div>
               <ul className="flex flex-col gap-1 text-[10px] font-mono">
                 {Array.from({length: maxRosterSize}).map((_, idx) => {
                   const slotLabel = getRosterSlotLabel(idx);
 
                   const viewedMember = roomState.members.find((m: any) => m.userId === (viewingUserId || (amMember ? amMember.userId : roomState.members[0]?.userId)));
                   const draftedPlayer = viewedMember?.roster[idx];
                   return (
                     <li key={idx} className="flex justify-between items-center p-1 px-2 border border-border bg-bg">
                       <span className="font-bold whitespace-nowrap text-text-muted w-12">{slotLabel}</span>
                       <span className="truncate flex-1 text-right text-text-primary ml-2 uppercase">
                         {draftedPlayer ? (draftedPlayer.name || draftedPlayer) : '---'}
                       </span>
                     </li>
                   );
                 })}
               </ul>
            </div>
          )}

          {amMember && (
            <div className={`mt-6 border p-4 transition-colors ${amAutoBid ? cBorder + ' ' + cBg + '/10' : 'border-border bg-surface'}`}>
               <div className="flex justify-between items-center mb-2">
                  <h3 className={`font-bold uppercase tracking-widest text-xs ${amAutoBid ? cText : 'text-text-secondary'}`}>
                    Auto Bid {amAutoBid ? 'Active' : 'Standby'}
                  </h3>
                  <button 
                    onClick={handleToggleAutoBid}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border transition-colors ${amAutoBid ? cBg + ' text-bg ' + cBorder + ' hover:brightness-90' : 'bg-bg text-text-primary border-border hover:bg-surface'}`}
                  >
                    {amAutoBid ? 'Disable' : 'Enable'}
                  </button>
               </div>
               <p className="text-[10px] font-mono text-text-muted">
                 If enabled (or if idle for {roomState.idleTime || 30}s), the system will bid automatically for you. 
                 It prioritizes your shortlist below.
               </p>
               {amMember.shortlist?.length > 0 && (
                 <div className="mt-4 flex flex-col gap-1">
                   <h4 className="font-bold uppercase tracking-widest text-[9px] text-brand">Shortlist Queue ({amMember.shortlist.length})</h4>
                   <div className="max-h-32 overflow-y-auto pr-1 flex flex-col gap-1">
                     {amMember.shortlist.map((id: string) => {
 
                       const p = roomState.playerPool.find((p: any) => p.id === id);
                       if (!p) return null;
                       return (
                         <div key={id} className="text-[10px] font-mono flex justify-between items-center bg-bg border border-brand/20 p-1">
                           <span className="truncate">{p.name} <span className="text-text-muted">{p.position}</span></span>
                           <button onClick={() => handleToggleShortlist(p.id)} className="text-red-500 opacity-50 hover:opacity-100">×</button>
                         </div>
                       )
                     })}
                   </div>
                 </div>
               )}
            </div>
          )}
        </div>
        
        <div className="lg:col-span-3 border border-border bg-surface p-12 min-h-[400px] flex flex-col items-center justify-center text-center">
           {roomState.status === 'pending' ? (
              <div className="animate-pulse flex flex-col items-center">
                 <Clock size={48} className="text-text-muted mb-4 opacity-50" />
                 <h2 className="text-xl uppercase font-bold tracking-widest text-text-secondary">Waiting to Start</h2>
                 <p className="max-w-md font-mono text-xs mt-4 text-text-muted">Users can join until the lobby is full. The creator can start the draft at any time.</p>
              </div>
           ) : roomState.status === 'drafting' ? (
              <div className="w-full max-w-2xl">
                 <h2 className={`text-sm font-mono ${cText} mb-2 uppercase tracking-widest`}>On The Block</h2>
                 
                 {roomState.draftType === 'snake' ? (
                   <div className={`relative overflow-hidden bg-bg border ${cBorder}/50 p-12 flex flex-col items-center ${cShadowL} mb-8 before:absolute before:inset-0 ${bgGrad} before:pointer-events-none`}>
                      <div className={`relative z-10 text-xl font-mono ${cText} mb-2 uppercase tracking-widest`}>Current Pick</div>
                      <div className="relative z-10 text-4xl lg:text-5xl font-black uppercase tracking-tighter mb-6 drop-shadow-md text-white text-center">
                        {(() => {
                           const activeUserId = roomState.currentSnakeRoute?.[roomState.currentSnakeIndex || 0]?.userId;
                           if (activeUserId === user?.id) return "YOUR TURN!";
 
                           const member = roomState.members.find((m: any) => m.userId === activeUserId);
                           return member ? member.email.split('@')[0] + "'s turn" : 'Waiting...';
                        })()}
                      </div>
                      <div className="relative z-10 text-6xl lg:text-7xl font-bold font-mono text-white mb-6 tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                        00:{timeLeft.toString().padStart(2, '0')}
                      </div>
                      {roomState.currentSnakeRoute?.[roomState.currentSnakeIndex || 0]?.userId === user?.id && (
                        <div className="relative z-10 font-mono text-sm text-text-muted mt-4">
                          Select a player from the pool below to draft them.
                        </div>
                      )}
                   </div>
                 ) : (
                   roomState.currentPlayerOut && (
                     <div className={`relative overflow-hidden bg-bg border ${cBorder}/50 p-12 flex flex-col items-center ${cShadowL} mb-8 before:absolute before:inset-0 ${bgGrad} before:pointer-events-none`}>
                       <div className={`relative z-10 w-32 h-32 rounded-full overflow-hidden border-4 ${cBorder} bg-surface mb-4 ${cShadowA}`}>
                         <img 
                            src={roomState.currentPlayerOut.image || `https://ui-avatars.com/api/?name=${roomState.currentPlayerOut.name}&background=random`} referrerPolicy="no-referrer" 
                            alt={roomState.currentPlayerOut.name}
                            className="w-full h-full object-cover"
                         />
                       </div>
                       <div className="relative z-10 text-4xl lg:text-5xl font-black uppercase tracking-tighter mb-2 drop-shadow-md text-white text-center">{roomState.currentPlayerOut.name}</div>
                       <div className={`relative z-10 font-mono text-sm tracking-widest ${cText} mb-6 ${cBg}/10 px-3 py-1 border ${cBorder}/20`}>
                         {roomState.currentPlayerOut.position} 
                         {roomState.draftType !== 'snake' && ` • BASE: $${roomState.currentPlayerOut.price}`}
                       </div>
                       
                       <div className="relative z-10 text-6xl lg:text-7xl font-bold font-mono text-white mb-6 tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                         00:{timeLeft.toString().padStart(2, '0')}
                       </div>
                       
                       <div className="relative z-10 font-mono text-sm mb-4 w-full">
                         {roomState.highestBid ? (
                           <div className="bg-brand/20 border border-brand/40 px-6 py-4 flex flex-col items-center justify-center">
                             <span className="text-brand-light uppercase tracking-widest text-[10px] mb-1">Highest Bid</span>
                             <span className="text-3xl font-bold text-white mb-1">${roomState.highestBid.amount}</span>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
                             <span className="text-text-secondary text-xs uppercase tracking-wider">by {roomState.members.find((m: any) => m.userId === roomState.highestBid.userId)?.email.split('@')[0]}</span>
                           </div>
                         ) : (
                           <div className="bg-surface/50 border border-border px-6 py-4 flex flex-col items-center justify-center">
                             <span className="text-text-muted uppercase tracking-widest text-xs">Waiting for opening bid...</span>
                           </div>
                         )}
                       </div>
                       
                       {wouldExceedImports && (
                         <div className="relative z-10 text-red-500 bg-red-500/10 border border-red-500/20 px-4 py-2 mb-4 font-mono text-[10px] uppercase tracking-widest font-bold">
                           Cannot bid: Max 3 imports reached
                         </div>
                       )}

                       {amMember && amMember.roster.length < maxRosterSize && (
                         <div className="relative z-10 flex gap-3">
                            <button 
                              onClick={() => handleBid((roomState.highestBid?.amount || 0) + 1)}
                              className={`px-8 py-4 ${cBg} text-bg font-black uppercase tracking-widest hover:brightness-110 disabled:opacity-50 transition-all active:scale-95`}
                              disabled={wouldExceedImports || roomState.outUsers?.includes(user?.id) || ((roomState.highestBid?.amount || 0) + 1) > maxPossibleBid}
                            >
                              Bid ${(roomState.highestBid?.amount || 0) + 1}
                            </button>
                            <button 
                              onClick={() => handleBid((roomState.highestBid?.amount || 0) + 5)}
                              className={`px-6 py-4 border-2 ${cBorder} ${cText} font-bold uppercase tracking-widest hover:opacity-80 disabled:opacity-50 transition-all active:scale-95`}
                              disabled={wouldExceedImports || roomState.outUsers?.includes(user?.id) || ((roomState.highestBid?.amount || 0) + 5) > maxPossibleBid}
                            >
                              +5
                            </button>
                            <div className="flex border-2 border-red-500 overflow-hidden">
                              <div className="relative bg-bg">
                                <input 
                                  type="number"
                                  value={customBid}
                                  onChange={(e) => { const v = parseInt(e.target.value); setCustomBid(e.target.value === '' || isNaN(v) ? '' : v); }}
                                  placeholder="...$"
                                  className="w-24 px-4 py-4 bg-transparent outline-none text-red-500 font-bold"
                                />
                                <button 
                                  onClick={() => setCustomBid(maxPossibleBid)} 
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-red-500 hover:text-red-400 bg-bg px-1"
                                >
                                  Max
                                </button>
                              </div>
                              <button 
                                onClick={() => { if(typeof customBid === 'number') handleBid(customBid); }}
                                className="px-6 py-4 bg-red-500 text-bg font-bold uppercase tracking-widest hover:bg-red-400 disabled:opacity-50 transition-all active:scale-95"
                                disabled={wouldExceedImports || roomState.outUsers?.includes(user?.id) || typeof customBid !== 'number' || customBid <= (roomState.highestBid?.amount || 0) || customBid > maxPossibleBid}
                              >
                                Bid
                              </button>
                            </div>
                            <button 
                              onClick={handleFold}
                              className="px-6 py-4 border-2 border-text-muted text-text-primary font-bold uppercase tracking-widest hover:bg-surface disabled:opacity-50 transition-all active:scale-95"
                              disabled={roomState.outUsers?.includes(user?.id) || roomState.highestBid?.userId === user?.id}
                            >
                              Fold / Out
                            </button>
                         </div>
                       )}
                     </div>
                   )
                 )}
                 <div className="text-left bg-surface border border-border p-6 shadow-inner w-full flex flex-col">
                    <div className="flex justify-between items-center mb-4 sticky top-0 bg-surface z-10 py-2 border-b border-border/50">
                       <h4 className="font-bold uppercase tracking-widest text-[10px] text-text-muted">Player Pool ({filteredPool.length})</h4>
                       <div className="flex flex-wrap gap-2 justify-end">
                          <select className="bg-bg border border-border text-[10px] p-1 font-mono outline-none" value={filterPosition} onChange={e => setFilterPosition(e.target.value)}>
                             <option value="ALL">All POS</option>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
                             {uniquePositions.map((pos: any) => <option key={pos} value={pos}>{pos}</option>)}
                          </select>
                          <select className="bg-bg border border-border text-[10px] p-1 font-mono outline-none max-w-[100px]" value={filterTeam} onChange={e => setFilterTeam(e.target.value)}>
                             <option value="ALL">All Teams</option>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
                             {uniqueTeams.map((t: any) => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <select className="bg-bg border border-border text-[10px] p-1 font-mono outline-none" value={filterType} onChange={e => setFilterType(e.target.value)}>
                             <option value="ALL">All Types</option>
                             <option value="LOCAL">Local</option>
                             <option value="IMPORT">Import</option>
                          </select>
                          <input type="number" placeholder="Max $" className="bg-bg border border-border text-[10px] p-1 font-mono outline-none w-16" value={maxPrice} onChange={e => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))} />
                       </div>
                    </div>
                    <div className="flex flex-col gap-2 relative max-h-64 overflow-y-auto pr-2 min-h-[150px]">
                      {filteredPool.length === 0 ? (
                        <div className="text-center text-text-muted font-mono text-xs py-8">No players match the filters.</div>
                      ) : (
 
                        filteredPool.slice(0, 50).map((p: any) => {
                          const isShortlisted = amMember?.shortlist?.includes(p.id);
                          return (
                          <div key={p.id} className={`text-xs font-mono flex justify-between items-center bg-bg border ${isShortlisted ? 'border-brand' : 'border-border/50'} p-2 hover:border-brand/30 transition-colors`}>
                            <div className="flex flex-col flex-1">
                               <span className="font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                                  {p.name} 
                                  <span className="text-[10px] text-text-muted font-normal bg-surface px-1">{p.position}</span>
                                  {p.isImport ? <span className="text-[9px] bg-red-500/20 text-red-500 px-1 font-bold">IMP</span> : <span className="text-[9px] bg-brand/20 text-brand px-1 font-bold">LOC</span>}
                                  {p.status === 'injured' && <span className="text-[9px] bg-orange-500/20 ${cText} px-1 font-bold" title="Injured">INJ</span>}
                                  {p.fixtureHistory?.length === 0 && <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1 font-bold" title="No recent minutes">ICE ❄️</span>}
                               </span>
                               <span className="text-[10px] text-text-secondary mt-1 max-w-[200px] truncate">{p.team}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {amMember && roomState.draftType === 'snake' && roomState.currentSnakeRoute?.[roomState.currentSnakeIndex || 0]?.userId === user?.id && (
                                <button
                                  onClick={() => handleSnakePick(p.id)}
                                  className="px-3 py-1 bg-brand text-bg font-bold text-[10px] uppercase tracking-widest hover:bg-brand-light transition-colors"
                                >
                                  Draft
                                </button>
                              )}
                              {amMember && (
                                <button
                                  onClick={() => handleToggleShortlist(p.id)}
                                  className={`p-1 border transition-colors ${isShortlisted ? 'bg-brand/20 text-brand border-brand/50' : 'bg-surface text-text-muted border-border hover:bg-bg'}`}
                                  title={isShortlisted ? 'Remove from Shortlist' : 'Add to Shortlist'}
                                >
                                  ★
                                </button>
                              )}
                              {roomState.draftType !== 'snake' && <span className={`${cText} ${cBg}/10 px-2 py-1 font-bold`}>${p.price}</span>}
                            </div>
                          </div>
                        )})
                      )}
                    </div>
                 </div>
              </div>
           ) : (
              <div className="flex flex-col items-center">
                 <Shield size={48} className={`mb-4 mx-auto ${cText}`} />
                 <h2 className="text-xl uppercase font-bold tracking-widest text-text-primary">Draft Completed!</h2>
                 <p className="font-mono text-xs mt-4 mb-8 text-text-muted">The teams have been formed and you can now manage your squad in the League Dashboard.</p>
                 <button 
                   onClick={() => navigate(`/${roomState.sport}/dashboard/draft/${roomState.leagueId}/dashboard`)}
                   className={`${cBg} text-bg px-6 py-3 font-bold uppercase tracking-widest text-sm hover:opacity-80 transition-colors`}
                 >
                   Go to League Dashboard
                 </button>
              </div>
           )}
        </div>
      </div>
    </div>
  );
}
