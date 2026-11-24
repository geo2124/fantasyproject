import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Trophy, Zap, Activity, Users, Shield, Globe, Clock, BarChart3, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useCmsStore } from '../../store/cmsStore';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export default function Home() {
  const cms = useCmsStore();
  const cmsData = cms.footballHome;
  const navData = cms.navigation;
  const activeBlogs = (cms.blogs || []).filter(b => b.sport === 'football' || b.sport === 'all');

  const [timeLeft, setTimeLeft] = useState({ hrs: 59, min: 58, sec: 41 });
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      badge: "GLOBAL DATABASE SYNCHRONIZED",
      title1: cmsData.heroTitle1 || "ORCHESTRATE",
      title2: cmsData.heroTitle2 || "THE PITCH.",
      paragraph: cmsData.heroSubtitle || "Granular event data. Build your squad, earn in real time.",
      bgImage: cmsData.heroImage || "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&q=80",
      bgVideo: cmsData.heroVideo || "",
      analyticsMode: "KEY MATCHUP",
      idLabel: "ID: 8472-B",
      playerA: "V. MORRETI",
      playerB: "J. ALVAREZ"
    },
    {
      badge: "AI PREDICTIVE MODELS ENGAGED",
      title1: "ANTICIPATE",
      title2: "THE BREAK.",
      paragraph: "Leverage machine learning to identify breakout potential before the market reacts. Outsmart millions of managers globally.",
      bgImage: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&q=80",
      analyticsMode: "EXPECTED GOALS",
      idLabel: "ID: 9921-X",
      playerA: "L. HENRIQUE",
      playerB: "S. AL-FARAH"
    },
    {
      badge: "ELITE LEAGUES UNLOCKED",
      title1: "DOMINATE",
      title2: "THE GLOBE.",
      paragraph: "Six premier competitions. One unified platform. Build a dynasty that spans continents and secure your place in the hall of fame.",
      bgImage: "https://images.unsplash.com/photo-1508344928928-7137b29de216?auto=format&fit=crop&q=80",
      analyticsMode: "FORM RATING",
      idLabel: "ID: 3341-OMEGA",
      playerA: "A. COSTA",
      playerB: "K. HANSEN"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.sec > 0) return { ...prev, sec: prev.sec - 1 };
        if (prev.min > 0) return { ...prev, hrs: prev.hrs, min: prev.min - 1, sec: 59 };
        if (prev.hrs > 0) return { hrs: prev.hrs - 1, min: 59, sec: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const heroTimer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 7000);
    return () => clearInterval(heroTimer);
  }, [heroSlides.length]);

  const topPerformers = [
    { rank: '01', name: 'H. MAATOUK', team: 'ANS', league: 'LBN-PREM', points: 142, value: '€13.4m', owned: '68%', trend: '+12', pos: 'FWD' },
    { rank: '02', name: 'M. HAIDAR', team: 'AHE', league: 'LBN-PREM', points: 128, value: '€12.5m', owned: '54%', trend: '+8', pos: 'MID' },
    { rank: '03', name: 'N. MATAR', team: 'NEJ', league: 'LBN-PREM', points: 121, value: '€10.8m', owned: '41%', trend: '-3', pos: 'MID' },
    { rank: '04', name: 'Z. FARRAN', team: 'AHE', league: 'LBN-PREM', points: 117, value: '€11.2m', owned: '73%', trend: '+5', pos: 'FWD' },
    { rank: '05', name: 'S. SAAD', team: 'NEJ', league: 'LBN-PREM', points: 109, value: '€9.4m', owned: '22%', trend: '+14', pos: 'MID' },
  ];

  const fixtures = [
    { type: 'TITLE DECIDER', time: 'SAT 16:30', h: 'AHE', a: 'NEJ', hLabel: 'HOME', aLabel: 'AWAY', meta: 'LBN-PREM', pts: '184.5' },
    { type: 'BEIRUT DERBY', time: 'SUN 15:00', h: 'ANS', a: 'NEJ', hLabel: 'HOME', aLabel: 'AWAY', meta: 'LBN-PREM', pts: '212.7' },
    { type: 'RIVALRY', time: 'SUN 16:45', h: 'SFA', a: 'BRJ', hLabel: 'HOME', aLabel: 'AWAY', meta: 'LBN-PREM', pts: '168.2' },
  ];

  return (
    <div className="flex flex-col w-full bg-bg selection:bg-brand selection:text-black">
      
      {/* 2. HERO SYSTEM */}
      <section className="relative w-full min-h-[700px] lg:min-h-[780px] overflow-hidden flex flex-col bg-bg">
        
        {/* Background Slider - Full Bleed */}
        <div className="absolute inset-0 z-0 bg-bg">
           {heroSlides.map((s, i) => (
             <div 
               key={i} 
               className={cn(
                 "absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out mix-blend-luminosity grayscale contrast-125",
                 i === currentSlide ? "opacity-30" : "opacity-0 pointer-events-none"
               )}
             >
                {s.bgVideo ? (
                  <video 
                    src={s.bgVideo} 
                    autoPlay loop muted playsInline 
                    className="w-full h-full object-cover object-center scale-105" 
                  />
                ) : (
                  <img 
                    src={s.bgImage} 
                    className="w-full h-full object-cover object-center scale-105" 
                    alt="" 
                  />
                )}
             </div>
           ))}
           {/* Overlays for depth */}
           <div className="absolute inset-0 bg-gradient-to-b from-bg via-transparent to-bg/80"></div>
           <div className="absolute inset-0 bg-gradient-to-r from-bg via-transparent to-transparent opacity-90"></div>
        </div>

        <div className="w-full max-w-[1500px] mx-auto px-4 md:px-8 relative z-10 flex-1 flex flex-col justify-center py-12 lg:py-16 pt-[20px] lg:pt-[40px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[48px] lg:gap-[64px] items-center w-full">
            
            <div className="lg:col-span-7 flex flex-col items-start z-10 w-full">
              <div className="inline-flex items-center gap-3 px-3 py-1.5 bg-surface/5 border border-white/5 text-[10px] lg:text-[12px] font-mono tracking-[0.1em] uppercase mb-6 rounded-sm">
                <div className="flex relative w-1.5 h-1.5 items-center justify-center shrink-0">
                   <div className="absolute w-full h-full bg-amber-500 rounded-full opacity-50 blur-[2px]"></div>
                   <div className="w-1.5 h-1.5 bg-amber-400 rotate-45 relative z-10"></div>
                </div>
                <span className="text-text-secondary font-black opacity-60">
                  {heroSlides[currentSlide].badge}
                </span>
              </div>
              
              {/* Title Container - Structured to prevent shifts */}
              <div className="min-h-[140px] lg:min-h-[180px] flex flex-col justify-end mb-6">
                <h1 className="text-[72px] lg:text-[96px] font-bold font-sans tracking-[-0.04em] leading-[0.85] text-[#EDF1F5] uppercase">
                  {heroSlides[currentSlide].title1}<br />
                  <span className="bg-gradient-to-r from-[#5DD3E8] via-[#EDF1F5] to-[#EDF1F5]/40 bg-clip-text text-transparent">
                    {heroSlides[currentSlide].title2}
                  </span>
                </h1>
              </div>
              
              {/* Paragraph Container - Structured to prevent shifts */}
              <div className="min-h-[80px] lg:min-h-[110px] mb-8">
                <p className="text-[16px] lg:text-[18px] text-text-secondary max-w-[50ch] font-medium leading-relaxed opacity-80">
                  {heroSlides[currentSlide].paragraph}
                </p>
              </div>

              <div className="flex flex-col md:flex-row items-baseline gap-10 mb-8">
                <div className="flex flex-col">
                    <span className="text-[10px] lg:text-[12px] font-mono text-brand tracking-[0.1em] uppercase mb-2 opacity-80">// GW 04 LOCK SEQUENCE</span>
                    <div className="flex items-center gap-5 font-mono text-4xl text-[#EDF1F5] tabular-data font-bold">
                      <div className="flex flex-col items-center">
                        <span>{timeLeft.hrs.toString().padStart(2, '0')}</span>
                        <span className="text-[7px] text-text-muted mt-1 uppercase tracking-widest font-bold">HRS</span>
                      </div>
                      <span className="opacity-10 mb-4 text-2xl">:</span>
                      <div className="flex flex-col items-center">
                        <span>{timeLeft.min.toString().padStart(2, '0')}</span>
                        <span className="text-[7px] text-text-muted mt-1 uppercase tracking-widest font-bold">MIN</span>
                      </div>
                      <span className="opacity-10 mb-4 text-2xl">:</span>
                      <div className="flex flex-col items-center">
                        <span>{timeLeft.sec.toString().padStart(2, '0')}</span>
                        <span className="text-[7px] text-text-muted mt-1 uppercase tracking-widest font-bold">SEC</span>
                      </div>
                    </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-brand text-bg hover:bg-[#EDF1F5] hover:text-bg shadow-[0_0_15px_rgba(38,182,177,0.3)] hover:shadow-[0_0_15px_rgba(38,182,177,0.3)] font-bold uppercase border-none px-[32px] py-[16px] h-[52px] text-[14px] rounded-none transition-colors duration-300">
                  DEPLOY SQUAD <ArrowRight className="ml-2" size={16} />
                </Button>
                <Button variant="outline" size="lg" className="bg-transparent text-[#EDF1F5] border border-border hover:bg-surface px-[32px] h-[52px] text-[14px] font-bold uppercase rounded-none transition-colors duration-300">
                  VIEW INTEL
                </Button>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col relative z-20 transition-all duration-1000 ease-in-out w-full hidden md:flex">
              <div className="w-full relative p-[1px] rounded-[8px] bg-gradient-to-b from-text-primary/20 via-text-primary/5 to-transparent">
                <div className="w-full bg-bg/80 backdrop-blur-[40px] rounded-[8px] p-[24px]">
                  <div className="absolute top-0 right-0 p-[24px] font-mono text-[12px] text-text-primary/50 tracking-[0.1em] uppercase leading-none">
                    {heroSlides[currentSlide].idLabel}
                  </div>
                  
                  <div className="pb-[16px]">
                    <span className="text-[14px] font-mono text-brand font-bold mr-2 tracking-[0.1em] uppercase">[ANALYSIS]</span>
                    <span className="text-[14px] font-sans font-semibold uppercase tracking-[0.1em] text-text-primary">{heroSlides[currentSlide].analyticsMode}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-[16px] items-center mb-[24px]">
                    {/* LEFT: Player A */}
                    <div className="flex flex-col items-center">
                      <div className="w-[80px] h-[80px] lg:w-[96px] lg:h-[96px] rounded-full p-[4px] relative bg-brand/5 border border-brand/40 mb-[12px]">
                         <div className="absolute inset-0 rounded-full border border-brand/20" style={{ animation: 'spin 8s linear infinite', margin: '-1px' }}></div>
                         <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop" alt="Player A" referrerPolicy="no-referrer" className="w-full h-full object-cover rounded-full mix-blend-luminosity grayscale contrast-125" />
                         <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-bg border border-border text-brand text-[10px] font-bold px-2 py-0.5 uppercase tracking-[0.1em] z-10 whitespace-nowrap">FWD</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[14px] font-sans font-bold text-text-primary uppercase tracking-[0.12em] leading-tight">{heroSlides[currentSlide].playerA}</div>
                        <div className="text-[12px] font-mono text-text-primary/60 mt-1 uppercase tracking-[0.1em]">CLUB // NAT</div>
                      </div>
                    </div>

                    {/* CENTER: Stats */}
                    <div className="flex flex-col gap-[12px]">
                      <div className="flex flex-col items-center">
                        <div className="text-[10px] font-sans font-semibold uppercase tracking-[0.1em] text-text-primary/40 mb-1">FORM RATING</div>
                        <div className="flex items-center gap-3">
                           <span className="text-[20px] font-bold font-mono text-brand leading-none">8.4</span>
                           <span className="text-text-primary/20 leading-none">|</span>
                           <span className="text-[14px] font-bold font-mono text-text-primary/60 leading-none">7.9</span>
                        </div>
                      </div>
                      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-border/60 to-transparent"></div>
                      <div className="flex flex-col items-center">
                        <div className="text-[10px] font-sans font-semibold uppercase tracking-[0.1em] text-text-primary/40 mb-1">THREAT XG</div>
                        <div className="flex items-center gap-3">
                           <span className="text-[14px] font-bold font-mono text-brand leading-none">+1.24</span>
                           <span className="text-text-primary/20 leading-none">|</span>
                           <span className="text-[14px] font-bold font-mono text-text-primary/60 leading-none">-0.45</span>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT: Player B */}
                    <div className="flex flex-col items-center">
                      <div className="w-[80px] h-[80px] lg:w-[96px] lg:h-[96px] rounded-full p-[4px] relative bg-text-primary/5 border border-text-primary/20 mb-[12px] opacity-90">
                         <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop" alt="Player B" referrerPolicy="no-referrer" className="w-full h-full object-cover rounded-full mix-blend-luminosity grayscale contrast-125" />
                         <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-bg border border-border text-text-primary text-[10px] font-bold px-2 py-0.5 uppercase tracking-[0.1em] z-10 whitespace-nowrap">DEF</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[14px] font-sans font-bold text-text-primary uppercase tracking-[0.12em] leading-tight opacity-90">{heroSlides[currentSlide].playerB}</div>
                        <div className="text-[12px] font-mono text-text-primary/60 mt-1 uppercase tracking-[0.1em]">CLUB // NAT</div>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="flex items-end gap-[4px] h-[64px] mb-4">
                      {[20, 30, 40, 100, 45, 35, 20].map((h, i) => (
                        <div key={i} className={cn(
                          "flex-1 transition-colors duration-300", 
                          i === 3 
                            ? "bg-brand/80 shadow-[0_0_15px_rgba(38,182,177,0.5)]" 
                            : "bg-text-primary/10 hover:bg-brand/40"
                        )} 
                        style={{ height: `${h}%` }}
                      ></div>
                      ))}
                    </div>
                     <div className="flex justify-between items-center text-[10px] font-mono text-text-primary/40 relative z-10 pointer-events-none -mt-3.5">
                       <span>GW 01</span>
                       <span className="uppercase tracking-[0.1em]">PROJECTION TREND</span>
                       <span>GW 07</span>
                     </div>
                  </div>
                </div>
              </div>

              <div className="hidden lg:flex mt-6 justify-end">
                {/* Arrow navigation has moved to a shared row for precision alignment */}
              </div>
            </div>
          </div>

          {/* SHARED NAVIGATION ROW - Precision Aligned Baseline */}
          <div className="w-full mt-3 lg:mt-4 pt-3 border-t border-border/10 flex items-center justify-between relative z-30">
             <div className="flex items-center gap-[12px]">
                {heroSlides.map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className="flex flex-col gap-1.5 outline-none group transition-all duration-500 ease-in-out"
                    style={{ width: i === currentSlide ? '48px' : '24px' }}
                  >
                     <div className={cn(
                       "h-[1px] w-full transition-colors duration-300",
                       i === currentSlide ? "bg-cyan-400" : "bg-text-primary/20 group-hover:bg-text-primary/40"
                     )}>
                     </div>
                     {i === currentSlide ? (
                       <span className="text-[10px] font-mono text-cyan-400 font-bold tabular-data uppercase tracking-[0.1em] text-left">
                          {String(i + 1).padStart(2, '0')}
                       </span>
                     ) : (
                       <span className="h-[15px] opacity-0 text-[10px] pointer-events-none">{String(i + 1).padStart(2, '0')}</span>
                     )}
                  </button>
                ))}
             </div>

             <div className="hidden md:flex items-center gap-4">
                <button 
                  onClick={() => setCurrentSlide(prev => (prev === 0 ? heroSlides.length - 1 : prev - 1))} 
                  className="w-[36px] h-[36px] border border-border bg-surface flex items-center justify-center text-text-secondary hover:bg-cyan-400 hover:text-bg hover:border-cyan-400 transition-all duration-300"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={() => setCurrentSlide(prev => (prev + 1) % heroSlides.length)} 
                  className="w-[36px] h-[36px] border border-border bg-surface flex items-center justify-center text-text-secondary hover:bg-cyan-400 hover:text-bg hover:border-cyan-400 transition-all duration-300"
                >
                  <ChevronRight size={16} />
                </button>
             </div>
          </div>
        </div>
      </section>

      {/* 3. LEAGUE TICKER */}
      <section className="bg-surface/50 backdrop-blur-sm border-y border-border py-6 w-full overflow-hidden whitespace-nowrap">
        <div className="flex animate-[ticker_30s_linear_infinite] hover:pause">
           {[...Array(2)].map((_, i) => (
             <div key={i} className="flex items-center gap-20 px-10">
                {(cmsData.tickerText || "PREMIER LEAGUE, LA LIGA, SERIE A, BUNDESLIGA, LIGUE 1").split(',').map((league, idx) => (
                  <TickerItem key={idx} id={`L-${idx}`} name={league.trim()} active={idx === 0} />
                ))}
             </div>
           ))}
        </div>
      </section>

      {/* 4. STATS + TOP PERFORMERS */}
      <section className="py-16 px-4 md:px-8 max-w-[1500px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* STATS TILES */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-4">
             <StatTile icon={<Users size={18} />} title="ACTIVE MANAGERS" value={(cmsData.statsHighlight || "2.4M+ MANAGERS ACTIVE").split(' ')[0] || "2.4M+"} meta={`// ${(cmsData.statsHighlight || "").split(' ').slice(1).join(' ') || "MANAGERS ACTIVE"}`} />
             <StatTile icon={<TrendingUp size={18} />} title="TOTAL PRIZE POOL" value="€1.2M" meta="// AWARDED MONTHLY" />
             <StatTile icon={<Activity size={18} />} title="AVG GW SCORE" value="62.4" meta="// GW04 IN PROGRESS" />
             <StatTile icon={<Zap size={18} />} title="HAT-TRICKS LOGGED" value="184" meta="// SEASON TO DATE" />
             <StatTile icon={<Globe size={18} />} title="COUNTRIES ACTIVE" value="147" meta="// GLOBAL COVERAGE" />
             <StatTile icon={<Clock size={18} />} title="TOP STREAK" value="9 GW" meta="// UNBEATEN MANAGER" />
             <StatTile icon={<Shield size={18} />} title="CLEAN SHEETS" value="312" meta="// DEFENDER BONUS ACTIVE" />
             <StatTile icon={<TrendingUp size={18} />} title="LIVE TRANSFERS" value="48K/h" meta="// DEADLINE APPROACHING" iconActive />
          </div>

          {/* TABLE */}
          <div className="lg:col-span-8 flex flex-col">
             <div className="mb-8">
               <span className="text-[10px] font-mono text-brand font-bold mr-3 tracking-[0.1em] uppercase">// GLOBAL LEADERBOARD</span>
               <div className="flex justify-between items-baseline mt-2">
                  <h2 className="text-4xl font-semibold font-sans text-text-primary uppercase tracking-tight">TOP <span className="text-text-primary/60">PERFORMERS</span></h2>
                  <span className="text-[10px] font-mono text-text-primary/40 uppercase tracking-[0.1em]">SEASON POINTS</span>
               </div>
             </div>

             <div className="flex flex-col border border-border rounded-[8px] bg-surface/30 backdrop-blur-sm overflow-hidden">
                <div className="grid grid-cols-12 px-6 py-4 border-b border-border/50 text-[10px] font-mono text-text-primary/40 uppercase tracking-[0.1em]">
                   <div className="col-span-1">RANK</div>
                   <div className="col-span-4">PLAYER</div>
                   <div className="col-span-2">LEAGUE</div>
                   <div className="col-span-1 text-center">POINTS</div>
                   <div className="col-span-2 text-right">VALUE</div>
                   <div className="col-span-2 text-right">OWNED %</div>
                </div>
                {topPerformers.map((player) => (
                   <div key={player.rank} className="grid grid-cols-12 px-6 py-4 border-b border-border/50 last:border-0 hover:bg-surface/60 transition-all items-center group cursor-pointer">
                      <div className="col-span-1 text-2xl font-bold font-mono text-text-primary/20 group-hover:text-brand transition-colors tabular-data leading-none uppercase">
                        {player.rank.toString().padStart(2, '0')}
                      </div>
                      <div className="col-span-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-surface overflow-hidden shrink-0 border border-border group-hover:border-cyan-400/30 transition-colors p-[2px]">
                          <img src={`https://i.pravatar.cc/150?u=${player.name}`} alt="" referrerPolicy="no-referrer" className="mix-blend-luminosity grayscale contrast-125 group-hover:grayscale-0 transition-all w-full h-full object-cover rounded-full" />
                        </div>
                        <div className="flex flex-col">
                           <div className="flex items-center gap-2">
                             <span className="text-[14px] font-semibold text-text-primary uppercase tracking-[0.1em] font-sans group-hover:text-cyan-400 transition-colors leading-none">{player.name}</span>
                             <span className="text-[10px] bg-cyan-400/10 border border-cyan-400/30 px-1.5 py-0.5 text-cyan-400 font-bold uppercase tracking-[0.1em]">{player.pos}</span>
                           </div>
                           <span className="text-[10px] font-mono text-text-primary/40 uppercase tracking-[0.1em] mt-1">{player.team}</span>
                        </div>
                      </div>
                      <div className="col-span-2 text-[10px] font-mono text-text-primary/60 uppercase tracking-[0.1em]">
                        {player.league}
                      </div>
                      <div className="col-span-1 text-center font-mono font-bold text-text-primary tabular-data text-[14px]">
                        {player.points}
                      </div>
                      <div className="col-span-2 text-right font-mono font-bold text-cyan-400 tabular-data text-[14px]">
                        {player.value}
                      </div>
                      <div className="col-span-2 text-right font-mono font-bold text-text-primary tabular-data text-[14px]">
                        {player.owned} <span className={cn("text-[10px] ml-1.5", player.trend.startsWith('+') ? "text-cyan-400" : "text-danger")}>{player.trend.startsWith('+') ? '↑' : '↓'} {player.trend.replace(/[+-]/, '')}</span>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURED FIXTURES */}
      <section className="py-16 bg-surface border-y border-border">
         <div className="px-4 md:px-8 max-w-[1500px] mx-auto w-full">
            <div className="mb-10">
               <span className="text-[10px] font-mono text-cyan-400 font-bold mr-3 tracking-[0.1em] uppercase">// ROUND 04 WATCHLIST</span>
               <div className="flex justify-between items-baseline mt-2">
                  <h2 className="text-4xl font-semibold font-sans text-text-primary uppercase tracking-tight">FEATURED <span className="text-cyan-400">FIXTURES</span></h2>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-text-primary/40 uppercase tracking-[0.1em]">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                    GW 04 LIVE
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {fixtures.map((f, i) => (
                 <div key={i} className="bg-bg/50 border border-border/50 p-8 rounded-[8px] group hover:border-cyan-400/40 transition-all cursor-pointer relative overflow-hidden backdrop-blur-sm">
                    <div className="absolute top-0 right-0 p-6 font-mono text-[10px] text-text-primary/40 uppercase tracking-[0.1em]">{f.time}</div>
                    <div className="mb-8">
                       <span className="text-[10px] font-mono text-cyan-400 bg-cyan-400/5 px-2 py-1 border border-cyan-400/20 uppercase tracking-[0.1em] font-semibold">{f.type}</span>
                    </div>

                    <div className="space-y-6 mb-10">
                       <div className="flex justify-between items-center group-hover:translate-x-1 transition-transform">
                          <span className="text-3xl font-bold font-sans text-text-primary tracking-tight uppercase">{f.h}</span>
                          <span className="text-[10px] font-mono text-text-primary/40 uppercase tracking-[0.1em]">{f.hLabel}</span>
                       </div>
                       <div className="flex justify-between items-center group-hover:translate-x-1 transition-transform delay-75">
                          <span className="text-3xl font-bold font-sans text-text-primary/60 tracking-tight uppercase">{f.a}</span>
                          <span className="text-[10px] font-mono text-text-primary/40 uppercase tracking-[0.1em]">{f.aLabel}</span>
                       </div>
                    </div>

                    <div className="flex justify-between items-end pt-6 border-t border-border/50">
                       <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-mono text-text-primary/40 uppercase tracking-[0.1em]">{f.meta}</span>
                          <span className="text-[14px] font-bold font-mono text-cyan-400 uppercase tabular-data tracking-tight">{f.pts} <span className="text-[10px] font-normal ml-1 text-text-primary/60">PTS</span></span>
                       </div>
                       <div className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center text-text-primary/60 group-hover:bg-cyan-400 group-hover:border-cyan-400 group-hover:text-bg transition-all group-hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                          <ChevronRight size={18} />
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* 6. PULSE CHANNEL */}
      <section className="py-16 px-4 md:px-8 max-w-[1500px] mx-auto w-full">
         <div className="mb-10">
            <span className="text-[10px] font-mono text-cyan-400 font-bold mr-3 tracking-[0.1em] uppercase">// LIVE INTELLIGENCE</span>
            <div className="flex justify-between items-baseline mt-2">
               <h2 className="text-4xl font-semibold font-sans text-text-primary uppercase tracking-tight">PULSE <span className="text-cyan-400">CHANNEL</span></h2>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* News List */}
            <div className="lg:col-span-7 flex flex-col">
               <div className="flex items-center justify-between mb-6 px-6 py-4 bg-surface/50 border border-t-0 border-r-0 border-b-0 border-l-2 border-l-cyan-400 backdrop-blur-sm shadow-sm rounded-r-[8px]">
                  <div className="flex items-center gap-4">
                     <BarChart3 className="text-cyan-400 w-[16px] h-[16px]" />
                     <span className="text-[12px] font-semibold font-sans uppercase tracking-[0.1em] text-text-primary">MANAGER BRIEF</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.1em] cursor-pointer hover:opacity-80 transition-opacity">// ALL UPDATES</span>
               </div>
               
               <div className="space-y-4">
                  {activeBlogs.slice(0, 4).map(blog => (
                    <NewsItem key={blog.id} tag={blog.tag} time={blog.date} title={blog.title} body={blog.excerpt} />
                  ))}
               </div>
            </div>

            {/* Live Poll / Captaincy */}
            <div className="lg:col-span-5">
               <div className="bg-surface/50 border border-border/50 p-8 rounded-[8px] backdrop-blur-sm flex flex-col h-full">
                  <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-4">
                        <Trophy className="text-cyan-400 w-[16px] h-[16px]" />
                        <span className="text-[12px] font-semibold font-sans uppercase tracking-[0.1em] text-text-primary">GW CAPTAINCY</span>
                     </div>
                     <span className="text-[10px] font-mono text-amber-500 uppercase tracking-[0.1em] underline decoration-2 underline-offset-4 decoration-amber-500/20">LIVE POLL</span>
                  </div>

                  <div className="flex flex-col gap-3 mb-8">
                     <div className="flex w-full h-[6px] bg-border/30 overflow-hidden rounded-full">
                        <div className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" style={{ width: '42%' }}></div>
                        <div className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] ml-px" style={{ width: '24%' }}></div>
                        <div className="h-full bg-text-primary ml-px" style={{ width: '18%' }}></div>
                        <div className="h-full bg-text-primary/40 ml-px" style={{ width: '11%' }}></div>
                        <div className="h-full bg-border ml-px" style={{ width: '5%' }}></div>
                     </div>
                  </div>

                  <div className="space-y-4 mb-auto">
                     <PollOption color="bg-cyan-400" name="L. HENRIQUE" team="PSG" pct="42%" active />
                     <PollOption color="bg-amber-500" name="V. MORRETI" team="MIL" pct="24%" />
                     <PollOption color="bg-text-primary" name="K. HANSEN" team="BAY" pct="18%" />
                     <PollOption color="bg-text-primary/40" name="A. COSTA" team="RMA" pct="11%" />
                     <PollOption color="bg-border" name="OTHERS" team="//" pct="5%" />
                  </div>

                  <Button className="w-full mt-8 h-12 uppercase tracking-[0.1em] font-semibold text-[12px] border border-cyan-400/40 text-cyan-400 bg-cyan-400/5 hover:bg-cyan-400 hover:text-bg transition-all rounded-[4px]">
                    CAST YOUR CAPTAIN
                  </Button>
               </div>
            </div>
         </div>
      </section>

      {/* 7. ACHIEVEMENTS + FINAL CTA */}
      <section className="py-24 bg-surface/30 border-y border-border">
         <div className="px-4 md:px-8 max-w-[1500px] mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
               
               <div className="flex flex-col">
                  <div className="flex items-center gap-3 mb-8">
                     <Shield className="text-cyan-400" size={18} />
                     <span className="text-[12px] font-mono font-semibold uppercase tracking-[0.1em] text-text-primary">SEASON OBJECTIVES</span>
                     <span className="text-[10px] font-mono text-text-primary/60 uppercase tracking-[0.1em] ml-auto">03 / 18 UNLOCKED</span>
                  </div>
                  <div className="space-y-4">
                     <AchievementBar tier="GOLD" label="TREBLE THREAT" sub="Score 100+ in three consecutive gameweeks" pct={66} />
                     <AchievementBar tier="SILVER" label="GLOBE TROTTER" sub="Field a player from all six leagues" pct={100} />
                     <AchievementBar tier="BRONZE" label="DIFFERENTIAL KING" sub="Captain a sub-5% owned player to 15+ pts" pct={30} />
                  </div>
               </div>

               <div className="bg-surface/50 border border-cyan-400/20 p-10 lg:p-12 relative flex flex-col justify-center overflow-hidden rounded-[8px] backdrop-blur-sm">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 scale-150 pointer-events-none">
                    <Trophy size={300} />
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4 relative z-10">
                     <span className="text-cyan-400 text-[10px] font-mono font-semibold tracking-[0.1em] uppercase">// GAMEWEEK CUP</span>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-bold uppercase font-sans tracking-tight leading-none mb-4 relative z-10">
                    KNOCKOUT BEGINS<br />
                    <span className="text-cyan-400">GW 17.</span>
                  </h3>
                  <p className="text-text-primary/60 text-[14px] max-w-[360px] mb-10 leading-relaxed font-mono relative z-10">
                    Single elimination. €250k pot. Top 2,048 managers from the regular season qualify automatically.
                  </p>

                  <div className="flex flex-wrap gap-8 items-center mb-10 relative z-10">
                     <div className="flex flex-col">
                        <span className="text-3xl font-bold font-mono text-text-primary tabular-data">8K</span>
                        <span className="text-[10px] font-mono text-text-primary/40 uppercase tracking-[0.1em] mt-1">SLOTS</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-3xl font-bold font-mono text-cyan-400 tabular-data">11</span>
                        <span className="text-[10px] font-mono text-text-primary/40 uppercase tracking-[0.1em] mt-1">ROUNDS</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-3xl font-bold font-mono text-text-primary tabular-data">€250K</span>
                        <span className="text-[10px] font-mono text-text-primary/40 uppercase tracking-[0.1em] mt-1">POT</span>
                     </div>
                  </div>

                  <Button className="w-full md:w-fit bg-cyan-400 text-bg hover:bg-[#EDF1F5] hover:text-bg font-bold tracking-[0.1em] px-12 h-[52px] text-[14px] uppercase rounded-[4px] shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-colors duration-300 relative z-10 border-none">
                    RESERVE MY SLOT <ArrowRight className="ml-3" size={16} />
                  </Button>
               </div>

            </div>
         </div>
      </section>

      {/* 8. FOOTER - UPDATED COMPLEX VERSION */}
      <footer className="pt-24 pb-12 px-4 md:px-8 bg-bg border-t border-border">
         <div className="max-w-[1500px] mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
               <div className="flex flex-col">
                  <Link to="/" className="flex items-center gap-3 mb-6">
                    <span className="w-2 h-2 bg-cyan-400"></span>
                    <div className="flex items-baseline gap-2">
                       <span className="text-[18px] font-black font-sans tracking-tight text-text-primary uppercase italic">LFFL</span>
                       <span className="text-[10px] font-mono text-text-primary/60 uppercase tracking-[0.1em]">// FANTASY LEAGUE</span>
                    </div>
                  </Link>
                  <p className="text-[12px] text-text-primary/60 font-mono leading-relaxed max-w-[260px]">
                    The global fantasy management terminal for elite club owners.
                  </p>
               </div>

               <FooterCol title="COMPETE" links={navData.footerCol1} sport="football" />

               <FooterCol title="TOOLS" links={navData.footerCol2} sport="football" />

               <FooterCol title="ACCOUNT" links={navData.footerCol3} sport="football" />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border/50 text-[10px] font-mono text-text-primary/40 uppercase tracking-[0.1em]">
               <span>© {new Date().getFullYear()} SYNDICATE FC // ALL CHANNELS SYNCHRONIZED</span>
               <div className="flex items-center gap-6 mt-4 md:mt-0">
                  <span className="text-cyan-400">V.4.20.1 — STABLE</span>
               </div>
            </div>
         </div>
      </footer>

    </div>
  );
}

