import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery';
import { CertificateFace } from './CertificateFace';
import type { Certificate } from './types';

interface Props {
  cert: Certificate;
  onView: (cert: Certificate) => void;
}

/**
 * 3D flip card: tilts toward the pointer with a moving glare, and flips to show the certificate.
 * Tilt is written to CSS variables directly (no React re-render per pointer move).
 */
export function CertificateCard({ cert, onView }: Props) {
  const [flipped, setFlipped] = useState(false);
  const reduced = usePrefersReducedMotion();
  const tiltRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const flipBackRef = useRef<HTMLButtonElement>(null);
  const flipFrontRef = useRef<HTMLButtonElement>(null);
  const moved = useRef(false);

  // Only the visible face is focusable / exposed to assistive tech.
  useEffect(() => {
    frontRef.current?.toggleAttribute('inert', flipped);
    backRef.current?.toggleAttribute('inert', !flipped);
    if (!moved.current) return;
    (flipped ? flipBackRef : flipFrontRef).current?.focus({ preventScroll: true });
  }, [flipped]);

  const flip = () => {
    moved.current = true;
    setFlipped((f) => !f);
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType !== 'mouse' || !tiltRef.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const el = tiltRef.current;
    el.style.setProperty('--rx', `${(0.5 - y) * 14}deg`);
    el.style.setProperty('--ry', `${(x - 0.5) * 14}deg`);
    el.style.setProperty('--gx', `${x * 100}%`);
    el.style.setProperty('--gy', `${y * 100}%`);
    el.style.setProperty('--glare', '1');
  };
  const onLeave = () => {
    const el = tiltRef.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--glare', '0');
  };

  return (
    <div className="cert-scene h-full" onPointerMove={onMove} onPointerLeave={onLeave}>
      <div ref={tiltRef} className="cert-tilt h-full">
        <div className={`cert-flip h-full ${flipped ? 'is-flipped' : ''}`}>
          {/* Front: details */}
          <div ref={frontRef} className="cert-side card flex flex-col p-3">
            <div className="flex items-start justify-between gap-1">
              <span className="rounded-full bg-accent-soft px-1 py-0.5 text-xs font-semibold text-accent">{cert.date}</span>
              <span className="text-xs text-muted">{cert.duration}</span>
            </div>
            <h4 className="cert-pop mt-2 font-heading text-lg font-semibold leading-snug">{cert.name}</h4>
            <p className="mt-0.5 text-sm text-muted">{cert.issuer}</p>
            <ul className="cert-pop mt-2 flex flex-wrap gap-0.5" aria-label="Skills covered">
              {cert.skills.map((s) => (
                <li key={s} className="chip">
                  {s}
                </li>
              ))}
            </ul>
            <div className="mt-auto flex flex-wrap gap-1 pt-2">
              <button ref={flipFrontRef} type="button" onClick={flip} className="btn-ghost px-2 text-sm" aria-label={`Preview certificate: ${cert.name}`}>
                <FlipIcon /> Preview
              </button>
              <button type="button" onClick={() => onView(cert)} className="btn-primary px-2 text-sm" aria-label={`View certificate PDF: ${cert.name}`}>
                View
              </button>
            </div>
          </div>

          {/* Back: certificate */}
          <div ref={backRef} className="cert-side cert-back card flex flex-col gap-1 p-1">
            <button
              type="button"
              onClick={() => onView(cert)}
              className="min-h-0 flex-1 rounded-md text-left transition-transform hover:scale-[1.01]"
              aria-label={`Open full certificate: ${cert.name}`}
            >
              <CertificateFace cert={cert} />
            </button>
            <div className="flex gap-1">
              <button ref={flipBackRef} type="button" onClick={flip} className="btn-ghost flex-1 px-1 text-sm" aria-label={`Back to details: ${cert.name}`}>
                <FlipIcon /> Back
              </button>
              <button type="button" onClick={() => onView(cert)} className="btn-primary flex-1 px-1 text-sm">
                Open
              </button>
            </div>
          </div>
        </div>
        <span aria-hidden="true" className="cert-glare" />
      </div>
    </div>
  );
}

function FlipIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.2L3 16M3 21v-5h5" />
    </svg>
  );
}
