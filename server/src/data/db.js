import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { projects, skills, experience } from './content.js';

// Versioned migrations tracked with SQLite's PRAGMA user_version.
const migrations = [
  `CREATE TABLE projects (
     id TEXT PRIMARY KEY,
     sort_order INTEGER NOT NULL,
     title TEXT NOT NULL,
     summary TEXT NOT NULL,
     highlights TEXT NOT NULL,
     tech TEXT NOT NULL,
     tags TEXT NOT NULL,
     period TEXT NOT NULL,
     repo_url TEXT,
     featured INTEGER NOT NULL DEFAULT 0
   );
   CREATE TABLE skills (
     sort_order INTEGER PRIMARY KEY,
     category TEXT NOT NULL,
     items TEXT NOT NULL
   );
   CREATE TABLE experience (
     id TEXT PRIMARY KEY,
     sort_order INTEGER NOT NULL,
     role TEXT NOT NULL,
     company TEXT NOT NULL,
     location TEXT NOT NULL,
     period TEXT NOT NULL,
     highlights TEXT NOT NULL
   );
   CREATE TABLE contact_messages (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     name TEXT NOT NULL,
     email TEXT NOT NULL,
     message TEXT NOT NULL,
     ip_hash TEXT,
     email_delivered INTEGER NOT NULL DEFAULT 0,
     created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
   );`,
];

function migrate(db) {
  const { user_version: current } = db.prepare('PRAGMA user_version').get();
  for (let v = current; v < migrations.length; v++) {
    db.exec('BEGIN');
    try {
      db.exec(migrations[v]);
      db.exec(`PRAGMA user_version = ${v + 1}`);
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  }
}

// Content tables are re-seeded on every start so edits to content.js deploy without a manual migration.
function seed(db) {
  db.exec('BEGIN');
  try {
    db.exec('DELETE FROM projects; DELETE FROM skills; DELETE FROM experience;');
    const p = db.prepare(
      `INSERT INTO projects (id, sort_order, title, summary, highlights, tech, tags, period, repo_url, featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    projects.forEach((x, i) =>
      p.run(x.id, i, x.title, x.summary, JSON.stringify(x.highlights), JSON.stringify(x.tech),
        JSON.stringify(x.tags), x.period, x.repoUrl, x.featured ? 1 : 0),
    );
    const s = db.prepare('INSERT INTO skills (sort_order, category, items) VALUES (?, ?, ?)');
    skills.forEach((x, i) => s.run(i, x.category, JSON.stringify(x.items)));
    const e = db.prepare(
      `INSERT INTO experience (id, sort_order, role, company, location, period, highlights)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );
    experience.forEach((x, i) =>
      e.run(x.id, i, x.role, x.company, x.location, x.period, JSON.stringify(x.highlights)),
    );
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export function openDatabase(path = ':memory:') {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  migrate(db);
  seed(db);
  return db;
}
