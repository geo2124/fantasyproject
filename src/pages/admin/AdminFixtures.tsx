import { apiFetch } from '../../lib/apiFetch';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../services/api';
import { Fixture } from '../../types';
import {  Plus,  Edit, Trash, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AdminFixtures() {
  const { sport } = useParams<{ sport: string }>();
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFixture, setEditingFixture] = useState<Partial<Fixture>>({ 
     homeTeam: '', awayTeam: '', date: new Date().toISOString().slice(0, 16), 
     status: 'upcoming', homeScore: 0, awayScore: 0, sport: (sport as 'football' | 'basketball') 
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const f = await db.getFixtures();
      setFixtures(f.filter(x => x.sport === sport));
      setLoading(false);
    };
    fetchData();
    setEditingFixture(prev => ({ ...prev, sport: (sport as 'football' | 'basketball') }));
  }, [sport]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFixture.homeTeam || !editingFixture.awayTeam) return;

    if (editingFixture.id) {
       // Update existing
       setFixtures(fixtures.map(f => f.id === editingFixture.id ? { ...f, ...editingFixture as Fixture } : f));
    } else {
       // Create new
       const newF = {
         ...editingFixture,
         id: Math.random().toString(36).substring(7)
       } as Fixture;
       setFixtures([...fixtures, newF]);
    }
    setShowModal(false);
  };

  const handleEdit = (f: Fixture) => {
    setEditingFixture({ ...f, date: f.date.slice(0, 16) }); // naive transform for datetime-local
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setFixtures(fixtures.filter(f => f.id !== id));
  };

  const sportColorClass = sport === 'basketball' ? 'text-amber-500' : 'text-brand';
  const sportBgClass = sport === 'basketball' ? 'bg-amber-500' : 'bg-brand';
  const sportBorderClass = sport === 'basketball' ? 'border-amber-500' : 'border-brand';
  const sportFocusClass = sport === 'basketball' ? 'focus:border-amber-500' : 'focus:border-brand';

  const handleAddNew = () => {
    setEditingFixture({ 
       homeTeam: '', awayTeam: '', date: new Date().toISOString().slice(0, 16), 
       status: 'upcoming', homeScore: 0, awayScore: 0, sport: (sport as 'football' | 'basketball') 
    });
    setShowModal(true);
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-full animate-in fade-in relative">
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm">
          <div className="bg-surface border border-border w-full max-w-md flex flex-col shadow-2xl">
             <div className="p-4 border-b border-border flex justify-between items-center bg-bg/50">
               <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
                 {editingFixture.id ? 'Edit Fixture' : 'Add New Fixture'}
               </h3>
               <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-primary transition-colors"><X size={16} /></button>
             </div>
             <form onSubmit={handleSave} className="p-6 space-y-4">
               <div className="flex gap-4">
                 <div className="w-1/2">
                   <label className="block text-[10px] font-mono tracking-widest uppercase text-text-secondary mb-1">Home Team</label>
                   <input required type="text" value={editingFixture.homeTeam || ''} onChange={e => setEditingFixture({...editingFixture, homeTeam: e.target.value})} className={cn("w-full bg-bg border border-border px-3 py-2 text-sm text-text-primary outline-none", sportFocusClass)} />
                 </div>
                 <div className="w-1/2">
                   <label className="block text-[10px] font-mono tracking-widest uppercase text-text-secondary mb-1">Away Team</label>
                   <input required type="text" value={editingFixture.awayTeam || ''} onChange={e => setEditingFixture({...editingFixture, awayTeam: e.target.value})} className={cn("w-full bg-bg border border-border px-3 py-2 text-sm text-text-primary outline-none", sportFocusClass)} />
                 </div>
               </div>
               <div>
                  <label className="block text-[10px] font-mono tracking-widest uppercase text-text-secondary mb-1">Date & Time</label>
                  <input required type="datetime-local" value={editingFixture.date || ''} onChange={e => setEditingFixture({...editingFixture, date: e.target.value})} className={cn("w-full bg-bg border border-border px-3 py-2 text-sm text-text-primary outline-none custom-calendar-icon", sportFocusClass)} />
               </div>
               <div className="flex gap-4">
                 <div className="w-1/3">
                   <label className="block text-[10px] font-mono tracking-widest uppercase text-text-secondary mb-1">Status</label>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
                   <select required value={editingFixture.status || 'upcoming'} onChange={e => setEditingFixture({...editingFixture, status: e.target.value as any})} className={cn("w-full bg-bg border border-border px-3 py-2 text-sm text-text-primary outline-none uppercase font-mono text-[10px]", sportFocusClass)}>
                     <option value="upcoming">Upcoming</option>
                     <option value="live">Live</option>
                     <option value="finished">Finished</option>
                   </select>
                 </div>
                 <div className="w-1/3">
                   <label className="block text-[10px] font-mono tracking-widest uppercase text-text-secondary mb-1">Home Score</label>
                   <input type="number" min="0" value={editingFixture.homeScore !== undefined && !isNaN(editingFixture.homeScore) ? editingFixture.homeScore : ''} onChange={e => { const val = parseInt(e.target.value); setEditingFixture({...editingFixture, homeScore: isNaN(val) ? undefined : val}); }} className={cn("w-full bg-bg border border-border px-3 py-2 text-sm text-text-primary outline-none tabular-data", sportFocusClass)} disabled={editingFixture.status === 'upcoming'} />
                 </div>
                 <div className="w-1/3">
                   <label className="block text-[10px] font-mono tracking-widest uppercase text-text-secondary mb-1">Away Score</label>
                   <input type="number" min="0" value={editingFixture.awayScore !== undefined && !isNaN(editingFixture.awayScore) ? editingFixture.awayScore : ''} onChange={e => { const val = parseInt(e.target.value); setEditingFixture({...editingFixture, awayScore: isNaN(val) ? undefined : val}); }} className={cn("w-full bg-bg border border-border px-3 py-2 text-sm text-text-primary outline-none tabular-data", sportFocusClass)} disabled={editingFixture.status === 'upcoming'} />
                 </div>
               </div>
               <div className="pt-4 mt-2 border-t border-border flex justify-end gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-mono font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary">Cancel</button>
                  <button type="submit" className={cn("px-4 py-2 text-bg text-xs font-mono font-bold uppercase tracking-widest hover:bg-opacity-90", sportBgClass)}>Save Fixture</button>
               </div>
             </form>
          </div>
        </div>
      )}

      <div className="flex justify-between items-end mb-8">
        <div>
           <h2 className="text-3xl font-bold uppercase tracking-tighter mb-1">Manage {sport} Fixtures</h2>
           <p className="text-xs font-mono text-text-secondary uppercase tracking-widest">Schedule and Results Management</p>
        </div>
        <button onClick={handleAddNew} className={cn("flex items-center gap-2 px-4 py-2 text-bg font-bold font-mono text-xs uppercase tracking-widest hover:bg-opacity-90 transition-colors", sportBgClass)}>
           <Plus size={14} /> Add New {sport === 'basketball' ? 'Game' : 'Match'}
        </button>
      </div>

      <div className="bg-surface border border-border flex flex-col flex-1 min-h-[500px]">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-12 text-center text-text-secondary uppercase tracking-widest text-sm">Loading...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-bg/80 backdrop-blur-sm sticky top-0 z-10 border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-[10px] font-mono uppercase tracking-widest text-text-secondary font-semibold">Date</th>
                  <th className="px-6 py-3 text-[10px] font-mono uppercase tracking-widest text-text-secondary font-semibold">Matchup</th>
                  <th className="px-6 py-3 text-[10px] font-mono uppercase tracking-widest text-text-secondary font-semibold">Status</th>
                  <th className="px-6 py-3 text-[10px] font-mono uppercase tracking-widest text-text-secondary font-semibold">Score</th>
                  <th className="px-6 py-3 text-[10px] font-mono uppercase tracking-widest text-text-secondary font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {fixtures.map(f => (
                  <tr key={f.id} className="hover:bg-bg/50 transition-colors group">
                    <td className="px-6 py-3 text-xs font-mono text-text-secondary uppercase">{f.date}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
                        <span>{f.homeTeam}</span>
                        <span className="text-text-muted px-2 italic">VS</span>
                        <span>{f.awayTeam}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                       <span className={cn("text-[9px] font-mono px-2 py-0.5 border uppercase tracking-widest font-bold", 
                         f.status === 'live' ? "bg-danger/10 border-danger text-danger animate-pulse" : 
                         f.status === 'finished' ? "bg-text-muted/10 border-text-muted text-text-muted" : 
                         cn("bg-opacity-10", sportBgClass, sportBorderClass, sportColorClass))}>
                         {f.status}
                       </span>
                    </td>
                    <td className="px-6 py-3 font-mono text-sm">
                       {f.status === 'upcoming' ? '-- : --' : `${f.homeScore} - ${f.awayScore}`}
                    </td>
                    <td className="px-6 py-3 text-right">
                       <div className="flex items-center gap-4 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(f)} className={cn("transition-colors", sport === 'basketball' ? 'text-text-secondary hover:text-amber-500' : 'text-text-secondary hover:text-brand')}><Edit size={14} /></button>
                          <button onClick={() => handleDelete(f.id)} className="text-text-secondary hover:text-danger transition-colors"><Trash size={14} /></button>
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
