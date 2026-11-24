import { apiFetch } from '../../lib/apiFetch';
import { useState, useEffect } from 'react';
import { db } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
// import { User } from '../../types';
import { Users, Activity, LayoutDashboard, Shield } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AdminOverview() {
  const { user } = useAuthStore();
  const sportColor = user?.sportAccess === 'basketball' ? 'text-amber-500' : 'text-brand';
  const sportBorder = user?.sportAccess === 'basketball' ? 'hover:border-amber-500' : 'hover:border-brand';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _sportBg = user?.sportAccess === 'basketball' ? 'bg-amber-500/10' : 'bg-brand/10';

  const [counts, setCounts] = useState({ 
    players: 0, 
    fixtures: 0, 
    activeUsers: 0,
    footPlayers: 0,
    baskPlayers: 0,
    footFixtures: 0,
    baskFixtures: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      const p = await db.getPlayers();
      const f = await db.getFixtures();
      
      const footPlayers = p.filter(x => x.sport === 'football').length;
      const baskPlayers = p.filter(x => x.sport === 'basketball').length;
      const footFixtures = f.filter(x => x.sport === 'football').length;
      const baskFixtures = f.filter(x => x.sport === 'basketball').length;

      const myPlayers = user?.sportAccess === 'all' ? p.length : (user?.sportAccess === 'basketball' ? baskPlayers : footPlayers);
      const myFixtures = user?.sportAccess === 'all' ? f.length : (user?.sportAccess === 'basketball' ? baskFixtures : footFixtures);

      setCounts({
        players: myPlayers,
        fixtures: myFixtures,
        activeUsers: 142,
        footPlayers,
        baskPlayers,
        footFixtures,
        baskFixtures
      });
    };
    fetchData();
  }, [user]);

  const platformName = user?.sportAccess === 'all' ? "Global" : (user?.sportAccess === 'basketball' ? "Basketball" : "Football");

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in text-text-primary">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-bold uppercase tracking-tighter mb-1">System Overview</h2>
           <p className="text-xs font-mono text-text-secondary uppercase tracking-widest">Real-time CMS Analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Football Stats */}
        {(user?.sportAccess === 'all' || user?.sportAccess === 'football') && (
          <div className="p-8 border border-border bg-surface hover:border-brand transition-all group">
             <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center text-brand">
                 <Activity size={20} />
               </div>
               <div>
                 <h3 className="text-lg font-bold uppercase tracking-tighter">LEB FOOTBALL</h3>
                 <p className="text-[10px] font-mono text-text-secondary uppercase">League Activity</p>
               </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-bg/50 p-4 border border-border/50">
                   <div className="text-[10px] font-mono uppercase text-text-muted mb-1">Players</div>
                   <div className="text-3xl font-bold font-mono tracking-tighter">{counts.footPlayers}</div>
                </div>
                <div className="bg-bg/50 p-4 border border-border/50">
                   <div className="text-[10px] font-mono uppercase text-text-muted mb-1">Fixtures</div>
                   <div className="text-3xl font-bold font-mono tracking-tighter">{counts.footFixtures}</div>
                </div>
             </div>
          </div>
        )}

        {/* Basketball Stats */}
        {(user?.sportAccess === 'all' || user?.sportAccess === 'basketball') && (
          <div className="p-8 border border-border bg-surface hover:border-amber-500 transition-all group">
             <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500">
                 <Activity size={20} />
               </div>
               <div>
                 <h3 className="text-lg font-bold uppercase tracking-tighter">LEB BASKETBALL</h3>
                 <p className="text-[10px] font-mono text-text-secondary uppercase">League Activity</p>
               </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-bg/50 p-4 border border-border/50">
                   <div className="text-[10px] font-mono uppercase text-text-muted mb-1">Players</div>
                   <div className="text-3xl font-bold font-mono tracking-tighter">{counts.baskPlayers}</div>
                </div>
                <div className="bg-bg/50 p-4 border border-border/50">
                   <div className="text-[10px] font-mono uppercase text-text-muted mb-1">Fixtures</div>
                   <div className="text-3xl font-bold font-mono tracking-tighter">{counts.baskFixtures}</div>
                </div>
             </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className={cn("p-6 border border-border bg-surface flex flex-col justify-between transition-colors", sportBorder)}>
            <div className="flex justify-between items-start mb-4">
               <span className="text-[10px] font-mono tracking-widest text-text-secondary uppercase">Total {platformName} Players</span>
               <Users size={16} className={sportColor} />
            </div>
            <div className="text-4xl font-bold font-mono tracking-tighter tabular-data text-text-primary">
               {counts.players}
            </div>
         </div>

         <div className={cn("p-6 border border-border bg-surface flex flex-col justify-between transition-colors", sportBorder)}>
            <div className="flex justify-between items-start mb-4">
               <span className="text-[10px] font-mono tracking-widest text-text-secondary uppercase">Total {platformName} Fixtures</span>
               <Activity size={16} className={sportColor} />
            </div>
            <div className="text-4xl font-bold font-mono tracking-tighter tabular-data text-text-primary">
               {counts.fixtures}
            </div>
         </div>

         <div className={cn("p-6 border border-border bg-surface flex flex-col justify-between transition-colors", sportBorder)}>
            <div className="flex justify-between items-start mb-4">
               <span className="text-[10px] font-mono tracking-widest text-text-secondary uppercase">Registered Users</span>
               <Shield size={16} className={sportColor} />
            </div>
            <div className="text-4xl font-bold font-mono tracking-tighter tabular-data text-text-primary">
               {counts.activeUsers}
            </div>
         </div>
      </div>

      <div className="p-8 border border-border bg-surface mt-8 flex flex-col items-center justify-center text-center opacity-50 py-16">
        <LayoutDashboard size={48} className="text-text-muted mb-4" />
        <h3 className="text-lg font-bold tracking-tighter uppercase mb-2">Welcome to LBFL/LFFL CMS</h3>
        <p className="max-w-md text-xs font-mono text-text-secondary">Use the sidebar to manage core game data (players, fixtures) or configure frontend elements.</p>
      </div>
    </div>
  );
}
