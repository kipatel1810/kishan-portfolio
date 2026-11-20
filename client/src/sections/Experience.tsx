import { api } from '../api/client';
import { useApi } from '../hooks/useApi';
import { Reveal } from '../components/Reveal';
import { Section } from '../components/Section';
import { Tilt } from '../components/Tilt';

export function Experience() {
  const { data, loading } = useApi(api.experience);

  return (
    <Section id="experience" eyebrow="Experience" title="Where I’ve worked">
      <ol className="relative flex flex-col gap-3 md:border-l md:border-border md:pl-4">
        {loading &&
          [0, 1].map((i) => (
            <li key={i} className="card p-3" aria-hidden="true">
              <div className="skeleton h-3 w-1/2" />
              <div className="skeleton mt-2 h-2 w-1/3" />
              <div className="skeleton mt-3 h-2 w-full" />
              <div className="skeleton mt-1 h-2 w-5/6" />
            </li>
          ))}
        {data?.map((job, i) => (
          <Reveal as="li" key={job.id} delay={i * 0.08} className="relative">
            <span
              aria-hidden="true"
              className="absolute -left-4 top-3 hidden h-2 w-2 -translate-x-1/2 rounded-full border-2 border-accent bg-bg md:block"
            />
            <Tilt max={3}>
            <article className="card p-2 sm:p-3 md:p-4">
              <header className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-2">
                <h3 className="text-xl font-semibold">
                  {job.role} <span className="text-accent">· {job.company}</span>
                </h3>
                <p className="shrink-0 text-sm font-medium text-muted">{job.period}</p>
              </header>
              <p className="mt-0.5 text-sm text-muted">{job.location}</p>
              <ul className="mt-2 flex list-disc flex-col gap-1 pl-2 text-muted marker:text-accent max-sm:pl-[18px]">
                {job.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </article>
            </Tilt>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
