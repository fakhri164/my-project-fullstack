
const { createClient } = require("@libsql/client");

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:ticket.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Membuat tabel dan memperbarui struktur database
const ready = (async () => {
  // Tabel tiket
  await db.execute(`
    CREATE TABLE IF NOT EXISTS ticket (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'open',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabel pengguna untuk database baru
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      full_name TEXT,
      email TEXT,
      account_status TEXT NOT NULL DEFAULT 'active'
    )
  `);

  // Periksa kolom yang sudah tersedia
  const result = await db.execute("PRAGMA table_info(users)");

  const existingColumns = result.rows.map((column) => column.name);

  // Tambahkan kolom jika belum tersedia
  const newColumns = [
    {
      name: "full_name",
      sql: "ALTER TABLE users ADD COLUMN full_name TEXT",
    },
    {
      name: "email",
      sql: "ALTER TABLE users ADD COLUMN email TEXT",
    },
    {
      name: "account_status",
      sql: "ALTER TABLE users ADD COLUMN account_status TEXT NOT NULL DEFAULT 'active'",
    },
  ];

  for (const column of newColumns) {
    if (!existingColumns.includes(column.name)) {
      await db.execute(column.sql);
      console.log(`Kolom ${column.name} berhasil ditambahkan.`);
    }
  }

  console.log("Database berhasil disiapkan!");
})();

ready.catch((err) => {
  console.error("Gagal menyiapkan database:", err);
});

module.exports = { db, ready };
