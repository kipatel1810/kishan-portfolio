import { profile } from '../data/content';
import { Reveal } from '../components/Reveal';
import { Section } from '../components/Section';
import { Tilt } from '../components/Tilt';

export function About() {
  return (
    <Section id="about" eyebrow="About" title="Backend developer with a designer’s eye">
      <div className="grid gap-5 md:grid-cols-[1.6fr_1fr] md:gap-8">
        <Reveal className="flex flex-col gap-2 text-lg text-muted">
          {profile.about.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </Reveal>
        <Reveal delay={0.1}>
          <ul className="grid grid-cols-2 gap-2" aria-label="Quick facts">
            {profile.facts.map((f) => (
              <li key={f.label}>
                <Tilt fill max={10} className="card p-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">{f.label}</p>
                <p className="tilt-pop mt-0.5 font-heading text-lg font-semibold">{f.value}</p>
                </Tilt>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Section>
  );
}
