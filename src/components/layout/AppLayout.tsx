import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { db } from '../../services/api';
import { Squad } from '../../types';
import { LayoutDashboard, Users, ArrowRightLeft, CalendarDays, Trophy, Search, Activity, Bell, Moon, Sun, Menu, X, FileDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { downloadBasketballGuidePdf } from '../../lib/downloadGuide';

import GlobalAdPopup from './GlobalAdPopup';

export default function AppLayout({ sport = 'football' }: { sport?: 'football' | 'basketball' }) {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [squad, setSquad] = useState<Squad | null>(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      db.getSquad(user.id, sport).then(setSquad);
    }
  }, [user, sport]);

  useEffect(() => {
    setMoreMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: `/${sport}/dashboard`, icon: LayoutDashboard },
    { name: 'Squad Builder', path: `/${sport}/dashboard/squad`, icon: Users },
    { name: 'Transfers', path: `/${sport}/dashboard/transfers`, icon: ArrowRightLeft },
    { name: 'Fixtures', path: `/${sport}/dashboard/fixtures`, icon: CalendarDays },
    { name: 'Standings', path: `/${sport}/dashboard/standings`, icon: Trophy },
    { name: 'Players', path: `/${sport}/dashboard/players`, icon: Search },
    { name: 'Match Center', path: `/${sport}/dashboard/match-center`, icon: Activity },
    { name: 'Draft', path: `/${sport}/dashboard/drafts`, icon: Trophy },
  ];

  const mainMobileTabs = navItems.slice(0, 4);
  const moreMobileTabs = navItems.slice(4);

  const sportColor = sport === 'basketball' ? 'text-amber-500' : 'text-brand';
  const sportBg = sport === 'basketball' ? 'bg-amber-500' : 'bg-brand';

  return (
    <div className="min-h-screen flex flex-col font-sans relative">
      <GlobalAdPopup />
      <header className="border-b border-border bg-surface py-3 px-4 sm:px-6 flex justify-between items-center z-10 relative">
        <div className="flex items-center gap-4 sm:gap-8 w-full max-w-[1500px] mx-auto">
          <Link to={`/${sport}/dashboard`} className={cn("text-xl font-black italic tracking-tighter uppercase", sportColor)}>
            {sport === 'basketball' ? 'LBFL' : 'LFFL'}
          </Link>
          <nav className="hidden lg:flex gap-1 ml-4">
            {navItems.map(item => {
              const isActive = location.pathname === item.path || (item.path !== `/${sport}/dashboard` && location.pathname.startsWith(item.path));
              return (
                <Link 
                  key={item.name} 
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider font-mono border",
                    isActive ? "border-text-primary text-text-primary" : "border-transparent text-text-secondary hover:text-text-primary hover:border-border"
                  )}
                 >
                  <item.icon size={14} className={isActive ? sportColor : ''} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          
         <div className="flex items-center gap-4 ml-auto">
            {user?.role === 'admin' && (
              <Link to="/admin" className={cn("hidden sm:flex items-center gap-2 px-3 py-1.5 text-[10px] font-mono tracking-widest uppercase border transition-colors", sport === 'basketball' ? "border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-bg" : "border-brand text-brand hover:bg-brand hover:text-bg")}>
                 <LayoutDashboard size={12} /> Admin Panel
              </Link>
            )}
            <button
              onClick={async () => {
                const ok = await downloadBasketballGuidePdf();
                if (!ok) navigate('/basketball/guide');
              }}
              title="Download Basketball Fantasy Guide PDF"
              className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2.5 h-8 border border-border bg-bg text-text-secondary hover:text-amber-500 hover:border-amber-500 transition-colors"
            >
              <FileDown size={13} /> Guide PDF
            </button>
            <button onClick={toggleTheme} className="text-text-secondary hover:text-text-primary w-8 h-8 flex items-center justify-center border border-border bg-bg transition-colors">
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button className="text-text-secondary hover:text-text-primary relative w-8 h-8 flex items-center justify-center border border-border bg-bg">
              <Bell size={14} />
              <span className={cn("absolute -top-1 -right-1 w-2 h-2 rounded-full", sportBg)}></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-border">
               <div className="text-right hidden sm:block">
                 <Link to={`/${sport}/dashboard/profile`} className={cn("text-xs font-semibold tabular-data uppercase text-text-primary transition-colors leading-none block", sport === 'basketball' ? "hover:text-amber-500" : "hover:text-brand")}>{user?.username}</Link>
                 <div className="text-[10px] text-text-secondary font-mono tracking-wider mt-1 uppercase">{squad?.name || 'No Squad'} / {squad?.totalPoints || 0} pts</div>
               </div>
               <button onClick={handleLogout} className="text-[10px] font-mono tracking-wider uppercase border border-border bg-bg hover:bg-border px-3 py-1.5 text-text-secondary hover:text-text-primary transition-colors">
                 Sign Out
               </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Nav Scroller */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-[60] flex justify-around items-center px-1 pb-[env(safe-area-inset-bottom)]">
         {mainMobileTabs.map(item => {
            const isActive = location.pathname === item.path || (item.path !== `/${sport}/dashboard` && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.name} 
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 text-[9px] font-semibold uppercase tracking-wider font-mono transition-colors min-w-[4rem]",
                  isActive ? cn("text-text-primary", sportColor) : "text-text-secondary hover:text-text-primary"
                )}
                >
                <item.icon size={18} className={isActive ? sportColor : ''} />
                <span className="truncate w-full text-center max-w-[60px] whitespace-normal leading-tight h-6 flex items-center justify-center">{item.name}</span>
              </Link>
            )
          })}
          <button 
             onClick={() => setMoreMenuOpen(!moreMenuOpen)}
             className={cn(
               "flex flex-col items-center gap-1 p-2 text-[9px] font-semibold uppercase tracking-wider font-mono transition-colors min-w-[4rem]",
               moreMenuOpen ? cn("text-text-primary", sportColor) : "text-text-secondary hover:text-text-primary"
             )}
          >
            {moreMenuOpen ? <X size={18} /> : <Menu size={18} />}
            <span className="truncate w-full text-center max-w-[60px] h-6 flex items-center justify-center">More</span>
          </button>
      </div>

      {/* Mobile "More" Drawer */}
      <AnimatePresence>
        {moreMenuOpen && (
          <div key="more-drawer" className="lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[50]"
              onClick={() => setMoreMenuOpen(false)}
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-[60px] left-0 right-0 bg-surface border-t border-border z-[55] rounded-t-2xl shadow-xl overflow-hidden pb-[env(safe-area-inset-bottom)]"
            >
              <div className="p-4 grid grid-cols-4 gap-4">
                {moreMobileTabs.map(item => {
                  const isActive = location.pathname === item.path || (item.path !== `/${sport}/dashboard` && location.pathname.startsWith(item.path));
                  return (
                    <Link 
                      key={item.name} 
                      to={item.path}
                      onClick={() => setMoreMenuOpen(false)}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 text-center gap-2 rounded-xl transition-colors border",
                        isActive ? cn("bg-bg border-border text-text-primary", sportColor) : "border-transparent bg-bg/50 text-text-secondary hover:text-text-primary hover:bg-bg"
                      )}
                      >
                      <item.icon size={24} className={isActive ? sportColor : ''} />
                      <span className="text-[10px] uppercase font-bold tracking-wider font-mono w-full leading-tight">{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="flex-1 w-full max-w-[1500px] mx-auto p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="h-full flex flex-col"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
