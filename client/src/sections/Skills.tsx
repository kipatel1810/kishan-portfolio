import { useState } from 'react';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';
import { Reveal } from '../components/Reveal';
import { Section } from '../components/Section';
import { SkillSphere } from '../components/SkillSphere';
import { Tilt } from '../components/Tilt';

export function Skills() {
  const { data, loading } = useApi(api.skills);
  const [active, setActive] = useState<string | null>(null);
  const toggle = (category: string) => setActive((a) => (a === category ? null : category));

  return (
    <Section
      id="skills"
      eyebrow="Skills"
      title="Tools I work with"
      intro="Drag the globe to spin it. Pick a category to light up its skills."
    >
      <div className="grid items-center gap-4 lg:grid-cols-[1.1fr_1fr]">
        <Reveal className="order-2 overflow-hidden lg:order-1">
          {data ? (
            <SkillSphere groups={data} active={active} />
          ) : (
            <div className="skeleton mx-auto aspect-square w-full max-w-[520px] rounded-full" aria-hidden="true" />
          )}
        </Reveal>

        <Reveal className="order-1 lg:order-2">
          <div role="group" aria-label="Highlight a skill category" className="flex flex-wrap gap-1">
            {(data ?? []).map((g) => (
              <button
                key={g.category}
                type="button"
                aria-pressed={active === g.category}
                onClick={() => toggle(g.category)}
                className={`min-h-touch rounded-full border px-2 text-sm font-semibold transition-colors ${
                  active === g.category
                    ? 'border-accent bg-accent text-on-accent'
                    : 'border-border bg-surface text-muted hover:border-accent hover:text-accent'
                }`}
              >
                {g.category}
              </button>
            ))}
          </div>
        </Reveal>
      </div>

      <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {loading &&
          Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="card p-3" aria-hidden="true">
              <div className="skeleton h-3 w-1/2" />
              <div className="mt-2 flex flex-wrap gap-0.5">
                {[60, 80, 50, 70, 90].map((w) => (
                  <div key={w} className="skeleton h-3" style={{ width: w }} />
                ))}
              </div>
            </li>
          ))}
        {data?.map((group, i) => (
          <Reveal as="li" key={group.category} delay={(i % 3) * 0.06}>
            <Tilt fill className={`card p-3 ${active === group.category ? 'ring-2 ring-accent' : ''}`}>
              <h3 className="tilt-pop font-heading text-base font-semibold">{group.category}</h3>
              <ul className="tilt-pop mt-2 flex flex-wrap gap-0.5">
                {group.items.map((item) => (
                  <li key={item} className="chip">
                    {item}
                  </li>
                ))}
              </ul>
            </Tilt>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
