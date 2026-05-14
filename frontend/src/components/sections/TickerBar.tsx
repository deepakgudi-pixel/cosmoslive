'use client';

interface TickerBarProps {
  satCount?: number;
  issPos?: { lat: number; lng: number } | null;
  crewCount?: number;
}

function TickerItem({ label, value, active }: { label: string; value: string; active?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
      <span style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
      <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
      <span style={{ color: active ? 'var(--color-cyan)' : 'white', fontWeight: active ? 700 : 400 }}>{value}</span>
      <span style={{ display: 'inline-block', width: '6px', height: '6px', background: 'rgba(255,255,255,0.2)', marginLeft: '24px' }} />
    </div>
  );
}

export function TickerBar({ satCount, issPos, crewCount }: TickerBarProps) {
  return (
    <section style={{ background: 'var(--color-void)', borderTop: '1px solid var(--border-thin)', borderBottom: '1px solid var(--border-thin)', padding: '12px 0', overflow: 'hidden', width: '100%' }}>
      <div className="flex items-center gap-12 whitespace-nowrap animate-marquee">
        <TickerItem label="STARLINK NETWORK" value={`${satCount ?? '6,000+'} LINKED`} active />
        <TickerItem label="ISS ORBIT" value={issPos ? `${issPos.lat.toFixed(4)}°N ${issPos.lng.toFixed(4)}°E` : 'TRACKING...'} active />
        <TickerItem label="ASTRONAUTS ABOARD" value={crewCount ? `${crewCount} SOULS` : 'STABLE'} />
        <TickerItem label="NASA IMAGE HUB" value="VERIFIED" />
        <TickerItem label="SPACEX DATA" value="LIVE" />
        <TickerItem label="UPSTASH CACHE" value="HIT RATIO 99.4%" />
        <TickerItem label="STARLINK NETWORK" value={`${satCount ?? '6,000+'} LINKED`} active />
        <TickerItem label="ISS ORBIT" value={issPos ? `${issPos.lat.toFixed(4)}°N ${issPos.lng.toFixed(4)}°E` : 'TRACKING...'} active />
        <TickerItem label="ASTRONAUTS ABOARD" value={crewCount ? `${crewCount} SOULS` : 'STABLE'} />
      </div>
      <style jsx global>{`
        .animate-marquee { display: flex; animation: marquee 35s linear infinite; }
        @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
      `}</style>
    </section>
  );
}
