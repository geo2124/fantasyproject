import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Login({ isRegister = false }: { isRegister?: boolean }) {
  const [username, setUsername] = useState(isRegister ? '' : 'test');
  const [password, setPassword] = useState('test123');
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isBasketball = location.pathname.includes('basketball');
  const sportTextColor = isBasketball ? 'text-amber-500' : 'text-brand';
  const sportBgColor = isBasketball ? 'bg-amber-500 hover:bg-amber-600' : 'bg-brand hover:bg-brand-hover';
  const focusBorderColor = isBasketball ? 'focus:border-amber-500' : 'focus:border-brand';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      alert("Demo only supports existing users. Try logging in with test / test123");
      return;
    }

    await login();
    const user = useAuthStore.getState().user;
    if (user) {
      const searchParams = new URLSearchParams(location.search);
      const redirect = searchParams.get('redirect');
      if (redirect) {
        navigate(redirect);
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(isBasketball ? '/basketball/dashboard' : '/football/dashboard');
      }
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-md w-full bg-surface p-8 border border-border">
        <div className="text-center mb-8">
          <ShieldCheck className={cn("mx-auto h-12 w-12 mb-4", sportTextColor)} strokeWidth={1.5} />
          <h2 className="text-3xl font-bold text-text-primary tracking-tight uppercase">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="mt-2 text-sm text-text-secondary mono-label">
             {isRegister ? 'JOIN MILLIONS OF MANAGERS WORLDWIDE.' : 'SIGN IN TO MANAGE YOUR SQUAD.'}
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-danger/10 text-danger border border-danger/20 text-sm font-medium mono-label">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-xs font-semibold mono-label mb-2 uppercase">Username</label>
            <input
              type="text"
              required
              className={cn("w-full px-4 py-3 bg-bg border border-border text-text-primary focus:outline-none transition-colors mono-label", focusBorderColor)}
              placeholder="test or admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mono-label mb-2 uppercase">Password</label>
            <input
              type="password"
              required
              className={cn("w-full px-4 py-3 bg-bg border border-border text-text-primary focus:outline-none transition-colors mono-label tabular-data text-2xl", focusBorderColor)}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={cn("w-full flex items-center justify-center gap-2 text-bg py-3 uppercase font-bold tracking-widest transition-colors disabled:opacity-70 mt-4 text-sm", sportBgColor)}
          >
            {isLoading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-text-secondary">
          <p className="mb-3 mono-label text-xs">Quick Access Login:</p>
          <div className="grid grid-cols-1 gap-1 text-[10px] font-mono uppercase tracking-wide bg-bg border border-border overflow-hidden">
             <button 
               type="button"
               onClick={() => { setUsername('test'); setPassword('test123'); }}
               className="flex justify-between items-center hover:bg-surface p-3 transition-colors group border-b border-border/30"
             >
               <span className="text-left">
                  <span className="text-text-muted">Global User:</span> <span className="font-bold text-text-primary">test</span>
               </span>
               <span className={cn("font-bold opacity-0 group-hover:opacity-100 transition-opacity", sportTextColor)}>LOAD INFO</span>
             </button>

             <button 
               type="button"
               onClick={() => { setUsername('admin_foot'); setPassword('admin123'); }}
               className="flex justify-between items-center hover:bg-surface p-3 transition-colors group border-b border-border/30"
             >
               <span className="text-left">
                  <span className="text-text-muted">Football Admin:</span> <span className="font-bold text-text-primary">admin_foot</span>
               </span>
               <span className={cn("font-bold opacity-0 group-hover:opacity-100 transition-opacity", sportTextColor)}>LOAD INFO</span>
             </button>

             <button 
               type="button"
               onClick={() => { setUsername('admin_bask'); setPassword('admin123'); }}
               className="flex justify-between items-center hover:bg-surface p-3 transition-colors group"
             >
               <span className="text-left">
                  <span className="text-text-muted">Basketball Admin:</span> <span className="font-bold text-text-primary">admin_bask</span>
               </span>
               <span className={cn("font-bold opacity-0 group-hover:opacity-100 transition-opacity", sportTextColor)}>LOAD INFO</span>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

