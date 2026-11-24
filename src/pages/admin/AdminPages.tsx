import { useState } from 'react';
import { useCmsStore } from '../../store/cmsStore';
import { useAuthStore } from '../../store/authStore';
import { Save, Plus, Trash, Edit } from 'lucide-react';
import { cn } from '../../lib/utils';
import { CustomPage } from '../../store/cmsStore';

export default function AdminPages() {
  const { user } = useAuthStore();
  const cms = useCmsStore();

  const [activeTab, setActiveTab] = useState<'football' | 'basketball'>(
    user?.sportAccess === 'basketball' ? 'basketball' : 'football'
  );

  const pages = cms.pages.filter(p => p.sport === activeTab || p.sport === 'all');
  const [editingPage, setEditingPage] = useState<CustomPage | null>(null);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _sportColor = activeTab === 'basketball' ? 'text-amber-500' : 'text-brand';
  const sportBg = activeTab === 'basketball' ? 'bg-amber-500' : 'bg-brand';
  const sportHoverBorder = activeTab === 'basketball' ? 'hover:border-amber-500' : 'hover:border-brand';
  const sportHoverColor = activeTab === 'basketball' ? 'hover:text-amber-500' : 'hover:text-brand';

  const handleEdit = (page: CustomPage) => {
    setEditingPage(page);
  };

  const handleDelete = (id: string) => {
    cms.deletePage(id);
  };

  const handleAddNew = () => {
    setEditingPage({
      id: Date.now().toString(),
      title: 'New Page',
      slug: 'new-page',
      content: '# New Page\n\nContent here...',
      sport: activeTab
    });
  };

  const handleSave = () => {
    if (editingPage) {
      if (cms.pages.some(p => p.id === editingPage.id)) {
        cms.updatePage(editingPage.id, editingPage);
      } else {
        cms.addPage(editingPage);
      }
      setEditingPage(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-full animate-in fade-in">
      <div className="flex justify-between items-end mb-8">
        <div>
           <h2 className="text-3xl font-bold uppercase tracking-tighter mb-1">Custom Pages</h2>
           <p className="text-xs font-mono text-text-secondary uppercase tracking-widest">Manage Static Content Pages</p>
        </div>
        {!editingPage && (
          <button 
             onClick={handleAddNew}
             className={cn("flex items-center gap-2 px-6 py-2 text-bg font-bold font-mono text-xs uppercase tracking-widest hover:bg-opacity-90 transition-colors", sportBg)}
           >
             <Plus size={14} /> Add Page
           </button>
        )}
      </div>

      {!editingPage ? (
        <>
          <div className="flex gap-4 mb-6">
            {(user?.sportAccess === 'all' || user?.sportAccess === 'football') && (
              <button 
                onClick={() => setActiveTab('football')}
                className={cn("px-4 py-2 text-xs font-mono font-bold uppercase tracking-widest border transition-colors", 
                  activeTab === 'football' ? "bg-brand text-bg border-brand" : "bg-surface border-border text-text-secondary hover:text-text-primary")}
              >
                Football
              </button>
            )}
            {(user?.sportAccess === 'all' || user?.sportAccess === 'basketball') && (
              <button 
                onClick={() => setActiveTab('basketball')}
                 className={cn("px-4 py-2 text-xs font-mono font-bold uppercase tracking-widest border transition-colors", 
                 activeTab === 'basketball' ? "bg-amber-500 text-bg border-amber-500" : "bg-surface border-border text-text-secondary hover:text-text-primary")}
              >
                Basketball
              </button>
            )}
          </div>

          <div className="flex flex-col gap-4">
             {pages.map(page => (
               <div key={page.id} className="bg-surface border border-border p-4 flex items-center justify-between group">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold uppercase tracking-widest">{page.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-text-secondary tracking-widest">/{page.slug}</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <button onClick={() => handleEdit(page)} className={cn("w-8 h-8 flex items-center justify-center bg-bg border border-border text-text-secondary transition-colors", sportHoverBorder, sportHoverColor)}>
                       <Edit size={14} />
                     </button>
                     <button onClick={() => handleDelete(page.id)} className="w-8 h-8 flex items-center justify-center bg-bg border border-border hover:border-danger text-text-secondary hover:text-danger transition-colors">
                       <Trash size={14} />
                     </button>
                  </div>
               </div>
             ))}
             {pages.length === 0 && (
               <div className="text-center p-12 bg-surface border border-border text-text-muted text-sm uppercase tracking-widest font-mono">
                 No pages found.
               </div>
             )}
          </div>
        </>
      ) : (
        <div className="bg-surface border border-border p-6 flex flex-col gap-6">
           <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold uppercase tracking-widest">Edit Page</span>
              <button onClick={() => setEditingPage(null)} className="text-[10px] font-mono text-text-muted uppercase hover:text-text-primary transition-colors">Cancel</button>
           </div>
           
           <div>
              <label className="block text-[10px] font-mono text-text-muted uppercase tracking-widest mb-2">Title</label>
              <input 
                type="text" 
                value={editingPage.title}
                onChange={(e) => setEditingPage({...editingPage, title: e.target.value})}
                className="w-full bg-bg border border-border px-4 py-2 text-sm font-bold uppercase tracking-wider text-text-primary focus:outline-none transition-colors"
              />
           </div>
           <div>
              <label className="block text-[10px] font-mono text-text-muted uppercase tracking-widest mb-2">Slug (URL)</label>
              <input 
                type="text" 
                value={editingPage.slug}
                onChange={(e) => setEditingPage({...editingPage, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})}
                className="w-full bg-bg border border-border px-4 py-2 text-sm font-mono text-text-primary focus:outline-none transition-colors"
              />
           </div>
           <div>
              <label className="block text-[10px] font-mono text-text-muted uppercase tracking-widest mb-2">Markdown Content</label>
              <textarea 
                value={editingPage.content}
                onChange={(e) => setEditingPage({...editingPage, content: e.target.value})}
                rows={12}
                className="w-full bg-bg border border-border px-4 py-2 text-sm font-mono text-text-primary focus:outline-none transition-colors resize-y min-h-[200px]"
              />
           </div>
           
           <div className="pt-6 border-t border-border flex justify-end">
             <button 
               onClick={handleSave}
               className={cn("flex items-center gap-2 px-6 py-2 text-bg font-bold font-mono text-xs uppercase tracking-widest hover:bg-opacity-90 transition-colors", sportBg)}
             >
               <Save size={14} /> Save Page
             </button>
           </div>
        </div>
      )}
    </div>
  );
}
