'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { mediaApi } from '@/lib/api';

type MediaTab = 'apod' | 'nasa';

export default function MediaPage() {
  const [activeTab, setActiveTab] = useState<MediaTab>('apod');
  const [lightbox, setLightbox] = useState<{ url: string; title: string; desc: string } | null>(null);
  const [nasaQuery, setNasaQuery] = useState('space nebula galaxy');

  const { data: apodArchive, isLoading: apodLoading } = useQuery({
    queryKey: ['apod-archive'],
    queryFn: () => mediaApi.getAPODArchive(30),
    enabled: activeTab === 'apod',
    staleTime: 60 * 60 * 1000,
  });

  const { data: nasaImages, isLoading: nasaLoading } = useQuery({
    queryKey: ['nasa-images', nasaQuery],
    queryFn: () => mediaApi.getNASAImages(nasaQuery, 1),
    enabled: activeTab === 'nasa',
    staleTime: 60 * 60 * 1000,
  });

  const tabs: { key: MediaTab; label: string }[] = [
    { key: 'apod', label: 'NASA APOD ARCHIVE' },
    { key: 'nasa', label: 'NASA IMAGE DIRECTORY' },
  ];

  const NASA_QUERIES = ['nebula', 'black hole', 'galaxy', 'deep space', 'aurora', 'supernova', 'moon', 'saturn'];

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--color-void)' }} className="select-none">

      {/* Lightbox / Immersive Viewport */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[9999] bg-void/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-5xl w-full cursor-default"
            >
              <ReticleCard className="p-2 bg-void/80 aspect-video relative overflow-hidden mb-6">
                <Image src={lightbox.url} alt={lightbox.title} fill style={{ objectFit: 'contain' }} unoptimized />
                <span className="absolute top-4 left-4 font-mono text-[0.6rem] text-cyan px-2 py-1 bg-void/80 border border-cyan/20">
                  RAW OPTICAL TELEMETRY
                </span>
              </ReticleCard>
              
              <ReticleCard className="p-6 bg-surface">
                <h3 className="font-display text-2xl text-white tracking-tight mb-2">
                  {lightbox.title}
                </h3>
                <p className="font-mono text-xs text-silver/80 leading-relaxed max-h-[160px] overflow-y-auto pr-2">
                  {lightbox.desc}
                </p>
                <div className="pt-4 mt-4 border-t border-white/5 text-right">
                  <button onClick={() => setLightbox(null)} className="font-mono text-xs text-silver/50 hover:text-white">
                    [ DISMISS VIEWPORT ]
                  </button>
                </div>
              </ReticleCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>

        {/* Cinematic Header Layout */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ marginBottom: '3rem' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block w-1 h-1 bg-cyan animate-pulse" />
            <span className="data-label text-cyan">DEEP SPACE IMAGING // OPTICAL TELEMETRY</span>
          </div>
          <h1 className="font-display text-white tracking-tight leading-none" style={{ fontSize: 'clamp(4rem, 10vw, 9rem)' }}>
            COSMOS<br /><span className="text-silver/40">GALLERY</span>
          </h1>
        </motion.div>

        {/* Aerospace Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6 mb-12">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-2.5 font-mono text-xs tracking-widest transition-all ${
                    isActive 
                      ? 'bg-white text-void font-bold' 
                      : 'bg-white/5 text-silver/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* NASA Library Filtering Indices */}
          {activeTab === 'nasa' && (
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="font-mono text-[0.55rem] text-silver/40 mr-2">QUERY PARAMETERS:</span>
              {NASA_QUERIES.map((q) => {
                const isSelected = nasaQuery === q;
                return (
                  <button
                    key={q}
                    onClick={() => setNasaQuery(q)}
                    className={`font-mono text-[0.65rem] px-2.5 py-1 transition-colors uppercase ${
                      isSelected 
                        ? 'bg-cyan/10 text-cyan border border-cyan/30 font-bold' 
                        : 'bg-white/5 text-silver/50 hover:text-white border border-transparent'
                    }`}
                  >
                    #{q}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── APOD CATALOGUE GRID ──────────────────────────── */}
        {activeTab === 'apod' && (
          <motion.div
            key="apod"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {apodLoading &&
              Array.from({ length: 12 }).map((_, i) => (
                <ReticleCard key={i} className="p-2 bg-surface/20 aspect-[4/3] animate-pulse" />
              ))}
            {apodArchive
              ?.filter((a) => a.media_type === 'image')
              .map((item, i) => (
                <motion.div
                  key={item.date}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setLightbox({ url: item.url, title: item.title, desc: item.explanation })}
                  className="group cursor-pointer outline-none"
                  data-interactive
                >
                  <ReticleCard className="p-2 bg-surface group-hover:bg-surface-hover transition-colors flex flex-col justify-between h-full">
                    <div className="aspect-[4/3] relative overflow-hidden bg-black/40 mb-3">
                      <Image src={item.url} alt={item.title} fill style={{ objectFit: 'cover' }} className="group-hover:scale-105 transition-transform duration-500" unoptimized />
                    </div>
                    <div>
                      <span className="font-mono text-[0.55rem] text-cyan block mb-1">{item.date}</span>
                      <h3 className="font-display text-lg text-white group-hover:text-cyan transition-colors tracking-tight line-clamp-2 leading-tight">
                        {item.title}
                      </h3>
                    </div>
                  </ReticleCard>
                </motion.div>
              ))}
          </motion.div>
        )}

        {/* ── NASA LIBRARY QUERY RESULTS ─────────────────── */}
        {activeTab === 'nasa' && (
          <motion.div
            key={`nasa-${nasaQuery}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {nasaLoading &&
              Array.from({ length: 12 }).map((_, i) => (
                <ReticleCard key={i} className="p-2 bg-surface/20 aspect-[4/3] animate-pulse" />
              ))}
            {nasaImages?.items
              ?.filter((item) => item.links?.[0]?.href)
              .map((item, i) => (
                <motion.div
                  key={item.data[0]?.nasa_id || i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() =>
                    setLightbox({
                      url: item.links[0].href,
                      title: item.data[0]?.title || 'NASA Image',
                      desc: item.data[0]?.description || '',
                    })
                  }
                  className="group cursor-pointer outline-none"
                  data-interactive
                >
                  <ReticleCard className="p-2 bg-surface group-hover:bg-surface-hover transition-colors flex flex-col justify-between h-full">
                    <div className="aspect-[4/3] relative overflow-hidden bg-black/40 mb-3">
                      <Image src={item.links[0].href} alt={item.data[0]?.title || 'NASA'} fill style={{ objectFit: 'cover' }} className="group-hover:scale-105 transition-transform duration-500" unoptimized />
                    </div>
                    <div>
                      <span className="font-mono text-[0.55rem] text-silver/50 block mb-1">
                        {item.data[0]?.date_created?.slice(0, 10)}
                      </span>
                      <h3 className="font-display text-lg text-white group-hover:text-cyan transition-colors tracking-tight line-clamp-2 leading-tight">
                        {item.data[0]?.title}
                      </h3>
                    </div>
                  </ReticleCard>
                </motion.div>
              ))}
          </motion.div>
        )}
      </div>
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
