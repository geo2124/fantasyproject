import { useState } from 'react';
import { useCmsStore } from '../../store/cmsStore';
import { useAuthStore } from '../../store/authStore';
import { Save, Plus, Trash } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AdminMenus() {
  const { user } = useAuthStore();
  const cms = useCmsStore();
  const [menus, setMenus] = useState(cms.navigation);

  const isBasketball = user?.sportAccess === 'basketball';
  const sportColor = isBasketball ? 'text-amber-500' : 'text-brand';
  const sportBg = isBasketball ? 'bg-amber-500' : 'bg-brand';
  const sportFocus = isBasketball ? 'focus:border-amber-500' : 'focus:border-brand';

  const handleSave = () => {
    cms.updateNavigation(menus);
  };

  const handleChange = (menuKey: keyof typeof menus, idx: number, field: string, value: string) => {
    const updatedMenu = [...menus[menuKey]];
    updatedMenu[idx] = { ...updatedMenu[idx], [field]: value };
    setMenus({ ...menus, [menuKey]: updatedMenu });
  };

  const handleAdd = (menuKey: keyof typeof menus) => {
    setMenus({
      ...menus,
      [menuKey]: [...menus[menuKey], { id: Date.now().toString(), label: 'New Link', to: '/' }]
    });
  };

  const handleRemove = (menuKey: keyof typeof menus, id: string) => {
    setMenus({
      ...menus,
      [menuKey]: menus[menuKey].filter(x => x.id !== id)
    });
  };

  const renderMenuEditor = (title: string, menuKey: keyof typeof menus) => (
    <div className="bg-surface border border-border flex flex-col group mb-6">
      <div className="p-3 border-b border-border bg-bg/50 flex items-center justify-between">
         <div className="flex items-center gap-3">
           <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
         </div>
         <button onClick={() => handleAdd(menuKey)} className={cn("text-[10px] uppercase font-mono tracking-widest hover:underline flex items-center gap-1", sportColor)}>
           <Plus size={12}/> Add Link
         </button>
      </div>
      <div className="p-4 flex flex-col gap-4">
         {menus[menuKey].map((link, idx) => (
           <div key={link.id} className="flex gap-4 items-center">
             <input 
               type="text" 
               value={link.label}
               onChange={(e) => handleChange(menuKey, idx, 'label', e.target.value)}
               placeholder="Label"
               className={cn("flex-1 bg-bg border border-border px-4 py-2 text-sm font-mono text-text-primary focus:outline-none transition-colors", sportFocus)}
             />
             <input 
               type="text" 
               value={link.to}
               onChange={(e) => handleChange(menuKey, idx, 'to', e.target.value)}
               placeholder="URL / Route"
               className={cn("flex-1 bg-bg border border-border px-4 py-2 text-sm font-mono text-text-primary focus:outline-none transition-colors", sportFocus)}
             />
             <button onClick={() => handleRemove(menuKey, link.id)} className="text-text-muted hover:text-danger">
               <Trash size={16} />
             </button>
           </div>
         ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-full animate-in fade-in">
      <div className="flex justify-between items-end mb-8">
        <div>
           <h2 className="text-3xl font-bold uppercase tracking-tighter mb-1">Navigation Menus</h2>
           <p className="text-xs font-mono text-text-secondary uppercase tracking-widest">Manage Header and Footer Links</p>
        </div>
        <button 
           onClick={handleSave}
           className={cn("flex items-center gap-2 px-6 py-2 text-bg font-bold font-mono text-xs uppercase tracking-widest hover:bg-opacity-90 transition-colors", sportBg)}
         >
           <Save size={14} /> Save Changes
         </button>
      </div>

      <div className="flex flex-col">
        {renderMenuEditor('Main Navigation (Header)', 'mainNav')}
        {renderMenuEditor('Footer Column 1', 'footerCol1')}
        {renderMenuEditor('Footer Column 2', 'footerCol2')}
        {renderMenuEditor('Footer Column 3', 'footerCol3')}
      </div>
    </div>
  );
}
