'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { GlobeMethods } from 'react-globe.gl';
import type { StarlinkSatellite, ISSPosition } from '@/lib/api';

interface GlobeProps {
  satellites?: StarlinkSatellite[];
  issPosition?: ISSPosition | null;
  onSatelliteClick?: (sat: StarlinkSatellite) => void;
  height?: number;
  mini?: boolean;
  disableScroll?: boolean;
  globeImageUrl?: string;
  bumpImageUrl?: string;
  atmosphereColor?: string;
  atmosphereAltitude?: number;
}

type GlobeSceneComponent = typeof import('react-globe.gl').default;

interface GlobePoint {
  lat: number;
  lng: number;
  alt: number;
  id: string;
  name: string;
  type: 'starlink' | 'iss';
  data: StarlinkSatellite | null;
}

export default function GlobeComponent({
  satellites = [],
  issPosition,
  onSatelliteClick,
  height = 600,
  mini = false,
  disableScroll = false,
  globeImageUrl = 'https://unpkg.com/three-globe/example/img/earth-dark.jpg',
  bumpImageUrl = 'https://unpkg.com/three-globe/example/img/earth-topology.png',
  atmosphereColor = '#00d4ff',
  atmosphereAltitude = 0.12,
}: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const controlsPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [GlobeScene, setGlobeScene] = useState<GlobeSceneComponent | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const globeMod = await import('react-globe.gl');
      if (cancelled) return;
      const GlobeLib = globeMod.default;
      setGlobeScene(() => GlobeLib);
    })();

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateWidth = () => setWidth(container.offsetWidth);
    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  const allPoints = useMemo<GlobePoint[]>(() => {
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

    return issPosition
      ? [
          ...satPoints,
          { lat: issPosition.lat, lng: issPosition.lng, alt: 0.065, id: 'ISS', name: 'ISS', type: 'iss' as const, data: null },
        ]
      : satPoints;
  }, [satellites, issPosition]);

  const focusedStarlink = useMemo(
    () => (satellites.length === 1 ? allPoints.find((point) => point.type === 'starlink') ?? null : null),
    [allPoints, satellites.length]
  );

  useEffect(() => {
    if (!GlobeScene) return;

    controlsPollRef.current = setInterval(() => {
      if (!globeRef.current) return;
      if (controlsPollRef.current) {
        clearInterval(controlsPollRef.current);
        controlsPollRef.current = null;
      }

      const controls = globeRef.current.controls?.();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.3;
        if (disableScroll) controls.enableZoom = false;
      }

      if (focusedStarlink) {
        globeRef.current.pointOfView(
          { lat: focusedStarlink.lat, lng: focusedStarlink.lng, altitude: mini ? 2.1 : 1.55 },
          900
        );
      }
    }, 50);

    return () => {
      if (controlsPollRef.current) {
        clearInterval(controlsPollRef.current);
        controlsPollRef.current = null;
      }
    };
  }, [GlobeScene, disableScroll, focusedStarlink, mini]);

  useEffect(() => {
    if (!focusedStarlink || !globeRef.current) return;

    globeRef.current.pointOfView(
      { lat: focusedStarlink.lat, lng: focusedStarlink.lng, altitude: mini ? 2.1 : 1.55 },
      900
    );
  }, [focusedStarlink, mini]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: `${height}px`,
        position: 'relative',
        pointerEvents: disableScroll ? 'none' : 'auto',
      }}
    >
      {GlobeScene && width > 0 ? (
        <GlobeScene
          ref={globeRef}
          width={width}
          height={height}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl={globeImageUrl}
          bumpImageUrl={bumpImageUrl}
          atmosphereColor={atmosphereColor}
          atmosphereAltitude={atmosphereAltitude}
          pointsData={allPoints}
          pointLat="lat"
          pointLng="lng"
          pointAltitude="alt"
          pointRadius={(d: object) => {
            const point = d as GlobePoint;
            if (point.type === 'iss') return mini ? 0.6 : 0.8;
            return focusedStarlink ? (mini ? 0.35 : 0.55) : mini ? 0.2 : 0.25;
          }}
          pointColor={(d: object) => {
            const point = d as GlobePoint;
            return point.type === 'iss' ? '#ff8c00' : 'rgba(0, 212, 255, 0.85)';
          }}
          pointsMerge={false}
          ringsData={focusedStarlink ? [focusedStarlink] : []}
          ringLat="lat"
          ringLng="lng"
          ringAltitude="alt"
          ringColor={() => 'rgba(0, 229, 255, 0.9)'}
          ringMaxRadius={mini ? 1.4 : 2.8}
          ringPropagationSpeed={mini ? 0.8 : 1.4}
          ringRepeatPeriod={900}
          pointLabel={(d: object) => {
            const point = d as GlobePoint;
            return `
            <div style="background:rgba(0,3,8,0.92);border:1px solid rgba(0,212,255,0.4);padding:8px 12px;font-family:'Space Mono',monospace;font-size:11px;color:#00d4ff;pointer-events:none;white-space:nowrap;">
              <div style="font-weight:700;margin-bottom:4px;">${point.name}</div>
              <div style="color:rgba(232,244,253,0.6)">Lat: ${point.lat.toFixed(2)}°</div>
              <div style="color:rgba(232,244,253,0.6)">Lng: ${point.lng.toFixed(2)}°</div>
              ${point.data?.height ? `<div style="color:rgba(232,244,253,0.6)">Alt: ${point.data.height.toFixed(0)} km</div>` : ''}
            </div>
          `;
          }}
          onPointClick={(point: object) => {
            const selectedPoint = point as GlobePoint;
            if (selectedPoint.type === 'starlink' && selectedPoint.data && onSatelliteClick) {
              onSatelliteClick(selectedPoint.data);
            }
          }}
          enablePointerInteraction={!mini && !disableScroll}
        />
      ) : null}
    </div>
  );
}
