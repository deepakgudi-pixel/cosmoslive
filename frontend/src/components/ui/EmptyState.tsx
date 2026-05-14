'use client';

interface EmptyStateProps {
  label?: string;
  message?: string;
}

export function EmptyState({ label = 'NO DATA', message = 'Nothing to display.' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] bg-void/50 border border-white/5 p-8">
      <span className="data-label text-silver/40 mb-2">{label}</span>
      <p className="font-mono text-xs text-silver/60">{message}</p>
    </div>
  );
}
