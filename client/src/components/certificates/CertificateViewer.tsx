import { useEffect, useRef } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { CloseIcon, DownloadIcon, ExternalIcon } from '../Icons';
import { CertificateFace } from './CertificateFace';
import { certificateUrl, type Certificate } from './types';

interface Props {
  cert: Certificate | null;
  onClose: () => void;
}

/** Shows the real certificate PDF in a native <dialog>. Phones get a summary plus open/download, since most mobile browsers can't embed PDFs. */
export function CertificateViewer({ cert, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<Element | null>(null);
  const canEmbed = useMediaQuery('(min-width: 768px) and (pointer: fine)');

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (cert && !dialog.open) {
      opener.current = document.activeElement;
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    } else if (!cert && dialog.open) dialog.close();
  }, [cert]);

  const handleClose = () => {
    document.body.style.overflow = '';
    (opener.current as HTMLElement | null)?.focus();
    onClose();
  };

  const url = cert ? certificateUrl(cert) : '';

  return (
    <dialog
      ref={ref}
      onClose={handleClose}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      aria-labelledby="cert-viewer-title"
      className="project-modal m-auto w-[calc(100%-32px)] max-w-4xl rounded-lg border border-border bg-surface p-0 text-text shadow-lg"
    >
      {cert && (
        <div className="flex max-h-[90vh] flex-col">
          <div className="flex items-start justify-between gap-2 border-b border-border p-2 md:px-3">
            <div className="min-w-0">
              <p className="eyebrow">{cert.issuer}</p>
              <h3 id="cert-viewer-title" className="mt-0.5 text-xl font-bold">
                {cert.name}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              aria-label="Close certificate"
              className="grid min-h-touch min-w-touch shrink-0 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-text"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-auto p-2 md:p-3">
            {canEmbed ? (
              <iframe
                src={`${url}#toolbar=0&navpanes=0&view=FitH`}
                title={`${cert.name} certificate PDF`}
                className="aspect-[1.3] w-full rounded-md border border-border bg-white"
                loading="lazy"
              />
            ) : (
              <div className="aspect-[1.3] w-full">
                <CertificateFace cert={cert} large />
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-1 border-t border-border p-2 md:px-3">
            <a href={url} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm">
              <ExternalIcon width={18} height={18} /> Open PDF
            </a>
            <a href={url} download className="btn-ghost text-sm">
              <DownloadIcon width={18} height={18} /> Download
            </a>
          </div>
        </div>
      )}
    </dialog>
  );
}
