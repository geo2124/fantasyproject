import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { useCmsStore } from '../../store/cmsStore';
import { Moon, Sun, ChevronDown, Menu, X, Instagram, FileDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { downloadBasketballGuidePdf } from '../../lib/downloadGuide';

export default function GlobalHeader({ sport = 'football' }: { sport?: 'football' | 'basketball' }) {
  const { theme, toggleTheme } = useThemeStore();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user } = useAuthStore();
  const cms = useCmsStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleDownloadPdf = async () => {
    const ok = await downloadBasketballGuidePdf();
    if (!ok) {
      navigate('/basketball/guide');
    }
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenAccordion(null);
  }, [location.pathname]);

  const toggleAccordion = (name: string) => {
    setOpenAccordion(prev => prev === name ? null : name);
  };

  const competitions = sport === 'football' ? [
    { name: 'PREMIER LEAGUE', caption: 'Lebanon // 12 clubs', code: 'LPL' },
    { name: 'SECOND DIVISION', caption: 'Lebanon // 12 clubs', code: 'LSD' },
    { name: 'LEBANON CUP', caption: 'Knockout Tournament', code: 'CUP' },
    { name: 'ELITE CUP', caption: 'Top 6 Tournament', code: 'ELT' },
    { name: 'SUPER CUP', caption: 'Champion vs Cup Winner', code: 'SUP' },
    { name: 'CHALLENGE CUP', caption: 'Bottom 6 Tournament', code: 'CHL' },
  ] : [
    { name: 'DIVISION 1', caption: 'Lebanon // 10 clubs', code: 'LBL' },
    { name: 'DIVISION 2', caption: 'Lebanon // 12 clubs', code: 'LD2' },
    { name: 'LEBANESE CUP', caption: 'Knockout Tournament', code: 'CUP' },
    { name: 'SUPER CUP', caption: 'Champion vs Cup Winner', code: 'SUP' },
    { name: 'YOUTH LEAGUE', caption: 'U18 Championship', code: 'YTH' },
    { name: 'WOMENS LBL', caption: 'Division 1 Women', code: 'WBL' },
  ];

  const analytics = [
    { title: 'GLOBAL RANKING', caption: 'All managers' },
    { title: 'PERFORMANCE HEATMAP', caption: 'xG vs actual' },
    { title: 'OWNERSHIP TRENDS', caption: 'Live transfer flow' },
    { title: 'PREDICTIVE MODEL', caption: 'AI forecasts' },
  ];

  const navItemBase = "px-3 py-2 font-sans text-[12px] font-semibold tracking-[0.1em] uppercase border-b-2 transition-colors duration-200";
  const navItemActive = sport === 'basketball' ? "border-amber-500/50 text-[#EDEFF2]" : "border-brand/50 text-[#EDEFF2]";
  const navItemInactive = "border-transparent text-[#9AA3B2] hover:border-text-primary h-full flex items-center";
  const activeColorText = sport === 'basketball' ? "text-amber-500" : "text-brand";
  const activeColorBg = sport === 'basketball' ? "bg-amber-500" : "bg-brand";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _activeColorBorder = sport === 'basketball' ? "border-amber-500" : "border-brand";
  const hoverActiveColorBg = sport === 'basketball' ? "hover:bg-amber-500" : "hover:bg-brand";
  const hoverActiveColorBorder = sport === 'basketball' ? "hover:border-amber-500" : "hover:border-brand";
  const hoverActiveColorText = sport === 'basketball' ? "hover:text-amber-500" : "hover:text-brand";

  return (
    <div className="w-full flex flex-col z-50 sticky top-0 relative">
      {/* ROW 1: Utility Bar (~36px) */}
      <div className="h-9 border-b border-border bg-bg/95 backdrop-blur-sm flex justify-between items-center px-4 md:px-6">
        {/* Left Utility */}
        <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-text-secondary">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            GW 04 LIVE
          </div>
          <div className="w-px h-3 bg-border"></div>
          <div className="hidden sm:block">2.4M MANAGERS ONLINE</div>
          <div className="w-px h-3 bg-border hidden sm:block"></div>
          <button onClick={toggleTheme} className="hover:text-text-primary transition-colors flex items-center justify-center">
            {theme === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
          </button>
        </div>

        {/* Right Utility */}
        <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-text-secondary">
          <button
            onClick={handleDownloadPdf}
            className={`hidden md:inline-flex items-center gap-1 border border-border px-2.5 py-1 ${hoverActiveColorText} ${hoverActiveColorBorder} transition-colors duration-200 ease-in-out text-text-secondary`}
            title="Download Basketball Fantasy Guide PDF"
          >
            <FileDown size={11} /> GUIDE PDF
          </button>
          <Link to="/basketball/guide" className={`hidden sm:block ${hoverActiveColorText} transition-colors duration-200 ease-in-out`}>
            GUIDE
          </Link>
          <Link to={`/${sport}/login`} className="hover:text-white transition-colors duration-200 ease-in-out hidden sm:block">
            AUTHENTICATE
          </Link>
          <Link to={`/${sport}/register`} className={`flex items-center gap-1 border border-border px-3 py-1 ${hoverActiveColorBg} hover:text-black ${hoverActiveColorBorder} transition-colors duration-200 ease-in-out text-text-primary`}>
            INITIALIZE <span className="ml-1">→</span>
          </Link>
          <div className="w-px h-3 bg-border hidden lg:block"></div>
          <div className="hidden lg:flex items-center gap-3">
            <Instagram size={12} className={`${hoverActiveColorText} cursor-pointer transition-colors duration-200 ease-in-out`} />
            <svg viewBox="0 0 24 24" fill="currentColor" className={`w-3 h-3 ${hoverActiveColorText} cursor-pointer transition-colors duration-200 ease-in-out`}>
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
            </svg>
            {/* Minimal SVG for TikTok/Other placeholder */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-3 h-3 ${hoverActiveColorText} cursor-pointer transition-colors duration-200 ease-in-out`}><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
          </div>
        </div>
      </div>

      {/* ROW 2: Main Navigation (~64px) */}
      <header className="h-16 border-b border-border bg-surface/95 backdrop-blur-md flex justify-between items-center px-4 md:px-6">
        
        {/* Left: Brand */}
        <Link to={`/${sport}`} className="flex items-center gap-3 group">
          <span className={cn("w-2 h-2 rounded-full animate-pulse-opacity", activeColorBg)}></span>
          <div className="flex items-baseline gap-2">
            <span className={cn("text-xl md:text-2xl font-black font-sans tracking-tight text-text-primary transition-colors uppercase italic", sport === 'basketball' ? "group-hover:text-amber-500" : "group-hover:text-brand")}>
              {sport === 'basketball' ? 'LBFL' : 'LFFL'}
            </span>
            <span className={cn("text-[10px] font-mono uppercase tracking-widest", activeColorText)}>// FANTASY LEAGUE</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex h-full items-center">
          <div className="flex h-full items-center mr-8 gap-2">
            {(cms.navigation?.mainNav || []).map(nav => {
              let pathStr = nav.to;
              if (pathStr === '/league') pathStr = '/leagues';
              if (pathStr === '/scout') pathStr = '/players';
              if (pathStr === '/news') pathStr = '/match-center';
              
              const toPath = pathStr.startsWith('/') ? `/${sport}${pathStr}` : `/${sport}/${pathStr}`;
              return (
              <NavLink 
                key={nav.id}
                to={toPath} 
                className={({ isActive }) => cn(navItemBase, isActive ? navItemActive : navItemInactive)}
              >
                {nav.label}
              </NavLink>
              );
            })}
            
            {/* COMPETITIONS DROPDOWN */}
            <div className="group relative h-full flex items-center">
              <button className={cn(navItemBase, navItemInactive, "flex gap-1 items-center")}>
                TOURNAMENTS <ChevronDown size={12} className="opacity-50" />
              </button>
              
              <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[640px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 z-50">
                <div className="bg-surface border border-border mt-px shadow-2xl flex flex-col">
                  {/* Mega Menu Header */}
                  <div className="flex justify-between items-center px-6 py-3 border-b border-border bg-bg/50">
                    <span className={cn("text-[10px] font-mono font-semibold tracking-widest uppercase", activeColorText)}>// {sport === 'basketball' ? 'LEBANESE BASKETBALL LEAGUE' : 'LEBANESE FOOTBALL LEAGUE'}</span>
                    <span className="text-[10px] font-mono text-text-secondary tracking-widest uppercase">2.4M MANAGERS</span>
                  </div>
                  {/* Mega Menu Grid */}
                  <div className="grid grid-cols-2 bg-border gap-px p-px">
                    {competitions.map((league) => (
                      <Link key={league.code} to={`/${sport}/tournaments/${league.code.toLowerCase()}`} className="flex items-center gap-4 bg-surface p-4 hover:bg-bg transition-colors group/item">
                        <div className="w-10 h-10 border border-border flex items-center justify-center shrink-0 text-text-muted group-hover/item:text-text-primary transition-colors">
                           <span className="font-bold text-sm tracking-tighter">{league.code.slice(0,2)}</span>
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className={`text-[11px] font-bold font-sans tracking-wider uppercase text-text-primary ${hoverActiveColorText} transition-colors`}>{league.name}</span>
                          <span className="text-[10px] font-mono text-text-secondary truncate">{league.caption}</span>
                        </div>
                        <span className={`text-[10px] font-mono opacity-70 font-semibold ${activeColorText}`}>{league.code}</span>
                      </Link>
                    ))}
                  </div>
                  {/* Mega Menu Footer */}
                  <div className="flex justify-between items-center px-6 py-4 border-t border-border bg-bg/50">
                    <span className="text-[10px] font-mono text-text-secondary uppercase tracking-widest">LIVE DATABASE SYNC</span>
                    <Link to={`/${sport}/leagues`} className={cn("text-[10px] font-mono font-semibold uppercase tracking-widest transition-colors flex items-center gap-1", sport === 'basketball' ? "text-amber-500 hover:text-amber-400" : "text-brand hover:text-brand/80")}>BROWSE ALL <span>→</span></Link>
                  </div>
                </div>
              </div>
            </div>

            {/* ANALYTICS DROPDOWN */}
            <div className="group relative h-full flex items-center">
              <button className={cn(navItemBase, navItemInactive, "flex gap-1 items-center")}>
                ANALYTICS <ChevronDown size={12} className="opacity-50" />
              </button>
              
              <div className="absolute top-16 left-0 w-[320px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 z-50">
                <div className="bg-surface border border-border mt-px shadow-2xl flex flex-col">
                  <div className="px-5 py-3 border-b border-border bg-bg/50">
                    <span className={`text-[10px] font-mono ${activeColorText} font-semibold tracking-widest uppercase`}>// ANALYTICS MODULES</span>
                  </div>
                  <div className="flex flex-col">
                    {analytics.map((item, idx) => (
                      <Link key={idx} to={`/${sport}/analytics`} className="flex flex-col py-3 px-5 hover:bg-bg border-b border-border last:border-0 transition-colors group/item">
                        <span className={`text-[11px] font-bold font-sans tracking-wider uppercase text-text-primary ${hoverActiveColorText} transition-colors`}>{item.title}</span>
                        <span className="text-[10px] font-mono text-text-secondary mt-1">{item.caption}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Link to={`/${sport}/dashboard/squad`} className="h-full flex items-center">
            <div className={`border border-border bg-bg ${hoverActiveColorBg} hover:text-black ${hoverActiveColorBorder} transition-colors duration-200 ease-in-out text-[11px] font-semibold font-mono tracking-widest uppercase px-4 py-2 flex items-center gap-2 text-text-primary`}>
              MY SQUAD <span>→</span>
            </div>
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <div className="flex lg:hidden h-full items-center">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-text-primary p-2 hover:bg-bg transition-colors"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* MOBILE FULL HEIGHT DRAWER */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[100px] bottom-0 bg-bg z-40 overflow-y-auto border-t border-border flex flex-col">
          <div className="flex flex-col pb-20">
            {(cms.navigation?.mainNav || []).map(nav => {
               let pathStr = nav.to;
               if (pathStr === '/league') pathStr = '/leagues';
               if (pathStr === '/scout') pathStr = '/players';
               if (pathStr === '/news') pathStr = '/match-center';
               
               const toPath = pathStr.startsWith('/') ? `/${sport}${pathStr}` : `/${sport}/${pathStr}`;
               return (
                  <MobileNavLink key={nav.id} to={toPath}>{nav.label}</MobileNavLink>
               );
            })}
            
            {/* Tournaments Accordion */}
            <div className="flex flex-col border-b border-border">
              <button 
                onClick={() => toggleAccordion('tournaments')}
                className="flex items-center justify-between w-full p-6 text-left"
              >
                <span className="text-sm font-bold font-sans tracking-wider uppercase text-text-primary">TOURNAMENTS</span>
                <ChevronDown size={16} className={cn("text-text-secondary transition-transform", openAccordion === 'tournaments' && "rotate-180")} />
              </button>
              {openAccordion === 'tournaments' && (
                <div className="flex flex-col bg-surface pb-4 px-6 gap-4">
                  {competitions.map((l) => (
                    <Link key={l.code} to={`/tournaments/${l.code.toLowerCase()}`} className="flex flex-col">
                      <span className={`text-xs font-bold font-sans tracking-wider uppercase ${activeColorText}`}>{l.name}</span>
                      <span className="text-[10px] font-mono text-text-secondary">{l.caption}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Analytics Accordion */}
            <div className="flex flex-col border-b border-border">
              <button 
                onClick={() => toggleAccordion('analytics')}
                className="flex items-center justify-between w-full p-6 text-left"
              >
                <span className="text-sm font-bold font-sans tracking-wider uppercase text-text-primary">ANALYTICS</span>
                <ChevronDown size={16} className={cn("text-text-secondary transition-transform", openAccordion === 'analytics' && "rotate-180")} />
              </button>
              {openAccordion === 'analytics' && (
                <div className="flex flex-col bg-surface pb-4 px-6 gap-4">
                  {analytics.map((a, idx) => (
                    <Link key={idx} to="/analytics" className="flex flex-col">
                      <span className={`text-xs font-bold font-sans tracking-wider uppercase ${activeColorText}`}>{a.title}</span>
                      <span className="text-[10px] font-mono text-text-secondary">{a.caption}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-6">
              <Link to={`/${sport}/dashboard/squad`} className="w-full border border-border bg-surface text-center py-4 flex justify-center items-center gap-2 text-xs font-bold font-mono tracking-widest text-text-primary hover:bg-bg transition-colors uppercase">
                MY SQUAD <span>→</span>
              </Link>
            </div>
            <div className="p-6 pt-0">
               <Link to={`/${sport}/login`} className="w-full border border-border bg-bg text-center py-4 flex justify-center items-center gap-2 text-xs font-bold font-mono tracking-widest text-text-secondary hover:text-text-primary hover:bg-surface transition-colors uppercase">
                AUTHENTICATE
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MobileNavLink({ to, children }: { to: string, children: React.ReactNode }) {
  return (
    <Link to={to} className="p-6 border-b border-border text-sm font-bold font-sans tracking-wider uppercase text-text-primary hover:bg-surface transition-colors">
      {children}
    </Link>
  );
}
