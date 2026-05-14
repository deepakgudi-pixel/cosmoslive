'use client';

import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { satelliteApi, issApi } from '@/lib/api';
import type { StarlinkSatellite } from '@/lib/api';
import { Globe } from '@/components/globe/Globe';

export default function SatellitesPage() {
  const [selected, setSelected] = useState<StarlinkSatellite | null>(null);
  const [search, setSearch] = useState('');
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      setTimeStr(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: satData, isLoading } = useQuery({
    queryKey: ['starlink'],
    queryFn: satelliteApi.getStarlink,
    refetchInterval: 30000,
    staleTime: 25000,
  });

  const { data: issPos } = useQuery({
    queryKey: ['iss-position'],
    queryFn: issApi.getPosition,
    refetchInterval: 10000,
  });

  const satellites = satData?.satellites ?? [];

  const filtered = satellites.filter(
    (s) =>
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.includes(search)
  );

  return (
    <div style={{ paddingTop: '70px', minHeight: '100vh', background: 'var(--color-void)' }} className="select-none">

      {/* ── FULL-SCREEN VIEWPORT GLOBE ──────────────────────── */}
      <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 70px)', overflow: 'hidden' }}>

        {/* Framing Guides */}
        <div className="absolute inset-x-8 inset-y-6 pointer-events-none z-1 border-x border-white/5 hidden lg:block" />

        {/* Render 3D Earth Constellation layer */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Globe
            satellites={satellites}
            issPosition={issPos ?? null}
            onSatelliteClick={setSelected}
            height={typeof window !== 'undefined' ? window.innerHeight - 70 : 800}
          />
        </div>

        {/* Ambient Dark Mask */}
        <div className="absolute inset-0 pointer-events-none z-1 bg-gradient-to-b from-void/60 via-transparent to-void/80" />

        {/* ── TOP LEFT HUD CONSOLE ─────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: 'absolute', top: '2rem', left: '2.5rem', zIndex: 10 }}
        >
          <ReticleCard className="p-6 bg-void/85 backdrop-blur-xl border-white/10 w-[280px]">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-1.5 h-1.5 bg-cyan animate-pulse" />
              <span className="font-mono text-[0.6rem] text-cyan tracking-widest">CONSTELLATION STATUS</span>
            </div>
            
            <h2 className="font-display text-4xl text-white tracking-tight leading-none mb-4">
              STARLINK<span className="text-silver/40 block text-lg">LEO ARRAY</span>
            </h2>
            
            <div className="divider-line mb-4" />
            
            <div className="space-y-3">
              <TelemetryMetric label="ACTIVE NODES" value={isLoading ? 'AWAITING...' : `${satData?.count ?? 0}`} />
              <TelemetryMetric label="ISS LINK" value={issPos ? `${issPos.lat.toFixed(2)}°N` : 'SEARCHING'} live />
              <TelemetryMetric label="TIMECODE" value={timeStr.split(' ')[1] || '—'} />
              <TelemetryMetric label="UPDATE CYCLE" value="30 SEC" />
            </div>
          </ReticleCard>
        </motion.div>

        {/* ── BOTTOM LEFT HUD LEGEND ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: 'absolute', bottom: '2rem', left: '2.5rem', zIndex: 10 }}
        >
          <ReticleCard className="py-3 px-5 bg-void/85 backdrop-blur-xl flex items-center gap-6 border-white/10">
            <LegendDot color="#00e5ff" label="STARLINK ORBIT" />
            <LegendDot color="#ff6a00" label="STATION (ISS)" />
          </ReticleCard>
        </motion.div>

        {/* ── TOP RIGHT TARGET DIRECTORY SEARCH ──────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: 'absolute', top: '2rem', right: '2.5rem', zIndex: 10, width: '300px' }}
        >
          <ReticleCard className="p-4 bg-void/85 backdrop-blur-xl border-white/10 flex flex-col max-h-[calc(100vh-140px)]">
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="SEARCH DESIGNATOR..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-xs font-mono text-white placeholder-silver/40 focus:outline-none focus:border-cyan transition-colors uppercase rounded-none"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-2 text-silver/60 hover:text-white font-mono text-xs">✕</button>
              )}
            </div>

            <span className="data-label text-[0.55rem] mb-2 text-silver/50">NODE INDEX ({filtered.length})</span>

            <div className="overflow-y-auto flex-1 space-y-1 pr-1 custom-scrollbar">
              {filtered.slice(0, 100).map((sat) => {
                const isSelected = selected?.id === sat.id;
                return (
                  <button
                    key={sat.id}
                    onClick={() => setSelected(sat)}
                    className={`w-full text-left font-mono text-xs py-2 px-3 transition-all flex items-center justify-between ${
                      isSelected 
                        ? 'bg-cyan/10 border-l-2 border-cyan text-white font-bold' 
                        : 'hover:bg-white/5 text-silver/80 border-l-2 border-transparent'
                    }`}
                  >
                    <span className="truncate pr-2">{sat.name}</span>
                    <span className="text-[0.6rem] text-silver/40 shrink-0">LEO</span>
                  </button>
                );
              })}
              {filtered.length > 100 && (
                <div className="text-[0.6rem] font-mono text-silver/40 text-center pt-2 border-t border-white/5 mt-2">
                  +{filtered.length - 100} TARGETS INDEXED
                </div>
              )}
            </div>
          </ReticleCard>
        </motion.div>

        {/* ── SELECTED TARGET TELEMETRY OVERLAY PANEL ─────── */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: 'absolute', bottom: '2rem', right: '2.5rem', zIndex: 20, width: '300px' }}
            >
              <ReticleCard className="p-6 bg-void/95 backdrop-blur-2xl border-cyan/40 shadow-2xl">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="data-label text-[0.55rem] text-cyan">LOCKED TARGET</span>
                    <h3 className="font-display text-2xl text-white leading-tight tracking-tight mt-0.5">{selected.name}</h3>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-silver/50 hover:text-white font-mono text-xs p-1">✕</button>
                </div>

                <div className="divider-cyan mb-4" />

                <div className="space-y-2.5">
                  <TelemetryMetric label="LATITUDE" value={`${selected.lat.toFixed(4)}°`} />
                  <TelemetryMetric label="LONGITUDE" value={`${selected.lng.toFixed(4)}°`} />
                  <TelemetryMetric label="ORBITAL ALT" value={selected.height ? `${selected.height.toFixed(1)} KM` : 'NOMINAL'} />
                  <TelemetryMetric label="VELOCITY" value={selected.velocity ? `${selected.velocity.toFixed(2)} KM/S` : 'STABLE'} />
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 font-mono text-[0.55rem] text-silver/40 tracking-wider truncate">
                  SYS_ID: {selected.id}
                </div>
              </ReticleCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════ */
function TelemetryMetric({ label, value, live }: { label: string; value: string; live?: boolean }) {
  return (
    <div className="flex items-center justify-between font-mono text-xs">
      <span className="text-silver/60 text-[0.65rem]">{label}</span>
      <div className="flex items-center gap-2">
        {live && <span className="w-1 h-1 bg-red rounded-full animate-pulse" />}
        <span className="text-white font-bold tracking-tight">{value}</span>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 font-mono text-[0.65rem] text-silver">
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
      <span>{label}</span>
    </div>
  );
}

function ReticleCard({ children, className = '', ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) {
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
