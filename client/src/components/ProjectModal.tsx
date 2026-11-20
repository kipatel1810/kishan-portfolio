import { useEffect, useRef } from 'react';
import type { Project } from '../api/types';
import { CloseIcon, GitHubIcon } from './Icons';

interface Props {
  project: Project | null;
  onClose: () => void;
}

/** Project details in a native <dialog>, which provides focus trapping, Esc to close and inert background. */
export function ProjectModal({ project, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (project && !dialog.open) {
      opener.current = document.activeElement;
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    } else if (!project && dialog.open) {
      dialog.close();
    }
  }, [project]);

  const handleClose = () => {
    document.body.style.overflow = '';
    (opener.current as HTMLElement | null)?.focus();
    onClose();
  };

  return (
    <dialog
      ref={ref}
      onClose={handleClose}
      // Clicking the backdrop (the dialog element itself, outside its content) closes it.
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      aria-labelledby="project-modal-title"
      className="project-modal m-auto w-[calc(100%-32px)] max-w-2xl rounded-lg border border-border bg-surface p-0 text-text shadow-lg"
    >
      {project && (
        <div className="max-h-[85vh] overflow-y-auto p-3 md:p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="eyebrow">{project.period}</p>
              <h3 id="project-modal-title" className="mt-0.5 text-2xl font-bold">
                {project.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              aria-label="Close project details"
              className="grid min-h-touch min-w-touch shrink-0 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-text"
            >
              <CloseIcon />
            </button>
          </div>

          <p className="mt-2 text-lg text-muted">{project.summary}</p>

          <h4 className="mt-3 font-heading text-base font-semibold">What I did</h4>
          <ul className="mt-1 flex list-disc flex-col gap-1 pl-2 text-muted marker:text-accent">
            {project.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>

          <h4 className="mt-3 font-heading text-base font-semibold">Tech stack</h4>
          <ul className="mt-1 flex flex-wrap gap-0.5">
            {project.tech.map((t) => (
              <li key={t} className="chip">
                {t}
              </li>
            ))}
          </ul>

          {project.repoUrl && (
            <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="btn-primary mt-3">
              <GitHubIcon width={18} height={18} /> View repository
            </a>
          )}
        </div>
      )}
    </dialog>
  );
}
