'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { launchApi } from '@/lib/api';
import type { Launch } from '@/lib/api';
import { CountdownTimer } from '@/components/ui/CountdownTimer';

export default function LaunchesPage() {
  const { data: upcoming, isLoading: upcomingLoading } = useQuery({
    queryKey: ['launches-upcoming'],
    queryFn: launchApi.getUpcoming,
    staleTime: 5 * 60 * 1000,
  });

  const { data: previous } = useQuery({
    queryKey: ['launches-previous'],
    queryFn: launchApi.getPrevious,
    staleTime: 5 * 60 * 1000,
  });

  const { data: spacex } = useQuery({
    queryKey: ['spacex'],
    queryFn: launchApi.getSpaceX,
    staleTime: 5 * 60 * 1000,
  });

  const liveStream = upcoming?.find((l) => l.webcast_live);

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
            <span className="inline-block w-1 h-1 bg-amber" />
            <span className="data-label text-amber">LAUNCH MANIFEST // DEEP SPACE ACCESS</span>
          </div>
          <h1 className="font-display text-white tracking-tight" style={{ fontSize: 'clamp(4rem, 10vw, 9rem)', lineHeight: 0.85 }}>
            MISSION<br /><span className="text-silver/40">CONTROL</span>
          </h1>
          <p className="font-mono text-xs text-silver/60 tracking-widest mt-4 max-w-lg">
            CONTROLLABLE CHRONOLOGICAL DEPLOYMENT MANIFEST COVERING ALL ACTIVE GLOBAL AEROSPACE LOGISTICS.
          </p>
        </motion.div>

        {/* Live Stream Focus Console */}
        {liveStream && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <ReticleCard className="p-2 bg-void/90 border-amber/40 glow-amber">
              <div className="p-4 bg-amber/5 flex items-center justify-between border-b border-amber/10">
                <div className="flex items-center gap-3">
                  <span className="status-live status-amber">LIVE INBOUND STREAM</span>
                  <span className="font-mono text-xs text-white truncate max-w-md">{liveStream.name}</span>
                </div>
                <span className="font-mono text-[0.6rem] text-amber animate-pulse">TRANSMISSION SECURE</span>
              </div>
              {liveStream.vidURLs?.[0] && (
                <div className="aspect-video relative overflow-hidden bg-black">
                  <iframe
                    src={liveStream.vidURLs[0].url.replace('watch?v=', 'embed/') + '?autoplay=1&mute=1'}
                    title="Launch Live Stream"
                    className="w-full h-full border-none"
                    allowFullScreen
                  />
                </div>
              )}
            </ReticleCard>
          </motion.div>
        )}

        {/* Upcoming Launches Catalog */}
        <section className="mb-24">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8">
            <h2 className="font-display text-3xl text-white tracking-tight">SCHEDULED OPERATIONS</h2>
            <span className="font-mono text-[0.65rem] text-silver/50">ACTIVE CADENCE</span>
          </div>

          {upcomingLoading ? (
            <div className="font-mono text-xs text-silver/40 py-12 text-center border border-white/5">
              RETRIEVING LAUNCH MANIFEST...
            </div>
          ) : (
            <div className="space-y-4">
              {upcoming?.map((launch, i) => (
                <LaunchCard key={launch.id} launch={launch} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* SpaceX Active Launch Vehicle Infrastructure */}
        {spacex?.rockets && (
          <section className="mb-24">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8">
              <h2 className="font-display text-3xl text-white tracking-tight">SPACEX HARDWARE FLEET</h2>
              <span className="font-mono text-[0.65rem] text-silver/50">REUSABLE ARCHITECTURES</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {spacex.rockets.map((rocket) => (
                <ReticleCard key={rocket.id} className="p-6 bg-surface flex flex-col justify-between h-full card-hover">
                  <div>
                    <span className="font-mono text-[0.55rem] text-cyan block mb-1">LAUNCH VEHICLE</span>
                    <h3 className="font-display text-2xl text-white tracking-tight mb-4">{rocket.name}</h3>
                    
                    <div className="space-y-2 pt-2 border-t border-white/5 font-mono text-xs">
                      <div className="flex justify-between"><span className="text-silver/50">RELIABILITY</span><span className="text-white font-bold">{rocket.success_rate_pct}%</span></div>
                      <div className="flex justify-between"><span className="text-silver/50">EST. COST</span><span className="text-white font-bold">${(rocket.cost_per_launch / 1e6).toFixed(0)}M</span></div>
                      <div className="flex justify-between"><span className="text-silver/50">DEBUT</span><span className="text-white font-bold">{new Date(rocket.first_flight).getFullYear()}</span></div>
                      <div className="flex justify-between"><span className="text-silver/50">STAGES</span><span className="text-white font-bold">{rocket.stages}</span></div>
                    </div>

                    <p className="font-mono text-[0.65rem] text-silver/60 pt-4 mt-4 border-t border-white/5 leading-relaxed">
                      {rocket.description.slice(0, 110)}...
                    </p>
                  </div>
                  
                  <span className="font-mono text-[0.55rem] text-silver/30 block pt-4 text-right">
                    SYS_REQ: NOMINAL
                  </span>
                </ReticleCard>
              ))}
            </div>
          </section>
        )}

        {/* Past Operational Log */}
        <section className="mb-12">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8">
            <h2 className="font-display text-3xl text-white tracking-tight">OPERATIONAL ARCHIVE</h2>
            <span className="font-mono text-[0.65rem] text-silver/50">VERIFIED LOGS</span>
          </div>

          <div className="space-y-2">
            {previous?.map((launch) => {
              const isSuccess = launch.status.abbrev === 'Success';
              const isFail = launch.status.abbrev === 'Failure';
              return (
                <div
                  key={launch.id}
                  className="p-4 bg-white/5 hover:bg-white/10 transition-colors border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs"
                >
                  <div className="space-y-1">
                    <div className="font-display text-lg text-white tracking-tight">{launch.name}</div>
                    <div className="text-[0.65rem] text-silver/60">
                      {launch.launch_service_provider?.name} // {new Date(launch.net).toISOString().slice(0, 10)}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-silver/40 hidden md:inline">{launch.pad?.name || 'PAD N/A'}</span>
                    <span
                      className={`px-2.5 py-1 text-[0.6rem] font-bold border ${
                        isSuccess 
                          ? 'bg-green/10 text-green border-green/30' 
                          : isFail 
                          ? 'bg-red/10 text-red border-red/30' 
                          : 'bg-amber/10 text-amber border-amber/30'
                      }`}
                    >
                      {launch.status.name.toUpperCase()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function LaunchCard({ launch, index }: { launch: Launch; index: number }) {
  const isPrimary = index === 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <ReticleCard className={`p-6 lg:p-8 bg-surface card-hover transition-all ${isPrimary ? 'border-l-4 border-l-amber border-white/20' : ''}`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {isPrimary && <span className="px-2 py-0.5 bg-amber text-void font-mono font-bold text-[0.6rem]">NEXT TARGET</span>}
              <span className="tag text-white border-white/20">{launch.launch_service_provider?.name}</span>
              {launch.mission?.type && <span className="tag text-silver/60">{launch.mission.type}</span>}
            </div>

            <h3 className="font-display text-2xl lg:text-4xl text-white tracking-tight leading-none">
              {launch.name}
            </h3>

            <div className="font-mono text-xs text-silver/60 pt-1">
              <span className="text-white/80">{launch.rocket?.configuration?.full_name}</span> // {launch.pad?.name}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col items-start lg:items-end justify-center pt-4 lg:pt-0 border-t lg:border-t-0 border-white/5">
            <span className="font-mono text-[0.6rem] text-silver/40 mb-2">
              NET: {new Date(launch.net).toUTCString()}
            </span>
            <CountdownTimer targetDate={launch.net} />
          </div>
        </div>
      </ReticleCard>
    </motion.div>
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
