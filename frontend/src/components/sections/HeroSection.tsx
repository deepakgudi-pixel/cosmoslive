'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { SignInButton, useAuth } from '@clerk/nextjs';
import { CountdownTimer, ReticleCard } from '@/components/ui';
import type { StarlinkSatellite, ISSPosition, Launch } from '@/lib/api';

interface HeroSectionProps {
  issPos: ISSPosition | undefined;
  launches: Launch[] | undefined;
  satData: { count: number; satellites: StarlinkSatellite[] } | undefined;
  crew: { count: number; crew: { name: string; craft: string }[] } | undefined;
}

export function HeroSection({ issPos, launches, satData }: HeroSectionProps) {
  const { isSignedIn } = useAuth();
  const [timeStr, setTimeStr] = useState('');
  const [orbitalInfo, setOrbitalInfo] = useState({ orbitalDay: 0, totalOrbits: 16, minsToSunrise: 0, lunarDay: 0, lunarPhaseLabel: '' });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC');

      // ── Real ISS orbital day calculation ──────────────
      // ISS orbital period is ~92.65 minutes = ~15.54 orbits/day
      const ISS_ORBITAL_PERIOD_MS = 92.65 * 60 * 1000;
      // Reference: arbitrary expedition start epoch (approx Expedition 72, Jan 2025)
      const expeditionStartEpoch = new Date('2025-03-15T00:00:00Z').getTime();
      const elapsedMs = now.getTime() - expeditionStartEpoch;
      const totalOrbits = Math.floor(elapsedMs / ISS_ORBITAL_PERIOD_MS);
      // ISS has ~16 orbits per day; compute day position in current cycle
      const orbitsPerDay = 16;
      const orbitalDay = (totalOrbits % orbitsPerDay) + 1;

      // ── ISS sunrise estimation ────────────────────────
      // Each orbit: ~46 min sunlight, ~46 min darkness
      const orbitPhaseMs = elapsedMs % ISS_ORBITAL_PERIOD_MS;
      const halfOrbit = ISS_ORBITAL_PERIOD_MS / 2;
      const isInDaylight = orbitPhaseMs < halfOrbit;
      const minsToSunrise = isInDaylight
        ? Math.ceil((halfOrbit + halfOrbit - orbitPhaseMs) / 60000)
        : Math.ceil((halfOrbit - (orbitPhaseMs - halfOrbit)) / 60000);

      // ── Real lunar phase calculation ──────────────────
      // Using a known new moon epoch and the synodic month
      const SYNODIC_MONTH = 29.53058770576;
      const knownNewMoon = new Date('2024-01-11T11:57:00Z').getTime();
      const daysSinceNewMoon = (now.getTime() - knownNewMoon) / (24 * 60 * 60 * 1000);
      const lunarAge = ((daysSinceNewMoon % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
      const lunarDay = Math.floor(lunarAge) + 1;

      let lunarPhaseLabel = 'STABLE';
      if (lunarAge < 1.85) lunarPhaseLabel = 'NEW MOON';
      else if (lunarAge < 7.38) lunarPhaseLabel = 'WAXING CRESCENT';
      else if (lunarAge < 9.23) lunarPhaseLabel = 'FIRST QUARTER';
      else if (lunarAge < 14.77) lunarPhaseLabel = 'WAXING GIBBOUS';
      else if (lunarAge < 16.61) lunarPhaseLabel = 'FULL MOON';
      else if (lunarAge < 22.15) lunarPhaseLabel = 'WANING GIBBOUS';
      else if (lunarAge < 23.99) lunarPhaseLabel = 'LAST QUARTER';
      else lunarPhaseLabel = 'WANING CRESCENT';

      setOrbitalInfo({ orbitalDay, totalOrbits: orbitsPerDay, minsToSunrise, lunarDay, lunarPhaseLabel });
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const nextLaunch = launches?.[0];

  return (
    <section
      style={{
        height: 'calc(100vh - 70px)',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--color-void)',
        width: '100%',
      }}
    >
      <HeroOrbitBackdrop />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background: `
            radial-gradient(ellipse at 50% 50%, transparent 38%, rgba(0, 0, 0, 0.42) 90%),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.18) 0%, transparent 30%, transparent 70%, rgba(0, 0, 0, 0.78) 100%)
          `,
          pointerEvents: 'none',
          width: '100%',
        }}
      />

      <div className="absolute inset-x-12 inset-y-6 pointer-events-none z-1 border-x border-y border-white/5 hidden md:block" />
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/5 pointer-events-none z-1 hidden md:block" />

      <div className="absolute top-8 left-6 md:left-16 z-2 pointer-events-none space-y-1">
        <span className="data-label text-[0.55rem] text-cyan/70 tracking-[0.25em] flex items-center gap-2">
          <span className="inline-block w-1 h-1 bg-cyan rounded-full animate-pulse" />
          SYSTEM ACTIVE // TELEMETRY LINK ESTABLISHED
        </span>
        <span className="font-mono text-[0.6rem] text-silver/50 tracking-wider block">
          {timeStr || 'LOADING CLOCK...'}
        </span>
        <div className="pt-2 text-[0.55rem] font-mono text-silver/40 tracking-widest hidden sm:block border-t border-white/5 mt-2">
          <span className="text-white/80">ORBITAL DAY {orbitalInfo.orbitalDay} OF {orbitalInfo.totalOrbits}</span> · NEXT SUNRISE <span className="text-cyan">{orbitalInfo.minsToSunrise} MINS</span>
        </div>
        <div className="text-[0.55rem] font-mono text-silver/40 tracking-widest hidden sm:block">
          <span className="text-white/80">LUNAR DAY {orbitalInfo.lunarDay} OF 30</span> · PHASE CONTROLLER <span className="text-amber">{orbitalInfo.lunarPhaseLabel}</span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'absolute', bottom: '5rem', left: '5%', zIndex: 2, maxWidth: '900px' }}
      >
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="status-live">ORBITAL MONITOR</span>
          <span className="data-label text-white/60">
            {satData?.count ?? 0} ACTIVE TARGETS · ISS AT {issPos ? `${issPos.lat.toFixed(2)}°N` : 'AWAITING LINK'}
          </span>
        </div>
        <h1
          className="font-display tracking-tight text-white select-none"
          style={{
            fontSize: 'clamp(4.5rem, 13vw, 11rem)',
            lineHeight: 0.82,
            marginBottom: '1.5rem',
            textShadow: '0 10px 40px rgba(0,0,0,0.9)',
          }}
        >
          COSMOS<span className="text-silver/40">LIVE</span>
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'var(--color-silver)',
            marginBottom: '2.5rem',
            maxWidth: '600px',
            lineHeight: 1.8,
          }}
        >
          Real-time deep space telemetry, orbital constellations, and raw planetary feeds aggregated into one premium aerospace console.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <HeroCta href="/satellites" className="btn-primary btn-cyan" isSignedIn={Boolean(isSignedIn)}>
            <span>CONSTELLATION MAP</span>
            <span className="text-xs">↗</span>
          </HeroCta>
          <HeroCta href="/launches" className="btn-primary btn-amber" isSignedIn={Boolean(isSignedIn)}>
            <span>LAUNCH MANIFEST</span>
            <span className="text-xs">↗</span>
          </HeroCta>
          <HeroCta href="/iss" className="btn-primary" isSignedIn={Boolean(isSignedIn)}>
            <span>ISS TELEMETRY</span>
            <span className="text-xs">↗</span>
          </HeroCta>
        </div>
      </motion.div>

      {nextLaunch && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: 'absolute', top: '6rem', right: '5%', zIndex: 2 }}
          className="hidden xl:block"
        >
          <ReticleCard style={{ padding: '1.5rem', maxWidth: '320px', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="data-label text-amber">NEXT FLIGHT</span>
              <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', padding: '2px 6px', background: 'rgba(255, 106, 0, 0.1)', color: 'var(--color-amber)', border: '1px solid rgba(255, 106, 0, 0.2)' }}>
                T-MINUS
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'white', marginBottom: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {nextLaunch.name.split('|')[0] || nextLaunch.name}
            </div>
            <CountdownTimer targetDate={nextLaunch.net} />
          </ReticleCard>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        style={{ position: 'absolute', bottom: '1.5rem', right: '5%', zIndex: 2, display: 'flex', alignItems: 'center', gap: '12px' }}
      >
        <span className="data-label text-[0.55rem] tracking-[0.2em] text-silver/40">SYSTEM OVERVIEW</span>
        <div style={{ width: '40px', height: '1px', background: 'rgba(255,255,255,0.1)', position: 'relative', overflow: 'hidden' }}>
          <motion.div
            style={{ position: 'absolute', top: 0, left: 0, width: '12px', height: '100%', background: 'var(--color-cyan)' }}
            animate={{ x: [0, 40] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          />
        </div>
      </motion.div>
    </section>
  );
}

function HeroOrbitBackdrop() {
  return (
    <div className="hero-orbit-backdrop" aria-hidden="true">
      <SeamlessHeroVideo />
      <div className="hero-starfield hero-starfield-a" />
      <div className="hero-starfield hero-starfield-b" />
      <div className="hero-video-vignette" />
      <span className="hero-satellite-trace hero-satellite-trace-a" />
      <span className="hero-satellite-trace hero-satellite-trace-b" />
      <span className="hero-satellite-trace hero-satellite-trace-c" />
    </div>
  );
}

function SeamlessHeroVideo() {
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const activeRef = useRef(0);
  const transitionRef = useRef(false);
  const [activeVideo, setActiveVideo] = useState(0);
  const crossfadeSeconds = 1.4;

  useEffect(() => {
    activeRef.current = activeVideo;
  }, [activeVideo]);

  const handleTimeUpdate = (index: number) => {
    const video = videoRefs.current[index];
    if (!video || index !== activeRef.current || transitionRef.current) return;
    if (!Number.isFinite(video.duration) || video.duration <= crossfadeSeconds + 0.5) return;
    if (video.currentTime < video.duration - crossfadeSeconds) return;

    const nextIndex = index === 0 ? 1 : 0;
    const nextVideo = videoRefs.current[nextIndex];
    if (!nextVideo) return;

    transitionRef.current = true;
    try {
      nextVideo.currentTime = 0;
    } catch {
      transitionRef.current = false;
      return;
    }

    nextVideo
      .play()
      .then(() => {
        setActiveVideo(nextIndex);
      })
      .catch(() => {
        transitionRef.current = false;
      });

    window.setTimeout(() => {
      try {
        video.pause();
        video.currentTime = 0;
      } catch {
        // Ignore browser media-state races during the crossfade reset.
      }
      transitionRef.current = false;
    }, (crossfadeSeconds + 0.15) * 1000);
  };

  return (
    <>
      {[0, 1].map((index) => (
        <video
          key={index}
          ref={(node) => {
            videoRefs.current[index] = node;
          }}
          className={`hero-earth-video ${activeVideo === index ? 'is-active' : ''}`}
          src="/videos/earth.mp4"
          autoPlay={index === 0}
          muted
          playsInline
          preload={index === 0 ? 'auto' : 'metadata'}
          onTimeUpdate={() => handleTimeUpdate(index)}
        />
      ))}
    </>
  );
}

function HeroCta({
  href,
  className,
  isSignedIn,
  children,
}: {
  href: string;
  className: string;
  isSignedIn: boolean;
  children: React.ReactNode;
}) {
  if (isSignedIn) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <SignInButton mode="modal">
      <button type="button" className={className}>
        {children}
      </button>
    </SignInButton>
  );
}
