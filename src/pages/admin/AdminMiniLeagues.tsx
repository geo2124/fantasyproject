import { apiFetch } from '../../lib/apiFetch';
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';

export default function AdminMiniLeagues() {
 
  const [leagues, setLeagues] = useState<any[]>([]);

  useEffect(() => {
    fetchLeagues();
  }, []);

  const fetchLeagues = async () => {
    try {
      const res = await apiFetch('/api/admin/minileagues');
      const data = await res.json();
      setLeagues(data || []);
    } catch (e) {
      console.error("Failed to fetch mini leagues", e);
    }
  };

  const deleteLeague = async (id: string) => {
    if (!confirm("Are you sure you want to delete this mini league?")) return;
    try {
      await apiFetch(`/api/admin/minileagues/${id}`, { method: 'DELETE' });
      fetchLeagues();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8 pb-32">
       <div className="flex justify-between items-end mb-8">
         <div>
           <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Mini Leagues</h1>
           <p className="text-sm font-mono text-text-secondary w-2/3">Manage all private mini-leagues across sports.</p>
         </div>
       </div>

       <div className="bg-surface border border-border">
          <table className="w-full text-left text-sm font-mono">
            <thead>
              <tr className="bg-bg border-b border-border uppercase tracking-widest text-[10px] text-text-secondary">
                <th className="p-4">Name</th>
                <th className="p-4">Sport</th>
                <th className="p-4">Code</th>
                <th className="p-4">Members</th>
                <th className="p-4">Created Date</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
              {leagues.map((l: any) => (
                <tr key={l.id} className="border-b border-border hover:bg-bg/50">
                  <td className="p-4 font-bold max-w-[200px] truncate" title={l.name}>{l.name}</td>
                  <td className="p-4 uppercase">{l.sport}</td>
                  <td className="p-4 font-bold text-brand uppercase tracking-widest">{l.code}</td>
                  <td className="p-4">{l.members?.length || 0}</td>
                  <td className="p-4 text-text-muted">{new Date(l.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <button onClick={() => deleteLeague(l.id)} className="text-[10px] font-bold text-red-500 hover:text-red-400 uppercase tracking-widest">Delete</button>
                  </td>
                </tr>
              ))}
              {leagues.length === 0 && (
                <tr>
                   <td colSpan={6} className="p-4 text-center text-text-muted">No mini leagues running</td>
                </tr>
              )}
            </tbody>
          </table>
       </div>
    </div>
  );
}
