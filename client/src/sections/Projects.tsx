import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { api } from '../api/client';
import type { Project, TagId } from '../api/types';
import { tags } from '../data/content';
import { useApi } from '../hooks/useApi';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectModal } from '../components/ProjectModal';
import { Reveal } from '../components/Reveal';
import { Section } from '../components/Section';

type Filter = TagId | 'all';

export function Projects() {
  // Fetch every project once and filter locally so switching tags is instant.
  const { data, loading } = useApi(() => api.projects());
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<Project | null>(null);

  const visible = useMemo(
    () => (data ?? []).filter((p) => filter === 'all' || p.tags.includes(filter)),
    [data, filter],
  );
  const filters: { id: Filter; label: string }[] = [{ id: 'all', label: 'All' }, ...tags];

  return (
    <Section
      id="projects"
      eyebrow="Projects"
      title="Things I’ve built"
      intro="Backend services, data pipelines, systems programming and test automation, from coursework and personal projects."
    >
      <Reveal>
        <div role="group" aria-label="Filter projects by category" className="mb-4 flex flex-wrap gap-1">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`min-h-touch rounded-full border px-2 text-sm font-semibold transition-colors ${
                filter === f.id
                  ? 'border-accent bg-accent text-on-accent'
                  : 'border-border bg-surface text-muted hover:border-accent hover:text-accent'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </Reveal>

      <p className="sr-only" aria-live="polite">
        {loading ? 'Loading projects' : `Showing ${visible.length} project${visible.length === 1 ? '' : 's'}`}
      </p>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {loading &&
          Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="card p-3" aria-hidden="true">
              <div className="skeleton h-3 w-1/3" />
              <div className="skeleton mt-2 h-4 w-4/5" />
              <div className="skeleton mt-3 h-2 w-full" />
              <div className="skeleton mt-1 h-2 w-5/6" />
              <div className="skeleton mt-3 h-3 w-1/2" />
            </li>
          ))}
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((p) => (
            <motion.li
              key={p.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
            >
              <ProjectCard project={p} onOpen={setSelected} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </Section>
  );
}
