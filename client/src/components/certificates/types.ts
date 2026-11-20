import type { certifications } from '../../data/content';

export type Certificate = (typeof certifications)[number];

/** Absolute URL of a certificate PDF, respecting the GitHub Pages base path. */
export const certificateUrl = (c: Certificate) => `${import.meta.env.BASE_URL}${c.file}`;
