import React, { Suspense } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { Loader2 } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

const LoadingFallback = () => (
  <div className="w-full h-full min-h-[400px] flex items-center justify-center">
    <Loader2 className="w-8 h-8 text-brand animate-spin" />
  </div>
);

export const SuspenseWrapper = ({ children }: Props) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};
