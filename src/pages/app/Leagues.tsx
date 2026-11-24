import { apiFetch } from '../../lib/apiFetch';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Plus, Trophy, Users, Shield, Target, ArrowLeft, Trash2, Edit2, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function Leagues({ sport }: { sport: 'football' | 'basketball' }) {
  const { user } = useAuthStore();
  const sportColor = sport === 'basketball' ? 'text-amber-500' : 'text-brand';
  const sportBg = sport === 'basketball' ? 'bg-amber-500' : 'bg-brand';
  const sportBorder = sport === 'basketball' ? 'border-amber-500' : 'border-brand';
  const groupHoverSportText = sport === 'basketball' ? 'group-hover:text-amber-500' : 'group-hover:text-brand';

  const [activeTab, setActiveTab] = useState<'general' | 'private' | 'mini'>('general');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [leagueName, setLeagueName] = useState('');
  const [leagueType, setLeagueType] = useState<'h2h' | 'roto'>('roto');
  const [leagueCode, setLeagueCode] = useState('');
  
 
  const [myLeagues, setMyLeagues] = useState<any[]>([]);
  const [editingLeague, setEditingLeague] = useState<{id: string, name: string} | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    if (user?.id) fetchMyLeagues();
  }, [user?.id, sport]);

  const fetchMyLeagues = async () => {
    try {
      const res = await apiFetch(`/api/minileagues/${sport}/${user?.id}`);
      const data = await res.json();
      setMyLeagues(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leagueName || !user) return;
    try {
      const res = await apiFetch('/api/minileagues', {
         method: 'POST',
         headers: {'Content-Type': 'application/json'},
         body: JSON.stringify({ name: leagueName, sport, type: leagueType, userId: user.id, email: user.email || user.username })
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(`League "${data.name}" created! Invite code: ${data.code}`);
        setIsCreating(false);
        setLeagueName('');
        fetchMyLeagues();
      } else {
        showNotification(data.error || "Failed to create league");
      }
    } catch (e) {
      console.error(e);
      showNotification("Network error");
    }
  };

  const handleJoinLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leagueCode || !user) return;
    try {
      const res = await apiFetch('/api/minileagues/join', {
         method: 'POST',
         headers: {'Content-Type': 'application/json'},
         body: JSON.stringify({ code: leagueCode, userId: user.id, email: user.email })
      });
      if (res.ok) {
        const data = await res.json();
        showNotification(`Successfully joined "${data.name}"!`);
        setIsJoining(false);
        setLeagueCode('');
        fetchMyLeagues();
      } else {
        showNotification("Invalid invite code or league not found.");
      }
    } catch (e) {
      console.error(e);
    }
  };
  
  const handleDelete = async (id: string) => {
    // auto confirm
    try {
      await apiFetch(`/api/minileagues/${id}?userId=${user?.id}`, { method: 'DELETE' });
      fetchMyLeagues();
    } catch (e) {
      console.error(e);
    }
  };
  
  const handleLeave = async (id: string) => {
    // auto confirm
    try {
      await apiFetch(`/api/minileagues/${id}/leave`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ userId: user?.id })
      });
      fetchMyLeagues();
    } catch (e) {
      console.error(e);
    }
  };
  
  const handleEdit = async (id: string) => {
    if(!editingLeague) return;
    try {
      await apiFetch(`/api/minileagues/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ userId: user?.id, name: editingLeague.name })
      });
      setEditingLeague(null);
      fetchMyLeagues();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-full gap-8 relative">
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-bg border border-text-primary px-4 py-3 shadow-lg flex items-center gap-3 w-80 animate-in fade-in slide-in-from-top-4">
           <div className={`w-2 h-2 rounded-full ${sportBg}`} />
           <p className="text-xs font-mono uppercase text-text-primary flex-1 break-words">{notification}</p>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-text-primary uppercase tracking-tighter">Leagues & Mini Games</h1>
        <p className="text-sm font-mono text-text-secondary mt-1 tracking-widest uppercase">Join or create competitions</p>
      </div>

      <div className="flex gap-4 border-b border-border">
        {['general', 'private', 'mini'].map(tab => (
          <button
            key={tab}
 
            onClick={() => setActiveTab(tab as any)}
            className={cn(
              "px-6 py-3 font-mono text-xs uppercase tracking-widest transition-colors border-b-2",
              activeTab === tab ? `${sportBorder} ${sportColor}` : "border-transparent text-text-secondary hover:text-text-primary"
            )}
          >
            {tab === 'general' ? 'Global & Public' : tab === 'private' ? 'Mini-Leagues' : 'Mini Games'}
          </button>
        ))}
      </div>

      <div className="flex-1">
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <div className="border border-border bg-surface p-6 hover:border-text-secondary transition-colors cursor-pointer group">
               <div className="flex justify-between items-start mb-4">
                 <Trophy size={24} className={sportColor} />
                 <span className="text-[10px] bg-bg border border-border px-2 py-0.5 font-mono text-text-secondary">#152,492</span>
               </div>
               <h3 className={cn("text-lg font-bold text-text-primary uppercase mb-2 transition-colors", groupHoverSportText)}>Global {sport} League</h3>
               <p className="text-xs text-text-secondary leading-relaxed mb-6">The official global leaderboard. Everyone is automatically entered.</p>
               <div className="text-[10px] font-mono tracking-widest text-text-secondary">— CURRENT STANDING</div>
             </div>
             
             <div className="border border-border bg-surface p-6 hover:border-text-secondary transition-colors cursor-pointer group">
               <div className="flex justify-between items-start mb-4">
                 <Shield size={24} className={sportColor} />
                 <span className="text-[10px] bg-bg border border-border px-2 py-0.5 font-mono text-text-secondary">#12,300</span>
               </div>
               <h3 className={cn("text-lg font-bold text-text-primary uppercase mb-2 transition-colors", groupHoverSportText)}>Country: Lebanon</h3>
               <p className="text-xs text-text-secondary leading-relaxed mb-6">Compete against managers from your registered country.</p>
               <div className="text-[10px] font-mono tracking-widest text-text-secondary">— CURRENT STANDING</div>
             </div>
             
             <div className="border border-border border-dashed bg-bg flex flex-col items-center justify-center p-6 text-text-muted hover:border-text-secondary transition-colors cursor-pointer">
               <SearchIcon className="mb-4" />
               <span className="text-xs font-mono uppercase tracking-widest text-text-secondary">FIND PUBLIC LEAGUES</span>
             </div>
          </div>
        )}

        {activeTab === 'private' && (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 bg-surface border border-border p-8 flex flex-col items-center justify-center text-center transition-all">
                {isCreating ? (
                  <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <button onClick={() => setIsCreating(false)} className="self-start text-text-secondary hover:text-text-primary flex items-center gap-2 mb-6 text-xs font-mono uppercase tracking-widest transition-colors"><ArrowLeft size={14} /> Back</button>
                    <h3 className="text-xl font-bold text-text-primary uppercase mb-2">Initialize New League</h3>
                    <p className="text-sm text-text-secondary mb-6">Enter a name for your private league.</p>
                    <form onSubmit={handleCreateLeague} className="w-full max-w-sm flex flex-col gap-4">
                      <input autoFocus type="text" placeholder="LEAGUE NAME" value={leagueName} onChange={e => setLeagueName(e.target.value)} className="bg-bg border border-border py-3 px-4 text-xs font-mono uppercase text-text-primary focus:outline-none focus:border-text-secondary transition-colors" />
                      <div className="flex flex-col gap-1 text-left">
                         <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest">League Format</label>
                         <select value={leagueType} onChange={e => setLeagueType(e.target.value as 'h2h' | 'roto')} className="bg-bg border border-border py-3 px-4 text-xs font-mono uppercase text-text-primary focus:outline-none focus:border-text-secondary transition-colors appearance-none cursor-pointer">
                            <option value="roto">Rotisserie (Roto)</option>
                            <option value="h2h">Head-to-Head (H2H)</option>
                         </select>
                      </div>
                      <button type="submit" disabled={!leagueName} className={cn("px-8 py-3 text-xs font-bold font-mono tracking-widest uppercase transition-colors text-bg disabled:opacity-50", sportBg, "hover:opacity-90")}>
                        CONFIRM CREATION
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="flex flex-col items-center animate-in fade-in duration-500">
                    <div className={cn("w-16 h-16 rounded-full border border-border flex items-center justify-center mb-6", sportBg, "bg-opacity-10")}>
                      <Plus size={24} className={sportColor} />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary uppercase mb-2">Create a League</h3>
                    <p className="text-sm text-text-secondary max-w-sm mb-8">Design a custom league for your friends, office, or community. Customize scoring features and entry rules.</p>
                    <button onClick={() => setIsCreating(true)} className={cn("px-8 py-3 text-xs font-bold font-mono tracking-widest uppercase transition-colors text-bg", sportBg, "hover:opacity-90")}>
                      INITIALIZE LEAGUE
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex-1 bg-surface border border-border p-8 flex flex-col items-center justify-center text-center transition-all">
                {isJoining ? (
                  <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <button onClick={() => setIsJoining(false)} className="self-start text-text-secondary hover:text-text-primary flex items-center gap-2 mb-6 text-xs font-mono uppercase tracking-widest transition-colors"><ArrowLeft size={14} /> Back</button>
                    <h3 className="text-xl font-bold text-text-primary uppercase mb-2">Join Private League</h3>
                    <p className="text-sm text-text-secondary mb-6">Enter the invite code provided by the league admin.</p>
                    <form onSubmit={handleJoinLeague} className="w-full max-w-sm flex flex-col gap-4">
                      <input autoFocus type="text" placeholder="ENTER 6-DIGIT CODE" value={leagueCode} onChange={e => setLeagueCode(e.target.value)} className="bg-bg border border-border py-3 px-4 text-xs font-mono uppercase text-text-primary focus:outline-none focus:border-text-secondary transition-colors" />
                      <button type="submit" disabled={!leagueCode} className={cn("px-8 py-3 text-xs font-bold font-mono tracking-widest uppercase transition-colors text-bg disabled:opacity-50 text-text-primary border border-text-secondary hover:bg-text-primary hover:text-bg")}>
                        AUTHENTICATE CODE
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="flex flex-col items-center animate-in fade-in duration-500">
                    <div className="w-16 h-16 rounded-full border border-border bg-bg flex items-center justify-center mb-6 hover:border-text-secondary transition-colors">
                      <Users size={24} className="text-text-secondary" />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary uppercase mb-2">Join a League</h3>
                    <p className="text-sm text-text-secondary max-w-sm mb-8">Got an invite code? Enter it below to join your friends' existing mini-league.</p>
                    <button onClick={() => setIsJoining(true)} className="bg-bg border border-border px-8 py-3 text-xs font-mono font-bold text-text-secondary hover:text-text-primary hover:border-text-secondary transition-colors uppercase tracking-widest">
                      ENTER INVITE CODE
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {myLeagues.length > 0 && (
              <div>
                 <h2 className="text-xl font-bold uppercase tracking-tighter mb-4 text-text-primary">My Mini-Leagues</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myLeagues.map(l => {
                      const isCreator = l.creatorId === user?.id;
                      const isEditing = editingLeague?.id === l.id;
                      return (
                        <div key={l.id} className="border border-border bg-surface p-6 flex flex-col relative group">
                          <div className="flex justify-between items-start mb-4">
                            <Users size={24} className={sportColor} />
                            <div className="text-[10px] bg-bg border border-brand/50 px-2 py-0.5 font-mono text-brand font-bold uppercase">Code: {l.code}</div>
                          </div>
                          
                          {isEditing ? (
                             <div className="flex flex-col gap-2 mb-2">
                                <input 
                                  type="text" 
                                  value={editingLeague.name} 
                                  onChange={e => setEditingLeague({ ...editingLeague, name: e.target.value })}
                                  className="bg-bg border border-border px-2 py-1 text-sm font-bold text-text-primary uppercase"
                                />
                                <div className="flex gap-2">
                                  <button onClick={() => handleEdit(l.id)} className="text-[10px] bg-brand text-bg px-2 py-1 font-bold uppercase">Save</button>
                                  <button onClick={() => setEditingLeague(null)} className="text-[10px] bg-bg border border-border text-text-secondary px-2 py-1 font-bold uppercase">Cancel</button>
                                </div>
                             </div>
                          ) : (
                            <h3 className={cn("text-lg font-bold text-text-primary uppercase mb-1 transition-colors truncate", groupHoverSportText)} title={l.name}>{l.name}</h3>
                          )}
                          
                          <div className="flex flex-col gap-1 mb-4 flex-1">
                             <div className="text-[10px] font-mono text-text-muted uppercase tracking-widest bg-surface border border-border px-2 py-0.5 inline-block w-fit">
                               {l.type === 'h2h' ? 'Head-to-Head' : 'Rotisserie'}
                             </div>
                             <p className="text-xs text-text-secondary mt-1">
                               {l.members.length} {l.members.length === 1 ? 'member' : 'members'}
                             </p>
                          </div>
                          
                          <div className="border-t border-border/50 pt-3 flex justify-between items-center opacity-70 group-hover:opacity-100 transition-opacity">
                             <span className="text-[10px] font-mono tracking-widest text-text-secondary">
                                {isCreator ? 'OWNER' : 'MEMBER'}
                             </span>
                             <div className="flex gap-2">
                               {isCreator ? (
                                 <>
                                   <button onClick={() => setEditingLeague({id: l.id, name: l.name})} className="p-1 hover:text-brand transition-colors text-text-muted" title="Edit Name"><Edit2 size={12} /></button>
                                   <button onClick={() => handleDelete(l.id)} className="p-1 hover:text-red-500 transition-colors text-text-muted" title="Delete League"><Trash2 size={12} /></button>
                                 </>
                               ) : (
                                 <button onClick={() => handleLeave(l.id)} className="p-1 hover:text-orange-500 transition-colors text-text-muted" title="Leave League"><LogOut size={12} /></button>
                               )}
                             </div>
                          </div>
                        </div>
                      )
                    })}
                 </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'mini' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="border border-border bg-surface p-6 flex items-start gap-6 cursor-pointer group hover:bg-bg/50">
               <div className={cn("w-16 h-16 shrink-0 border border-border flex items-center justify-center rotate-45 transition-transform group-hover:rotate-0", sportBg, "bg-opacity-5")}>
                 <Target size={24} className={cn("-rotate-45 group-hover:rotate-0 transition-transform", sportColor)} />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-text-primary uppercase mb-2">Head-to-Head Cup</h3>
                  <p className="text-xs text-text-secondary mb-4">A randomized knockout tournament starting in Gameweek 15. Win your weekly matchup to advance.</p>
                  <span className="text-[10px] font-mono tracking-widest text-text-muted uppercase">QUALIFICATION: OPEN</span>
               </div>
             </div>
             
             <div className="border border-border bg-surface p-6 flex items-start gap-6 cursor-pointer group hover:bg-bg/50">
               <div className={cn("w-16 h-16 shrink-0 border border-border flex items-center justify-center rotate-45 transition-transform group-hover:rotate-0", sportBg, "bg-opacity-5")}>
                 <Trophy size={24} className={cn("-rotate-45 group-hover:rotate-0 transition-transform", sportColor)} />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-text-primary uppercase mb-2">Survivor Series</h3>
                  <p className="text-xs text-text-secondary mb-4">The lowest scoring managers each week are eliminated until one champion remains.</p>
                  <span className="text-[10px] font-mono tracking-widest text-text-muted uppercase">STARTS GW 10</span>
               </div>
             </div>
          </div>
        )}
      </div>

    </div>
  );
}

 
function SearchIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
