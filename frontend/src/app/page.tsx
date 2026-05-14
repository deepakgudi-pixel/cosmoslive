'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { issApi, launchApi, mediaApi, newsApi, satelliteApi } from '@/lib/api';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { Globe } from '@/components/globe/Globe';

export default function HomePage() {
  const [timeStr, setTimeStr] = useState('');
  const [minsNext, setMinsNext] = useState(42);

  // Ticking UTC clock for authentic telemetry feel inspired directly by Auriga Space console
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
      setMinsNext(40 + (now.getSeconds() % 5));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: issPos } = useQuery({
    queryKey: ['iss-position'],
    queryFn: issApi.getPosition,
    refetchInterval: 10000,
  });

  const { data: launches } = useQuery({
    queryKey: ['launches-upcoming'],
    queryFn: launchApi.getUpcoming,
    staleTime: 5 * 60 * 1000,
  });

  const { data: crew } = useQuery({
    queryKey: ['iss-crew'],
    queryFn: issApi.getCrew,
    staleTime: 6 * 60 * 60 * 1000,
  });

  const { data: apod } = useQuery({
    queryKey: ['apod'],
    queryFn: mediaApi.getAPOD,
    staleTime: 24 * 60 * 60 * 1000,
  });

  const { data: news } = useQuery({
    queryKey: ['news-home'],
    queryFn: () => newsApi.getArticles(6),
    staleTime: 10 * 60 * 1000,
  });

  const { data: satData } = useQuery({
    queryKey: ['starlink'],
    queryFn: satelliteApi.getStarlink,
    refetchInterval: 30000,
    staleTime: 25000,
  });

  const nextLaunch = launches?.[0];

  return (
    <>
      {/* ── AMBIENT HERO SECTION WITH TECHNICAL HAIRLINE GRID ─────────────────── */}
      <div style={{ paddingTop: '70px', width: '100%', overflowX: 'hidden' }}>
        <section
          style={{
            height: 'calc(100vh - 70px)',
            position: 'relative',
            overflow: 'hidden',
            background: 'var(--color-void)',
            width: '100%',
          }}
        >
          {/* Live Fullscreen 3D Globe */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0, width: '100%' }}>
            <Globe
              satellites={satData?.satellites ?? []}
              issPosition={issPos ?? null}
              height={typeof window !== 'undefined' ? window.innerHeight - 70 : 800}
              disableScroll={true}
            />
          </div>

          {/* Cinematic lighting and dark vignetting overlays */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              background: `
                radial-gradient(ellipse at 50% 50%, transparent 20%, rgba(0, 0, 0, 0.75) 85%),
                linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.95) 100%)
              `,
              pointerEvents: 'none',
              width: '100%',
            }}
          />

          {/* Technical Framing Border Lines (Auriga Style) */}
          <div className="absolute inset-x-12 inset-y-6 pointer-events-none z-1 border-x border-y border-white/5 hidden md:block" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/5 pointer-events-none z-1 hidden md:block" />

          {/* Top-left aerospace micro-label */}
          <div className="absolute top-8 left-6 md:left-16 z-2 pointer-events-none space-y-1">
            <span className="data-label text-[0.55rem] text-cyan/70 tracking-[0.25em] flex items-center gap-2">
              <span className="inline-block w-1 h-1 bg-cyan rounded-full animate-pulse" />
              SYSTEM ACTIVE // TELEMETRY LINK ESTABLISHED
            </span>
            <span className="font-mono text-[0.6rem] text-silver/50 tracking-wider block">
              {timeStr || 'LOADING CLOCK...'}
            </span>
            <div className="pt-2 text-[0.55rem] font-mono text-silver/40 tracking-widest hidden sm:block border-t border-white/5 mt-2">
              <span className="text-white/80">ORBITAL DAY 12 OF 16</span> · NEXT SUNRISE <span className="text-cyan">{minsNext} MINS</span>
            </div>
            <div className="text-[0.55rem] font-mono text-silver/40 tracking-widest hidden sm:block">
              <span className="text-white/80">LUNAR DAY 12 OF 16</span> · PHASE CONTROLLER <span className="text-amber">STABLE</span>
            </div>
          </div>

          {/* Main Cinematic Title Overlays */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              bottom: '5rem',
              left: '5%',
              zIndex: 2,
              maxWidth: '900px',
            }}
          >
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="status-live">
                ORBITAL MONITOR
              </span>
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
              <Link href="/satellites" className="btn-primary btn-cyan">
                <span>CONSTELLATION MAP</span>
                <span className="text-xs">↗</span>
              </Link>
              <Link href="/launches" className="btn-primary btn-amber">
                <span>LAUNCH MANIFEST</span>
                <span className="text-xs">↗</span>
              </Link>
              <Link href="/iss" className="btn-primary">
                <span>ISS TELEMETRY</span>
              </Link>
            </div>
          </motion.div>

          {/* Next launch countdown overlay inside Hero */}
          {nextLaunch && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'absolute',
                top: '6rem',
                right: '5%',
                zIndex: 2,
              }}
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

          {/* Technical Scroll Indicator Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            style={{
              position: 'absolute',
              bottom: '1.5rem',
              right: '5%',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
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

        {/* ── LIVE TELEMETRY TICKER BAR ──────────────────────── */}
        <section style={{ background: 'var(--color-void)', borderTop: '1px solid var(--border-thin)', borderBottom: '1px solid var(--border-thin)', padding: '12px 0', overflow: 'hidden', width: '100%' }}>
          <div className="flex items-center gap-12 whitespace-nowrap animate-marquee">
            <TickerItem label="STARLINK NETWORK" value={`${satData?.count ?? '6,000+'} LINKED`} active />
            <TickerItem label="ISS ORBIT" value={issPos ? `${issPos.lat.toFixed(4)}°N ${issPos.lng.toFixed(4)}°E` : 'TRACKING...'} active />
            <TickerItem label="ASTRONAUTS ABOARD" value={crew ? `${crew.count} SOULS` : 'STABLE'} />
            <TickerItem label="NASA IMAGE HUB" value="VERIFIED" />
            <TickerItem label="SPACEX DATA" value="LIVE" />
            <TickerItem label="UPSTASH CACHE" value="HIT RATIO 99.4%" />
            {/* Duplicated for smooth endless looping */}
            <TickerItem label="STARLINK NETWORK" value={`${satData?.count ?? '6,000+'} LINKED`} active />
            <TickerItem label="ISS ORBIT" value={issPos ? `${issPos.lat.toFixed(4)}°N ${issPos.lng.toFixed(4)}°E` : 'TRACKING...'} active />
            <TickerItem label="ASTRONAUTS ABOARD" value={crew ? `${crew.count} SOULS` : 'STABLE'} />
          </div>
          <style jsx global>{`
            .animate-marquee {
              display: flex;
              animation: marquee 35s linear infinite;
            }
            @keyframes marquee {
              0% { transform: translateX(0%); }
              100% { transform: translateX(-50%); }
            }
          `}</style>
        </section>

        {/* ── MISSION DATA BOARDS (ROBUST ABSOLUTE CENTERED SPACING) ──────── */}
        <div 
          style={{ 
            maxWidth: '1400px', 
            width: '100%', 
            margin: '0 auto', 
            padding: '6rem 2rem', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8rem',
          }}
        >
          
          {/* ISS LIVE FEED PANEL SECTION */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: '100%' }}
          >
            <SectionTitle label="STATION TELEMETRY" title="INTERNATIONAL SPACE STATION" />
            
            {/* Guaranteed side-by-side flex layout spreading elements beautifully */}
            <div 
              style={{ 
                display: 'flex', 
                gap: '2.5rem', 
                marginTop: '3rem', 
                flexWrap: 'wrap',
                width: '100%',
                alignItems: 'stretch',
              }}
            >
              {/* Primary Video Canvas Container */}
              <div style={{ flex: '2 1 650px', minWidth: 0 }}>
                <ReticleCard style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.4)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', flex: 1 }}>
                    <iframe
                      src="https://www.youtube.com/embed/xAieE-QtOeM?autoplay=1&mute=1&controls=1"
                      title="ISS Live Feed"
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                    <div style={{ position: 'absolute', top: '1rem', left: '1rem', pointerEvents: 'none' }}>
                      <span className="status-live" style={{ background: 'rgba(0,0,0,0.8)' }}>LIVE HD VIDEO</span>
                    </div>
                  </div>
                </ReticleCard>
              </div>

              {/* Station Parameters Sidebar */}
              <div style={{ flex: '1 1 350px', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                <ReticleCard style={{ padding: '2.5rem', background: 'var(--color-surface)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span className="data-label" style={{ marginBottom: '0.5rem' }}>MANIFEST</span>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', color: 'white', lineHeight: 0.9, marginBottom: '0.5rem' }}>
                      {crew?.count ?? '—'}
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-silver)', display: 'block', marginBottom: '1.5rem' }}>
                      ASTRONAUTS ASSIGNED TO EXPEDITION
                    </span>
                    
                    <div className="divider-line" style={{ marginBottom: '1.5rem' }} />
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                      {crew?.crew?.map((member) => (
                        <div key={member.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-thin)' }}>
                          <span style={{ color: 'rgba(255,255,255,0.9)' }}>{member.name}</span>
                          <span style={{ fontSize: '0.6rem', color: 'var(--color-cyan)', padding: '2px 6px', background: 'rgba(0, 229, 255, 0.05)', border: '1px solid rgba(0, 229, 255, 0.1)' }}>ACTIVE</span>
                        </div>
                      )) ?? <div className="data-label">FETCHING TELEMETRY...</div>}
                    </div>
                  </div>

                  <div style={{ paddingTop: '1.5rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-thin)' }}>
                    <Link href="/iss" className="btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                      ACCESS ISS CONSOLE →
                    </Link>
                  </div>
                </ReticleCard>
              </div>
            </div>
          </motion.section>

          <div className="divider-cyan" />

          {/* NEXT LAUNCH FLIGHT TRACKER */}
          {nextLaunch && (
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ width: '100%' }}
            >
              <SectionTitle label="PRE-FLIGHT OPERATIONS" title="NEXT ORBITAL MISSION" />
              
              <ReticleCard style={{ marginTop: '3rem', padding: '3rem', background: 'var(--color-surface)' }} className="card-hover">
                <div 
                  style={{ 
                    display: 'flex', 
                    gap: '3rem', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    width: '100%',
                  }}
                >
                  <div style={{ flex: '1 1 550px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span className="tag" style={{ color: 'var(--color-amber)', borderColor: 'rgba(255, 106, 0, 0.2)', background: 'rgba(255, 106, 0, 0.05)' }}>
                        {nextLaunch.launch_service_provider?.name}
                      </span>
                      <span className="tag">{nextLaunch.rocket?.configuration?.name}</span>
                    </div>
                    
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', color: 'white', lineHeight: 0.9 }}>
                      {nextLaunch.name}
                    </h3>
                    
                    {nextLaunch.mission && (
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                        {nextLaunch.mission.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', paddingTop: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-silver)' }}>
                      <div><span style={{ display: 'block', fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)' }}>PAD</span>{nextLaunch.pad?.name || 'TBD'}</div>
                      <div><span style={{ display: 'block', fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)' }}>LOCATION</span>{nextLaunch.pad?.location?.name || 'TBD'}</div>
                    </div>
                  </div>

                  <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: '280px' }}>
                    <span className="data-label" style={{ color: 'var(--color-amber)', marginBottom: '0.75rem' }}>LAUNCH CLOCK</span>
                    <CountdownTimer targetDate={nextLaunch.net} />
                    
                    <Link href="/launches" className="btn-primary btn-amber" style={{ marginTop: '2rem', width: '100%', textAlign: 'center' }}>
                      LAUNCH MANIFEST →
                    </Link>
                  </div>
                </div>
              </ReticleCard>
            </motion.section>
          )}

          <div className="divider-cyan" />

          {/* NASA APOD GALLERY HERO FEATURE */}
          {apod && (
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ width: '100%' }}
            >
              <SectionTitle label="DEEP SPACE OPTICS" title="ASTRONOMY PICTURE OF THE DAY" />
              
              <div 
                style={{ 
                  display: 'flex', 
                  gap: '2.5rem', 
                  marginTop: '3rem', 
                  flexWrap: 'wrap',
                  width: '100%',
                  alignItems: 'stretch',
                }}
              >
                {/* APOD Image Viewport */}
                <div style={{ flex: '7 1 650px', minWidth: 0 }}>
                  <ReticleCard style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.5)', height: '100%', display: 'flex', flexDirection: 'column' }} className="card-hover">
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/10', overflow: 'hidden', flex: 1 }}>
                      {apod.media_type === 'image' ? (
                        <Image src={apod.url} alt={apod.title} fill style={{ objectFit: 'cover' }} unoptimized />
                      ) : (
                        <iframe src={apod.url} title={apod.title} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen />
                      )}
                    </div>
                  </ReticleCard>
                </div>

                {/* APOD Info Dashboard */}
                <div style={{ flex: '5 1 350px', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <ReticleCard style={{ padding: '2.5rem', background: 'var(--color-surface)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-cyan)', display: 'block', marginBottom: '0.5rem' }}>{apod.date}</span>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: 'white', lineHeight: 1.1, marginBottom: '1rem' }}>{apod.title}</h3>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, maxHeight: '180px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        {apod.explanation}
                      </p>
                      {apod.copyright && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', display: 'block', marginTop: '1rem' }}>© {apod.copyright}</span>}
                    </div>

                    <div style={{ paddingTop: '1.5rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-thin)' }}>
                      <Link href="/media" className="btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                        EXPLORE OPTICAL ARCHIVE →
                      </Link>
                    </div>
                  </ReticleCard>
                </div>
              </div>
            </motion.section>
          )}

          <div className="divider-cyan" />

          {/* LATEST TECHNICAL AEROSPACE NEWS */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: '100%' }}
          >
            <SectionTitle label="GLOBAL DISPATCHES" title="AEROSPACE INTELLIGENCE FEED" />
            
            {/* Guarantee responsive centered grid spreading item cards across the view */}
            <div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
                gap: '2rem', 
                marginTop: '3rem',
                width: '100%',
              }}
            >
              {news?.results?.slice(0, 6).map((article) => (
                <a key={article.id} href={article.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
                  <ReticleCard style={{ padding: '2rem', background: 'var(--color-surface)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} className="card-hover" data-interactive>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-silver)', marginBottom: '0.75rem' }}>
                        <span style={{ color: 'var(--color-cyan)' }}>{article.news_site}</span>
                        <span>{new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'white', lineHeight: 1.1, marginBottom: '0.75rem' }}>
                        {article.title}
                      </h4>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                        {article.summary?.slice(0, 120)}...
                      </p>
                    </div>
                    
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', display: 'block', paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-thin)', textAlign: 'right' }}>
                      READ DISPATCH ↗
                    </span>
                  </ReticleCard>
                </a>
              )) ?? <div className="data-label">LOADING INTEL...</div>}
            </div>

            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
              <Link href="/news" className="btn-primary">
                ACCESS COMPLETE INTELLIGENCE FEED →
              </Link>
            </div>
          </motion.section>

        </div>

        {/* ── PREMIUM TECHNICAL FOOTER ──────────────────────────────── */}
        <footer style={{ borderTop: '1px solid var(--border-thin)', background: 'var(--color-void)', padding: '4rem 2rem', marginTop: '6rem', width: '100%' }}>
          <div 
            style={{ 
              maxWidth: '1400px', 
              width: '100%', 
              margin: '0 auto', 
              display: 'flex', 
              flexWrap: 'wrap', 
              justifyContent: 'space-between', 
              gap: '2rem',
              alignItems: 'center',
            }}
          >
            <div style={{ flex: '1 1 400px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'white', lineHeight: 1, marginBottom: '0.5rem' }}>
                COSMOS<span style={{ color: 'var(--color-silver)' }}>LIVE</span>
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-silver)', maxWidth: '450px' }}>
                Premium real-time space infrastructure console. All data sourced directly via authentic aerospace APIs.
              </p>
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textAlign: 'right', flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>DATA PROVIDERS: NASA · SPACEX · LAUNCH LIBRARY 2 · WHERETHEISS.AT</div>
              <div>DESIGN SYSTEM: PRECISE AEROSPACE SOTD GRIDS</div>
              <div style={{ color: 'rgba(255,255,255,0.2)', paddingTop: '0.5rem' }}>© {new Date().getFullYear()} COSMOSLIVE. ALL SYSTEMS NOMINAL.</div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   MICRO-WIDGET COMPONENTS
   ═══════════════════════════════════════════════════════════ */
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

function SectionTitle({ label, title }: { label: string; title: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      <span className="data-label" style={{ color: 'var(--color-cyan)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ display: 'inline-block', width: '4px', height: '4px', background: 'var(--color-cyan)' }} />
        {label}
      </span>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', color: 'white', lineHeight: 0.9 }}>
        {title}
      </h2>
    </div>
  );
}

/* Premium Card Wrapper with corner brackets rendering absolute lines */
function ReticleCard({ children, className = '', style = {}, ...props }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; [key: string]: any }) {
  return (
    <div style={{ position: 'relative', border: '1px solid var(--border-thin)', width: '100%', ...style }} className={className} {...props}>
      {/* 4 Corner Reticle crosshairs */}
      <span style={{ position: 'absolute', top: 0, left: 0, width: '8px', height: '8px', borderTop: '2px solid var(--color-cyan)', borderLeft: '2px solid var(--color-cyan)', pointerEvents: 'none' }} />
      <span style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', borderTop: '2px solid var(--color-cyan)', borderRight: '2px solid var(--color-cyan)', pointerEvents: 'none' }} />
      <span style={{ position: 'absolute', bottom: 0, left: 0, width: '8px', height: '8px', borderBottom: '2px solid var(--color-cyan)', borderLeft: '2px solid var(--color-cyan)', pointerEvents: 'none' }} />
      <span style={{ position: 'absolute', bottom: 0, right: 0, width: '8px', height: '8px', borderBottom: '2px solid var(--color-cyan)', borderRight: '2px solid var(--color-cyan)', pointerEvents: 'none' }} />
      {children}
    </div>
  );
}
