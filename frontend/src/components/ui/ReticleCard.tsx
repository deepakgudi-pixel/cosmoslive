'use client';

import type { HTMLAttributes, ReactNode } from 'react';

interface ReticleCardProps {
  children?: ReactNode;
  className?: string;
}

export function ReticleCard({ children, className = '', ...props }: ReticleCardProps & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`relative border border-white/10 rounded-none ${className}`} {...props}>
      <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan pointer-events-none" />
      <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan pointer-events-none" />
      <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan pointer-events-none" />
      <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan pointer-events-none" />
      {children}
    </div>
  );
}
