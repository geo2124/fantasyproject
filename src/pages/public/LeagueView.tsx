import { apiFetch } from '../../lib/apiFetch';
import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Trophy, Users, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface MiniLeague {
  code: string;
  name: string;
  type: string;
  sport: string;
  creatorId: string;
  members: { userId: string; email: string }[];
}

export default function LeagueView({ sport }: { sport: 'football' | 'basketball' }) {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const [league, setLeague] = useState<MiniLeague | null>(null);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore(state => state.user);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!code) {
      setError("No league code provided");
      setLoading(false);
      return;
    }

    const fetchLeague = async () => {
      try {
        const res = await apiFetch(`/api/leagues/${code}`);
        if (!res.ok) throw new Error("League not found");
        const data = await res.json();
        setLeague(data);
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError(String(e));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLeague();
  }, [code]);

  const handleJoin = async () => {
    if (!user) {
      navigate(`/${sport}/login?redirect=/league?code=${code}`);
      return;
    }
    try {
      const res = await apiFetch('/api/minileagues/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: league?.code,
          userId: user.id,
          email: user.username + '@example.com' // Using username as mock email
        })
      });
      if (!res.ok) throw new Error("Failed to join league");
      const updatedLeague = await res.json();
      setLeague(updatedLeague);
    } catch(e: unknown) {
      if (e instanceof Error) {
        alert(e.message);
      } else {
        alert(String(e));
      }
    }
  };

  if (loading) {
    return (
      <div className="p-24 flex justify-center text-text-muted animate-pulse font-mono uppercase tracking-widest text-[10px]">
        Locating mini-league instance...
      </div>
    );
  }

  if (error || !league) {
    return (
      <div className="p-24 flex flex-col items-center justify-center text-center max-w-xl mx-auto">
        <AlertCircle size={48} className="text-danger mb-6" />
        <h1 className="text-3xl font-black uppercase tracking-tighter text-text-primary mb-2">Access Denied</h1>
        <p className="text-text-secondary font-mono text-sm leading-relaxed mb-8">
          The league code "{code}" does not match any active database records. Please verify the credentials with your league administrator.
        </p>
        <Link to={`/${sport}`} className="text-[10px] font-mono tracking-widest font-bold uppercase py-3 px-6 bg-surface border border-border hover:bg-border transition-colors text-text-primary">
          Return to Hub
        </Link>
      </div>
    );
  }

  const isMember = user && league.members.some((m) => m.userId === user.id);

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-12 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <div className="text-[10px] font-mono tracking-widest uppercase text-brand mb-2 flex items-center gap-2">
            <Trophy size={14} /> 
            {league.type === 'h2h' ? 'Head-to-Head League' : 'Classic Roto League'}
          </div>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-text-primary italic">
            {league.name}
          </h1>
        </div>
        {!isMember && (
          <div className="bg-surface p-6 border border-border min-w-[280px]">
            <h3 className="text-[10px] font-mono tracking-widest uppercase text-text-muted mb-4">Unregistered Agent</h3>
            <button onClick={handleJoin} className="w-full bg-brand text-bg hover:opacity-90 font-bold uppercase tracking-widest text-[10px] py-3 rounded-none flex justify-center items-center gap-2 transition-all">
              {user ? 'Join League' : 'Login to Join'} <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-surface/50 border border-border p-6 md:p-8 relative overflow-hidden">
           <Users size={120} className="absolute -bottom-6 -right-6 text-border opacity-20 pointer-events-none" />
           <h2 className="text-sm font-mono tracking-widest uppercase text-text-primary font-bold mb-6">Registered Managers ({(league?.members || []).length})</h2>
           <div className="flex flex-col gap-2 relative z-10">
              {(league?.members || []).map((m, i: number) => (
                <div key={m.userId || i} className="p-4 border-b border-border/50 bg-bg/50 flex justify-between items-center last:border-0 hover:bg-bg transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono tracking-wider text-text-muted">{String(i+1).padStart(2, '0')}</span>
                    <span className="font-bold text-sm tracking-wide text-text-primary uppercase">{m.email?.split('@')[0] || 'Unknown Manager'}</span>
                    {m.userId === league?.creatorId && (
                      <span className="text-[8px] border border-amber-500/30 text-amber-500 bg-amber-500/10 px-1.5 py-0.5 tracking-widest uppercase font-mono">Admin</span>
                    )}
                  </div>
                  {/* Since this is a public view, maybe we don't show specific points unless authenticated? Or maybe we do show points. */}
                  <span className="text-xl font-mono tabular-data font-bold tracking-tighter text-text-primary">--</span>
                </div>
              ))}
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-surface border border-border p-6 shadow-xl shadow-bg">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-text-muted border-b border-border pb-3 mb-4">League Meta</h3>
              <div className="space-y-4">
                 <div>
                    <div className="text-[9px] font-mono text-text-secondary uppercase tracking-widest mb-1">League Type</div>
                    <div className="text-sm font-bold uppercase tracking-wide text-text-primary">{league.type === 'h2h' ? 'H2H Knockouts' : 'Classic Roto'}</div>
                 </div>
                 <div>
                    <div className="text-[9px] font-mono text-text-secondary uppercase tracking-widest mb-1">Sport Context</div>
                    <div className="text-sm font-bold uppercase tracking-wide text-text-primary">{league.sport}</div>
                 </div>
                 {isMember && (
                   <div>
                      <div className="text-[9px] font-mono text-text-secondary uppercase tracking-widest mb-1">Registry Code (Share)</div>
                      <div className="text-xl font-mono tracking-widest text-brand font-bold bg-bg p-2 text-center border-l-2 border-brand mt-1 uppercase selection:bg-brand selection:text-bg">{league.code}</div>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
