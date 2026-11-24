import { useState, useEffect } from 'react';
import { db } from '../../services/api';
import { User } from '../../types';
import { useAuthStore } from '../../store/authStore';
import {  Trash, Lock } from 'lucide-react';
import { cn } from '../../lib/utils';

import { useParams } from 'react-router-dom';

export default function AdminUsers({ sport: sportProp }: { sport?: 'football' | 'basketball' | 'global' }) {
  const { sport: paramSport } = useParams<{ sport: string }>();
  const sport = sportProp || paramSport as 'football' | 'basketball' | 'global' || 'global';

  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);

  // The view changes appearance based on if they are locked into one sport vs global
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _activeColor = sport === 'basketball' ? 'text-amber-500' : 'text-brand';
  const activeBg = sport === 'basketball' ? 'bg-amber-500' : 'bg-brand';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _activeHover = sport === 'basketball' ? 'hover:text-amber-500' : 'hover:text-brand';

  const fetchUsers = async () => {
    const allUsers = await db.getUsers();
    // In a real app we might only fetch users engaged in this sport.
    // For now we show all users or filter if we can tell their sport.
    // We'll just show all users, but hide the global settings if admin is restricted.
    setUsers(allUsers);
  };

  useEffect(() => {
    fetchUsers();
  }, [sport]);

  const handleDelete = async (id: string) => {
    // Basic protection against deleting oneself
    if (id === currentUser?.id) return;
    await db.deleteUser(id);
    fetchUsers();
  };

  const handleUpdateRole = async (id: string, role: string, sportAccess?: string) => {
    if (id === currentUser?.id) return;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.updateUser(id, { role: role as 'admin' | 'user', sportAccess: sportAccess as any });
    fetchUsers();
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-full animate-in fade-in">
      <div className="flex justify-between items-end mb-8">
        <div>
           <h2 className="text-3xl font-bold uppercase tracking-tighter mb-1">User Management</h2>
           <p className="text-xs font-mono text-text-secondary uppercase tracking-widest">
             {sport === 'global' ? 'Manage Global Platform Users' : `Manage ${sport} Users`}
           </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {users.map(u => (
          <div key={u.id} className="bg-surface border border-border p-4 flex items-center justify-between group">
            <div className="flex gap-4 items-center">
               <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold font-mono tracking-tighter border border-border", activeBg, "text-bg")}>
                 {u.username.substring(0, 2).toUpperCase()}
               </div>
               <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold uppercase tracking-widest">{u.username}</span>
                    {u.role === 'admin' && (
                       <span className={cn("text-[8px] font-mono uppercase tracking-widest px-2 py-0.5 border", sport === 'basketball' ? 'border-amber-500/30 text-amber-500' : 'border-brand/30 text-brand')}>
                         Admin ({u.sportAccess})
                       </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-text-secondary tracking-widest">{u.email}</span>
               </div>
            </div>
            
            <div className="flex items-center gap-4">
              {currentUser?.sportAccess === 'all' && u.id !== currentUser.id && (
                <div className="flex flex-col items-end gap-1 mr-4">
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase">
                     <span className="text-text-muted">Role:</span>
                     <select 
                       value={u.role} 
                       onChange={(e) => handleUpdateRole(u.id, e.target.value, u.sportAccess)}
                       className="bg-bg border border-border px-2 py-1 text-text-primary outline-none"
                     >
                       <option value="user">User</option>
                       <option value="admin">Admin</option>
                     </select>
                  </div>
                  {u.role === 'admin' && (
                     <div className="flex items-center gap-2 text-[10px] font-mono uppercase">
                       <span className="text-text-muted">Access:</span>
                       <select 
                         value={u.sportAccess} 
                         onChange={(e) => handleUpdateRole(u.id, u.role, e.target.value)}
                         className="bg-bg border border-border px-2 py-1 text-text-primary outline-none"
                       >
                         <option value="all">All</option>
                         <option value="football">Football</option>
                         <option value="basketball">Basketball</option>
                       </select>
                     </div>
                  )}
                </div>
              )}
              
              <button 
                onClick={() => handleDelete(u.id)} 
                disabled={u.id === currentUser?.id}
                className={cn("w-8 h-8 flex items-center justify-center bg-bg border border-border transition-colors text-text-secondary", u.id === currentUser?.id ? "opacity-50 cursor-not-allowed" : "hover:border-danger hover:text-danger")}
              >
                {u.id === currentUser?.id ? <Lock size={14} /> : <Trash size={14} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
