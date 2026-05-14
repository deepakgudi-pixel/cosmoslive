'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CountdownTimer, ReticleCard, SectionTitle } from '@/components/ui';
import type { Launch } from '@/lib/api';

interface LaunchSectionProps {
  nextLaunch: Launch | undefined;
}

export function LaunchSection({ nextLaunch }: LaunchSectionProps) {
  if (!nextLaunch) return null;

  return (
    <>
      <div className="divider-cyan" />
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%' }}
      >
        <SectionTitle label="PRE-FLIGHT OPERATIONS" title="NEXT ORBITAL MISSION" />
        <ReticleCard style={{ marginTop: '3rem', padding: '3rem', background: 'var(--color-surface)' }} className="card-hover">
          <div style={{ display: 'flex', gap: '3rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', width: '100%' }}>
            <div style={{ flex: '1 1 550px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span className="tag" style={{ color: 'var(--color-amber)', borderColor: 'rgba(255, 106, 0, 0.2)', background: 'rgba(255, 106, 0, 0.05)' }}>{nextLaunch.launch_service_provider?.name}</span>
                <span className="tag">{nextLaunch.rocket?.configuration?.name}</span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', color: 'white', lineHeight: 0.9 }}>{nextLaunch.name}</h3>
              {nextLaunch.mission && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{nextLaunch.mission.description}</p>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', paddingTop: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-silver)' }}>
                <div><span style={{ display: 'block', fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)' }}>PAD</span>{nextLaunch.pad?.name || 'TBD'}</div>
                <div><span style={{ display: 'block', fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)' }}>LOCATION</span>{nextLaunch.pad?.location?.name || 'TBD'}</div>
              </div>
            </div>
            <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: '280px' }}>
              <span className="data-label" style={{ color: 'var(--color-amber)', marginBottom: '0.75rem' }}>LAUNCH CLOCK</span>
              <CountdownTimer targetDate={nextLaunch.net} />
              <Link href="/launches" className="btn-primary btn-amber" style={{ marginTop: '2rem', width: '100%', textAlign: 'center' }}>LAUNCH MANIFEST →</Link>
            </div>
          </div>
        </ReticleCard>
      </motion.section>
    </>
  );
}
