'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [ringPos, setRingPos] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;
    let animFrame: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      setPos({ x: mouseX, y: mouseY });
      if (!visible) setVisible(true);
    };

    // Ensure initial ring position tracks smoothly without jumping
    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      setRingPos({ x: ringX, y: ringY });
      animFrame = requestAnimationFrame(animateRing);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    animFrame = requestAnimationFrame(animateRing);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animFrame);
    };
  }, [visible]);

  // Keep rendering persistently above all WebGL/Canvas elements
  return (
    <div style={{ pointerEvents: 'none', zIndex: 999999, position: 'fixed', inset: 0 }}>
      <div
        className="cursor-dot"
        style={{ 
          left: pos.x, 
          top: pos.y, 
          opacity: pos.x === -100 ? 0 : 1,
          position: 'fixed',
          pointerEvents: 'none',
          zIndex: 999999,
        }}
      />
      <div
        className="cursor-ring"
        style={{ 
          left: ringPos.x, 
          top: ringPos.y, 
          opacity: ringPos.x === -100 ? 0 : 1,
          position: 'fixed',
          pointerEvents: 'none',
          zIndex: 999998,
        }}
      />
    </div>
  );
}
