'use client';

import dynamic from 'next/dynamic';
import type { StarlinkSatellite, ISSPosition } from '@/lib/api';

// Must be client-side only — WebGL / Three.js can't run in Node
const GlobeComponent = dynamic(() => import('./GlobeComponent'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 50%, rgba(0,20,40,0.8), rgba(0,3,8,1))',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: 'var(--color-cyan)',
            borderRightColor: 'rgba(0,212,255,0.3)',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div className="data-label">Initialising globe...</div>
      </div>
    </div>
  ),
});

export interface GlobeWrapperProps {
  satellites?: StarlinkSatellite[];
  issPosition?: ISSPosition | null;
  onSatelliteClick?: (sat: StarlinkSatellite) => void;
  height?: number;
  mini?: boolean;
  disableScroll?: boolean;
}

export function Globe(props: GlobeWrapperProps) {
  return <GlobeComponent {...props} />;
}
