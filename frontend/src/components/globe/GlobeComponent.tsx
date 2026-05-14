'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { StarlinkSatellite, ISSPosition } from '@/lib/api';

interface GlobeProps {
  satellites?: StarlinkSatellite[];
  issPosition?: ISSPosition | null;
  onSatelliteClick?: (sat: StarlinkSatellite) => void;
  height?: number;
  mini?: boolean;
  disableScroll?: boolean;
}

export default function GlobeComponent({
  satellites = [],
  issPosition,
  onSatelliteClick,
  height = 600,
  mini = false,
  disableScroll = false,
}: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const initializedRef = useRef(false);

  // Keep stable refs so initGlobe has zero dependencies and never causes effect re-triggers
  const propsRef = useRef({ satellites, issPosition, height, mini, disableScroll, onSatelliteClick });
  useEffect(() => {
    propsRef.current = { satellites, issPosition, height, mini, disableScroll, onSatelliteClick };
  }, [satellites, issPosition, height, mini, disableScroll, onSatelliteClick]);

  const initGlobe = useCallback(async () => {
    if (!containerRef.current || initializedRef.current) return;
    initializedRef.current = true;

    const Globe = (await import('react-globe.gl')).default;
    const { createRoot } = await import('react-dom/client');
    const React = await import('react');

    const currentProps = propsRef.current;

    // Build satellite point data
    const satPoints = currentProps.satellites
      .filter((s) => s.lat != null && s.lng != null)
      .map((s) => ({
        lat: s.lat,
        lng: s.lng,
        alt: Math.min((s.height ?? 550) / 6371, 0.08), // normalize altitude
        id: s.id,
        name: s.name,
        type: 'starlink' as const,
        data: s,
      }));

    // Add ISS as special point
    const allPoints = currentProps.issPosition
      ? [
          ...satPoints,
          {
            lat: currentProps.issPosition.lat,
            lng: currentProps.issPosition.lng,
            alt: 0.065, // ~408km normalized
            id: 'ISS',
            name: 'ISS',
            type: 'iss' as const,
            data: null,
          },
        ]
      : satPoints;

    const globeEl = React.createElement(Globe, {
      ref: globeRef,
      width: containerRef.current.offsetWidth,
      height: currentProps.height,
      backgroundColor: 'rgba(0,0,0,0)',
      // Globe imagery — dark ocean, subtle landmass
      globeImageUrl: 'https://unpkg.com/three-globe/example/img/earth-dark.jpg',
      bumpImageUrl: 'https://unpkg.com/three-globe/example/img/earth-topology.png',
      atmosphereColor: '#00d4ff',
      atmosphereAltitude: 0.12,

      // Satellite dots
      pointsData: allPoints,
      pointLat: 'lat',
      pointLng: 'lng',
      pointAltitude: 'alt',
      pointRadius: (d: any) => (d.type === 'iss' ? (currentProps.mini ? 0.6 : 0.8) : currentProps.mini ? 0.2 : 0.25),
      pointColor: (d: any) => {
        if (d.type === 'iss') return '#ff8c00';
        return 'rgba(0, 212, 255, 0.85)';
      },
      pointsMerge: false,
      pointLabel: (d: any) => `
        <div style="
          background: rgba(0,3,8,0.92);
          border: 1px solid rgba(0,212,255,0.4);
          border-radius: 6px;
          padding: 8px 12px;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          color: #00d4ff;
          pointer-events: none;
          white-space: nowrap;
        ">
          <div style="font-weight:700; margin-bottom:4px;">${d.name}</div>
          <div style="color:rgba(232,244,253,0.6)">Lat: ${d.lat?.toFixed(2)}°</div>
          <div style="color:rgba(232,244,253,0.6)">Lng: ${d.lng?.toFixed(2)}°</div>
          ${d.data?.height ? `<div style="color:rgba(232,244,253,0.6)">Alt: ${d.data.height.toFixed(0)} km</div>` : ''}
        </div>
      `,
      onPointClick: (point: any) => {
        if (point.type === 'starlink' && point.data && propsRef.current.onSatelliteClick) {
          propsRef.current.onSatelliteClick(point.data);
        }
      },

      // Enable standard pointers unless mini mode or scroll disabled
      enablePointerInteraction: !currentProps.mini && !currentProps.disableScroll,
    });

    const root = createRoot(containerRef.current);
    root.render(globeEl);

    // Store cleanup reference
    (containerRef.current as any).__root = root;

    // Configure OrbitControls rotation and zooming
    if (!currentProps.mini && globeRef.current) {
      const controls = globeRef.current.controls?.();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.3;
        if (currentProps.disableScroll) {
          controls.enableZoom = false; // Disable scroll capture so users scroll down the page effortlessly
        }
      }
    }
  }, []); // zero dependencies avoids re-mounting cycles

  useEffect(() => {
    initGlobe();
    return () => {
      if (containerRef.current && (containerRef.current as any).__root) {
        const rootToUnmount = (containerRef.current as any).__root;
        // Schedule unmount asynchronously to avoid React 18 synchronous rendering race condition
        setTimeout(() => {
          try {
            rootToUnmount.unmount();
          } catch (_) {}
        }, 0);
      }
    };
  }, [initGlobe]);

  // Update points dynamically when satellite data changes (without re-mounting)
  useEffect(() => {
    if (!globeRef.current || !initializedRef.current) return;
    const satPoints = satellites
      .filter((s) => s.lat != null && s.lng != null)
      .map((s) => ({
        lat: s.lat,
        lng: s.lng,
        alt: Math.min((s.height ?? 550) / 6371, 0.08),
        id: s.id,
        name: s.name,
        type: 'starlink' as const,
        data: s,
      }));

    const allPoints = issPosition
      ? [
          ...satPoints,
          {
            lat: issPosition.lat,
            lng: issPosition.lng,
            alt: 0.065,
            id: 'ISS',
            name: 'ISS',
            type: 'iss' as const,
            data: null,
          },
        ]
      : satPoints;

    try {
      globeRef.current.pointsData(allPoints);
    } catch (_) {}
  }, [satellites, issPosition]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: `${height}px`,
        position: 'relative',
        pointerEvents: disableScroll ? 'none' : 'auto',
      }}
    />
  );
}
