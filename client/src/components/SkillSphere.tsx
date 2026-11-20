import { useEffect, useMemo, useRef } from 'react';
import type { SkillCategory } from '../api/types';
import { useInView } from '../hooks/useInView';
import { useIsMobile, usePrefersReducedMotion } from '../hooks/useMediaQuery';

interface Props {
  groups: SkillCategory[];
  /** Category to highlight; others fade back. */
  active: string | null;
}

interface Point {
  label: string;
  category: string;
  x: number;
  y: number;
  z: number;
}

/** Evenly spreads n points over a unit sphere (Fibonacci lattice). */
function spherePoints(n: number) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: n }, (_, i) => {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = golden * i;
    return { x: Math.cos(t) * r, y, z: Math.sin(t) * r };
  });
}

/**
 * A rotating 3D cloud of skills, rendered with CSS 3D transforms (no WebGL).
 * Drag to spin it; it keeps some momentum, then settles back to a slow auto-rotation.
 * Decorative: the same skills are listed accessibly in the category cards.
 */
export function SkillSphere({ groups, active }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLSpanElement | null)[]>([]);
  const inView = useInView(wrap, { rootMargin: '100px' });
  const reduced = usePrefersReducedMotion();
  const mobile = useIsMobile();
  // Fewer labels keep the cloud readable; the full list is in the cards below.
  const perGroup = mobile ? 3 : 4;

  // Take the first few skills of each category, skipping duplicates (first category wins).
  const points = useMemo<Point[]>(() => {
    const seen = new Set<string>();
    const list: { label: string; category: string }[] = [];
    for (const g of groups)
      for (const item of g.items.slice(0, perGroup))
        if (!seen.has(item)) {
          seen.add(item);
          list.push({ label: item, category: g.category });
        }
    const pts = spherePoints(list.length);
    return list.map((s, i) => ({ ...s, ...pts[i] }));
  }, [groups, perGroup]);

  const state = useRef({ ax: -0.3, ay: 0, vx: 0, vy: 0.004, dragging: false, lastX: 0, lastY: 0 });
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    let raf = 0;
    const s = state.current;

    const draw = () => {
      const radius = el.clientWidth * (mobile ? 0.32 : 0.4);
      const half = el.clientWidth / 2;
      const cx = Math.cos(s.ax), sx = Math.sin(s.ax);
      const cy = Math.cos(s.ay), sy = Math.sin(s.ay);
      points.forEach((p, i) => {
        const node = items.current[i];
        if (!node) return;
        // Rotate around Y, then X.
        const x1 = p.x * cy + p.z * sy;
        const z1 = -p.x * sy + p.z * cy;
        const y2 = p.y * cx - z1 * sx;
        const z2 = p.y * sx + z1 * cx;
        const depth = (z2 + 1) / 2; // 0 = back, 1 = front
        // Keep long labels inside the box on narrow screens (front labels are scaled up by perspective).
        const limit = Math.max(0, half - (node.offsetWidth / 2) * (1 + depth * 0.25));
        const px = Math.max(-limit, Math.min(limit, x1 * radius));
        const dim = activeRef.current && p.category !== activeRef.current;
        node.style.transform = `translate(-50%, -50%) translate3d(${px}px, ${y2 * radius}px, ${z2 * radius}px)`;
        node.style.opacity = String(dim ? 0.08 + depth * 0.12 : 0.25 + depth * 0.75);
        node.style.zIndex = String(Math.round(depth * 100));
        node.dataset.front = depth > 0.75 ? 'true' : 'false';
        node.dataset.active = activeRef.current && !dim ? 'true' : 'false';
      });
    };

    const tick = () => {
      if (!s.dragging) {
        // Momentum decays toward a gentle auto-rotation.
        s.vy += ((reduced ? 0 : 0.004) - s.vy) * 0.02;
        s.vx *= 0.95;
      }
      s.ay += s.vy;
      s.ax = Math.max(-1.2, Math.min(1.2, s.ax + s.vx));
      draw();
      raf = requestAnimationFrame(tick);
    };

    draw();
    if (inView) raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [points, inView, reduced, mobile, active]);

  // Pointer drag (mouse, pen and touch). touch-action keeps vertical page scrolling working.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const s = state.current;
    const down = (e: PointerEvent) => {
      s.dragging = true;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!s.dragging) return;
      s.vy = (e.clientX - s.lastX) * 0.006;
      s.vx = -(e.clientY - s.lastY) * 0.006;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
    };
    const up = () => (s.dragging = false);
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
  }, []);

  return (
    <div
      ref={wrap}
      aria-hidden="true"
      className="skill-sphere relative mx-auto aspect-square w-full max-w-[520px] cursor-grab touch-pan-y select-none active:cursor-grabbing"
    >
      <div className="skill-sphere__core" />
      {points.map((p, i) => (
        <span key={p.label} ref={(n) => (items.current[i] = n)} className="skill-sphere__item">
          {p.label}
        </span>
      ))}
    </div>
  );
}
