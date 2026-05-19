'use client';

import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { SectionErrorBoundary } from './SectionErrorBoundary';

interface QueryErrorResetProps {
  children: React.ReactNode;
  sectionLabel?: string;
}

/**
 * Wraps a section in both a TanStack Query error-reset boundary and
 * a React error boundary. When the user clicks "Retry", all failed
 * queries inside this boundary will be re-attempted automatically.
 */
export function QueryErrorReset({ children, sectionLabel }: QueryErrorResetProps) {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <SectionErrorBoundary sectionLabel={sectionLabel} onReset={reset}>
      {children}
    </SectionErrorBoundary>
  );
}