function StatTile({ icon, title, value, meta, iconActive = false }: { icon: React.ReactNode, title: string, value: string, meta: string, iconActive?: boolean }) {
  return (
    <div className="bg-surface/50 border border-border/50 p-6 flex flex-col group hover:bg-surface transition-all cursor-crosshair rounded-[8px]">
       <div className="flex justify-between items-start mb-4">
          <div className={cn("transition-colors uppercase shrink-0", iconActive ? "text-cyan-400" : "text-text-primary/40 group-hover:text-cyan-400")}>
            {icon}
          </div>
          <div className="w-10 h-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rotate-12">
            {icon}
          </div>
       </div>
       <span className="text-[10px] font-mono text-text-primary/40 uppercase tracking-[0.1em] mb-2">{title}</span>
       <span className="text-3xl font-bold font-mono text-text-primary tabular-data mb-2 tracking-tight leading-none">{value}</span>
       <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.1em] font-semibold">{meta}</span>
    </div>
  );
}

function TickerItem({ id, name, active = false }: { id: string, name: string, active?: boolean }) {
  return (
    <div className="flex items-center gap-3 group cursor-default">
       <div className={cn("w-1.5 h-1.5 rotate-45 border border-border group-hover:bg-cyan-400 group-hover:border-cyan-400 transition-colors", active && "bg-cyan-400 border-cyan-400")}></div>
       <span className="text-[12px] font-mono font-semibold tracking-[0.1em] text-text-primary flex items-baseline gap-2 uppercase">
         {id} <span className="text-text-primary/40 font-normal">{name}</span>
       </span>
    </div>
  );
}

