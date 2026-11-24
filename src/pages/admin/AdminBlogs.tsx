import { useState } from 'react';
import { useCmsStore } from '../../store/cmsStore';
import { useAuthStore } from '../../store/authStore';
import { Save, Plus, Trash, Edit } from 'lucide-react';
import { cn } from '../../lib/utils';
import { BlogItem } from '../../store/cmsStore';

export default function AdminBlogs() {
  const { user } = useAuthStore();
  const cms = useCmsStore();

  const [activeTab, setActiveTab] = useState<'football' | 'basketball'>(
    user?.sportAccess === 'basketball' ? 'basketball' : 'football'
  );

  const blogs = cms.blogs.filter(b => b.sport === activeTab || b.sport === 'all');
  const [editingBlog, setEditingBlog] = useState<BlogItem | null>(null);

  const sportColor = activeTab === 'basketball' ? 'text-amber-500' : 'text-brand';
  const sportBg = activeTab === 'basketball' ? 'bg-amber-500' : 'bg-brand';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _sportBorder = activeTab === 'basketball' ? 'border-amber-500' : 'border-brand';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _sportFocus = activeTab === 'basketball' ? 'focus:border-amber-500' : 'focus:border-brand';
  const sportBgSoft = activeTab === 'basketball' ? 'bg-amber-500/10' : 'bg-brand/10';
  const sportBorderSoft = activeTab === 'basketball' ? 'border-amber-500/20' : 'border-brand/20';
  const sportHoverBorder = activeTab === 'basketball' ? 'hover:border-amber-500' : 'hover:border-brand';
  const sportHoverColor = activeTab === 'basketball' ? 'hover:text-amber-500' : 'hover:text-brand';

  const handleEdit = (blog: BlogItem) => {
    setEditingBlog(blog);
  };

  const handleDelete = (id: string) => {
    cms.deleteBlog(id);
  };

  const handleAddNew = () => {
    setEditingBlog({
      id: Date.now().toString(),
      title: 'New Post',
      excerpt: '',
      content: '',
      date: 'JUST NOW',
      tag: 'NEWS',
      sport: activeTab
    });
  };

  const handleSave = () => {
    if (editingBlog) {
      if (cms.blogs.some(b => b.id === editingBlog.id)) {
        cms.updateBlog(editingBlog.id, editingBlog);
      } else {
        cms.addBlog(editingBlog);
      }
      setEditingBlog(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-full animate-in fade-in">
      <div className="flex justify-between items-end mb-8">
        <div>
           <h2 className="text-3xl font-bold uppercase tracking-tighter mb-1">Blogs & News</h2>
           <p className="text-xs font-mono text-text-secondary uppercase tracking-widest">Manage Announcements and Articles</p>
        </div>
        {!editingBlog && (
          <button 
             onClick={handleAddNew}
             className={cn("flex items-center gap-2 px-6 py-2 text-bg font-bold font-mono text-xs uppercase tracking-widest hover:bg-opacity-90 transition-colors", sportBg)}
           >
             <Plus size={14} /> Add Post
           </button>
        )}
      </div>

      {!editingBlog ? (
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
             {blogs.map(blog => (
               <div key={blog.id} className="bg-surface border border-border p-4 flex items-center justify-between group">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <span className={cn("text-[10px] px-2 py-0.5 border uppercase font-mono tracking-widest", sportBgSoft, sportColor, sportBorderSoft)}>{blog.tag}</span>
                      <span className="text-sm font-bold uppercase tracking-widest">{blog.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-text-secondary tracking-widest">{blog.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <button onClick={() => handleEdit(blog)} className={cn("w-8 h-8 flex items-center justify-center bg-bg border border-border text-text-secondary transition-colors", sportHoverBorder, sportHoverColor)}>
                       <Edit size={14} />
                     </button>
                     <button onClick={() => handleDelete(blog.id)} className="w-8 h-8 flex items-center justify-center bg-bg border border-border hover:border-danger text-text-secondary hover:text-danger transition-colors">
                       <Trash size={14} />
                     </button>
                  </div>
               </div>
             ))}
             {blogs.length === 0 && (
               <div className="text-center p-12 bg-surface border border-border text-text-muted text-sm uppercase tracking-widest font-mono">
                 No posts found.
               </div>
             )}
          </div>
        </>
      ) : (
        <div className="bg-surface border border-border p-6 flex flex-col gap-6">
           <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold uppercase tracking-widest">Edit Post</span>
              <button onClick={() => setEditingBlog(null)} className="text-[10px] font-mono text-text-muted uppercase hover:text-text-primary transition-colors">Cancel</button>
           </div>
           
           <div>
              <label className="block text-[10px] font-mono text-text-muted uppercase tracking-widest mb-2">Title</label>
              <input 
                type="text" 
                value={editingBlog.title}
                onChange={(e) => setEditingBlog({...editingBlog, title: e.target.value})}
                className="w-full bg-bg border border-border px-4 py-2 text-sm font-bold uppercase tracking-wider text-text-primary focus:outline-none focus:border-brand transition-colors"
              />
           </div>
           <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-[10px] font-mono text-text-muted uppercase tracking-widest mb-2">Tag</label>
                <input 
                  type="text" 
                  value={editingBlog.tag}
                  onChange={(e) => setEditingBlog({...editingBlog, tag: e.target.value})}
                  className="w-full bg-bg border border-border px-4 py-2 text-sm font-mono text-text-primary focus:outline-none focus:border-brand transition-colors uppercase"
                />
             </div>
             <div>
                <label className="block text-[10px] font-mono text-text-muted uppercase tracking-widest mb-2">Date (e.g. 2H AGO)</label>
                <input 
                  type="text" 
                  value={editingBlog.date}
                  onChange={(e) => setEditingBlog({...editingBlog, date: e.target.value})}
                  className="w-full bg-bg border border-border px-4 py-2 text-sm font-mono text-text-primary focus:outline-none focus:border-brand transition-colors uppercase"
                />
             </div>
           </div>
           <div>
              <label className="block text-[10px] font-mono text-text-muted uppercase tracking-widest mb-2">Excerpt</label>
              <textarea 
                value={editingBlog.excerpt}
                onChange={(e) => setEditingBlog({...editingBlog, excerpt: e.target.value})}
                rows={2}
                className="w-full bg-bg border border-border px-4 py-2 text-sm font-mono text-text-primary focus:outline-none focus:border-brand transition-colors resize-none"
              />
           </div>
           <div>
              <label className="block text-[10px] font-mono text-text-muted uppercase tracking-widest mb-2">Content</label>
              <textarea 
                value={editingBlog.content}
                onChange={(e) => setEditingBlog({...editingBlog, content: e.target.value})}
                rows={6}
                className="w-full bg-bg border border-border px-4 py-2 text-sm font-mono text-text-primary focus:outline-none focus:border-brand transition-colors resize-none"
              />
           </div>
           
           <div className="pt-6 border-t border-border flex justify-end">
             <button 
               onClick={handleSave}
               className={cn("flex items-center gap-2 px-6 py-2 text-bg font-bold font-mono text-xs uppercase tracking-widest hover:bg-opacity-90 transition-colors", sportBg)}
             >
               <Save size={14} /> Save Post
             </button>
           </div>
        </div>
      )}
    </div>
  );
}
