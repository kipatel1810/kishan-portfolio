import * as content from '../data/content';
import type { ContactRequest, ContactResponse, DataSource, Experience, FieldErrors, Project, SkillCategory, TagId } from './types';

const BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV && !import.meta.env.VITE_WEB3FORMS_KEY ? 'http://localhost:5080' : '')
).replace(/\/$/, '');
const WEB3FORMS_KEY = (import.meta.env.VITE_WEB3FORMS_KEY ?? '').trim();
const CONTACT_ENDPOINT = (import.meta.env.VITE_CONTACT_ENDPOINT ?? '').trim();
const TIMEOUT_MS = 15000;

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public fieldErrors: FieldErrors = {},
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!BASE) throw new ApiError('API base URL not configured', 0);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}/api${path}`, {
      ...init,
      signal: controller.signal,
      headers: { Accept: 'application/json', ...(init?.body ? { 'Content-Type': 'application/json' } : {}) },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(body.detail ?? body.title ?? `Request failed (${res.status})`, res.status, body.errors);
    return body as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('Could not reach the server', 0);
  } finally {
    clearTimeout(timer);
  }
}

export interface Loaded<T> {
  data: T;
  source: DataSource;
}

/** Tries the API first; on any failure returns the bundled static content. */
async function withFallback<T>(load: () => Promise<T>, fallback: T): Promise<Loaded<T>> {
  try {
    return { data: await load(), source: 'api' };
  } catch {
    return { data: fallback, source: 'static' };
  }
}

export const api = {
  hasServer: Boolean(BASE),

  projects: (tag?: TagId) =>
    withFallback(
      () => request<Project[]>(tag ? `/projects?tag=${encodeURIComponent(tag)}` : '/projects'),
      tag ? content.projects.filter((p) => p.tags.includes(tag)) : content.projects,
    ),

  project: (id: string) =>
    withFallback(() => request<Project>(`/projects/${encodeURIComponent(id)}`), content.projects.find((p) => p.id === id) ?? null),

  skills: () => withFallback(() => request<SkillCategory[]>('/skills'), content.skills),

  experience: () => withFallback(() => request<Experience[]>('/experience'), content.experience),

  /**
   * Submits contact message to:
   * 1. Web3Forms (if VITE_WEB3FORMS_KEY is set, sends directly to Gmail)
   * 2. Custom contact endpoint (if VITE_CONTACT_ENDPOINT is set)
   * 3. Portfolio API server (if VITE_API_BASE_URL is set)
   */
  sendContact: async (body: ContactRequest): Promise<ContactResponse> => {
    // 1. Direct Web3Forms delivery to Gmail (recommended for GitHub Pages)
    if (WEB3FORMS_KEY) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: WEB3FORMS_KEY,
            name: body.name,
            email: body.email,
            message: body.message,
            subject: `Portfolio Contact from ${body.name}`,
            from_name: body.name,
            replyto: body.email,
            botcheck: body.website || '',
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.success === false) {
          throw new ApiError(data.message || `Submission failed (${res.status})`, res.status);
        }
        return { id: Date.now(), delivered: true };
      } catch (err) {
        if (err instanceof ApiError) throw err;
        throw new ApiError('Could not reach email delivery service', 0);
      } finally {
        clearTimeout(timer);
      }
    }

    // 2. Custom endpoint (e.g. Formspree)
    if (CONTACT_ENDPOINT) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const res = await fetch(CONTACT_ENDPOINT, {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new ApiError(data.error || `Submission failed (${res.status})`, res.status);
        }
        return { id: Date.now(), delivered: true };
      } catch (err) {
        if (err instanceof ApiError) throw err;
        throw new ApiError('Could not reach contact endpoint', 0);
      } finally {
        clearTimeout(timer);
      }
    }

    // 3. Backend API server
    if (BASE) {
      const outcome = await request<ContactResponse & { error?: string }>('/contact', { method: 'POST', body: JSON.stringify(body) });
      if (outcome && outcome.delivered === false) {
        throw new ApiError(
          outcome.error ? `Email delivery failed: ${outcome.error}` : 'Message stored in database, but email delivery to Gmail failed.',
          502,
        );
      }
      return outcome;
    }

    throw new ApiError('Contact email service is not configured yet.', 0);
  },
};
