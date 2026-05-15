'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { startTransition, useEffect, useMemo, useState } from 'react';
import { satelliteApi } from '@/lib/api';
import { Globe } from '@/components/globe/Globe';
import { ReticleCard } from '@/components/ui';

export default function SatellitesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [timeStr, setTimeStr] = useState('');
  const [globeReady, setGlobeReady] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      setTimeStr(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const enableGlobe = () => {
      if (cancelled) return;
      startTransition(() => setGlobeReady(true));
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(enableGlobe, { timeout: 250 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(idleId);
      };
    }

    const timeoutId = window.setTimeout(enableGlobe, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, []);

  const { data: satData, isLoading, isError } = useQuery({
    queryKey: ['starlink'],
    queryFn: satelliteApi.getStarlink,
    refetchInterval: 30000,
    staleTime: 25000,
  });

  const satellites = useMemo(() => satData?.satellites ?? [], [satData]);
  const selected = selectedId ? satellites.find((sat) => sat.id === selectedId) ?? null : null;
  const globeSatellites = selected ? [selected] : [];

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return satellites;
    return satellites.filter((sat) => sat.name.toLowerCase().includes(query) || sat.id.includes(query));
  }, [satellites, search]);

  const stats = useMemo(() => {
    const withHeight = satellites.filter((sat) => sat.height != null);
    const withVelocity = satellites.filter((sat) => sat.velocity != null);
    const avgAlt = withHeight.length
      ? withHeight.reduce((total, sat) => total + sat.height!, 0) / withHeight.length
      : 0;
    const avgVel = withVelocity.length
      ? withVelocity.reduce((total, sat) => total + sat.velocity!, 0) / withVelocity.length
      : 0;
    const minAlt = withHeight.length ? Math.min(...withHeight.map((sat) => sat.height!)) : 0;
    const maxAlt = withHeight.length ? Math.max(...withHeight.map((sat) => sat.height!)) : 0;

    return {
      total: satellites.length,
      avgAlt,
      avgVel,
      minAlt,
      maxAlt,
    };
  }, [satellites]);

  const altitudeBins = useMemo(() => {
    const steps = [300, 350, 400, 450, 500, 550, 600];
    return steps.map((lo, index) => {
      const hi = steps[index + 1] ?? Infinity;
      return {
        label: `${lo}${Number.isFinite(hi) ? `-${hi}` : '+'}`,
        count: satellites.filter((sat) => sat.height != null && sat.height >= lo && sat.height < hi).length,
      };
    });
  }, [satellites]);

  const maxBinCount = Math.max(...altitudeBins.map((bin) => bin.count), 1);

  const telemetryLog = useMemo(() => {
    if (selected) {
      return [
        selected,
        ...satellites.filter((sat) => sat.id !== selected.id).slice(0, 5),
      ];
    }
    return filtered.slice(0, 6);
  }, [filtered, satellites, selected]);

  const statusText = isError ? 'OFFLINE' : isLoading ? 'SYNCING' : 'NOMINAL';

  return (
    <div style={{ paddingTop: '70px', minHeight: '100vh', background: 'var(--color-void)' }} className="select-none">
      <section style={{ position: 'relative', width: '100%', height: 'calc(100vh - 70px)', overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'translateY(-4%)',
          }}
        >
          {globeReady ? (
            <Globe
              satellites={globeSatellites}
              issPosition={null}
              onSatelliteClick={(sat) => setSelectedId(sat.id)}
              height={typeof window !== 'undefined' ? window.innerHeight - 70 : 800}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_50%_45%,rgba(0,32,64,0.45),rgba(0,0,0,0)_55%)]">
              <div className="font-mono text-[0.7rem] tracking-[0.22em] text-cyan/70">INITIALISING ORBITAL VIEWPORT</div>
            </div>
          )}
        </div>

        <div className="absolute inset-0 pointer-events-none z-1 bg-gradient-to-b from-void/50 via-transparent to-void/80" />
        <div className="satellite-hud-overlay">
          <div className="satellite-hud-frame">
            <span className="satellite-hud-corner satellite-hud-corner-tl" />
            <span className="satellite-hud-corner satellite-hud-corner-tr" />
            <span className="satellite-hud-corner satellite-hud-corner-bl" />
            <span className="satellite-hud-corner satellite-hud-corner-br" />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-4 top-4 z-10 w-[min(320px,calc(100vw-2rem))] md:left-8 md:top-8"
        >
          <ReticleCard className="bg-void/80 backdrop-blur-xl border-white/10 p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${isError ? 'bg-red' : 'bg-cyan'} animate-pulse`} />
              <span className="font-mono text-[0.6rem] text-cyan tracking-widest">CONSTELLATION STATUS</span>
            </div>

            <h1 className="font-display text-4xl text-white tracking-tight leading-none">
              STARLINK<span className="text-silver/40 block text-lg">LEO ARRAY</span>
            </h1>

            <div className="divider-line my-4" />

            <div className="grid grid-cols-2 gap-3">
              <TelemetryMetric label="STATE" value={statusText} live={!isError} />
              <TelemetryMetric label="NODES" value={isLoading ? '...' : stats.total.toLocaleString()} />
              <TelemetryMetric label="LOCK" value={selected ? selected.name : 'STANDBY'} live={Boolean(selected)} />
              <TelemetryMetric label="CYCLE" value="30 SEC" />
            </div>
          </ReticleCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-4 right-4 top-4 z-10 w-[min(360px,calc(100vw-2rem))] md:bottom-8 md:right-8 md:top-8"
        >
          <ReticleCard className="flex h-full flex-col overflow-hidden bg-void/82 backdrop-blur-xl border-white/10">
            <div className="border-b border-white/10 p-4">
              <div className="mb-3 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <span className="data-label text-[0.55rem] text-cyan">TARGET DIRECTORY</span>
                  <h2 className="mt-1 truncate font-display text-2xl text-white tracking-tight leading-none">
                    {selected ? selected.name : 'SELECT NODE'}
                  </h2>
                </div>
                {selected && (
                  <button onClick={() => setSelectedId(null)} className="shrink-0 p-1 font-mono text-xs text-silver/50 hover:text-white">X</button>
                )}
              </div>

              <input
                type="text"
                placeholder="SEARCH DESIGNATOR..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-xs font-mono text-white placeholder-silver/40 focus:outline-none focus:border-cyan transition-colors uppercase rounded-none"
              />
            </div>

            <div className="border-b border-white/10 p-4 bg-cyan/5">
              {selected ? (
                <div className="grid grid-cols-2 gap-3">
                  <TelemetryMetric label="LAT" value={`${selected.lat.toFixed(3)}°`} />
                  <TelemetryMetric label="LNG" value={`${selected.lng.toFixed(3)}°`} />
                  <TelemetryMetric label="ALT" value={selected.height ? `${selected.height.toFixed(0)} KM` : 'NOMINAL'} />
                  <TelemetryMetric label="VEL" value={selected.velocity ? `${selected.velocity.toFixed(2)} KM/S` : 'STABLE'} />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <TelemetryMetric label="LOCK" value="STANDBY" />
                  <TelemetryMetric label="DISPLAY" value="CLEAR" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-4 py-3">
              <span className="data-label text-[0.55rem] text-silver/50">NODE INDEX</span>
              <span className="font-mono text-[0.6rem] text-silver/40">{filtered.length}</span>
            </div>

            <div className="custom-scrollbar flex-1 space-y-1 overflow-y-auto px-3 pb-3">
              {filtered.slice(0, 100).map((sat) => {
                const isSelected = selectedId === sat.id;
                return (
                  <button
                    key={sat.id}
                    onClick={() => setSelectedId(sat.id)}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left font-mono text-xs transition-all ${
                      isSelected
                        ? 'bg-cyan/10 border-l-2 border-cyan text-white font-bold'
                        : 'hover:bg-white/5 text-silver/80 border-l-2 border-transparent'
                    }`}
                  >
                    <span className="truncate pr-2">{sat.name}</span>
                    <span className={`shrink-0 text-[0.6rem] ${isSelected ? 'text-cyan' : 'text-silver/40'}`}>
                      {isSelected ? 'LOCK' : 'LEO'}
                    </span>
                  </button>
                );
              })}
            </div>
          </ReticleCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-4 left-4 right-4 z-10 md:left-8 md:right-[408px] md:bottom-8"
        >
          <ReticleCard className="bg-void/78 backdrop-blur-xl border-white/10 p-4">
            <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="font-display text-2xl text-white tracking-tight leading-none">CONSTELLATION METRICS</h2>
              <span className="font-mono text-[0.6rem] text-silver/45">{timeStr.split(' ')[1] || '--:--:--'} UTC</span>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr_1.45fr]">
              <div className="grid grid-cols-2 gap-3">
                <MetricTile label="ACTIVE" value={stats.total.toLocaleString()} unit="NODES" />
                <MetricTile label="AVG ALT" value={stats.avgAlt.toFixed(0)} unit="KM" />
                <MetricTile label="AVG VEL" value={stats.avgVel.toFixed(2)} unit="KM/S" />
                <MetricTile label="ALT RANGE" value={`${stats.minAlt.toFixed(0)}-${stats.maxAlt.toFixed(0)}`} unit="KM" />
              </div>

              <div className="min-w-0">
                <div className="mb-2 flex items-center justify-between">
                  <span className="data-label text-[0.55rem] text-silver/50">ALTITUDE DISTRIBUTION</span>
                  <span className="font-mono text-[0.55rem] text-silver/35">KM SHELLS</span>
                </div>
                <div className="space-y-1.5">
                  {altitudeBins.map((bin) => (
                    <div key={bin.label} className="grid grid-cols-[52px_1fr_38px] items-center gap-2">
                      <span className="font-mono text-[0.55rem] text-silver/45">{bin.label}</span>
                      <div className="h-2 overflow-hidden bg-white/5">
                        <div
                          className="h-full bg-cyan/55 transition-all duration-500"
                          style={{ width: `${(bin.count / maxBinCount) * 100}%` }}
                        />
                      </div>
                      <span className="text-right font-mono text-[0.55rem] text-cyan/80">{bin.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="hidden min-w-0 lg:block">
                <div className="mb-2 flex items-center justify-between">
                  <span className="data-label text-[0.55rem] text-silver/50">NODE TELEMETRY LOG</span>
                  <span className="font-mono text-[0.55rem] text-silver/35">LIVE INDEX</span>
                </div>
                <div className="space-y-1">
                  {telemetryLog.map((sat) => (
                    <button
                      key={sat.id}
                      onClick={() => setSelectedId(sat.id)}
                      className={`grid w-full grid-cols-[1fr_70px_70px] gap-2 border-b border-white/5 py-1.5 text-left font-mono text-[0.62rem] transition-colors ${
                        selectedId === sat.id ? 'text-cyan' : 'text-silver/70 hover:text-white'
                      }`}
                    >
                      <span className="truncate font-bold">{sat.name}</span>
                      <span>{sat.height?.toFixed(0) ?? '--'} KM</span>
                      <span>{sat.velocity?.toFixed(2) ?? '--'} KM/S</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </ReticleCard>
        </motion.div>
      </section>
    </div>
  );
}

function TelemetryMetric({ label, value, live }: { label: string; value: string; live?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 font-mono text-xs">
      <span className="text-[0.62rem] text-silver/60">{label}</span>
      <div className="flex min-w-0 items-center gap-2">
        {live && <span className="h-1 w-1 shrink-0 rounded-full bg-red animate-pulse" />}
        <span className="truncate text-white font-bold tracking-tight">{value}</span>
      </div>
    </div>
  );
}

function MetricTile({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="border border-white/10 bg-white/[0.03] px-3 py-2">
      <span className="data-label text-[0.5rem] text-silver/45">{label}</span>
      <div className="mt-1 flex items-end gap-1">
        <span className="font-display text-2xl text-white leading-none tracking-tight">{value}</span>
        <span className="pb-0.5 font-mono text-[0.52rem] text-silver/40">{unit}</span>
      </div>
    </div>
  );
}
