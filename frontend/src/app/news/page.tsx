'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { newsApi } from '@/lib/api';
import type { NewsArticle } from '@/lib/api';

const TAGS = ['SpaceX', 'NASA', 'ISS', 'Mars', 'Moon', 'Launches', 'Webb', 'ESA', 'ISRO'];

export default function NewsPage() {
  const [activeTag, setActiveTag] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(0);
  const LIMIT = 24;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['news', page, activeTag],
    queryFn: () => newsApi.getArticles(LIMIT, page * LIMIT, activeTag),
    staleTime: 10 * 60 * 1000,
  });

  const handleTag = (tag: string) => {
    setActiveTag(activeTag === tag ? undefined : tag);
    setPage(0);
  };

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--color-void)' }} className="select-none">
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>

        {/* Framing Grid Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ marginBottom: '3rem' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block w-1 h-1 bg-cyan animate-pulse" />
            <span className="data-label text-cyan">GLOBAL DISPATCHES // REAL-TIME AEROSPACE FEED</span>
          </div>
          <h1 className="font-display text-white tracking-tight leading-none" style={{ fontSize: 'clamp(4rem, 10vw, 9rem)' }}>
            MISSION<br /><span className="text-silver/40">BRIEFING</span>
          </h1>
        </motion.div>

        {/* Index Parameter Filters */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-6 mb-8">
          <span className="font-mono text-[0.55rem] text-silver/40 mr-2">DESIGNATORS:</span>
          <button
            onClick={() => { setActiveTag(undefined); setPage(0); }}
            className={`font-mono text-xs px-3 py-1 transition-colors uppercase ${
              !activeTag ? 'bg-cyan/10 text-cyan border border-cyan/30 font-bold' : 'bg-white/5 text-silver/60 hover:text-white border border-transparent'
            }`}
          >
            #ALL_INDEXED
          </button>
          {TAGS.map((tag) => {
            const isSelected = activeTag === tag;
            return (
              <button
                key={tag}
                onClick={() => handleTag(tag)}
                className={`font-mono text-xs px-3 py-1 transition-colors uppercase ${
                  isSelected ? 'bg-cyan/10 text-cyan border border-cyan/30 font-bold' : 'bg-white/5 text-silver/60 hover:text-white border border-transparent'
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>

        {/* Stream Metrics Log */}
        <div className="flex items-center justify-between font-mono text-[0.65rem] text-silver/40 mb-8">
          <div>
            TOTAL RESULTS: <span className="text-white font-bold">{isLoading ? 'CALCULATING...' : data?.count ?? 0}</span>
            {activeTag && ` [ FILTER ACTIVE: #${activeTag.toUpperCase()} ]`}
          </div>
          {isFetching && !isLoading && <span className="text-cyan animate-pulse">UPDATING FEED LINK...</span>}
        </div>

        {/* Array Viewport Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <ReticleCard key={i} className="p-2 h-64 bg-surface/20 animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div
            key={`${page}-${activeTag}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {data?.results?.map((article, i) => (
              <ArticleCard key={article.id} article={article} index={i} />
            ))}
          </motion.div>
        )}

        {/* Index Page Pagination Controls */}
        <div className="flex items-center justify-center gap-4 mt-16 pt-8 border-t border-white/5">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className={`font-mono text-xs px-4 py-2 border border-white/10 ${
              page === 0 ? 'text-silver/30 border-white/5 cursor-not-allowed' : 'text-white hover:bg-white/5'
            }`}
          >
            [ ← PREV SEGMENT ]
          </button>
          
          <ReticleCard className="px-4 py-2 bg-surface">
            <span className="font-mono text-xs text-cyan font-bold">SEGMENT {page + 1}</span>
          </ReticleCard>

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!data?.next}
            className={`font-mono text-xs px-4 py-2 border border-white/10 ${
              !data?.next ? 'text-silver/30 border-white/5 cursor-not-allowed' : 'text-white hover:bg-white/5'
            }`}
          >
            [ NEXT SEGMENT → ]
          </button>
        </div>
      </div>
    </div>
  );
}

function ArticleCard({ article, index }: { article: NewsArticle; index: number }) {
  return (
    <motion.a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.03 }}
      className="block outline-none group h-full"
      data-interactive
    >
      <ReticleCard className="p-2 bg-surface group-hover:bg-surface-hover transition-colors flex flex-col justify-between h-full">
        <div>
          {article.image_url ? (
            <div className="aspect-[16/9] relative overflow-hidden bg-black mb-3">
              <Image
                src={article.image_url}
                alt={article.title}
                fill
                style={{ objectFit: 'cover' }}
                className="group-hover:scale-105 transition-transform duration-500"
                unoptimized
              />
              <span className="absolute top-2 left-2 font-mono text-[0.55rem] text-void px-1.5 py-0.5 bg-white font-bold">
                {article.news_site.toUpperCase()}
              </span>
            </div>
          ) : (
            <div className="mb-2">
              <span className="font-mono text-[0.55rem] text-cyan px-1.5 py-0.5 bg-cyan/10 border border-cyan/20">
                {article.news_site.toUpperCase()}
              </span>
            </div>
          )}

          <div className="p-3 pt-1">
            <span className="font-mono text-[0.55rem] text-silver/50 block mb-1.5">
              {new Date(article.published_at).toISOString().slice(0, 10)}
            </span>
            <h3 className="font-display text-lg text-white group-hover:text-cyan transition-colors tracking-tight line-clamp-2 leading-tight mb-2">
              {article.title}
            </h3>
            <p className="font-mono text-xs text-silver/70 line-clamp-3 leading-relaxed">
              {article.summary}
            </p>
          </div>
        </div>

        <div className="px-3 pb-2 pt-3 mt-2 border-t border-white/5 font-mono text-[0.55rem] text-silver/30 group-hover:text-white transition-colors text-right">
          ACCESS EXTERNAL DISPATCH ↗
        </div>
      </ReticleCard>
    </motion.a>
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
