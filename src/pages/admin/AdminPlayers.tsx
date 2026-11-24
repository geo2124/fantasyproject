/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCmsStore } from '../../store/cmsStore';
import { Player, BasketballBasePos } from '../../types';
import { Search, Plus, Edit, Trash, X, BarChart2, DollarSign, Calculator } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AdminPlayers() {
  const { sport } = useParams<{ sport: string }>();
  const cms = useCmsStore();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'details' | 'stats' | 'pricing'>('details');
  const [editingPlayer, setEditingPlayer] = useState<Partial<Player>>({});
  
  const playersBySport = cms.players.filter(x => x.sport === sport);

  useEffect(() => {
    resetEditingPlayer();
  }, [sport]);

  const resetEditingPlayer = () => {
    setEditingPlayer({ 
 
      sport: sport as any, 
      status: 'available', 
      price: 5.0, 
      totalPoints: 0,
      basketballPosDetail: { type: 'fixed', primary: 'PG', label: 'PG' }
    });
  };

  const filtered = playersBySport.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                        p.team.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const sportColorClass = sport === 'basketball' ? 'text-amber-500' : 'text-brand';
  const sportBgClass = sport === 'basketball' ? 'bg-amber-500' : 'bg-brand';
  const sportBorderClass = sport === 'basketball' ? 'border-amber-500' : 'border-brand';
  const sportFocusClass = sport === 'basketball' ? 'focus:border-amber-500' : 'focus:border-brand';
  const sportAccentClass = sport === 'basketball' ? 'accent-amber-500' : 'accent-brand';

  const getBasketballLabel = (type: 'fixed' | 'combo', primary: BasketballBasePos, secondary?: BasketballBasePos) => {
    if (type === 'fixed') return primary;
    if (primary === 'PG' && secondary === 'SG') return 'COMBO GUARD';
    if (primary === 'SG' && (secondary === 'PG' || secondary === 'SF')) return 'GUARD';
    if (primary === 'SF' && (secondary === 'SG' || secondary === 'PF')) return 'FORWARD';
    if (primary === 'PF' && (secondary === 'SF' || secondary === 'C')) return 'BIG';
    return `${primary}/${secondary}`;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer.name || !editingPlayer.team) return;

    const playerToSave = { ...editingPlayer };

    if (sport === 'basketball' && playerToSave.basketballPosDetail) {
       const detail = { ...playerToSave.basketballPosDetail };
       detail.label = getBasketballLabel(detail.type, detail.primary, detail.secondary);
       playerToSave.basketballPosDetail = detail;
    }

    if (playerToSave.id) {
       cms.updatePlayer(playerToSave.id, playerToSave);
    } else {
       const newP = {
         ...playerToSave,
         id: Math.random().toString(36).substring(7),
         fixtureHistory: [],
         statsHistory: {}
       } as Player;
       cms.addPlayer(newP);
    }
    setShowModal(false);
    setActiveSubTab('details');
  };

  const calculateSuggestedPrice = (p: Partial<Player>) => {
    const formulas = cms.priceFormulas.filter(f => f.sport === sport);
    if (formulas.length === 0) return p.price || 5.0;
    
    // In a real app we'd use a safe math parser
    const statsArr = Object.values(p.statsHistory || {});
    if (statsArr.length === 0) return 5.0;

    const avgPoints = statsArr.reduce((acc, curr) => acc + (curr.points || 0), 0) / statsArr.length;
    // Simple logic for demo: Base 5.0 + average points * multiplier
    return Math.max(3.0, Math.min(30.0, 5.0 + (avgPoints * 0.2)));
  };

  const handleApplySuggested = () => {
    const suggested = calculateSuggestedPrice(editingPlayer);
    setEditingPlayer({ ...editingPlayer, price: parseFloat(suggested.toFixed(1)) });
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-full animate-in fade-in relative">
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm">
          <div className="bg-surface border border-border w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden max-h-[90vh]">
             <div className="p-4 border-b border-border flex justify-between items-center bg-bg/50">
                <div className="flex items-center gap-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
                    {editingPlayer.id ? `Edit: ${editingPlayer.name}` : 'Create Player'}
                  </h3>
                </div>
                <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-primary transition-colors"><X size={16} /></button>
             </div>

             {editingPlayer.id && (
               <div className="flex border-b border-border bg-bg/30">
                 {[
                   { id: 'details', icon: Edit, label: 'Details' },
                   { id: 'stats', icon: BarChart2, label: 'Stats' },
                   { id: 'pricing', icon: DollarSign, label: 'Pricing' }
                 ].map((tab) => (
                   <button 
                     key={tab.id}
 
                     onClick={() => setActiveSubTab(tab.id as any)}
                     className={cn(
                       "flex items-center gap-2 px-6 py-3 text-[10px] font-mono font-bold uppercase tracking-widest border-r border-border transition-colors",
                       activeSubTab === tab.id ? cn(sportBgClass, "text-bg") : "text-text-secondary hover:bg-bg/50"
                     )}
                   >
                     <tab.icon size={12} />
                     {tab.label}
                   </button>
                 ))}
               </div>
             )}

             <form onSubmit={handleSave} className="flex-1 overflow-y-auto custom-scrollbar p-6">
               {activeSubTab === 'details' && (
                 <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono tracking-widest uppercase text-text-muted mb-1">Name</label>
                        <input required type="text" value={editingPlayer.name || ''} onChange={e => setEditingPlayer({...editingPlayer, name: e.target.value})} className={cn("w-full bg-bg border border-border px-3 py-2 text-sm text-text-primary outline-none", sportFocusClass)} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono tracking-widest uppercase text-text-muted mb-1">Team</label>
                        <input required type="text" value={editingPlayer.team || ''} onChange={e => setEditingPlayer({...editingPlayer, team: e.target.value})} className={cn("w-full bg-bg border border-border px-3 py-2 text-sm text-text-primary outline-none", sportFocusClass)} />
                      </div>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer mt-4">
                           <input type="checkbox" checked={editingPlayer.isImport || false} onChange={e => setEditingPlayer({...editingPlayer, isImport: e.target.checked})} className="accent-brand" />
                           <span className="text-sm font-mono uppercase tracking-widest text-text-primary">Is Import</span>
                        </label>
                        <label className="flex flex-col flex-1">
                           <span className="text-[10px] font-mono tracking-widest uppercase text-text-muted mb-1 mt-1">Status</span>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
                           <select value={editingPlayer.status || 'available'} onChange={e => setEditingPlayer({...editingPlayer, status: e.target.value as any})} className={cn("bg-bg border border-border px-3 py-2 text-sm text-text-primary outline-none", sportFocusClass)}>
                              <option value="available">Available</option>
                              <option value="injured">Injured</option>
                              <option value="suspended">Suspended</option>
                           </select>
                        </label>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] font-mono tracking-widest uppercase text-text-muted mb-1">Face Photo (URL or Upload)</label>
                        <div className="flex gap-2">
                           <input type="text" placeholder="https://..." value={editingPlayer.image || ''} onChange={e => setEditingPlayer({...editingPlayer, image: e.target.value})} className={cn("flex-1 bg-bg border border-border px-3 py-2 text-sm text-text-primary outline-none", sportFocusClass)} />
                           <label className={cn("cursor-pointer px-4 py-2 border flex items-center justify-center text-[10px] font-mono font-bold uppercase tracking-widest transition-colors", editingPlayer.image?.startsWith('data:') ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-surface border-border text-text-secondary hover:text-text-primary')}>
                             Upload
                             <input type="file" accept="image/*" className="hidden" onChange={e => {
                               if (e.target.files && e.target.files[0]) {
                                 const reader = new FileReader();
                                 reader.onload = (ev) => {
                                   if (ev.target?.result) setEditingPlayer({...editingPlayer, image: ev.target.result as string});
                                 };
                                 reader.readAsDataURL(e.target.files[0]);
                               }
                             }} />
                           </label>
                        </div>
                      </div>
                    </div>

                    {sport === 'basketball' ? (
                       <div className="bg-bg/50 p-4 border border-border space-y-4">
                          <div className="flex items-center justify-between">
                             <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Position Config (LEB Rules)</span>
                             <div className="flex gap-2">
                               <button 
                                 type="button" 
                                 onClick={() => setEditingPlayer({...editingPlayer, basketballPosDetail: { ...editingPlayer.basketballPosDetail!, type: 'fixed', secondary: undefined }})}
                                 className={cn("px-3 py-1 text-[10px] font-mono border transition-colors", editingPlayer.basketballPosDetail?.type === 'fixed' ? cn(sportBgClass, "text-bg", sportBorderClass) : "border-border text-text-secondary hover:text-text-primary")}
                               >
                                 FIXED
                               </button>
                               <button 
                                 type="button" 
                                 onClick={() => setEditingPlayer({...editingPlayer, basketballPosDetail: { ...editingPlayer.basketballPosDetail!, type: 'combo' }})}
                                 className={cn("px-3 py-1 text-[10px] font-mono border transition-colors", editingPlayer.basketballPosDetail?.type === 'combo' ? cn(sportBgClass, "text-bg", sportBorderClass) : "border-border text-text-secondary hover:text-text-primary")}
                               >
                                 COMBO
                               </button>
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                             <div>
                               <label className="block text-[10px] font-mono tracking-widest uppercase text-text-muted mb-1">Primary</label>
                               <select 
                                 value={editingPlayer.basketballPosDetail?.primary} 
 
                                 onChange={e => setEditingPlayer({...editingPlayer, basketballPosDetail: { ...editingPlayer.basketballPosDetail!, primary: e.target.value as any }})}
                                 className={cn("w-full bg-bg border border-border px-3 py-2 text-xs font-mono outline-none", sportFocusClass)}
                               >
                                 {['PG', 'SG', 'SF', 'PF', 'C'].map(pos => <option key={pos} value={pos}>{pos}</option>)}
                               </select>
                             </div>
                             {editingPlayer.basketballPosDetail?.type === 'combo' && (
                               <div>
                                 <label className="block text-[10px] font-mono tracking-widest uppercase text-text-muted mb-1">Secondary</label>
                                 <select 
                                   value={editingPlayer.basketballPosDetail?.secondary} 
 
                                   onChange={e => setEditingPlayer({...editingPlayer, basketballPosDetail: { ...editingPlayer.basketballPosDetail!, secondary: e.target.value as any }})}
                                   className={cn("w-full bg-bg border border-border px-3 py-2 text-xs font-mono outline-none", sportFocusClass)}
                                 >
                                   <option value="">None</option>
                                   {['PG', 'SG', 'SF', 'PF', 'C'].map(pos => <option key={pos} value={pos}>{pos}</option>)}
                                 </select>
                               </div>
                             )}
                          </div>
                          
                          <div className="pt-2">
                             <div className="text-[10px] font-mono text-text-muted mb-1">SYSTEM AUTO-LABEL:</div>
                             <div className={cn("text-sm font-bold uppercase tracking-widest", sportColorClass)}>
                                {getBasketballLabel(editingPlayer.basketballPosDetail!.type, editingPlayer.basketballPosDetail!.primary, editingPlayer.basketballPosDetail!.secondary)}
                             </div>
                          </div>
                       </div>
                    ) : (
                      <div>
                        <label className="block text-[10px] font-mono tracking-widest uppercase text-text-muted mb-1">Position</label>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
                        <select required value={editingPlayer.position} onChange={e => setEditingPlayer({...editingPlayer, position: e.target.value as any})} className={cn("w-full bg-bg border border-border px-3 py-2 text-sm text-text-primary outline-none", sportFocusClass)}>
                           {['GKP', 'DEF', 'MID', 'FWD'].map(pos => <option key={pos} value={pos}>{pos}</option>)}
                        </select>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <div className="w-1/2">
                        <label className="block text-[10px] font-mono tracking-widest uppercase text-text-muted mb-1">Status</label>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
                        <select value={editingPlayer.status} onChange={e => setEditingPlayer({...editingPlayer, status: e.target.value as any})} className={cn("w-full bg-bg border border-border px-3 py-2 text-sm text-text-primary outline-none", sportFocusClass)}>
                          <option value="available">Available</option>
                          <option value="injured">Injured</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </div>
                      <div className="w-1/2">
                        <label className="block text-[10px] font-mono tracking-widest uppercase text-text-muted mb-1">Total Points</label>
                        <input type="number" value={editingPlayer.totalPoints !== undefined && !isNaN(editingPlayer.totalPoints) ? editingPlayer.totalPoints : 0} onChange={e => { const val = parseInt(e.target.value); setEditingPlayer({...editingPlayer, totalPoints: isNaN(val) ? 0 : val}); }} className={cn("w-full bg-bg border border-border px-3 py-2 text-sm text-text-primary outline-none", sportFocusClass)} />
                      </div>
                    </div>
                 </div>
               )}

               {activeSubTab === 'stats' && (
                 <div className="space-y-6">
                    <div className="bg-bg/50 p-4 border border-border">
                       <h4 className={cn("text-[10px] font-bold font-mono tracking-widest uppercase mb-4", sportColorClass)}>Quick Match Log</h4>
                       <div className="grid grid-cols-4 gap-3">
                          {['pts', 'reb', 'ast', 'stl', 'blk', 'min'].map(stat => (
                            <div key={stat}>
                               <label className="block text-[8px] font-mono uppercase text-text-muted">{stat}</label>
                               <input type="number" className={cn("w-full bg-bg border border-border px-2 py-1 text-xs outline-none", sportFocusClass)} />
                            </div>
                          ))}
                          <div className="flex items-end col-span-2">
                             <button type="button" className={cn("w-full text-bg text-[10px] font-bold uppercase tracking-widest py-2 hover:bg-opacity-90 transition-colors shadow-sm", sportBgClass)}>Commit Game Stats</button>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Match History</span>
                       <div className="flex flex-col gap-2">
                         {Object.keys(editingPlayer.statsHistory || {}).length === 0 ? (
                           <div className="text-[10px] font-mono text-text-muted italic border-t border-border pt-4 text-center py-8">No match data logged for this season.</div>
                         ) : (
                           <div className="text-xs font-mono">Statistical breakdown logic here...</div>
                         )}
                       </div>
                    </div>
                 </div>
               )}

               {activeSubTab === 'pricing' && (
                 <div className="space-y-6">
                    <div className="flex items-center justify-between bg-bg/50 p-6 border border-border">
                       <div>
                          <div className="text-[10px] font-mono text-text-muted uppercase mb-1">Current Price</div>
                          <div className="text-3xl font-bold font-mono text-text-primary mb-1">${editingPlayer.price?.toFixed(1)}</div>
                          <div className="text-[10px] font-mono text-text-muted italic">Budget Limit: $30.0</div>
                       </div>
                       <div className="text-right">
                          <div className="text-[10px] font-mono text-text-muted uppercase mb-1">Suggested (Stats AI)</div>
                          <div className={cn("text-xl font-bold font-mono mb-2", sportColorClass)}>${calculateSuggestedPrice(editingPlayer).toFixed(1)}</div>
                          <button 
                            type="button" 
                            onClick={handleApplySuggested}
                            className={cn("flex items-center gap-2 px-4 py-1.5 text-bg text-[10px] font-bold font-mono uppercase tracking-widest hover:translate-y-[-1px] transition-transform shadow-md", sportBgClass)}
                          >
                            <Calculator size={12} /> Apply Suggested
                          </button>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <label className="block text-[10px] font-mono tracking-widest uppercase text-text-muted">Price Slider (USD)</label>
                       <input 
                         type="range" 
                         min="1" 
                         max="30" 
                         step="0.5" 
                         value={editingPlayer.price} 
                         onChange={e => setEditingPlayer({...editingPlayer, price: parseFloat(e.target.value)})}
                         className={cn("w-full cursor-pointer", sportAccentClass)} 
                       />
                       <div className="flex justify-between text-[10px] font-mono text-text-muted uppercase font-bold tracking-tighter">
                          <span>$1.0</span>
                          <span>$15.0</span>
                          <span>$30.0</span>
                       </div>
                    </div>

                    <div className="bg-surface border border-border p-4">
                       <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Calculator size={14} className={sportColorClass} />
                            <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-text-primary">Global Pricing Formula</span>
                          </div>
                       </div>
                       <div className="text-[10px] font-mono bg-bg p-3 border border-border text-text-secondary leading-relaxed font-bold">
                          {cms.priceFormulas.find(f => f.sport === sport)?.formula || "Default: points * 0.1"}
                       </div>
                    </div>
                 </div>
               )}
               
               <div className="pt-6 mt-6 border-t border-border flex justify-end gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-mono font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary">Cancel</button>
                  <button type="submit" className={cn("px-8 py-2 text-bg text-xs font-mono font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-lg active:scale-95", sportBgClass)}>
                     {editingPlayer.id ? 'Save Changes' : 'Create Player'}
                  </button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* Main Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
           <h2 className="text-3xl font-bold uppercase tracking-tighter mb-1">Manage {sport} Players</h2>
           <p className="text-xs font-mono text-text-secondary uppercase tracking-widest">Full CRUD, Statistics Engine & Formula-Based Pricing</p>
        </div>
        <button 
          onClick={() => {
            resetEditingPlayer();
            setShowModal(true);
          }} 
          className={cn("flex items-center gap-2 px-6 py-2 text-bg font-bold font-mono text-xs uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-lg hover:-translate-y-0.5", sportBgClass)}
        >
           <Plus size={14} /> Add {sport === 'basketball' ? 'Basket' : 'Foot'} Player
        </button>
      </div>

      {/* Players List Table */}
      <div className="bg-surface border border-border flex flex-col flex-1 min-h-[500px]">
        <div className="p-4 border-b border-border bg-bg/50 flex items-center justify-between gap-4">
           <div className="relative w-full max-w-sm">
             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
             <input 
               type="text" 
               placeholder={`SEARCH BY NAME OR TEAM...`}
               value={search}
               onChange={e => setSearch(e.target.value)}
               className={cn("w-full bg-bg border border-border pl-9 pr-3 py-2 text-xs font-mono uppercase tracking-widest focus:outline-none transition-all text-text-primary", sportFocusClass)}
             />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="p-16 text-center">
               <div className="text-sm font-mono text-text-muted uppercase tracking-[0.2em]">No players available in this sport category.</div>
            </div>
          ) : (
            <table className="w-full text-left border-separate border-spacing-0">
              <thead className="bg-bg/90 backdrop-blur-md sticky top-0 z-10 border-b border-border shadow-sm">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-text-secondary font-bold">Player Identity</th>
                  <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-text-secondary font-bold text-center">Position / Label</th>
                  <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-text-secondary font-bold text-center">Value</th>
                  <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-text-secondary font-bold text-center">Total Pts</th>
                  <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-text-secondary font-bold text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-bg/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className={cn("w-10 h-10 rounded-full border-2 border-border/50 bg-bg flex items-center justify-center text-xs font-bold text-text-secondary overflow-hidden transition-colors", sport === 'basketball' ? 'group-hover:border-amber-500' : 'group-hover:border-brand')}>
                           {p.image ? <img src={p.image} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" /> : p.name.charAt(0)}
                        </div>
                        <div>
                          <div className={cn("text-sm font-bold uppercase tracking-wider text-text-primary transition-colors", sport === 'basketball' ? 'group-hover:text-amber-500' : 'group-hover:text-brand')}>{p.name}</div>
                          <div className="text-[10px] font-mono text-text-muted uppercase font-bold tracking-widest">{p.team}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex justify-center">
                          <span className={cn(
                            "text-[9px] font-mono font-bold uppercase tracking-widest px-3 py-1 border transition-all",
                            sport === 'basketball' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-brand/10 text-brand border-brand/20"
                          )}>
                             {sport === 'basketball' ? (p.basketballPosDetail?.label || p.position) : p.position}
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className="text-sm font-bold font-mono tracking-tighter text-text-primary">${p.price.toFixed(1)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className="text-xs font-mono font-bold text-text-secondary bg-surface px-2 py-1 border border-border shadow-inner">{p.totalPoints}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                          <button 
                            onClick={() => {
                              setEditingPlayer(p);
                              setActiveSubTab('details');
                              setShowModal(true);
                            }}
                            className={cn("w-9 h-9 flex items-center justify-center bg-bg border border-border text-text-muted transition-all shadow-sm", sport === 'basketball' ? 'hover:border-amber-500 hover:text-amber-500' : 'hover:border-brand hover:text-brand')}
                          >
                             <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => { if(confirm('Delete player?')) cms.deletePlayer(p.id); }}
                            className="w-9 h-9 flex items-center justify-center bg-bg border border-border hover:border-danger text-text-muted hover:text-danger transition-all shadow-sm"
                          >
                             <Trash size={14} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
