import { profile } from '../../data/content';
import type { Certificate } from './types';

/** A certificate-style rendering of a completion record, built from its data (the real PDF opens in the viewer). */
export function CertificateFace({ cert, large = false }: { cert: Certificate; large?: boolean }) {
  return (
    <div
      className={`cert-face relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-md text-center ${
        large ? 'gap-2 p-4' : 'gap-1 p-2'
      }`}
    >
      <span aria-hidden="true" className="cert-face__ribbon" />
      <p className={`font-semibold uppercase tracking-widest text-accent ${large ? 'text-sm' : 'text-xs'}`}>
        Certificate of completion
      </p>
      <p className={`font-heading font-bold leading-tight ${large ? 'text-2xl' : 'text-base'}`}>{cert.name}</p>
      <p className={`text-muted ${large ? 'text-base' : 'text-xs'}`}>
        Completed by <span className="font-semibold text-text">{profile.name}</span>
      </p>
      <p className={`text-muted ${large ? 'text-sm' : 'text-xs'}`}>
        {cert.completed} · {cert.duration}
      </p>
      <ul className="flex flex-wrap justify-center gap-0.5" aria-label="Skills covered">
        {cert.skills.map((s) => (
          <li key={s} className="rounded-full border border-border px-1 py-px text-xs text-muted">
            {s}
          </li>
        ))}
      </ul>
      <p className={`w-full truncate font-mono text-muted ${large ? 'text-sm' : 'text-xs'}`} title={cert.credentialId}>
        {cert.issuer} · ID {cert.credentialId}
      </p>
    </div>
  );
}
