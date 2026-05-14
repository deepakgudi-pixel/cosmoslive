'use client';

import { SignInButton, useUser } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { launchApi, userApi } from '@/lib/api';
import type { Launch } from '@/lib/api';
import { CountdownTimer, ReticleCard } from '@/components/ui';

export default function LaunchesPage() {
  const { user, isSignedIn } = useUser();
  const queryClient = useQueryClient();
  const email = user?.primaryEmailAddress?.emailAddress;

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

  const { isSuccess: accountSynced } = useQuery({
    queryKey: ['user-sync', user?.id, email],
    queryFn: () => userApi.sync(user!.id, email!),
    enabled: Boolean(user?.id && email),
    staleTime: 10 * 60 * 1000,
  });

  const { data: bookmarksData } = useQuery({
    queryKey: ['user-bookmarks', user?.id],
    queryFn: () => userApi.getBookmarks(user!.id),
    enabled: Boolean(user?.id && accountSynced),
    staleTime: 30 * 1000,
  });

  const { data: alertsData } = useQuery({
    queryKey: ['user-alerts', user?.id],
    queryFn: () => userApi.getAlerts(user!.id),
    enabled: Boolean(user?.id && accountSynced),
    staleTime: 30 * 1000,
  });

  const saveLaunch = useMutation({
    mutationFn: (launch: Launch) =>
      userApi.createBookmark(user!.id, {
        type: 'launch',
        referenceId: launch.id,
        metadata: {
          title: launch.name,
          net: launch.net,
          provider: launch.launch_service_provider?.name,
          rocket: launch.rocket?.configuration?.full_name || launch.rocket?.configuration?.name,
          pad: launch.pad?.name,
          status: launch.status.name,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-bookmarks', user?.id] });
    },
  });

  const createLaunchAlert = useMutation({
    mutationFn: (launch: Launch) =>
      userApi.createAlert(user!.id, {
        alertType: 'launch',
        config: {
          referenceId: launch.id,
          title: launch.name,
          net: launch.net,
          provider: launch.launch_service_provider?.name,
          status: launch.status.name,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-alerts', user?.id] });
    },
  });

  const liveStream = upcoming?.find((l) => l.webcast_live);
  const savedLaunchIds = new Set(bookmarksData?.bookmarks.filter((bookmark) => bookmark.type === 'launch').map((bookmark) => bookmark.referenceId) || []);
  const alertLaunchIds = new Set(
    alertsData?.alerts
      .filter((alert) => alert.alertType === 'launch' && typeof alert.config.referenceId === 'string')
      .map((alert) => alert.config.referenceId as string) || []
  );

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
            className="mb-20"
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
        <section style={{ marginBottom: '9rem' }}>
          <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-10">
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
                <LaunchCard
                  key={launch.id}
                  launch={launch}
                  index={i}
                  isSignedIn={Boolean(isSignedIn)}
                  accountReady={!isSignedIn || accountSynced}
                  isBookmarked={savedLaunchIds.has(launch.id)}
                  hasAlert={alertLaunchIds.has(launch.id)}
                  isSaving={saveLaunch.isPending && saveLaunch.variables?.id === launch.id}
                  isCreatingAlert={createLaunchAlert.isPending && createLaunchAlert.variables?.id === launch.id}
                  onSave={() => saveLaunch.mutate(launch)}
                  onCreateAlert={() => createLaunchAlert.mutate(launch)}
                />
              ))}
            </div>
          )}
        </section>

        {/* SpaceX Active Launch Vehicle Infrastructure */}
        {spacex?.rockets && (
          <section
            style={{
              marginTop: '6rem',
              marginBottom: '9rem',
              paddingTop: '5rem',
              borderTop: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-10">
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
        <section
          style={{
            marginTop: '6rem',
            marginBottom: '5rem',
            paddingTop: '5rem',
            borderTop: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-10">
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
                      {launch.launch_service_provider?.name} <span aria-hidden="true">{'//'}</span> {new Date(launch.net).toISOString().slice(0, 10)}
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

function LaunchCard({
  launch,
  index,
  isSignedIn,
  accountReady,
  isBookmarked,
  hasAlert,
  isSaving,
  isCreatingAlert,
  onSave,
  onCreateAlert,
}: {
  launch: Launch;
  index: number;
  isSignedIn: boolean;
  accountReady: boolean;
  isBookmarked: boolean;
  hasAlert: boolean;
  isSaving: boolean;
  isCreatingAlert: boolean;
  onSave: () => void;
  onCreateAlert: () => void;
}) {
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
              <span className="text-white/80">{launch.rocket?.configuration?.full_name}</span> <span aria-hidden="true">{'//'}</span> {launch.pad?.name}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col items-start lg:items-end justify-center pt-4 lg:pt-0 border-t lg:border-t-0 border-white/5">
            <span className="font-mono text-[0.6rem] text-silver/40 mb-2">
              NET: {new Date(launch.net).toUTCString()}
            </span>
            <CountdownTimer targetDate={launch.net} />
            <div className="mt-5 flex flex-wrap items-center gap-2 lg:justify-end">
              {isSignedIn ? (
                <>
                  <LaunchActionButton
                    label={!accountReady ? 'SYNCING...' : isBookmarked ? 'SAVED' : isSaving ? 'SAVING...' : 'SAVE MISSION'}
                    tone="cyan"
                    disabled={!accountReady || isBookmarked || isSaving}
                    onClick={onSave}
                  />
                  <LaunchActionButton
                    label={!accountReady ? 'SYNCING...' : hasAlert ? 'ALERT SET' : isCreatingAlert ? 'SETTING...' : 'SET ALERT'}
                    tone="amber"
                    disabled={!accountReady || hasAlert || isCreatingAlert}
                    onClick={onCreateAlert}
                  />
                </>
              ) : (
                <SignInButton mode="modal">
                  <button className="border border-cyan/40 px-3 py-2 font-mono text-[0.6rem] font-bold tracking-widest text-cyan transition-colors hover:bg-cyan hover:text-void">
                    SIGN IN TO SAVE
                  </button>
                </SignInButton>
              )}
            </div>
          </div>
        </div>
      </ReticleCard>
    </motion.div>
  );
}

function LaunchActionButton({
  label,
  tone,
  disabled,
  onClick,
}: {
  label: string;
  tone: 'cyan' | 'amber';
  disabled: boolean;
  onClick: () => void;
}) {
  const toneClass = tone === 'cyan'
    ? 'border-cyan/40 text-cyan hover:bg-cyan hover:text-void'
    : 'border-amber/40 text-amber hover:bg-amber hover:text-void';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`border px-3 py-2 font-mono text-[0.6rem] font-bold tracking-widest transition-colors disabled:cursor-default disabled:border-white/10 disabled:text-silver/35 disabled:hover:bg-transparent ${toneClass}`}
    >
      {label}
    </button>
  );
}
