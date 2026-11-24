import { apiFetch } from '../../lib/apiFetch';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCmsStore } from '../../store/cmsStore';
import { Shield, Users, ArrowRight } from 'lucide-react';
import AdBanner from '../../components/layout/AdBanner';

export interface DraftLeague { id: string; name: string; sport: string; maxTeams: number; draftType: string; isPublic: boolean; status: string; membersCount: number; [key: string]: unknown; }
export default function DraftLeagues({ sport = 'basketball' }: { sport?: 'football' | 'basketball' }) {
  const { user } = useAuthStore();
  const cms = useCmsStore();
  const navigate = useNavigate();
  
  const isFb = sport === 'football';
  const cText = isFb ? 'text-brand' : 'text-amber-500';
  const cBg = isFb ? 'bg-brand' : 'bg-amber-500';
  
  const [activeDrafts, setActiveDrafts] = useState<DraftLeague[]>([]);
  
  useEffect(() => {
    apiFetch('/api/drafts/public')
      .then(res => res.json())
      .then(data => setActiveDrafts(data.filter((d: DraftLeague) => d.sport === sport)));
  }, [sport]);

  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: 'My Draft League',
    sport: sport,
    draftType: 'auction', // 'auction' or 'snake'
    scoringSystem: 'h2h', // 'h2h' or 'rotisserie'
    rosterConfig: 'consistent', // 'consistent' or 'open'
    maxTeams: 8,
    isPublic: true,
    password: '',
    draftDate: '',
    draftTimePerPick: 5,
    idleTime: 30,
    seasonType: 'full',
    roundsCount: 38,
    botsCount: 0,
    budget: 100
  });

  const handleCreate = async () => {
    if (!user) return;
    
    // We send players currently in system
    const players = cms.players.filter(p => p.sport === formData.sport);
    
    const res = await apiFetch('/api/drafts/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        creatorId: user.id,
        creatorEmail: user.email,
        players: players.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          position: p.position,
          image: p.image,
          team: p.team,
          isImport: p.isImport,
          status: p.status,
          fixtureHistory: p.fixtureHistory
        }))
      })
    });
    
    const data = await res.json();
    if (data.draftId) {
      navigate(`/${sport}/dashboard/draft/${data.draftId}`);
    }
  };
  
  const handleJoin = async (d: DraftLeague) => {
    if (!user) return;
    
    let password = '';
    if (!d.isPublic && d.hasPassword) {
      const p = prompt("Enter password for this private draft server:");
      if (p === null) return;
      password = p;
    }
    
    const res = await apiFetch('/api/drafts/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        draftId: d.id, userId: user.id, email: user.email, password
      })
    });
    const data = await res.json();
    if (data.success) {
      navigate(`/${sport}/dashboard/draft/${d.id}`);
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <AdBanner />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className={`font-bold text-3xl uppercase tracking-tighter ${cText}`}>Fantasy Draft</h1>
          <p className="text-sm font-mono text-text-secondary mt-2">Build a closed league and bid live on players.</p>
        </div>
        <button 
          onClick={() => setCreating(!creating)}
          className={`${cBg} text-bg px-4 py-2 font-bold uppercase tracking-widest text-xs`}
        >
          {creating ? 'Cancel' : 'Create Draft'}
        </button>
      </div>
      
      {creating && (
        <div className="bg-surface border border-border p-6 mb-8">
          <h2 className="font-bold uppercase tracking-widest text-sm mb-4">New Draft League</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
               <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Server Name</label>
               <input 
                 className="w-full bg-bg border border-border px-3 py-2 text-sm"
                 value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
               />
            </div>
            <div>
               <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Sport</label>
               <select 
                 className="w-full bg-bg border border-border px-3 py-2 text-sm"
                 value={formData.sport} onChange={e => setFormData({...formData, sport: e.target.value as 'football' | 'basketball'})}
               >
                 <option value="basketball">Basketball</option>
                 <option value="football">Football</option>
               </select>
            </div>
            <div>
               <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Server Type</label>
               <select 
                 className="w-full bg-bg border border-border px-3 py-2 text-sm"
                 value={formData.draftType} onChange={e => setFormData({...formData, draftType: e.target.value})}
               >
                 <option value="auction">Auction Server</option>
                 <option value="snake">Snake Server</option>
               </select>
            </div>
            {formData.draftType === 'auction' && (
              <div>
                 <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Budget</label>
                 <input 
                   type="number" min={50} max={200} step={10}
                   className="w-full bg-bg border border-border px-3 py-2 text-sm"
                   value={isNaN(formData.budget) ? '' : formData.budget} 
                   onChange={e => { const val = parseInt(e.target.value); setFormData({...formData, budget: isNaN(val) ? NaN : val}); }}
                 />
              </div>
            )}
            <div>
               <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Scoring System</label>
               <select 
                 className="w-full bg-bg border border-border px-3 py-2 text-sm"
                 value={formData.scoringSystem} onChange={e => setFormData({...formData, scoringSystem: e.target.value})}
               >
                 <option value="h2h">Head-to-Head (H2H)</option>
                 <option value="rotisserie">Rotisserie</option>
               </select>
            </div>
            <div>
               <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Roster Configuration</label>
               <select 
                 className="w-full bg-bg border border-border px-3 py-2 text-sm"
                 value={formData.rosterConfig} onChange={e => setFormData({...formData, rosterConfig: e.target.value})}
               >
                 <option value="consistent">Consistent Roster (Positional Limits)</option>
                 <option value="open">Open Position (No Limits)</option>
               </select>
            </div>
            <div>
               <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Number of Teams</label>
               <input 
                 type="number" min={8} max={12}
                 className="w-full bg-bg border border-border px-3 py-2 text-sm"
                 value={isNaN(formData.maxTeams) ? '' : formData.maxTeams} onChange={e => { const val = parseInt(e.target.value); setFormData({...formData, maxTeams: isNaN(val) ? NaN : val}); }}
               />
            </div>
            <div>
               <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Privacy</label>
               <select 
                 className="w-full bg-bg border border-border px-3 py-2 text-sm"
                 value={formData.isPublic ? 'public' : 'private'} 
                 onChange={e => setFormData({...formData, isPublic: e.target.value === 'public'})}
               >
                 <option value="public">Public</option>
                 <option value="private">Private</option>
               </select>
            </div>
            {!formData.isPublic && (
              <div>
                 <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Password</label>
                 <input 
                   type="password"
                   className="w-full bg-bg border border-border px-3 py-2 text-sm"
                   value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                 />
              </div>
            )}
            <div>
               <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Time per bid</label>
               <select 
                 className="w-full bg-bg border border-border px-3 py-2 text-sm"
                 value={formData.draftTimePerPick} 
                 onChange={e => setFormData({...formData, draftTimePerPick: parseInt(e.target.value) as number})}
               >
                 <option value={5}>5 Seconds</option>
                 <option value={10}>10 Seconds</option>
                 <option value={15}>15 Seconds</option>
               </select>
            </div>
            <div>
               <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Idle Time to Auto-bid (sec)</label>
               <input 
                 type="number" min={5} max={120}
                 className="w-full bg-bg border border-border px-3 py-2 text-sm"
                 value={isNaN(formData.idleTime) ? '' : formData.idleTime} onChange={e => { const val = parseInt(e.target.value); setFormData({...formData, idleTime: isNaN(val) ? NaN : val}); }}
               />
               <div className="text-[10px] font-mono mt-1 text-text-muted">
                 If user is inactive, system auto bids.
               </div>
            </div>
            <div>
               <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Simulated Bots</label>
               <input 
                 type="number" min={0} max={11}
                 className="w-full bg-bg border border-border px-3 py-2 text-sm"
                 value={isNaN(formData.botsCount) ? '' : formData.botsCount} onChange={e => { const val = parseInt(e.target.value); setFormData({...formData, botsCount: isNaN(val) ? NaN : val}); }}
               />
               <div className="text-[10px] font-mono mt-1 text-text-muted">
                 Useful for testing. Will auto-bid against you.
               </div>
            </div>
            <div>
               <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Draft Date & Time</label>
               <input 
                 type="datetime-local"
                 className="w-full bg-bg border border-border px-3 py-2 text-sm"
                 value={formData.draftDate} onChange={e => setFormData({...formData, draftDate: e.target.value})}
               />
            </div>
          </div>
          <button 
            onClick={handleCreate}
            className={`mt-6 ${cBg} text-bg px-6 py-2 font-bold uppercase tracking-widest text-xs`}
          >
            Create Server
          </button>
        </div>
      )}

      <h2 className="font-bold uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
        <Users size={16} className={cText} />
        Active Draft Servers
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeDrafts.map((d: DraftLeague) => (
          <div key={d.id} className="bg-surface border border-border p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold uppercase tracking-wider">{d.name}</h3>
                <div className="flex flex-col gap-1 items-end">
                  <span className="text-[10px] font-mono bg-border px-2 py-1 uppercase">{d.sport}</span>
                  <span className={`text-[10px] font-mono ${cBg}/20 ${cText} px-2 py-1 uppercase`}>{d.draftType || 'auction'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-text-secondary mb-2">
                <Users size={12} /> {d.membersCount} / {d.maxTeams} Teams
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-text-secondary">
                <Shield size={12} /> {d.isPublic ? 'Public' : 'Private'}
              </div>
              
              <div className="mt-4">
                 <span className={`inline-block px-2 py-1 text-[10px] uppercase font-bold tracking-widest ${cBg}/10 ${cText}`}>
                    Mode: {d.status}
                 </span>
              </div>
            </div>
            
            <div className="mt-6 flex flex-col gap-2">
              {d.status === 'completed' ? (
                 <button 
                   onClick={() => navigate(`/${sport}/dashboard/draft/${d.id}/dashboard`)}
                   className={`w-full flex items-center justify-center gap-2 ${cBg} text-bg px-4 py-2 font-bold uppercase tracking-widest text-[10px] hover:opacity-80 transition-colors`}
                 >
                   League Dashboard
                 </button>
              ) : (
                 <button 
                   onClick={() => handleJoin(d)}
                   disabled={d.membersCount >= d.maxTeams && d.status === 'pending'}
                   className={`w-full flex items-center justify-center gap-2 bg-text border border-border text-bg px-4 py-2 font-bold uppercase tracking-widest text-[10px] hover:opacity-80 transition-colors disabled:opacity-50`}
                 >
                   {d.status === 'drafting' ? 'Watch Draft' : (d.membersCount >= d.maxTeams ? 'Lobby Full' : 'Join Draft')} <ArrowRight size={14} />
                 </button>
              )}
            </div>
          </div>
        ))}
        {activeDrafts.length === 0 && (
          <div className="col-span-full py-12 text-center text-sm font-mono text-text-muted border border-dashed border-border">
            No public draft servers active. Create one!
          </div>
        )}
      </div>
    </div>
  );
}
