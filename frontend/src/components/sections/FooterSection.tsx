'use client';

export function FooterSection() {
  return (
    <footer style={{ borderTop: '1px solid var(--border-thin)', background: 'var(--color-void)', padding: '4rem 2rem', marginTop: '6rem', width: '100%' }}>
      <div style={{ maxWidth: '1400px', width: '100%', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '2rem', alignItems: 'center' }}>
        <div style={{ flex: '1 1 400px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'white', lineHeight: 1, marginBottom: '0.5rem' }}>
            COSMOS<span style={{ color: 'var(--color-silver)' }}>LIVE</span>
          </div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-silver)', maxWidth: '450px' }}>
            Premium real-time space infrastructure console. All data sourced directly via authentic aerospace APIs.
          </p>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textAlign: 'right', flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div>DATA PROVIDERS: NASA · SPACEX · LAUNCH LIBRARY 2 · WHERETHEISS.AT</div>
          <div>DESIGN SYSTEM: PRECISE AEROSPACE SOTD GRIDS</div>
          <div style={{ color: 'rgba(255,255,255,0.2)', paddingTop: '0.5rem' }}>© {new Date().getFullYear()} COSMOSLIVE. ALL SYSTEMS NOMINAL.</div>
        </div>
      </div>
    </footer>
  );
}
