import { lazy, Suspense, useEffect, useState } from 'react';
import { useIsMobile, useMediaQuery, usePrefersReducedMotion } from '../hooks/useMediaQuery';
import { Fallback2D } from './Fallback2D';
import { supportsWebGL, useSceneColors } from './utils';

const HeroScene = lazy(() => import('./HeroScene'));

/** Chooses between the WebGL scene and the 2D fallback, and loads three.js only after the first interaction. */
export function HeroBackground() {
  const mobile = useIsMobile();
  const compact = useMediaQuery('(max-width: 1023px)');
  const reduced = usePrefersReducedMotion();
  const [webgl] = useState(supportsWebGL);
  const [ready, setReady] = useState(false);
  const { colors, dark } = useSceneColors();

  // Load three.js only after the first interaction (on desktop, any mouse movement), so the
  // ~220 KB gzipped bundle and shader compilation never compete with the initial page load.
  const [interacted, setInteracted] = useState(false);
  useEffect(() => {
    if (interacted) return;
    const events = ['pointermove', 'pointerdown', 'touchstart', 'scroll', 'keydown', 'wheel'] as const;
    const go = () => setInteracted(true);
    events.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, go));
  }, [interacted]);

  useEffect(() => {
    if (!webgl || !interacted) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setReady(true), { timeout: 2000 });
      return () => window.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(() => setReady(true), 300);
    return () => window.clearTimeout(id);
  }, [webgl, interacted]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      {(!webgl || !ready) && <Fallback2D />}
      {webgl && ready && (
        <Suspense fallback={<Fallback2D />}>
          <HeroScene colors={colors} dark={dark} mobile={mobile} compact={compact} animate={!reduced} />
        </Suspense>
      )}
      {/* Fade into the page so the next section starts cleanly. */}
      <div className="absolute inset-x-0 bottom-0 h-16" style={{ background: 'linear-gradient(transparent, var(--color-bg))' }} />
    </div>
  );
}
