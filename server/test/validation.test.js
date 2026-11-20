import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateContact, sanitize } from '../src/validation/contact.js';

const valid = { name: 'Jane Doe', email: 'jane@example.com', message: 'Hello, I would like to chat about a role.' };

test('accepts a valid message and drops the honeypot field', () => {
  const r = validateContact({ ...valid, website: '' });
  assert.equal(r.success, true);
  assert.deepEqual(r.data, valid);
});

test('rejects missing fields with per-field errors', () => {
  const r = validateContact({});
  assert.equal(r.success, false);
  assert.ok(r.errors.name);
  assert.ok(r.errors.email);
  assert.ok(r.errors.message);
});

test('rejects invalid email', () => {
  const r = validateContact({ ...valid, email: 'not-an-email' });
  assert.equal(r.success, false);
  assert.deepEqual(Object.keys(r.errors), ['email']);
});

test('enforces length limits after sanitizing', () => {
  assert.equal(validateContact({ ...valid, name: 'A' }).success, false);
  assert.equal(validateContact({ ...valid, message: 'short' }).success, false);
  assert.equal(validateContact({ ...valid, message: 'x'.repeat(2001) }).success, false);
  // Tags are stripped before the length check, so markup can't pad a message.
  assert.equal(validateContact({ ...valid, message: '<b></b><i></i><u></u>hi' }).success, false);
});

test('rejects filled honeypot', () => {
  assert.equal(validateContact({ ...valid, website: 'http://spam.example' }).success, false);
});

test('rejects non-string values', () => {
  assert.equal(validateContact({ ...valid, name: 42 }).success, false);
  assert.equal(validateContact(null).success, false);
});

test('sanitize strips tags and control characters but keeps newlines', () => {
  assert.equal(sanitize('  <script>alert(1)</script>Hi\u0007\nthere  '), 'alert(1)Hi\nthere');
});
