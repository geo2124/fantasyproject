/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useThemeStore } from './store/themeStore';
import { Toaster } from 'sonner';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  // Added key to RouterProvider to prevent recreation issues but strictly adhering to layout changes
  return (
    <ErrorBoundary>
      <Toaster position="top-center" theme={theme === 'dark' ? 'dark' : 'light'} richColors />
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
