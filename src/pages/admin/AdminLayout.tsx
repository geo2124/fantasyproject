import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Settings, Users,  Activity, LayoutDashboard, LogOut, Image, Megaphone, Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useEffect, useState } from 'react';

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isFootball = location.pathname.includes('/football');
  const isBasketball = location.pathname.includes('/basketball');
  
  // Use user's primary sport if we're on a generic admin page
  const effectiveSport = isBasketball ? 'basketball' : (isFootball ? 'football' : (user?.sportAccess === 'basketball' ? 'basketball' : 'football'));
  
  const isEffectiveBasketball = effectiveSport === 'basketball';
  const activeColor = isEffectiveBasketball ? 'text-amber-500' : 'text-brand';
  const activeBg = isEffectiveBasketball ? 'bg-amber-500/10' : 'bg-brand/10';
  const activeBadgeBg = isEffectiveBasketball ? 'bg-amber-500' : 'bg-brand';

  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  useEffect(() => {
    if (!user) {
      navigate('/football/login');
      return;
    }

    // Redirect if they try to access a sport they don't have permission for
    if (user.sportAccess !== 'all') {
      if (isFootball && user.sportAccess !== 'football') {
        navigate('/admin/basketball/players');
      } else if (isBasketball && user.sportAccess !== 'basketball') {
        navigate('/admin/football/players');
      } else if (!isFootball && !isBasketball) {
        // They are trying to access a generic "global" page but they aren't 'all'
        // Allow dashboard and generic CMS pages which have internal tab separation
        const allowedPaths = ['/admin', '/admin/', '/admin/blocks', '/admin/blogs', '/admin/pages'];
        if (!allowedPaths.includes(location.pathname)) {
             const defaultTarget = user.sportAccess === 'football' ? '/admin/football/players' : '/admin/basketball/players';
             navigate(defaultTarget);
        }
      }
    }
  }, [user, navigate, isFootball, isBasketball]);

  if (!user) return null;

  return (
    <div className="flex bg-bg h-screen text-text-primary overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-bg flex flex-col shrink-0 transition-transform duration-300 lg:relative lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-border text-center flex items-center justify-between lg:justify-center">
          <div className="text-2xl font-black italic tracking-tighter text-text-primary uppercase flex items-center justify-center gap-1 w-full relative">
             <span className={activeColor}>{isEffectiveBasketball ? 'LB' : 'LF'}</span>FL 
             <span className={cn("text-[10px] text-bg px-1 rounded-sm ml-1 align-top not-italic", activeBadgeBg)}>CMS</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-text-secondary hover:text-text-primary absolute right-4">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-1 px-4 custom-scrollbar">
           <NavLink to="/admin" end className={({isActive}) => cn("flex items-center gap-3 px-3 py-2 text-sm font-bold uppercase tracking-wider rounded-sm transition-colors", isActive ? cn(activeBg, activeColor) : "text-text-secondary hover:bg-surface hover:text-text-primary")}>
             <LayoutDashboard size={16} /> Overview
           </NavLink>

           {(user.sportAccess === 'all' || user.sportAccess === 'football') && (
             <>
               <div className="text-[10px] font-mono tracking-widest text-text-muted uppercase mt-6 mb-2 px-2">Lebanon Football</div>
               <NavLink to="/admin/football/players" className={({isActive}) => cn("flex items-center gap-3 px-3 py-2 text-sm font-bold uppercase tracking-wider rounded-sm transition-colors", isActive ? "bg-brand/10 text-brand" : "text-text-secondary hover:bg-surface hover:text-text-primary")}>
                 <Users size={16} /> Players
               </NavLink>
               <NavLink to="/admin/football/fixtures" className={({isActive}) => cn("flex items-center gap-3 px-3 py-2 text-sm font-bold uppercase tracking-wider rounded-sm transition-colors", isActive ? "bg-brand/10 text-brand" : "text-text-secondary hover:bg-surface hover:text-text-primary")}>
                 <Activity size={16} /> Fixtures
               </NavLink>
               <NavLink to="/admin/football/users" className={({isActive}) => cn("flex items-center gap-3 px-3 py-2 text-sm font-bold uppercase tracking-wider rounded-sm transition-colors", isActive ? "bg-brand/10 text-brand" : "text-text-secondary hover:bg-surface hover:text-text-primary")}>
                 <Users size={16} /> Football Users
               </NavLink>
             </>
           )}
           
           {(user.sportAccess === 'all' || user.sportAccess === 'basketball') && (
             <>
               <div className="text-[10px] font-mono tracking-widest text-text-muted uppercase mt-6 mb-2 px-2">Lebanon Basketball</div>
               <NavLink to="/admin/basketball/players" className={({isActive}) => cn("flex items-center gap-3 px-3 py-2 text-sm font-bold uppercase tracking-wider rounded-sm transition-colors", isActive ? "bg-amber-500/10 text-amber-500" : "text-text-secondary hover:bg-surface hover:text-text-primary")}>
                 <Users size={16} /> Players
               </NavLink>
               <NavLink to="/admin/basketball/fixtures" className={({isActive}) => cn("flex items-center gap-3 px-3 py-2 text-sm font-bold uppercase tracking-wider rounded-sm transition-colors", isActive ? "bg-amber-500/10 text-amber-500" : "text-text-secondary hover:bg-surface hover:text-text-primary")}>
                 <Activity size={16} /> Fixtures
               </NavLink>
               <NavLink to="/admin/basketball/stats" className={({isActive}) => cn("flex items-center gap-3 px-3 py-2 text-sm font-bold uppercase tracking-wider rounded-sm transition-colors", isActive ? "bg-amber-500/10 text-amber-500" : "text-text-secondary hover:bg-surface hover:text-text-primary")}>
                 <Activity size={16} /> Stats & Rounds
               </NavLink>
               <NavLink to="/admin/basketball/users" className={({isActive}) => cn("flex items-center gap-3 px-3 py-2 text-sm font-bold uppercase tracking-wider rounded-sm transition-colors", isActive ? "bg-amber-500/10 text-amber-500" : "text-text-secondary hover:bg-surface hover:text-text-primary")}>
                 <Users size={16} /> Basketball Users
               </NavLink>
             </>
           )}

           <div className="text-[10px] font-mono tracking-widest text-text-muted uppercase mt-6 mb-2 px-2">CMS & Content</div>
           <NavLink to="/admin/blocks" className={({isActive}) => cn("flex items-center gap-3 px-3 py-2 text-sm font-bold uppercase tracking-wider rounded-sm transition-colors", isActive ? cn(activeBg, activeColor) : "text-text-secondary hover:bg-surface hover:text-text-primary")}>
             <Image size={16} /> Home Blocks
           </NavLink>
           <NavLink to="/admin/blogs" className={({isActive}) => cn("flex items-center gap-3 px-3 py-2 text-sm font-bold uppercase tracking-wider rounded-sm transition-colors", isActive ? cn(activeBg, activeColor) : "text-text-secondary hover:bg-surface hover:text-text-primary")}>
             <Megaphone size={16} /> Blogs & News
           </NavLink>
           <NavLink to="/admin/pages" className={({isActive}) => cn("flex items-center gap-3 px-3 py-2 text-sm font-bold uppercase tracking-wider rounded-sm transition-colors", isActive ? cn(activeBg, activeColor) : "text-text-secondary hover:bg-surface hover:text-text-primary")}>
             <Settings size={16} /> Custom Pages
           </NavLink>
           <NavLink to="/admin/drafts" className={({isActive}) => cn("flex items-center gap-3 px-3 py-2 text-sm font-bold uppercase tracking-wider rounded-sm transition-colors", isActive ? cn(activeBg, activeColor) : "text-text-secondary hover:bg-surface hover:text-text-primary")}><LayoutDashboard size={16} /> Draft Servers</NavLink>
           <NavLink to="/admin/minileagues" className={({isActive}) => cn("flex items-center gap-3 px-3 py-2 text-sm font-bold uppercase tracking-wider rounded-sm transition-colors", isActive ? cn(activeBg, activeColor) : "text-text-secondary hover:bg-surface hover:text-text-primary")}><Users size={16} /> Mini Leagues</NavLink>
           <NavLink to="/admin/ads" className={({isActive}) => cn("flex items-center gap-3 px-3 py-2 text-sm font-bold uppercase tracking-wider rounded-sm transition-colors", isActive ? cn(activeBg, activeColor) : "text-text-secondary hover:bg-surface hover:text-text-primary")}><Megaphone size={16} /> Advertisements</NavLink>

           {user.sportAccess === 'all' && (
             <>
               <div className="text-[10px] font-mono tracking-widest text-text-muted uppercase mt-6 mb-2 px-2">Global Settings</div>
               <NavLink to="/admin/users" className={({isActive}) => cn("flex items-center gap-3 px-3 py-2 text-sm font-bold uppercase tracking-wider rounded-sm transition-colors", isActive ? cn(activeBg, activeColor) : "text-text-secondary hover:bg-surface hover:text-text-primary")}>
                 <Users size={16} /> Global Accounts
               </NavLink>
               <NavLink to="/admin/menus" className={({isActive}) => cn("flex items-center gap-3 px-3 py-2 text-sm font-bold uppercase tracking-wider rounded-sm transition-colors", isActive ? cn(activeBg, activeColor) : "text-text-secondary hover:bg-surface hover:text-text-primary")}>
                 <Activity size={16} /> Navigation Menus
               </NavLink>
               <NavLink to="/admin/analytics" className={({isActive}) => cn("flex items-center gap-3 px-3 py-2 text-sm font-bold uppercase tracking-wider rounded-sm transition-colors", isActive ? cn(activeBg, activeColor) : "text-text-secondary hover:bg-surface hover:text-text-primary")}>
                 <Activity size={16} /> Analytics
               </NavLink>
               <NavLink to="/admin/features" className={({isActive}) => cn("flex items-center gap-3 px-3 py-2 text-sm font-bold uppercase tracking-wider rounded-sm transition-colors", isActive ? cn(activeBg, activeColor) : "text-text-secondary hover:bg-surface hover:text-text-primary")}>
                 <Settings size={16} /> Features & Toggles
               </NavLink>
             </>
           )}
        </div>

        <div className="p-4 border-t border-border mt-auto">
           <button onClick={() => { logout(); navigate('/'); }} className="flex w-full items-center gap-3 px-3 py-2 text-sm font-bold uppercase tracking-wider text-text-secondary hover:bg-surface hover:text-text-primary rounded-sm transition-colors">
             <LogOut size={16} /> Sign Out
           </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-border bg-surface/50 backdrop-blur-sm flex items-center px-4 md:px-8 shrink-0 gap-4">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-text-secondary hover:text-text-primary"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-sm font-mono tracking-widest text-text-secondary uppercase hidden sm:block">Management Portal</h1>
          <div className="ml-auto flex items-center gap-4">
             <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-bg font-bold font-mono", activeBadgeBg)}>A</div>
             <div className="text-xs font-mono uppercase font-bold text-text-primary">{user?.username || 'Admin'}</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
           <Outlet />
        </main>
      </div>
    </div>
  );
}
