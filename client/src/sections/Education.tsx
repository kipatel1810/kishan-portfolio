import { useState } from 'react';
import { certifications, education, profile } from '../data/content';
import { Reveal } from '../components/Reveal';
import { Section } from '../components/Section';
import { Tilt } from '../components/Tilt';
import { DownloadIcon } from '../components/Icons';
import { CertificateCard } from '../components/certificates/CertificateCard';
import { CertificateViewer } from '../components/certificates/CertificateViewer';
import type { Certificate } from '../components/certificates/types';

export function Education() {
  const [viewing, setViewing] = useState<Certificate | null>(null);
  const resumeHref = `${import.meta.env.BASE_URL}${profile.resumeFile}`;

  return (
    <Section id="education" eyebrow="Education" title="Education & certifications">
      <ul className="grid gap-2 md:grid-cols-2">
        {education.map((e, i) => (
          <Reveal as="li" key={e.degree} delay={i * 0.08}>
            <Tilt fill className="card p-3">
            <h3 className="tilt-pop text-xl font-semibold">{e.degree}</h3>
            <p className="mt-0.5 text-muted">
              {e.school}, {e.location}
            </p>
            <p className="mt-1 text-sm font-medium text-muted">{e.period}</p>
            </Tilt>
          </Reveal>
        ))}
      </ul>

      <h3 id="certifications" className="mt-6 text-2xl font-semibold">
        Certifications
      </h3>
      <p className="mt-1 text-muted">Preview flips a card to the certificate; open one to see the original PDF.</p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3" aria-labelledby="certifications">
        {certifications.map((c, i) => (
          <Reveal as="li" key={c.credentialId} delay={(i % 3) * 0.06} className="h-[280px] min-w-0 sm:h-[320px]">
            <CertificateCard cert={c} onView={setViewing} />
          </Reveal>
        ))}
      </ul>
      <CertificateViewer cert={viewing} onClose={() => setViewing(null)} />

      <Reveal className="mt-5 flex flex-col items-start justify-between gap-2 rounded-lg border border-accent bg-accent-soft p-3 sm:flex-row sm:items-center md:p-4">
        <div id="resume">
          <h3 className="text-xl font-semibold">Want the full picture?</h3>
          <p className="mt-0.5 text-muted">Download my resume as a PDF.</p>
        </div>
        <a href={resumeHref} download className="btn-primary shrink-0">
          <DownloadIcon width={18} height={18} /> Download resume
        </a>
      </Reveal>
    </Section>
  );
}
