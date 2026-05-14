'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ReticleCard, SectionTitle, YoutubeLiveFeed } from '@/components/ui';

interface IssSectionProps {
  crew: { count: number; crew: { name: string; craft: string }[] } | undefined;
}

export function IssSection({ crew }: IssSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{ width: '100%' }}
    >
      <SectionTitle label="STATION TELEMETRY" title="INTERNATIONAL SPACE STATION" />
      <div style={{ display: 'flex', gap: '2.5rem', marginTop: '3rem', flexWrap: 'wrap', width: '100%', alignItems: 'stretch' }}>
        <div style={{ flex: '2 1 650px', minWidth: 0 }}>
          <ReticleCard style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.4)', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', flex: 1 }}>
              <YoutubeLiveFeed
                videoId="FuuC4dpSQ1M"
                title="ISS Live Feed"
                muted
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </ReticleCard>
        </div>
        <div style={{ flex: '1 1 350px', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <ReticleCard style={{ padding: '2.5rem', background: 'var(--color-surface)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span className="data-label" style={{ marginBottom: '0.5rem' }}>MANIFEST</span>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', color: 'white', lineHeight: 0.9, marginBottom: '0.5rem' }}>{crew?.count ?? '—'}</div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-silver)', display: 'block', marginBottom: '1.5rem' }}>ASTRONAUTS ASSIGNED TO EXPEDITION</span>
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
              <Link href="/iss" className="btn-primary" style={{ width: '100%', textAlign: 'center' }}>ACCESS ISS CONSOLE →</Link>
            </div>
          </ReticleCard>
        </div>
      </div>
    </motion.section>
  );
}
