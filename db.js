const path = require('path');
const Database = require('better-sqlite3');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'data', 'findback.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name     TEXT    NOT NULL,
    email         TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    phone         TEXT,
    faculty       TEXT,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        TEXT    NOT NULL CHECK (type IN ('lost', 'found')),
    title       TEXT    NOT NULL,
    description TEXT,
    category    TEXT    NOT NULL,
    location    TEXT    NOT NULL,
    event_date  TEXT    NOT NULL,
    image       TEXT,
    status      TEXT    NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved')),
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_items_type     ON items(type);
  CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
  CREATE INDEX IF NOT EXISTS idx_items_status   ON items(status);
  CREATE INDEX IF NOT EXISTS idx_items_user     ON items(user_id);
`);

module.exports = db;
