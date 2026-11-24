import { apiFetch } from '../../lib/apiFetch';
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';

export default function AdminDrafts() {
 
  const [drafts, setDrafts] = useState<any[]>([]);

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      const res = await apiFetch('/api/drafts');
      const data = await res.json();
      setDrafts(data || []);
    } catch (e) {
      console.error("Failed to fetch drafts", e);
    }
  };

  const deleteDraft = async (id: string) => {
    if (!confirm("Are you sure you want to delete this draft?")) return;
    try {
      await apiFetch(`/api/drafts/${id}`, { method: 'DELETE' });
      fetchDrafts();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-4 sm:p-8 pb-32">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 sm:mb-8 gap-4">
         <div>
           <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Draft Servers</h1>
           <p className="text-sm font-mono text-text-secondary md:w-2/3">Manage all active and completed draft lobbies.</p>
         </div>
       </div>

       <div className="bg-surface border border-border overflow-x-auto">
          <table className="w-full text-left text-sm font-mono min-w-[700px]">
            <thead>
              <tr className="bg-bg border-b border-border uppercase tracking-widest text-[10px] text-text-secondary">
                <th className="p-4">Name</th>
                <th className="p-4">Sport</th>
                <th className="p-4">Type</th>
                <th className="p-4">Privacy</th>
                <th className="p-4">Status</th>
                <th className="p-4">Teams</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
              {drafts.map((d: any) => (
                <tr key={d.id} className="border-b border-border hover:bg-bg/50">
                  <td className="p-4 font-bold">{d.name}</td>
                  <td className="p-4 uppercase">{d.sport}</td>
                  <td className="p-4 uppercase">{d.draftType || 'auction'}</td>
                  <td className="p-4">{d.isPublic ? 'Public' : 'Private'}</td>
                  <td className="p-4 uppercase text-[10px]"><span className={`px-2 py-1 ${d.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-brand/10 text-brand'}`}>{d.status}</span></td>
                  <td className="p-4">{d.membersCount} / {d.maxTeams}</td>
                  <td className="p-4">
                    <button onClick={() => deleteDraft(d.id)} className="text-[10px] font-bold text-red-500 hover:text-red-400 uppercase tracking-widest">Delete</button>
                  </td>
                </tr>
              ))}
              {drafts.length === 0 && (
                <tr>
                   <td colSpan={7} className="p-4 text-center text-text-muted">No draft servers active</td>
                </tr>
              )}
            </tbody>
          </table>
       </div>
    </div>
  );
}
