import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { LayoutDashboard, Users, Database, Settings, ShieldCheck, Flag, PlayCircle, Trophy, Moon, Sun } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Leagues Config', path: '/admin/leagues', icon: Trophy },
    { name: 'Data Center', path: '/admin/data', icon: Database },
    { name: 'Feature Flags', path: '/admin/flags', icon: Flag },
    { name: 'Simulate', path: '/admin/simulate', icon: PlayCircle },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-bg flex font-sans">
      <aside className="w-64 bg-surface border-r border-border flex flex-col pt-6 hidden md:flex shrink-0">
        <div className="px-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-danger" />
            <span className="text-lg font-bold text-text-primary uppercase tracking-tight">Admin Console</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <div className="text-[10px] font-mono text-text-muted uppercase tracking-widest mb-4 px-2">Management</div>
          {navItems.map(item => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.name} 
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium uppercase tracking-wide border transition-colors",
                  isActive ? "border-text-primary text-text-primary bg-bg" : "border-transparent text-text-secondary hover:text-text-primary hover:border-border"
                )}
              >
                <item.icon size={16} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border mt-auto flex flex-col gap-4">
           <div className="flex justify-between items-center px-2">
             <button onClick={toggleTheme} className="text-text-secondary hover:text-text-primary transition-colors">
               {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
             </button>
           </div>
           <div>
             <div className="text-[10px] font-mono tabular-data text-text-secondary mb-2 ml-2 uppercase">{user?.email}</div>
             <button onClick={handleLogout} className="w-full text-left text-xs font-mono uppercase tracking-wider text-text-secondary hover:text-text-primary px-2 py-1.5 border border-transparent hover:border-border hover:bg-bg transition-colors">
               Sign out
             </button>
           </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-surface border-b border-border h-16 flex items-center justify-between px-6 md:hidden">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-danger" size={20} />
              <span className="text-lg font-bold text-text-primary uppercase tracking-tight">Admin Console</span>
            </div>
            <button onClick={handleLogout} className="text-[10px] font-mono uppercase tracking-wider text-text-secondary">Logout</button>
        </header>
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-[1500px] mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
