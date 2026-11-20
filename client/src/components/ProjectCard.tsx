import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import type { PointerEvent } from 'react';
import type { Project } from '../api/types';
import { usePrefersReducedMotion } from '../hooks/useMediaQuery';
import { tags as allTags } from '../data/content';
import { ArrowRightIcon } from './Icons';

const tagLabel = (id: string) => allTags.find((t) => t.id === id)?.label ?? id;

interface Props {
  project: Project;
  onOpen: (project: Project) => void;
}

export function ProjectCard({ project, onOpen }: Props) {
  const reduced = usePrefersReducedMotion();
  // Pointer position within the card, normalised to -0.5..0.5.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spring = { stiffness: 200, damping: 20 };
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [7, -7]), spring);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-7, 7]), spring);

  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (reduced || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <motion.article
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className="group card relative flex h-full flex-col p-3 transition-[border-color,box-shadow] duration-300 hover:border-accent hover:shadow-lg"
    >
      <div className="flex flex-wrap gap-0.5">
        {project.tags.map((t) => (
          <span key={t} className="rounded-full bg-accent-soft px-1 py-0.5 text-xs font-semibold text-accent">
            {tagLabel(t)}
          </span>
        ))}
      </div>
      <h3 className="mt-2 text-xl font-semibold">{project.title}</h3>
      <p className="mt-0.5 text-sm text-muted">{project.period}</p>
      <p className="mt-2 flex-1 text-muted">{project.summary}</p>
      <ul className="mt-2 flex flex-wrap gap-0.5" aria-label="Technologies">
        {project.tech.map((t) => (
          <li key={t} className="chip">
            {t}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => onOpen(project)}
        className="mt-3 inline-flex min-h-touch items-center gap-1 self-start font-semibold text-accent after:absolute after:inset-0 after:rounded-lg after:content-['']"
      >
        View details
        <span className="sr-only">: {project.title}</span>
        <ArrowRightIcon width={18} height={18} className="transition-transform group-hover:translate-x-0.5" />
      </button>
    </motion.article>
  );
}
