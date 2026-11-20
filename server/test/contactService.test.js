import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openDatabase } from '../src/data/db.js';
import { createContactService } from '../src/services/contactService.js';

const silent = { error() {}, warn() {}, log() {} };
const msg = { name: 'Jane Doe', email: 'jane@example.com', message: 'Hello there, nice portfolio!' };
const rows = (db) => db.prepare('SELECT * FROM contact_messages').all();

test('stores the message and marks it delivered when email succeeds', async () => {
  const db = openDatabase();
  const sent = [];
  const svc = createContactService({ db, emailSender: { send: async (m) => (sent.push(m), true) }, logger: silent });

  const result = await svc.submit(msg, '203.0.113.5');

  assert.deepEqual(result, { id: 1, delivered: true });
  assert.equal(sent.length, 1);
  assert.equal(sent[0].replyTo, msg.email);
  assert.match(sent[0].text, /Hello there/);
  const [row] = rows(db);
  assert.equal(row.email_delivered, 1);
  assert.equal(row.ip_hash.length, 16);
  assert.notEqual(row.ip_hash, '203.0.113.5');
});

test('keeps the message when email sending throws', async () => {
  const db = openDatabase();
  const svc = createContactService({
    db,
    emailSender: { send: async () => { throw new Error('SMTP down'); } },
    logger: silent,
  });

  const result = await svc.submit(msg, null);

  assert.equal(result.delivered, false);
  assert.equal(rows(db).length, 1);
  assert.equal(rows(db)[0].email_delivered, 0);
});

test('reports not delivered when SMTP is not configured', async () => {
  const db = openDatabase();
  const svc = createContactService({ db, emailSender: { send: async () => false }, logger: silent });
  assert.equal((await svc.submit(msg)).delivered, false);
});
