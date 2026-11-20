import { z } from 'zod';

// Removes control characters (keeping newlines/tabs) and any HTML tags.
export function sanitize(value) {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

const clean = (min, max, label) =>
  z
    .string({ required_error: `${label} is required`, invalid_type_error: `${label} must be text` })
    .transform(sanitize)
    .pipe(
      z
        .string()
        .min(min, `${label} must be at least ${min} characters`)
        .max(max, `${label} must be at most ${max} characters`),
    );

export const contactSchema = z.object({
  name: clean(2, 100, 'Name'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .max(254, 'Email is too long')
    .email('Enter a valid email address'),
  message: clean(10, 2000, 'Message'),
  // Honeypot field: real users never see it, bots tend to fill it.
  website: z.string().max(0, 'Spam detected').optional().default(''),
});

/** Returns { success: true, data } or { success: false, errors: { field: [messages] } }. */
export function validateContact(input) {
  const result = contactSchema.safeParse(input ?? {});
  if (result.success) {
    const { website, ...data } = result.data;
    return { success: true, data };
  }
  return { success: false, errors: result.error.flatten().fieldErrors };
}
