'use client';

import { useUser, SignInButton } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import React from 'react';

export default function ProfilePage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--color-void)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="select-none">
        <ReticleCard className="p-8 bg-surface">
          <span className="data-label animate-pulse text-cyan">VERIFYING COMMANDER CLEARANCE...</span>
        </ReticleCard>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--color-void)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="select-none">
        <div style={{ maxWidth: '600px', width: '100%', padding: '2rem' }}>
          <ReticleCard className="p-12 bg-surface text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="inline-block w-1 h-1 bg-amber animate-pulse" />
              <span className="data-label text-amber">AUTHENTICATION PROTOCOL</span>
            </div>
            <h1 className="font-display text-white tracking-tight leading-none mb-4" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}>
              MISSION<br /><span className="text-silver/40">COMMANDER</span>
            </h1>
            <p className="font-mono text-xs text-silver/70 max-w-sm mx-auto leading-relaxed mb-8">
              Sign in with protected SSO protocols to preserve your orbital telemetry caches, custom launch alerts, and global bookmarks.
            </p>
            <SignInButton mode="modal">
              <button className="btn-primary w-full text-center">
                ESTABLISH ENCRYPTED LINK →
              </button>
            </SignInButton>
          </ReticleCard>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--color-void)' }} className="select-none">
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>

        {/* Commander ID Specs Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ marginBottom: '4rem' }}>
          <ReticleCard className="p-6 md:p-8 bg-surface flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <div className="relative">
              {user.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.imageUrl}
                  alt={user.fullName || 'Commander'}
                  className="w-24 h-24 rounded-none border border-cyan/40 object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-void border border-cyan/40 flex items-center justify-center text-2xl">
                  👨‍🚀
                </div>
              )}
              <span className="absolute bottom-0 right-0 font-mono text-[0.55rem] text-void px-1 bg-cyan font-bold">
                ACTIVE
              </span>
            </div>

            <div className="text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <span className="inline-block w-1 h-1 bg-cyan animate-pulse" />
                <span className="data-label text-cyan">CLEARANCE LEVEL // UNRESTRICTED</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl text-white tracking-tight leading-none mb-2">
                {user.fullName || user.username || 'ASTRONAUT_X'}
              </h1>
              <div className="font-mono text-xs text-silver/60">
                LINKED ADDRESS: {user.primaryEmailAddress?.emailAddress}
              </div>
            </div>

            <div className="border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8 text-center md:text-right font-mono text-[0.65rem] text-silver/40">
              <div>SYS_NODE: PRIMARY</div>
              <div>ENCRYPTION: RSA-4096</div>
              <div className="text-white/20 pt-1">ID: {user.id.slice(0, 16)}...</div>
            </div>
          </ReticleCard>
        </motion.div>

        {/* Global Operational Metrics Array */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'SAVED ARCHIVE BOOKMARKS', value: '0 LOGGED' },
            { label: 'ACTIVE COUNTDOWN ALERTS', value: '0 TRIGGERS' },
            { label: 'COMMISSIONED PROTOCOL', value: new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase() },
          ].map(({ label, value }) => (
            <ReticleCard key={label} className="p-6 bg-surface text-center flex flex-col justify-between">
              <span className="data-label text-[0.55rem] text-silver/40 mb-2">{label}</span>
              <span className="font-mono text-lg font-bold text-white tracking-tight">{value}</span>
            </ReticleCard>
          ))}
        </div>

        {/* Mission Bookmarks Archive Canvas */}
        <section className="mb-12">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <h2 className="font-display text-2xl text-white tracking-tight">INDEXED TELEMETRY BOOKMARKS</h2>
            <span className="font-mono text-[0.65rem] text-silver/50">LOCAL REGISTRY</span>
          </div>

          <ReticleCard className="p-12 bg-void/50 border-white/5 text-center">
            <span className="font-mono text-xs text-silver/40 block mb-2">[ ARCHIVE EMPTY ]</span>
            <p className="font-mono text-xs text-silver/60 max-w-md mx-auto leading-relaxed">
              Navigate to satellite modules, dynamic image sets, or global news releases to tag and securely pin persistent operational items.
            </p>
          </ReticleCard>
        </section>

        {/* Alert Schedulers Sub-array */}
        <section className="mb-24">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <h2 className="font-display text-2xl text-white tracking-tight">ACTIVE MISSION CRITICAL ALERTS</h2>
            <span className="font-mono text-[0.65rem] text-amber">EVENT HOOKS</span>
          </div>

          <ReticleCard className="p-12 bg-surface/20 border-amber/10 text-center">
            <span className="font-mono text-xs text-amber/60 block mb-2">[ NO HOOKS CONFIGURED ]</span>
            <p className="font-mono text-xs text-silver/60 max-w-md mx-auto leading-relaxed">
              Engage upcoming orbital launches or LEO transit calculations to configure auto-executing background alert schedules.
            </p>
          </ReticleCard>
        </section>
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
