import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { TAGS, projects, skills, experience } from '../src/data/content.js';

// The client bundles a copy of the content as its offline fallback; it must match the API seed.
const clientPath = new URL('../../client/src/data/content.json', import.meta.url);

test('client fallback content matches server seed data', { skip: !existsSync(clientPath) && 'client not present' }, () => {
  const client = JSON.parse(readFileSync(clientPath, 'utf8'));
  assert.deepEqual(client.tags, TAGS);
  assert.deepEqual(client.projects, projects);
  assert.deepEqual(client.skills, skills);
  assert.deepEqual(client.experience, experience);
});
