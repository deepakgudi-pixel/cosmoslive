'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ReticleCard, SectionTitle } from '@/components/ui';
import type { APOD } from '@/lib/api';

interface ApodSectionProps {
  apod: APOD | undefined;
}

export function ApodSection({ apod }: ApodSectionProps) {
  if (!apod) return null;

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
        <SectionTitle label="DEEP SPACE OPTICS" title="ASTRONOMY PICTURE OF THE DAY" />
        <div style={{ display: 'flex', gap: '2.5rem', marginTop: '3rem', flexWrap: 'wrap', width: '100%', alignItems: 'stretch' }}>
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
          <div style={{ flex: '5 1 350px', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <ReticleCard style={{ padding: '2.5rem', background: 'var(--color-surface)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-cyan)', display: 'block', marginBottom: '0.5rem' }}>{apod.date}</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: 'white', lineHeight: 1.1, marginBottom: '1rem' }}>{apod.title}</h3>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, maxHeight: '180px', overflowY: 'auto', paddingRight: '0.5rem' }}>{apod.explanation}</p>
                {apod.copyright && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', display: 'block', marginTop: '1rem' }}>© {apod.copyright}</span>}
              </div>
              <div style={{ paddingTop: '1.5rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-thin)' }}>
                <Link href="/media" className="btn-primary" style={{ width: '100%', textAlign: 'center' }}>EXPLORE OPTICAL ARCHIVE →</Link>
              </div>
            </ReticleCard>
          </div>
        </div>
      </motion.section>
    </>
  );
}
