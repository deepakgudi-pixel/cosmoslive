'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/profile" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.65rem' }}>
          Profile
        </Link>
        <div style={{ border: '1px solid var(--border-thin)', borderRadius: '50%', padding: '2px' }}>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    );
  }

  return (
    <SignInButton mode="modal">
      <button className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.65rem' }}>
        Sign In
      </button>
    </SignInButton>
  );
}

export function Navigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 9000,
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

      {/* Desktop Links with active reticle indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }} className="hidden md:flex">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
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
              {link.label}
              {isActive && (
                <span 
                  style={{ 
                    position: 'absolute', 
                    bottom: 0, left: 0, right: 0, 
                    height: '1px', 
                    background: 'var(--color-cyan)' 
                  }} 
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* Auth & Mobile Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <AuthSection />
        <button
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
          }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            top: '70px', left: 0, right: 0,
            background: 'rgba(0, 0, 0, 0.98)',
            backdropFilter: 'blur(30px)',
            padding: '3rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
            borderBottom: '1px solid var(--border-thin)',
          }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2rem',
                letterSpacing: '0.04em',
                color: pathname === link.href ? 'var(--color-cyan)' : 'var(--color-white)',
                textDecoration: 'none',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
