import { lazy, Suspense, useRef, useState } from 'react';
import { useInView } from '../hooks/useInView';
import { useIsMobile, usePrefersReducedMotion } from '../hooks/useMediaQuery';
import { supportsWebGL, useSceneColors } from '../three/utils';
import type { Place } from '../three/GlobeScene';

const GlobeScene = lazy(() => import('../three/GlobeScene'));

const FROM: Place = { name: 'Gujarat, India', lat: 23.02, lon: 72.57 };
const TO: Place = { name: 'Windsor, Canada', lat: 42.31, lon: -83.04 };

/** Interactive 3D globe tracing the move from Gujarat to Windsor. Loads three.js only when scrolled near. */
export function ContactGlobe() {
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, { rootMargin: '300px', once: true });
  const visible = useInView(ref);
  const [webgl] = useState(supportsWebGL);
  const reduced = usePrefersReducedMotion();
  const mobile = useIsMobile();
  const { colors, dark } = useSceneColors();

  return (
    <figure className="card overflow-hidden p-2">
      <div ref={ref} className="relative mx-auto aspect-square w-full max-w-[360px]">
        {/* Static ring shown until (or instead of) the WebGL globe. */}
        <div aria-hidden="true" className="absolute inset-[12%] rounded-full border border-border bg-accent-soft" />
        {webgl && near && (
          <Suspense fallback={null}>
            <GlobeScene colors={colors} dark={dark} from={FROM} to={TO} animate={!reduced && visible} mobile={mobile} />
          </Suspense>
        )}
      </div>
      <figcaption className="flex flex-wrap items-center justify-center gap-1 text-center text-sm text-muted">
        <span className="font-medium text-text">{FROM.name}</span>
        <span aria-hidden="true" className="text-accent">
          →
        </span>
        <span className="font-medium text-text">{TO.name}</span>
        <span className="sr-only">: from India to Canada.</span>
        {webgl && <span className="w-full text-xs">Drag to spin the globe</span>}
      </figcaption>
    </figure>
  );
}
