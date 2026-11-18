const { createClient } = require("@libsql/client");

// Di Vercel: TURSO_DATABASE_URL dan TURSO_AUTH_TOKEN diisi otomatis dari integrasi Turso.
// Di laptop (tanpa env): pakai file lokal ticket.db seperti biasa.
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:ticket.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const ready = db.batch(
  [
    `CREATE TABLE IF NOT EXISTS ticket (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'open',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user'
    )`,
  ],
  "write"
);

ready.catch((err) => console.error("Gagal membuat tabel:", err));

module.exports = { db, ready };

//KHAYLA KOK CANTIK BANGET SIHHHH
