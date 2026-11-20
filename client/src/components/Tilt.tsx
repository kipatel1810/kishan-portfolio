import { useRef, type PointerEvent, type ReactNode } from 'react';
import { usePrefersReducedMotion } from '../hooks/useMediaQuery';

interface Props {
  children: ReactNode;
  className?: string;
  /** Maximum rotation in degrees. */
  max?: number;
  /** Stretch to the parent height (for equal-height grid cards). */
  fill?: boolean;
}

/**
 * Tilts its content toward a mouse pointer with a soft glare. Writes CSS variables directly
 * (once per animation frame) so moving the mouse never re-renders React. Touch and reduced motion: static.
 */
export function Tilt({ children, className = '', max = 6, fill = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const reduced = usePrefersReducedMotion();

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType !== 'mouse') return;
    const el = ref.current;
    if (!el) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const x = (clientX - r.left) / r.width;
      const y = (clientY - r.top) / r.height;
      el.style.setProperty('--rx', `${(0.5 - y) * max * 2}deg`);
      el.style.setProperty('--ry', `${(x - 0.5) * max * 2}deg`);
      el.style.setProperty('--gx', `${x * 100}%`);
      el.style.setProperty('--gy', `${y * 100}%`);
      el.style.setProperty('--glare', '1');
    });
  };

  const onLeave = () => {
    cancelAnimationFrame(frame.current);
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--glare', '0');
  };

  return (
    <div className={`tilt ${fill ? 'h-full' : ''}`} onPointerMove={onMove} onPointerLeave={onLeave}>
      <div ref={ref} className={`tilt-inner ${fill ? 'h-full' : ''} ${className}`}>
        {children}
      </div>
    </div>
  );
}
