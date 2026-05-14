'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { PointerEvent } from 'react';
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
      <button className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.65rem' }}>
        Sign In
      </button>
    </SignInButton>
  );
}

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const showSignedInNav = isLoaded && Boolean(isSignedIn);

  const navigateTo = (href: string) => {
    setMobileOpen(false);
    if (pathname !== href) {
      router.push(href);
    }
  };

  const handleNavPointerDown = (event: PointerEvent<HTMLButtonElement>, href: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigateTo(href);
  };

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

  return (
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
      {showSignedInNav && (
      <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }} className="hidden md:flex">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <button
              key={link.href}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              onFocus={() => router.prefetch(link.href)}
              onMouseEnter={() => router.prefetch(link.href)}
              onPointerDown={(event) => handleNavPointerDown(event, link.href)}
              onClick={() => navigateTo(link.href)}
              style={{
                appearance: 'none',
                background: 'transparent',
                border: 0,
                cursor: 'pointer',
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
            </button>
          );
        })}
      </div>
      )}

      {/* Auth & Mobile Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <AuthSection />
        {showSignedInNav && (
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
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {showSignedInNav && mobileOpen && (
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
            <button
              key={link.href}
              type="button"
              aria-current={pathname === link.href ? 'page' : undefined}
              onFocus={() => router.prefetch(link.href)}
              onMouseEnter={() => router.prefetch(link.href)}
              onPointerDown={(event) => handleNavPointerDown(event, link.href)}
              onClick={() => navigateTo(link.href)}
              style={{
                appearance: 'none',
                background: 'transparent',
                border: 0,
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
                fontSize: '2rem',
                letterSpacing: '0.04em',
                color: pathname === link.href ? 'var(--color-cyan)' : 'var(--color-white)',
                textDecoration: 'none',
                textAlign: 'left',
              }}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
