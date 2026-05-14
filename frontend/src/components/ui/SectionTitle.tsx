'use client';

interface SectionTitleProps {
  label: string;
  title: string;
}

export function SectionTitle({ label, title }: SectionTitleProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      <span className="data-label" style={{ color: 'var(--color-cyan)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ display: 'inline-block', width: '4px', height: '4px', background: 'var(--color-cyan)' }} />
        {label}
      </span>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', color: 'white', lineHeight: 0.9 }}>
        {title}
      </h2>
    </div>
  );
}
