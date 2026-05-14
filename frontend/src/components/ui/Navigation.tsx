'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SignInButton, UserButton, useAuth } from '@clerk/nextjs';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/satellites', label: 'Satellites' },
  { href: '/launches', label: 'Launches' },
  { href: '/iss', label: 'ISS Live' },
  { href: '/media', label: 'Media' },
  { href: '/news', label: 'News' },
];

function AuthSection() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <div aria-hidden="true" style={{ width: '90px', height: '34px' }} />;
  }

  if (isSignedIn) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/profile" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.65rem' }}>
          Profile
        </Link>
        <div style={{ border: '1px solid var(--border-thin)', borderRadius: '50%', padding: '2px' }}>
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'cosmos-clerk-avatar',
                userButtonPopoverCard: 'cosmos-clerk-popover',
                userButtonPopoverMain: 'cosmos-clerk-popover-main',
                userButtonPopoverFooter: 'cosmos-clerk-popover-footer',
                userPreview: 'cosmos-clerk-preview',
                userPreviewMainIdentifier: 'cosmos-clerk-preview-name',
                userPreviewSecondaryIdentifier: 'cosmos-clerk-preview-email',
                userButtonPopoverActionButton: 'cosmos-clerk-action',
                userButtonPopoverActionButtonIconBox: 'cosmos-clerk-action-icon',
              },
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <SignInButton mode="modal">
      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        className="btn-primary" 
        style={{ padding: '8px 20px', fontSize: '0.65rem' }}
      >
        Sign In
      </motion.button>
    </SignInButton>
  );
}

export function Navigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Global body attribute for navigation feedback
  useEffect(() => {
    if (isNavigating) {
      document.body.setAttribute('data-navigating', 'true');
    } else {
      document.body.removeAttribute('data-navigating');
    }
  }, [isNavigating]);

  // Close mobile menu and reset navigation state when pathname changes
  useEffect(() => {
    setMobileOpen(false);
    setIsNavigating(false);
  }, [pathname]);

  const startNav = (href: string) => {
    if (pathname !== href) {
      setIsNavigating(true);
    }
  };

  return (
    <>
      {/* Top Loading Progress Bar */}
      <AnimatePresence mode="wait">
        {isNavigating && (
          <motion.div
            key="nav-progress"
            initial={{ width: '0%', opacity: 0 }}
            animate={{ width: ['30%', '85%'], opacity: 1 }}
            exit={{ width: '100%', opacity: 0 }}
            transition={{ 
              width: { duration: 2, ease: "easeOut" },
              opacity: { duration: 0.2 }
            }}
            style={{
              position: 'fixed',
              top: 0, left: 0,
              height: '3px',
              background: 'linear-gradient(90deg, var(--color-cyan), var(--color-white))',
              zIndex: 200000,
              boxShadow: '0 0 15px var(--color-cyan)',
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      <nav
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 100000,
          pointerEvents: 'auto',
          isolation: 'isolate',
          padding: '0 3rem',
          height: '70px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: scrolled ? 'rgba(0, 0, 0, 0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(30px) saturate(1.2)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border-thin)' : '1px solid transparent',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Premium Minimal Logo */}
        <Link
          href="/"
          onClick={() => startNav('/')}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.6rem',
            letterSpacing: '0.04em',
            color: 'var(--color-white)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            lineHeight: 1,
          }}
        >
          <span style={{ color: 'var(--color-cyan)', fontSize: '0.9rem' }}>◈</span>
          <span>COSMOS<span style={{ color: 'var(--color-silver)' }}>LIVE</span></span>
        </Link>

        {/* Desktop Links with active indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }} className="hidden md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => startNav(link.href)}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: isActive ? 'var(--color-white)' : 'var(--color-silver)',
                  textDecoration: 'none',
                  position: 'relative',
                  padding: '0.5rem 0',
                  transition: 'color 0.3s ease',
                }}
              >
                <motion.span
                  whileTap={{ scale: 0.9, y: 1 }}
                  style={{ display: 'inline-block' }}
                >
                  {link.label}
                </motion.span>
                <span 
                  style={{ 
                    position: 'absolute', 
                    bottom: 0, left: 0, right: 0, 
                    height: '1px', 
                    background: 'var(--color-cyan)',
                    transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                    transformOrigin: 'left',
                    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  }} 
                />
              </Link>
            );
          })}
        </div>

        {/* Auth & Mobile Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <AuthSection />
          <motion.button
            whileHover={{ scale: 1.05, borderColor: 'var(--color-cyan)' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden"
            style={{
              background: 'transparent',
              border: '1px solid var(--border-thin)',
              color: 'var(--color-white)',
              padding: '8px 12px',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              transition: 'all 0.3s ease',
            }}
            aria-label="Toggle menu"
          >
            {mobileOpen ? '✕' : '☰'}
          </motion.button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'fixed',
                top: '70px', left: 0, right: 0,
                height: 'calc(100vh - 70px)',
                background: 'rgba(0, 0, 0, 0.98)',
                backdropFilter: 'blur(30px)',
                padding: '3rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                borderBottom: '1px solid var(--border-thin)',
                overflowY: 'auto',
                zIndex: 99999,
              }}
            >
              {NAV_LINKS.map((link, idx) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                >
                  <Link
                    href={link.href}
                    aria-current={pathname === link.href ? 'page' : undefined}
                    onClick={() => startNav(link.href)}
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '2.5rem',
                      letterSpacing: '0.04em',
                      color: pathname === link.href ? 'var(--color-cyan)' : 'var(--color-white)',
                      textDecoration: 'none',
                      textAlign: 'left',
                      display: 'block',
                      width: '100%',
                      padding: '0.5rem 0',
                    }}
                  >
                    <motion.span
                      whileTap={{ x: 10, color: 'var(--color-cyan)' }}
                      style={{ display: 'block' }}
                    >
                      {link.label}
                    </motion.span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
