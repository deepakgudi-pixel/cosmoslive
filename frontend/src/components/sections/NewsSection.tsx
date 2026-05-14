'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ReticleCard, SectionTitle } from '@/components/ui';
import type { NewsArticle } from '@/lib/api';

interface NewsSectionProps {
  news: { results: NewsArticle[] } | undefined;
}

export function NewsSection({ news }: NewsSectionProps) {
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
        <SectionTitle label="GLOBAL DISPATCHES" title="AEROSPACE INTELLIGENCE FEED" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginTop: '3rem', width: '100%' }}>
          {news?.results?.slice(0, 6).map((article) => (
            <a key={article.id} href={article.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
              <ReticleCard style={{ padding: '2rem', background: 'var(--color-surface)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} className="card-hover" data-interactive>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-silver)', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--color-cyan)' }}>{article.news_site}</span>
                    <span>{new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'white', lineHeight: 1.1, marginBottom: '0.75rem' }}>{article.title}</h4>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{article.summary?.slice(0, 120)}...</p>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', display: 'block', paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-thin)', textAlign: 'right' }}>READ DISPATCH ↗</span>
              </ReticleCard>
            </a>
          )) ?? <div className="data-label">LOADING INTEL...</div>}
        </div>
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <Link href="/news" className="btn-primary">ACCESS COMPLETE INTELLIGENCE FEED →</Link>
        </div>
      </motion.section>
    </>
  );
}
