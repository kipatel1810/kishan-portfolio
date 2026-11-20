import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { openDatabase } from '../src/data/db.js';
import { createPortfolioService } from '../src/services/portfolioService.js';
import { createContactService } from '../src/services/contactService.js';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';

const silent = { error() {}, warn() {}, log() {} };
let server, base;

before(async () => {
  const db = openDatabase();
  const config = { ...loadConfig({}), contactRateLimit: { windowMs: 60_000, max: 2 } };
  const app = createApp({
    db,
    config,
    portfolio: createPortfolioService(db),
    contact: createContactService({ db, emailSender: { send: async () => true }, logger: silent }),
    logger: silent,
  });
  server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}/api`;
});
after(() => server.close());

test('GET /health', async () => {
  const res = await fetch(`${base}/health`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { status: 'healthy', db: 'ok' });
});

test('GET /projects returns all projects and filters by tag', async () => {
  const all = await (await fetch(`${base}/projects`)).json();
  assert.equal(all.length, 6);
  const data = await (await fetch(`${base}/projects?tag=data-ml`)).json();
  assert.ok(data.length > 0 && data.every((p) => p.tags.includes('data-ml')));
});

test('GET /projects with unknown tag is a 400 problem', async () => {
  const res = await fetch(`${base}/projects?tag=nope`);
  assert.equal(res.status, 400);
  assert.match(res.headers.get('content-type'), /application\/problem\+json/);
});

test('GET /projects/:id returns one project or 404', async () => {
  const ok = await fetch(`${base}/projects/socketfs`);
  assert.equal(ok.status, 200);
  assert.equal((await ok.json()).title, 'SocketFS – Distributed File System');
  const missing = await fetch(`${base}/projects/does-not-exist`);
  assert.equal(missing.status, 404);
  assert.equal((await missing.json()).status, 404);
});

test('GET /skills and /experience', async () => {
  const skills = await (await fetch(`${base}/skills`)).json();
  assert.equal(skills.length, 10);
  const exp = await (await fetch(`${base}/experience`)).json();
  assert.equal(exp[0].company, 'Ottawa Infotainment');
});

test('POST /contact validates, accepts, then rate limits', async () => {
  const post = (body) =>
    fetch(`${base}/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

  const bad = await post({ name: 'J', email: 'x', message: '' });
  assert.equal(bad.status, 400);
  assert.ok((await bad.json()).errors.email);

  const good = await post({ name: 'Jane', email: 'jane@example.com', message: 'Hello from the test suite' });
  assert.equal(good.status, 202);
  assert.equal((await good.json()).delivered, true);

  const limited = await post({ name: 'Jane', email: 'jane@example.com', message: 'Hello from the test suite' });
  assert.equal(limited.status, 429);
  assert.ok(limited.headers.get('retry-after'));
});

test('malformed JSON returns 400 problem', async () => {
  const res = await fetch(`${base}/projects`, { method: 'GET' });
  assert.equal(res.status, 200);
  const bad = await fetch(`${base}/health`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{oops' });
  assert.equal(bad.status, 400);
});

test('CORS rejects unknown origins and allows the configured one', async () => {
  const blocked = await fetch(`${base}/skills`, { headers: { Origin: 'https://evil.example' } });
  assert.equal(blocked.status, 403);
  const allowed = await fetch(`${base}/skills`, { headers: { Origin: 'http://localhost:5173' } });
  assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://localhost:5173');
});

test('unknown routes return 404 problem', async () => {
  const res = await fetch(`${base}/nope`);
  assert.equal(res.status, 404);
});
