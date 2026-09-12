const express = require("express");
const cors = require("cors");
const db = require("./database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

//register user
app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || username.trim() === "") {
        return res.status(400).json({
            error: "Username is required"
        });
    }

    if (!password || password.length < 6) {
        return res.status(400).json({
            error: "Password minimal 6 karakter"
        });
    }

    const existingUser = db
        .prepare("SELECT * FROM users WHERE username = ?")
        .get(username.trim());

    if (existingUser) {
        return res.status(409).json({
            error: "Username already exists"
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const stmt = db.prepare(
        "INSERT INTO users (username, password) VALUES (?, ?)"
    );

    const result = stmt.run(
        username.trim(),
        hashedPassword
    );

    const newUser = db
        .prepare("SELECT id, username, role FROM users WHERE id = ?")
        .get(result.lastInsertRowid);

    res.status(201).json(newUser);
});

//get semua tiket
app.get("/tickets", (req, res) => {
    const tickets =db.prepare("SELECT * FROM ticket ORDER BY id DESC").all();
    res.json(tickets);
});

//get satu tiket berdasarkan id
app.get("/tickets/:id", (req, res) => {
    const { id } = req.params;

    const ticket = db
        .prepare("SELECT * FROM ticket WHERE id = ?")
        .get(id);

    if (!ticket) {
        return res.status(404).json({ error: "Ticket not found"});
    }
    
    res.json(ticket);
});

//post tiket bru
app.post("/tickets", (req, res) => {
    const {title, description} = req.body;

    if (!title || title.trim() === "") {
        return res.status(400).json({error: "Title is required"});
    }

    const stmt = db.prepare(
        "INSERT INTO ticket (title, description, status) VALUES (?, ?, 'open')"
    );
    const result = stmt.run(title, description || "");

    const newTicket = db
    .prepare("SELECT * FROM ticket WHERE id = ?")
    .get(result.lastInsertRowid);

    res.status(201).json(newTicket);
});

//update tiket
app.put("/tickets/:id", (req, res) => {
    const { id } = req.params;
    const { title, description, status } = req.body;

    const validStatuses = ["open", "in progress", "resolved"];

    if (!title || title.trim() === "") {
        return res.status(400).json({
            error: "Title is required"
        });
    }

    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            error: "Invalid status"
        });
    }

    const stmt = db.prepare(
        "UPDATE ticket SET title = ?, description = ?, status = ? WHERE id = ?"
    );

    const result = stmt.run(
        title.trim(),
        description || "",
        status,
        id
    );

    if (result.changes === 0) {
        return res.status(404).json({
            error: "Ticket not found"
        });
    }

    const updatedTicket = db
        .prepare("SELECT * FROM ticket WHERE id = ?")
        .get(id);

    res.json(updatedTicket);
});

//delete tiket
app.delete("/tickets/:id", (req, res) => {
    const { id } = req.params;
    const stmt = db.prepare("DELETE FROM ticket WHERE id = ?");
    const result = stmt.run(id);

    if (result.changes === 0) {
        return res.status(404).json({ error: "Tiket not found"});
    }

    res.status(204).send();
});

app.listen(PORT, () => {
    console.log(`Server jalan di http://localhost:${PORT}`);
});