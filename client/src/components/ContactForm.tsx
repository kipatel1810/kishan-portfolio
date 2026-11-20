import { useState, type FormEvent } from 'react';
import { api, ApiError } from '../api/client';
import type { ContactRequest, FieldErrors } from '../api/types';
import { profile } from '../data/content';
import { AlertIcon, CheckIcon } from './Icons';

type Status = 'idle' | 'sending' | 'success' | 'error';
type Field = 'name' | 'email' | 'message';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mirrors the server rules so users get instant feedback; the server re-validates.
function validate(v: ContactRequest): FieldErrors {
  const e: FieldErrors = {};
  if (v.name.trim().length < 2) e.name = ['Please enter your name (at least 2 characters).'];
  else if (v.name.trim().length > 100) e.name = ['Name must be at most 100 characters.'];
  if (!EMAIL_RE.test(v.email.trim())) e.email = ['Please enter a valid email address.'];
  if (v.message.trim().length < 10) e.message = ['Message must be at least 10 characters.'];
  else if (v.message.trim().length > 2000) e.message = ['Message must be at most 2000 characters.'];
  return e;
}

export function ContactForm() {
  const [values, setValues] = useState<ContactRequest>({ name: '', email: '', message: '', website: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [serverMessage, setServerMessage] = useState('');

  const set = (field: keyof ContactRequest) => (e: { target: { value: string } }) => {
    const next = { ...values, [field]: e.target.value };
    setValues(next);
    if (touched[field as Field]) setErrors(validate(next));
  };
  const blur = (field: Field) => () => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate(values));
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setTouched({ name: true, email: true, message: true });
    const firstInvalid = (['name', 'email', 'message'] as Field[]).find((f) => found[f]);
    if (firstInvalid) {
      document.getElementById(`contact-${firstInvalid}`)?.focus();
      return;
    }

    setStatus('sending');
    try {
      await api.sendContact(values);
      setStatus('success');
      setValues({ name: '', email: '', message: '', website: '' });
      setTouched({});
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null;
      if (apiErr?.status === 400 && apiErr.fieldErrors) setErrors(apiErr.fieldErrors);
      setServerMessage(
        apiErr?.status === 429
          ? 'You’ve sent a few messages already. Please try again in a few minutes.'
          : apiErr?.status === 400
            ? 'Please fix the highlighted fields.'
            : apiErr?.message && apiErr.message !== 'Could not reach the server'
              ? apiErr.message
              : 'The message couldn’t be sent right now.',
      );
      setStatus('error');
    }
  }

  const fieldClass = (f: Field) =>
    `mt-0.5 min-h-touch w-full rounded-md border bg-surface px-2 py-1 text-base text-text placeholder:text-muted transition-colors focus-visible:border-accent ${
      errors[f] ? 'border-danger' : 'border-border hover:border-muted'
    }`;

  const errorFor = (f: Field) =>
    errors[f]?.[0] ? (
      <p id={`contact-${f}-error`} className="mt-0.5 flex items-center gap-0.5 text-sm text-danger">
        <AlertIcon width={16} height={16} /> {errors[f]![0]}
      </p>
    ) : null;

  const a11y = (f: Field) => ({
    id: `contact-${f}`,
    name: f,
    'aria-invalid': Boolean(errors[f]),
    'aria-describedby': errors[f] ? `contact-${f}-error` : undefined,
    onBlur: blur(f),
    className: fieldClass(f),
  });

  if (status === 'success') {
    return (
      <div role="status" className="card flex flex-col items-start gap-2 p-4">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-accent-soft text-success">
          <CheckIcon />
        </span>
        <h3 className="text-xl font-semibold">Thanks, your message is on its way.</h3>
        <p className="text-muted">I’ll get back to you by email as soon as I can.</p>
        <button type="button" className="btn-ghost" onClick={() => setStatus('idle')}>
          Send another message
        </button>
      </div>
    );
  }

  const mailtoUrl = `mailto:${profile.email}?subject=${encodeURIComponent(
    `Portfolio Contact from ${values.name || 'Visitor'}`,
  )}&body=${encodeURIComponent(
    `Name: ${values.name}\nEmail: ${values.email}\n\nMessage:\n${values.message}`,
  )}`;

  return (
    <form noValidate onSubmit={onSubmit} className="card flex flex-col gap-2 p-3 md:p-4" aria-describedby="contact-required">
      <p id="contact-required" className="text-sm text-muted">
        All fields are required.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="text-sm font-semibold">Name</label>
          <input type="text" autoComplete="name" maxLength={100} value={values.name} onChange={set('name')} {...a11y('name')} />
          {errorFor('name')}
        </div>
        <div>
          <label htmlFor="contact-email" className="text-sm font-semibold">Email</label>
          <input type="email" autoComplete="email" maxLength={254} value={values.email} onChange={set('email')} {...a11y('email')} />
          {errorFor('email')}
        </div>
      </div>
      <div>
        <label htmlFor="contact-message" className="text-sm font-semibold">Message</label>
        <textarea rows={5} maxLength={2000} value={values.message} onChange={set('message')} {...a11y('message')} />
        <div className="flex justify-between gap-2">
          {errorFor('message') ?? <span />}
          <span className="mt-0.5 text-xs text-muted" aria-hidden="true">
            {values.message.length}/2000
          </span>
        </div>
      </div>

      {/* Honeypot: hidden from people and assistive tech, catches naive bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={set('website')} />
      </div>

      {status === 'error' && (
        <div role="alert" className="flex flex-col gap-2 rounded-md border border-danger/80 bg-danger/5 p-3 text-sm text-danger">
          <div className="flex items-start gap-1">
            <AlertIcon className="mt-px shrink-0" />
            <p>
              {serverMessage} You can also email me directly at{' '}
              <a className="font-semibold underline" href={`mailto:${profile.email}`}>
                {profile.email}
              </a>
              .
            </p>
          </div>
          <a
            href={mailtoUrl}
            className="self-start rounded-md border border-danger/40 bg-surface px-2.5 py-1 text-xs font-medium text-text transition-colors hover:border-danger hover:text-danger"
          >
            Open in Email App with your message
          </a>
        </div>
      )}

      <button type="submit" className="btn-primary self-start" disabled={status === 'sending'} aria-busy={status === 'sending'}>
        {status === 'sending' && (
          <span aria-hidden="true" className="h-2 w-2 animate-spin rounded-full border-2 border-on-accent border-t-transparent" />
        )}
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
