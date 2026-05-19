'use client';

import { useMemo, useState } from 'react';
import { ReticleCard } from '@/components/ui';
import type { StarlinkSatellite } from '@/lib/api';

interface SatellitesDashboardProps {
  satellites: StarlinkSatellite[];
  isLoading: boolean;
  error: boolean;
}

type SortKey = 'name' | 'lat' | 'lng' | 'height' | 'velocity';

// Safe min/max that won't blow the call stack on large arrays
function safeMin(values: number[]): number {
  return values.reduce((m, v) => (v < m ? v : m), Infinity);
}
function safeMax(values: number[]): number {
  return values.reduce((m, v) => (v > m ? v : m), -Infinity);
}

export function SatellitesDashboard({ satellites, isLoading, error }: SatellitesDashboardProps) {
  const [sortKey, setSortKey] = useState<SortKey>('height');
  const [sortAsc, setSortAsc] = useState(false);
  const [tableSearch, setTableSearch] = useState('');

  const stats = useMemo(() => {
    const withHeight = satellites.filter((s) => s.height != null);
    const withVelocity = satellites.filter((s) => s.velocity != null);
    const total = satellites.length;
    const avgAlt = withHeight.length
      ? withHeight.reduce((a, b) => a + b.height!, 0) / withHeight.length
      : 0;
    const avgVel = withVelocity.length
      ? withVelocity.reduce((a, b) => a + b.velocity!, 0) / withVelocity.length
      : 0;
    const minAlt = withHeight.length ? safeMin(withHeight.map((s) => s.height!)) : 0;
    const maxAlt = withHeight.length ? safeMax(withHeight.map((s) => s.height!)) : 0;
    return { total, avgAlt, avgVel, minAlt, maxAlt };
  }, [satellites]);

  const altitudeBins = useMemo(() => {
    const bins: { label: string; count: number }[] = [];
    const steps = [300, 350, 400, 450, 500, 550, 600];
    for (let i = 0; i < steps.length; i++) {
      const lo = steps[i];
      const hi = steps[i + 1] ?? Infinity;
      bins.push({
        label: `${lo}${steps[i + 1] ? `-${hi}` : '+'}`,
        count: satellites.filter((s) => s.height != null && s.height >= lo && s.height < hi).length,
      });
    }
    return bins;
  }, [satellites]);

  const maxBinCount = Math.max(...altitudeBins.map((b) => b.count), 1);

  const sorted = useMemo(() => {
    const filtered = tableSearch
      ? satellites.filter(
          (s) =>
            s.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
            s.id.includes(tableSearch)
        )
      : satellites;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey] ?? 0;
      const bv = b[sortKey] ?? 0;
      return sortAsc ? (av > bv ? 1 : -1) : av > bv ? -1 : 1;
    });
  }, [satellites, sortKey, sortAsc, tableSearch]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  }

  if (error) {
    return (
      <div className="max-w-[1400px] mx-auto px-8 pb-16">
        <ReticleCard className="p-12 bg-surface text-center">
          <span className="data-label text-red mb-2">CONNECTION ERROR</span>
          <p className="font-mono text-xs text-silver/60">
            Unable to reach the backend API. Make sure the server is running on port 4000.
          </p>
        </ReticleCard>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto px-8 pb-16">
        <div className="font-mono text-xs text-silver/40 text-center py-12 border border-white/5">
          RETRIEVING CONSTELLATION DATA...
        </div>
      </div>
    );
  }

  if (satellites.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-8 pb-16">
        <ReticleCard className="p-12 bg-surface text-center">
          <span className="data-label mb-2">NO TARGETS</span>
          <p className="font-mono text-xs text-silver/60">No satellite data available.</p>
        </ReticleCard>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-8 pb-16 space-y-16">

      {/* ── STATS GRID ───────────────────────────── */}
      <section>
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8">
          <h2 className="font-display text-3xl text-white tracking-tight">CONSTELLATION METRICS</h2>
          <span className="font-mono text-[0.65rem] text-silver/50">LIVE TELEMETRY</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="ACTIVE NODES" value={stats.total.toLocaleString()} unit="SATELLITES" />
          <StatCard label="AVG ALTITUDE" value={stats.avgAlt.toFixed(0)} unit="KM" />
          <StatCard label="AVG VELOCITY" value={stats.avgVel.toFixed(2)} unit="KM/S" />
          <StatCard label="ALT RANGE" value={`${stats.minAlt.toFixed(0)}-${stats.maxAlt.toFixed(0)}`} unit="KM" />
        </div>
      </section>

      {/* ── ALTITUDE DISTRIBUTION ─────────────────── */}
      <section>
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8">
          <h2 className="font-display text-3xl text-white tracking-tight">ALTITUDE DISTRIBUTION</h2>
          <span className="font-mono text-[0.65rem] text-silver/50">ORBITAL SHELLS</span>
        </div>
        <ReticleCard className="p-6 bg-surface">
          <div className="space-y-2">
            {altitudeBins.map((bin) => (
              <div key={bin.label} className="flex items-center gap-4">
                <span className="font-mono text-[0.65rem] text-silver w-20 text-right shrink-0">{bin.label} KM</span>
                <div className="flex-1 h-5 bg-white/5 relative overflow-hidden">
                  <div
                    className="h-full bg-cyan/50 transition-all duration-500"
                    style={{ width: `${(bin.count / maxBinCount) * 100}%` }}
                  />
                </div>
                <span className="font-mono text-[0.6rem] text-cyan w-16 text-right shrink-0">{bin.count}</span>
              </div>
            ))}
          </div>
        </ReticleCard>
      </section>

      {/* ── SORTABLE DATA TABLE ───────────────────── */}
      <section>
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8">
          <h2 className="font-display text-3xl text-white tracking-tight">NODE TELEMETRY LOG</h2>
          <span className="font-mono text-[0.65rem] text-silver/50">SORTABLE INDEX</span>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="FILTER BY DESIGNATOR..."
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 px-3 py-2 text-xs font-mono text-white placeholder-silver/40 focus:outline-none focus:border-cyan transition-colors uppercase rounded-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <Th onClick={() => toggleSort('name')} active={sortKey === 'name'} asc={sortAsc}>DESIGNATOR</Th>
                <Th onClick={() => toggleSort('lat')} active={sortKey === 'lat'} asc={sortAsc}>LAT</Th>
                <Th onClick={() => toggleSort('lng')} active={sortKey === 'lng'} asc={sortAsc}>LNG</Th>
                <Th onClick={() => toggleSort('height')} active={sortKey === 'height'} asc={sortAsc}>ALT (KM)</Th>
                <Th onClick={() => toggleSort('velocity')} active={sortKey === 'velocity'} asc={sortAsc}>VEL (KM/S)</Th>
              </tr>
            </thead>
            <tbody>
              {sorted.slice(0, 200).map((sat) => (
                <tr key={sat.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-2 px-3 text-white font-bold truncate max-w-[200px]">{sat.name}</td>
                  <td className="py-2 px-3 text-silver/80">{sat.lat.toFixed(4)}°</td>
                  <td className="py-2 px-3 text-silver/80">{sat.lng.toFixed(4)}°</td>
                  <td className="py-2 px-3 text-silver/80">{sat.height?.toFixed(1) ?? '—'}</td>
                  <td className="py-2 px-3 text-silver/80">{sat.velocity?.toFixed(4) ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {satellites.length > 200 && (
          <div className="font-mono text-[0.6rem] text-silver/40 text-center pt-4 border-t border-white/5 mt-4">
            DISPLAYING 200 OF {satellites.length} TARGETS
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <ReticleCard className="p-5 bg-surface">
      <span className="data-label text-[0.55rem] text-silver/50 mb-1">{label}</span>
      <div className="font-display text-4xl text-white tracking-tight leading-none mb-1">{value}</div>
      <span className="font-mono text-[0.6rem] text-silver/40">{unit}</span>
    </ReticleCard>
  );
}

function Th({ children, onClick, active, asc }: { children: React.ReactNode; onClick: () => void; active: boolean; asc: boolean }) {
  return (
    <th
      onClick={onClick}
      className={`py-2 px-3 text-left cursor-pointer transition-colors select-none ${
        active ? 'text-cyan' : 'text-silver/50 hover:text-silver'
      }`}
    >
      {children} {active ? (asc ? '▲' : '▼') : ''}
    </th>
  );
}