function NewsItem({ tag, time, title, body }: { tag: string, time: string, title: string, body: string }) {
  return (
    <div className="p-6 border border-border/50 hover:border-cyan-400/40 transition-all bg-surface/5 backdrop-blur-sm cursor-pointer group hover:bg-surface/10 rounded-[8px]">
       <div className="flex items-center gap-4 mb-4">
          <Badge variant="outline" className="text-[10px] font-mono border-cyan-400/30 text-cyan-400 bg-cyan-400/[0.03] font-semibold px-2 py-0.5 tracking-[0.1em] uppercase rounded-[4px]">{tag}</Badge>
          <span className="text-[10px] font-mono text-text-primary/40 uppercase tracking-[0.1em]">{time}</span>
       </div>
       <h4 className="text-[16px] font-bold text-text-primary uppercase group-hover:text-cyan-400 transition-colors mb-2 leading-tight tracking-tight font-sans">{title}</h4>
       <p className="text-[12px] text-text-primary/60 font-mono leading-relaxed">{body}</p>
    </div>
  );
}

function PollOption({ color, name, team, pct, active = false }: { color: string, name: string, team: string, pct: string, active?: boolean }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer border border-border/20 hover:border-border/50 bg-bg/20 hover:bg-bg/40 p-4 rounded-[4px] transition-all">
       <div className="flex items-center gap-4">
          <div className={cn("w-1.5 h-1.5 shrink-0 rounded-full", color, active && "shadow-[0_0_8px_rgba(34,211,238,0.8)]")}></div>
          <div className="flex items-baseline gap-2.5">
             <span className={cn("text-[12px] font-semibold uppercase tracking-[0.1em] font-sans transition-colors", active ? "text-cyan-400" : "text-text-primary group-hover:text-cyan-400")}>{name}</span>
             <span className="text-[10px] font-mono text-text-primary/40 uppercase tracking-[0.1em]">{team}</span>
          </div>
       </div>
       <span className={cn("text-[12px] font-mono font-bold tabular-data transition-colors", active ? "text-cyan-400" : "text-text-primary/60 group-hover:text-text-primary")}>{pct}</span>
    </div>
  );
}

