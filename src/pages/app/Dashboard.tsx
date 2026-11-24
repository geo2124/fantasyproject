import { useAuthStore } from '../../store/authStore';
import { useCmsStore } from '../../store/cmsStore';
import { db } from '../../services/api';
import { Fixture,  Squad } from '../../types';
import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  BrainCircuit, 
  TrendingUp, 
  Zap, 
  Activity, 
  ChevronRight, 
  AlertCircle,
  Trophy,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  Users,
  Search,
  ArrowUpRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface AIInsight {
  id: string;
  type: 'transfer' | 'captain' | 'risk';
  title: string;
  description: string;
  impactScore: number;
}

export default function Dashboard({ sport }: { sport: 'football' | 'basketball' }) {
  const user = useAuthStore(state => state.user);
  const cms = useCmsStore();
  const [squad, setSquad] = useState<Squad | null>(null);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'ai' | 'market'>('overview');

  const players = cms.players.filter(p => p.sport === sport);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const s = await db.getSquad(user.id, sport);
      const f = await db.getFixtures();
      
      setSquad(s);
      setFixtures(f.filter(x => x.sport === sport));
      setLoading(false);
    };
    fetchData();
  }, [user, sport]);

  const aiInsights = useMemo<AIInsight[]>(() => [
    {
      id: '1',
      type: 'transfer',
      title: 'Scout: High ROI Found',
      description: `Based on last 3 games, ${sport === 'basketball' ? 'Wael Arakji' : 'Hassan Maatouk'} is outperforming his price point by 23%.`,
      impactScore: 88
    },
    {
      id: '2',
      type: 'captain',
      title: 'Optimal Captaincy',
      description: 'Algorithm suggests switching captain for GameWeek 12 due to favorable defensive matchups.',
      impactScore: 72
    },
    {
      id: '3',
      type: 'risk',
      title: 'Injury Alert',
      description: '2 players in your starting lineup have a medium probability of rotation risk.',
      impactScore: 45
    },
    {
      id: '4',
      type: 'transfer',
      title: 'Differential Alert',
      description: 'Ownership for Ali Haidar remains under 5% despite consistent double-double performance.',
      impactScore: 91
    }
  ], [sport]);

  const winningProbability = useMemo(() => {
    // Mock probability calculation based on squad strength
    return 65 + (squad?.totalPoints ? (squad.totalPoints % 20) : 0);
  }, [squad]);

  const squadValue = useMemo(() => {
    if (!squad) return 0;
    return squad.players.reduce((sum, sp) => {
      const p = players.find(x => x.id === sp.playerId);
      return sum + (p?.price || 0);
    }, 0);
  }, [squad, players]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-24 space-y-4">
      <div className={cn("w-12 h-12 border-4 border-t-transparent rounded-full animate-spin", sport === 'basketball' ? 'border-amber-500' : 'border-brand')}></div>
      <div className="text-xs font-mono text-text-muted uppercase tracking-[0.3em] animate-pulse">Synchronizing AI Node...</div>
    </div>
  );

  const sportColor = sport === 'basketball' ? 'text-amber-500' : 'text-brand';
  const sportBg = sport === 'basketball' ? 'bg-amber-500' : 'bg-brand';
  const sportBorder = sport === 'basketball' ? 'border-amber-500' : 'border-brand';
  const sportBgLight = sport === 'basketball' ? 'bg-amber-500/10' : 'bg-brand/10';
  const sportBgMedium = sport === 'basketball' ? 'bg-amber-500/20' : 'bg-brand/20';
  const sportHoverBg = sport === 'basketball' ? 'hover:bg-amber-500/40' : 'hover:bg-brand/40';
  const sportHoverBorder = sport === 'basketball' ? 'hover:border-amber-500' : 'hover:border-brand';

  return (
    <div className="space-y-8 pb-12">
      {/* Header with Sub-Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <div className={cn("w-2 h-2 rounded-full animate-pulse", sportBg)} />
             <span className="text-[10px] font-mono font-bold tracking-widest text-text-muted uppercase">Live Season: {sport}</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-text-primary uppercase tracking-tighter italic">Command Center</h1>
        </div>
        
        <div className="flex gap-1 bg-bg p-1 border border-border">
          {[
            { id: 'overview', icon: Activity, label: 'Overview' },
            { id: 'ai', icon: BrainCircuit, label: 'AI Scout' },
            { id: 'market', icon: TrendingUp, label: 'Trends' }
          ].map(t => (
            <button
              key={t.id}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={() => setActiveTab(t.id as any)}
              className={cn(
                "flex items-center gap-2 px-6 py-2 text-[10px] font-mono font-bold uppercase tracking-widest transition-all",
                activeTab === t.id ? "bg-surface text-text-primary shadow-sm" : "text-text-muted hover:text-text-primary hover:bg-surface/50"
              )}
            >
              <t.icon size={12} className={activeTab === t.id ? sportColor : ''} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4"
          >
            {/* Main Stats Bento */}
            <div className="md:col-span-2 lg:col-span-2 bg-surface border border-border p-8 flex flex-col justify-between relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Trophy size={120} className={sportColor} />
               </div>
               <div>
                 <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-4">Current Standing</p>
                 <div className="text-6xl font-black tracking-tighter text-text-primary italic">#{squad?.overallRank?.toLocaleString()}</div>
                 <div className={cn("mt-4 flex items-center gap-2 text-xs font-mono", sportColor)}>
                    <ArrowUpRight size={14} />
                    <span>+1,240 SPOTS SINCE LAST GW</span>
                 </div>
               </div>
               <Link to={`/${sport}/dashboard/standings`} className="mt-8 flex items-center justify-between group/link">
                 <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-muted group-hover/link:text-text-primary transition-colors">View All Leagues</span>
                 <ChevronRight size={14} className="text-text-muted" />
               </Link>
            </div>

            <div className="md:col-span-2 lg:col-span-2 bg-surface/50 border border-border p-8 flex flex-col items-center justify-center relative group">
               <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-6 absolute top-8 left-8">Win Probability</div>
               <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle 
                      cx="80" cy="80" r="70" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="8" 
                      className="text-border" 
                    />
                    <circle 
                      cx="80" cy="80" r="70" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="8" 
                      strokeDasharray={440}
                      strokeDashoffset={440 - (440 * (isNaN(winningProbability) ? 0 : winningProbability)) / 100}
                      className={cn("transition-all duration-1000 ease-out", sportColor)} 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black italic">{isNaN(winningProbability) ? 0 : winningProbability}%</span>
                    <span className="text-[8px] font-mono text-text-muted uppercase">VS NEXT OPPONENT</span>
                  </div>
               </div>
               <div className="mt-6 flex items-center gap-2">
                 <BrainCircuit size={12} className={sportColor} />
                 <span className="text-[10px] font-mono font-bold uppercase tracking-widest animate-pulse transition-all">AI ANALYZING DATA...</span>
               </div>
            </div>

            <div className="md:col-span-2 lg:col-span-2 bg-surface border border-border p-8 flex flex-col justify-between relative overflow-hidden text-text-primary">
               <div>
                 <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-4 text-text-muted">Total Points</p>
                 <div className="text-6xl font-black tracking-tighter italic">{squad?.totalPoints?.toLocaleString()}</div>
                 <div className="mt-4 flex items-center gap-3">
                   <div className="h-1 flex-1 bg-bg border border-border overflow-hidden">
                     <div className={cn("h-full w-[60%]", sportBg)} />
                   </div>
                   <span className="text-[10px] font-mono text-text-muted uppercase">TOP 5%</span>
                 </div>
               </div>
               <div className="mt-8 pt-6 border-t border-border flex justify-between">
                  <div>
                    <p className="text-[8px] font-mono uppercase text-text-muted">Last GW</p>
                    <p className="text-lg font-bold font-mono">68</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-mono uppercase text-text-muted">Average</p>
                    <p className="text-lg font-bold font-mono">42</p>
                  </div>
               </div>
            </div>

            <div className={cn("md:col-span-2 lg:col-span-2 p-8 text-bg flex flex-col justify-between shadow-xl shadow-brand/10", sportBg)}>
               <div>
                 <Zap size={32} fill="currentColor" className="mb-6" />
                 <h3 className="text-2xl font-black uppercase tracking-tighter leading-tight mb-2">Build Your<br/>Win Streak</h3>
                 <p className="text-xs opacity-80 leading-relaxed font-medium">Squad value is currently trending up.</p>
               </div>
               <Link to={`/${sport}/dashboard/transfers`} className="mt-6 w-full py-3 bg-bg text-text-primary flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all font-mono font-bold uppercase text-[10px] tracking-widest shadow-xl">
                 GO TO MARKET <ArrowUpRight size={14} />
               </Link>
            </div>

            <div className="md:col-span-4 lg:col-span-4 bg-bg border border-border">
               <div className="p-4 border-b border-border flex justify-between items-center bg-surface/50">
                 <div className="flex items-center gap-2">
                   <Activity size={12} className={sportColor} />
                   <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Live Activity Feed</span>
                 </div>
               </div>
               <div>
                  {[
                    { time: '12m ago', icon: AlertCircle, text: `Injury Update: ${sport === 'basketball' ? 'Wael Arakji' : 'Hassan Maatouk'} questionable for next match.`, color: 'text-danger' },
                    { time: '1h ago', icon: TrendingUp, text: `Market Alert: ${sport === 'basketball' ? 'Sergio El Darwich' : 'Kassem El Zein'} price increased by €0.2m.`, color: sportColor },
                    { time: '3h ago', icon: Zap, text: 'New Challenge: Join the Lebanon Pro Cup and win rewards.', color: 'text-amber-500' },
                    { time: '5h ago', icon: Search, text: 'Scout Report: 3 highly efficient defenders found for under €5.0m.', color: 'text-text-muted' },
                  ].map((item, i) => (
                    <div key={i} className="px-6 py-4 border-b border-border last:border-0 hover:bg-surface/30 transition-colors flex items-center gap-4 group">
                       <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-text-muted">
                          <item.icon size={14} className={item.color} />
                       </div>
                       <div className="flex-1">
                         <p className="text-xs font-bold uppercase tracking-wider text-text-primary">{item.text}</p>
                         <p className="text-[10px] font-mono text-text-muted uppercase mt-0.5">{item.time}</p>
                       </div>
                       <ChevronRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                    </div>
                  ))}
               </div>
            </div>

            <div className="md:col-span-2 lg:col-span-2 bg-surface/30 border border-border border-dashed p-8">
               <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-6">Financial Oversight</p>
               <div className="flex items-end justify-between gap-4 mb-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-mono text-text-muted">EQUITY</span>
                    <span className="text-2xl font-bold font-mono tracking-tighter text-text-primary">€{squadValue.toFixed(1)}M</span>
                  </div>
                  <div className="flex flex-col gap-1 text-right">
                    <span className="text-xs font-mono text-text-muted">LIQUIDITY</span>
                    <span className={cn("text-2xl font-bold font-mono tracking-tighter", sportColor)}>€{squad?.bank?.toFixed(1)}M</span>
                  </div>
               </div>
               <div className="h-12 flex gap-1 items-end">
                  {[40, 60, 45, 80, 75, 40, 55, 90, 85, 70].map((h, i) => (
                    <div key={i} className={cn("flex-1 transition-colors cursor-help", sportBgLight, sportHoverBg)} style={{ height: `${h}%` }} />
                  ))}
               </div>
               <p className="mt-4 text-[8px] font-mono leading-relaxed text-text-muted uppercase tracking-tighter">Your squad value has outperformed the league average by 12.4% over the last 30 days.</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'ai' && (
          <motion.div 
            key="ai"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="bg-bg border border-border overflow-hidden">
               <div className="p-6 border-b border-border bg-surface/50 flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", sportBgLight, sportColor)}>
                    <BrainCircuit size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-tight text-text-primary">AI Scouting Core</h3>
                    <p className="text-[10px] font-mono text-text-muted uppercase">Vescio-AI v4.1 Active</p>
                  </div>
               </div>
               <div className="p-6 space-y-6">
                  {aiInsights.map((insight) => (
                    <div key={insight.id} className={cn("relative p-6 border border-border bg-surface/30 group transition-colors", sportHoverBorder)}>
                       <div className="absolute top-0 right-0 bg-bg border-l border-b border-border p-3 flex flex-col items-center">
                          <span className="text-[8px] font-mono text-text-muted uppercase">CONFIDENCE</span>
                          <span className={cn("text-sm font-bold font-mono", sportColor)}>{insight.impactScore}%</span>
                       </div>
                       <h4 className="text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2 text-text-primary">
                          <Zap size={14} className={sportColor} />
                          {insight.title}
                       </h4>
                       <p className="text-xs text-text-secondary leading-relaxed mb-4 max-w-[80%]">{insight.description}</p>
                       <button className={cn("text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all", sportColor)}>
                         Apply Suggestion <ArrowUpRight size={12} />
                       </button>
                    </div>
                  ))}
               </div>
            </div>

            <div className="space-y-6">
               <div className="bg-surface border border-border p-8">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-text-muted mb-4 text-text-muted">Neural Predictions (Next GW)</h4>
                  <div className="space-y-4">
                     {[
                       { label: 'Win Probability', val: '72%', color: sportBg },
                       { label: 'Projected Points', val: '58.4', color: 'bg-amber-500' },
                       { label: 'Cleanup Sheet Prob.', val: '31%', color: 'bg-indigo-500' }
                     ].map(stat => (
                       <div key={stat.label}>
                         <div className="flex justify-between text-[10px] font-mono font-bold uppercase mb-2 text-text-primary">
                            <span className="text-text-muted">{stat.label}</span>
                            <span>{stat.val}</span>
                         </div>
                         <div className="h-1.5 bg-bg border border-border overflow-hidden">
                           <div className={cn("h-full", stat.color)} style={{ width: stat.val.includes('%') ? stat.val : '60%' }} />
                         </div>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="bg-bg border border-border p-8 relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-5 rotate-12 pointer-events-none">
                    <BrainCircuit size={160} />
                  </div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-text-muted mb-4 italic text-text-muted">The AI Perspective</h4>
                  <p className="text-sm italic leading-relaxed text-text-primary font-medium opacity-80">
                    "Analyzing collective transfer patterns within the top 100 players reveals a significant shift towards defensive depth for GameWeek 12. My recommendation: Prioritize bench reliability over high-variance midfielders this cycle."
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                     <div className={cn("w-8 h-8 rounded-full border p-1", sportBorder, sportBgLight)}>
                        <BrainCircuit size={20} className={sportColor} />
                     </div>
                     <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-text-primary">Vescio-AI Agent</span>
                  </div>
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'market' && (
          <motion.div 
            key="market"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="md:col-span-2 bg-surface border border-border p-8">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold uppercase tracking-tighter italic text-text-primary">Player Value Trajectory</h3>
                    <div className="flex gap-4">
                      {['7D', '30D', 'ALL'].map(d => (
                        <button key={d} className={cn("text-[10px] font-mono font-bold p-1 border-b-2 border-transparent transition-all text-text-muted hover:text-text-primary", sport === 'basketball' ? 'hover:border-amber-500' : 'hover:border-brand')}>{d}</button>
                      ))}
                    </div>
                 </div>
                 <div className="h-64 flex items-end gap-2 pb-2">
                    {Array.from({length: 20}).map((_, i) => {
                      const h = Math.random() * 80 + 20;
                      return (
                        <div 
                          key={i} 
                          className={cn("flex-1 transition-all rounded-t-sm group relative", sportBgMedium, sportHoverBg)}
                          style={{ height: `${h}%` }}
                        >
                          <div className="absolute bottom-full left-1/2 translate-x-[-50%] mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-text-primary text-bg text-[8px] font-mono px-2 py-1 z-20">
                            GW {i + 1}: {h.toFixed(0)} Pts
                          </div>
                        </div>
                      );
                    })}
                 </div>
                 <div className="flex justify-between mt-4 text-[10px] font-mono font-bold uppercase text-text-muted tracking-tighter">
                    <span>GW 1</span>
                    <span>GW 5</span>
                    <span>GW 10</span>
                    <span>TODAY</span>
                 </div>
               </div>

               <div className="bg-bg border border-border flex flex-col">
                  <div className="p-6 border-b border-border bg-surface/30">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-text-primary">Trending Hot</h3>
                  </div>
                  <div className="flex-1">
                     {players.slice(0, 5).map((p, i) => (
                       <div key={p.id} className="p-4 border-b border-border last:border-0 flex items-center justify-between hover:bg-surface/50 transition-colors">
                          <div className="flex items-center gap-3">
                             <div className="text-xs font-mono font-bold text-text-muted">0{i+1}</div>
                             <div>
                               <div className="text-xs font-bold uppercase text-text-primary">{p.name}</div>
                               <div className="text-[10px] font-mono text-text-muted uppercase">{p.team}</div>
                             </div>
                          </div>
                          <div className="text-right">
                             <div className={cn("text-xs font-mono font-bold flex items-center gap-1 justify-end", sportColor)}>
                               <ArrowUpRight size={10} /> +{Math.random().toFixed(1)}%
                             </div>
                             <div className="text-[10px] font-mono text-text-muted uppercase">€{p.price.toFixed(1)}m</div>
                          </div>
                       </div>
                     ))}
                  </div>
                  <Link to={`/${sport}/dashboard/players`} className="p-4 text-[10px] font-mono font-bold uppercase text-center bg-surface hover:bg-border transition-colors text-text-primary border-t border-border">
                    Explore Full Market
                  </Link>
               </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
