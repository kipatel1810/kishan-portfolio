export type TagId = 'backend' | 'web' | 'data-ml' | 'systems' | 'testing';

export interface Tag {
  id: TagId;
  label: string;
}

export interface Project {
  id: string;
  title: string;
  summary: string;
  highlights: string[];
  tech: string[];
  tags: TagId[];
  period: string;
  repoUrl: string | null;
  featured: boolean;
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  highlights: string[];
}

export interface ContactRequest {
  name: string;
  email: string;
  message: string;
  /** Honeypot – always empty for real users. */
  website?: string;
}

export interface ContactResponse {
  id: number;
  delivered: boolean;
}

export type FieldErrors = Partial<Record<keyof ContactRequest, string[]>>;

/** Where the data on screen came from. */
export type DataSource = 'api' | 'static';
