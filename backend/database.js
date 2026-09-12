const Database = require("better-sqlite3");

const db = new Database("ticket.db");

db.exec(`
    CREATE TABLE IF NOT EXISTS ticket (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description
    TEXT, status TEXT NOT NULL DEFAULT 'open', 
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, 
    password TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'user')
`);

module.exports = db;