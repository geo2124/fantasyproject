import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';
import { User, Settings, Shield, Activity, CreditCard } from 'lucide-react';

export default function Profile({ sport }: { sport: 'football' | 'basketball' }) {
  const user = useAuthStore(state => state.user);
  const [activeTab, setActiveTab] = useState('account');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');

  const sportColor = sport === 'basketball' ? 'text-amber-500' : 'text-brand';
  const sportBg = sport === 'basketball' ? 'bg-amber-500' : 'bg-brand';
  const sportBorder = sport === 'basketball' ? 'border-amber-500' : 'border-brand';

  if (!user) return null;

  return (
    <div className="flex flex-col h-full lg:flex-row gap-8">
      {/* Sidebar Navigation */}
      <div className="w-full lg:w-64 shrink-0">
        <h1 className="text-3xl font-bold text-text-primary uppercase tracking-tighter mb-6">Profile Settings</h1>
        
        <div className="flex flex-col border border-border bg-surface">
          <button onClick={() => setActiveTab('account')} className={cn("flex items-center gap-3 p-4 border-b border-border transition-colors text-left", activeTab === 'account' ? 'bg-bg text-text-primary' : 'hover:bg-bg/50 text-text-secondary hover:text-text-primary')}>
            <User size={16} className={activeTab === 'account' ? sportColor : ''} />
            <span className="text-xs font-bold uppercase tracking-widest font-mono">Account</span>
          </button>
          <button onClick={() => setActiveTab('preferences')} className={cn("flex items-center gap-3 p-4 border-b border-border transition-colors text-left", activeTab === 'preferences' ? 'bg-bg text-text-primary' : 'hover:bg-bg/50 text-text-secondary hover:text-text-primary')}>
            <Settings size={16} className={activeTab === 'preferences' ? sportColor : ''} />
            <span className="text-xs font-bold uppercase tracking-widest font-mono">Preferences</span>
          </button>
          <button onClick={() => setActiveTab('security')} className={cn("flex items-center gap-3 p-4 border-b border-border transition-colors text-left", activeTab === 'security' ? 'bg-bg text-text-primary' : 'hover:bg-bg/50 text-text-secondary hover:text-text-primary')}>
            <Shield size={16} className={activeTab === 'security' ? sportColor : ''} />
            <span className="text-xs font-bold uppercase tracking-widest font-mono">Security</span>
          </button>
          <button onClick={() => setActiveTab('activity')} className={cn("flex items-center gap-3 p-4 border-b border-border transition-colors text-left", activeTab === 'activity' ? 'bg-bg text-text-primary' : 'hover:bg-bg/50 text-text-secondary hover:text-text-primary')}>
            <Activity size={16} className={activeTab === 'activity' ? sportColor : ''} />
            <span className="text-xs font-bold uppercase tracking-widest font-mono">Activity</span>
          </button>
          <button onClick={() => setActiveTab('subscription')} className={cn("flex items-center gap-3 p-4 transition-colors text-left", activeTab === 'subscription' ? 'bg-bg text-text-primary' : 'hover:bg-bg/50 text-text-secondary hover:text-text-primary')}>
            <CreditCard size={16} className={activeTab === 'subscription' ? sportColor : ''} />
            <span className="text-xs font-bold uppercase tracking-widest font-mono">Subscription</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-surface border border-border p-8 min-h-[500px]">
        {activeTab === 'account' && (
          <div className="animate-in fade-in pt-2">
            <h2 className="text-xl font-bold uppercase tracking-tight text-text-primary mb-6">Account Information</h2>
            
            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
              <div className={cn("w-20 h-20 rounded-full border-2 bg-bg flex items-center justify-center shadow-lg", sportBorder)}>
                <User size={32} className={cn("opacity-80", sportColor)} />
              </div>
              <div>
                <button className={cn("px-4 py-2 border font-mono text-[10px] uppercase tracking-widest transition-colors mb-2", "border-border bg-bg hover:border-text-primary text-text-primary")}>
                  Upload New Avatar
                </button>
                <p className="text-[10px] text-text-muted font-mono tracking-wider uppercase">JPG, GIF or PNG. Max size 2MB.</p>
              </div>
            </div>

            <div className="space-y-6 max-w-xl">
              <div>
                <label className="block text-[10px] font-mono tracking-widest uppercase text-text-secondary mb-2">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-bg border border-border px-4 py-3 text-text-primary font-mono text-sm focus:outline-none focus:border-text-secondary transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-mono tracking-widest uppercase text-text-secondary mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-bg border border-border px-4 py-3 text-text-primary font-mono text-sm focus:outline-none focus:border-text-secondary transition-colors opacity-70"
                  readOnly
                />
                <p className="text-[10px] text-text-muted mt-2 font-mono">Email cannot be changed in demo mode.</p>
              </div>

              <div className="pt-4">
                <button 
                  onClick={() => {
                    alert(`Profile updated. Username changed to: ${username}`);
                    // Note: In real app, call API to update user.
                  }}
                  className={cn("px-6 py-3 font-mono text-xs uppercase tracking-widest font-bold transition-colors text-bg hover:opacity-90", sportBg)}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'account' && (
          <div className="flex flex-col items-center justify-center h-full opacity-50 py-20">
            <span className="text-4xl mb-4 text-text-muted">⚙️</span>
            <h3 className="text-lg font-bold uppercase tracking-widest text-text-secondary">Section Unavailable</h3>
            <p className="text-xs font-mono text-text-muted mt-2 text-center max-w-md">
              The {activeTab} section is currently disabled in this demo environment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
