import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import GlobalHeader from './GlobalHeader';
import { useCmsStore } from '../../store/cmsStore';

export default function PublicLayout({ sport = 'football' }: { sport?: 'football' | 'basketball' }) {
  const cms = useCmsStore();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col font-sans relative">
      {/* Dynamic scripts injection simulation */}
      {cms.analytics?.googleAnalyticsId && (
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${cms.analytics.googleAnalyticsId}`}></script>
      )}
      {cms.analytics?.customScripts && (
        <div dangerouslySetInnerHTML={{ __html: cms.analytics.customScripts }} />
      )}

      <GlobalHeader sport={sport} />
      <main className="flex-1 flex flex-col w-full overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="flex-1 flex flex-col"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="border-t border-border bg-surface py-12">
        <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 text-center text-text-muted mono-label uppercase transition-colors">
          &copy; {new Date().getFullYear()} {sport === 'football' ? 'LFFL' : 'LBFL'} FANTASY PLATFORM.
        </div>
      </footer>
    </div>
  );
}
