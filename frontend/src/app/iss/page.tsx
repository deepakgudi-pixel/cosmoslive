'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { issApi } from '@/lib/api';
import { Globe } from '@/components/globe/Globe';

export default function ISSPage() {
  const { data: position, dataUpdatedAt } = useQuery({
    queryKey: ['iss-position'],
    queryFn: issApi.getPosition,
    refetchInterval: 10000,
  });

  const { data: crewData } = useQuery({
    queryKey: ['iss-crew'],
    queryFn: issApi.getCrew,
    staleTime: 6 * 60 * 60 * 1000,
  });

  const { data: stream } = useQuery({
    queryKey: ['iss-stream'],
    queryFn: issApi.getStream,
    staleTime: Infinity,
  });

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--color-void)' }} className="select-none">
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>

        {/* Framing Grid Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: '4rem' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block w-1 h-1 bg-cyan animate-pulse" />
            <span className="data-label text-cyan">STATION CONSOLE // ORBITAL LINK ACTIVE</span>
          </div>
          <h1 className="font-display text-white tracking-tight leading-none" style={{ fontSize: 'clamp(4rem, 10vw, 9rem)' }}>
            STATION<br /><span className="text-silver/40">TELEMETRY</span>
          </h1>
          <div className="flex items-center gap-4 mt-6">
            <span className="status-live">ORBIT: LEO</span>
            <span className="font-mono text-xs text-silver/60">
              TIMECODE: {dataUpdatedAt ? new Date(dataUpdatedAt).toISOString().split('T')[1].slice(0, 8) : 'AWAITING'} UTC
            </span>
          </div>
        </motion.div>

        {/* Live Video + Position Console Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">

          {/* HD Earth Feed Viewport */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-2"
          >
            <ReticleCard className="p-2 bg-void/50 aspect-video relative overflow-hidden h-full flex flex-col justify-between">
              <iframe
                src={stream?.url || 'https://www.youtube.com/embed/xAieE-QtOeM?autoplay=1&mute=1'}
                title="ISS Live Feed"
                className="w-full h-full border-none absolute inset-0"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
              <div className="absolute top-4 left-4 z-10">
                <span className="status-live bg-void/80 backdrop-blur-md">NASA HD FEED</span>
              </div>
            </ReticleCard>
          </motion.div>

          {/* Persistent Position Telemetry Log */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-between"
          >
            <ReticleCard className="p-8 bg-surface flex-1 flex flex-col justify-between">
              <div>
                <span className="data-label mb-1 text-silver/40">CURRENT ORBITAL POSITION</span>
                <div className="font-display text-5xl text-white tracking-tight line-clamp-2 leading-none mb-6 pt-2">
                  {position ? (
                    <>
                      {position.lat.toFixed(4)}°<span className="text-silver/40 text-xl font-mono">N</span>
                      <span className="text-white/20 mx-2">/</span>
                      {position.lng.toFixed(4)}°<span className="text-silver/40 text-xl font-mono">E</span>
                    </>
                  ) : 'CALCULATING...'}
                </div>

                <div className="divider-line mb-6" />

                <div className="space-y-4">
                  <TelemetryRow label="ESTIMATED ALTITUDE" value="~408 KM" />
                  <TelemetryRow label="ORBITAL SPEED" value="~7.66 KM/S" />
                  <TelemetryRow label="ORBITAL PERIOD" value="~92 MIN" />
                  <TelemetryRow label="INCLINATION" value="51.6°" />
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-white/5 font-mono text-[0.65rem] text-silver/40 flex justify-between">
                <span>OPERATIONAL SATELLITE STATUS</span>
                <span className="text-green font-bold">NOMINAL</span>
              </div>
            </ReticleCard>
          </motion.div>
        </div>

        {/* Assigned Crew Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8">
            <h2 className="font-display text-3xl text-white tracking-tight">ACTIVE PERSONNEL MANIFEST</h2>
            <span className="font-mono text-[0.65rem] text-silver/50">EXPEDITION ABOARD</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {crewData?.crew?.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <ReticleCard className="p-6 bg-surface text-center card-hover h-full flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 bg-cyan/5 border border-cyan/20 rounded-none flex items-center justify-center text-xl mx-auto mb-4">
                      👨‍🚀
                    </div>
                    <h3 className="font-display text-xl text-white tracking-tight mb-1">{member.name}</h3>
                    <span className="font-mono text-[0.6rem] text-cyan block tracking-widest">{member.craft.toUpperCase()} ASSIGNMENT</span>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/5 text-[0.55rem] font-mono text-silver/30 text-right">
                    SYS_DESIG: ACTIVE
                  </div>
                </ReticleCard>
              </motion.div>
            )) ?? (
              Array.from({ length: 7 }).map((_, i) => (
                <ReticleCard key={i} className="p-6 h-36 bg-surface/20 border-white/5 animate-pulse" />
              ))
            )}
          </div>
        </motion.section>

        {/* Local Station Viewport Mini Globe */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8">
            <h2 className="font-display text-3xl text-white tracking-tight">ORBITAL INTERFACE SIMULATION</h2>
            <span className="font-mono text-[0.65rem] text-silver/50">3D RENDERING</span>
          </div>

          <ReticleCard className="p-2 bg-void/50 h-[450px] relative overflow-hidden">
            <Globe
              satellites={[]}
              issPosition={position ?? null}
              height={450}
              mini={false}
            />
            <div className="absolute bottom-6 left-6 z-10 flex items-center gap-4 bg-void/80 backdrop-blur px-4 py-2 border border-white/10">
              <span className="status-live">STATION ORBIT DETECTED</span>
              {position && (
                <span className="font-mono text-xs text-white">
                  {position.lat.toFixed(2)}°N / {position.lng.toFixed(2)}°E
                </span>
              )}
            </div>
          </ReticleCard>
        </motion.section>

        {/* Structural Spec Sheets */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8">
            <h2 className="font-display text-3xl text-white tracking-tight">STATION STRUCTURAL SPECIFICATIONS</h2>
            <span className="font-mono text-[0.65rem] text-silver/50">PHYSICAL DIMENSIONS</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'TOTAL MASS', value: '419,725 KG' },
              { label: 'LENGTH AXIS', value: '109 METERS' },
              { label: 'SOLAR ARRAY SPAN', value: '73 METERS' },
              { label: 'HABITABLE VOLUME', value: '916 M³' },
              { label: 'EVA MISSIONS', value: '250+ LOGGED' },
              { label: 'PARTICIPATING NATIONS', value: '19 STATES' },
              { label: 'ORBITAL REVOLUTIONS', value: '~15.5 / DAY' },
              { label: 'DISTANCE LOGGED', value: '~4.7B KM' },
            ].map(({ label, value }) => (
              <ReticleCard key={label} className="p-5 bg-surface/40 hover:bg-surface transition-colors">
                <span className="data-label text-[0.55rem] text-silver/50 mb-1">{label}</span>
                <span className="font-mono text-sm font-bold text-white tracking-tight">{value}</span>
              </ReticleCard>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}

function TelemetryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between font-mono text-xs">
      <span className="text-silver/60 text-[0.65rem]">{label}</span>
      <span className="text-white font-bold">{value}</span>
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
