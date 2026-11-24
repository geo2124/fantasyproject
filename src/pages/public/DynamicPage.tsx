import { useParams } from 'react-router-dom';
import { useCmsStore } from '../../store/cmsStore';
import ReactMarkdown from 'react-markdown';

export default function DynamicPage({ sport }: { sport: 'football' | 'basketball' }) {
  const { slug } = useParams();
  const cms = useCmsStore();
  
  const page = cms.pages.find(p => p.slug === slug && (p.sport === sport || p.sport === 'all'));

  if (!page) {
    return <div className="p-24 text-center mt-24 text-text-muted uppercase tracking-widest font-mono">Page not found...</div>;
  }

  return (
    <div className="w-full flex justify-center py-16">
       <div className="max-w-[800px] w-full px-6 prose prose-invert prose-brand prose-headings:font-sans prose-headings:uppercase prose-headings:tracking-tight prose-a:text-brand prose-a:no-underline hover:prose-a:underline">
          <ReactMarkdown>{page.content}</ReactMarkdown>
       </div>
    </div>
  );
}