function AchievementBar({ tier, label, sub, pct }: { tier: 'GOLD' | 'SILVER' | 'BRONZE', label: string, sub: string, pct: number }) {
  const colors = {
    GOLD: 'text-amber-500 border-amber-500/30 bg-amber-500/10',
    SILVER: 'text-gray-400 border-gray-400/30 bg-gray-400/10',
    BRONZE: 'text-orange-900 border-orange-900/30 bg-orange-900/10',
  };
  return (
    <div className="flex flex-col gap-4 p-6 border border-border/50 group hover:border-cyan-400/30 transition-all bg-surface/50 backdrop-blur-sm cursor-help rounded-[8px]">
       <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
             <div className={cn("text-[10px] font-semibold font-mono px-2 py-0.5 border uppercase tracking-[0.1em] rounded-[4px]", colors[tier])}>{tier}</div>
             <span className="text-[14px] font-semibold font-sans text-text-primary uppercase tracking-[0.1em] group-hover:text-cyan-400 transition-colors">{label}</span>
          </div>
          <span className="text-[12px] font-mono font-bold text-text-primary/60 tabular-data group-hover:text-text-primary transition-colors tracking-tight">{pct}%</span>
       </div>
       <p className="text-[10px] text-text-primary/40 font-mono uppercase tracking-[0.1em] leading-relaxed">{sub}</p>
       <div className="w-full h-1.5 bg-border/30 overflow-hidden relative rounded-full">
          <div className="absolute inset-0 bg-cyan-400/10 animate-pulse"></div>
          <div className="h-full bg-cyan-400 relative z-10 transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(34,211,238,0.5)] rounded-full" style={{ width: `${pct}%` }}></div>
       </div>
    </div>
  );
}

function FooterCol({ title, links = [], sport }: { title: string, links?: { label: string, to: string }[], sport: string }) {
  return (
    <div className="flex flex-col">
       <span className="text-[12px] font-mono text-cyan-400 font-semibold uppercase tracking-[0.1em] mb-6">// {title}</span>
       <nav className="flex flex-col gap-3">
          {(links || []).map((link, i) => (
             <Link key={i} to={link.to.startsWith('/') ? `/${sport}${link.to}` : `/${sport}/${link.to}`} className="text-[10px] font-mono text-text-primary/60 uppercase tracking-[0.1em] hover:text-cyan-400 transition-colors">
                {link.label}
             </Link>
          ))}
       </nav>
    </div>
  );
}
