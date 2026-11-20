import type { ReactNode } from 'react';
import { Reveal } from './Reveal';

interface Props {
  id: string;
  eyebrow: string;
  title: string;
  intro?: string;
  children: ReactNode;
  className?: string;
}

export function Section({ id, eyebrow, title, intro, children, className = '' }: Props) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`py-8 md:py-10 ${className}`}>
      <div className="container-page">
        <Reveal className="mb-5 max-w-2xl md:mb-6">
          <p className="eyebrow mb-1">{eyebrow}</p>
          <h2 id={`${id}-title`} className="text-3xl font-bold">
            {title}
          </h2>
          {intro && <p className="mt-2 text-lg text-muted">{intro}</p>}
        </Reveal>
        {children}
      </div>
    </section>
  );
}
