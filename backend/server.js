
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { db, ready } = require("./database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

// ======================================
// DATABASE MIDDLEWARE
// ======================================

app.use(async (req, res, next) => {
    try {
        await ready;
        next();
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            error: "Database initialization failed"
        });
    }
});

// ======================================
// MIDDLEWARE AUTHENTICATION
// ======================================

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            error: "Access denied. Token required."
        });
    }

    if (!JWT_SECRET) {
        return res.status(500).json({
            error: "JWT_SECRET belum dikonfigurasi"
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                error: "Invalid or expired token"
            });
        }

        req.user = user;
        next();
    });
};

// ======================================
// MIDDLEWARE AUTHORIZATION
// ======================================

const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: "Akses ditolak! Role lu tidak memiliki izin."
            });
        }

        next();
    };
};

// ======================================
// ROUTE UTAMA
// ======================================

app.get("/", (req, res) => {
    res.send("IT Ticket Tracker API is running!");
});

// ======================================
// REGISTER USER
// ======================================

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

    const existingUser = await db.execute({
        sql: "SELECT * FROM users WHERE username = ?",
        args: [username.trim()]
    });

    if (existingUser.rows.length > 0) {
        return res.status(409).json({
            error: "Username already exists"
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.execute({
        sql: "INSERT INTO users (username, password) VALUES (?, ?)",
        args: [username.trim(), hashedPassword]
    });

    const newUser = await db.execute({
        sql: "SELECT id, username, role FROM users WHERE id = ?",
        args: [Number(result.lastInsertRowid)]
    });

    res.status(201).json(newUser.rows[0]);
});

// ======================================
// LOGIN USER
// ======================================

app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            error: "Username dan password wajib diisi"
        });
    }

    if (!JWT_SECRET) {
        return res.status(500).json({
            error: "JWT_SECRET belum dikonfigurasi"
        });
    }

    const result = await db.execute({
        sql: "SELECT * FROM users WHERE username = ?",
        args: [username.trim()]
    });

    const user = result.rows[0];

    if (!user) {
        return res.status(401).json({
            error: "Username atau password salah"
        });
    }

    const passwordMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!passwordMatch) {
        return res.status(401).json({
            error: "Username atau password salah"
        });
    }

    const token = jwt.sign(
        {
            id: Number(user.id),
            username: user.username,
            role: user.role
        },
        JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );

    res.json({
        message: "Login berhasil",
        token,
        user: {
            id: Number(user.id),
            username: user.username,
            role: user.role
        }
    });
});

// ======================================
// GET SEMUA TIKET
// ADMIN DAN USER
// ======================================

app.get("/tickets", authenticateToken, async (req, res) => {
    const result = await db.execute(
        "SELECT * FROM ticket ORDER BY id DESC"
    );

    res.json(result.rows);
});

// ======================================
// GET SATU TIKET
// ADMIN DAN USER
// ======================================

app.get("/tickets/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;

    const result = await db.execute({
        sql: "SELECT * FROM ticket WHERE id = ?",
        args: [id]
    });

    if (result.rows.length === 0) {
        return res.status(404).json({
            error: "Ticket not found"
        });
    }

    res.json(result.rows[0]);
});

// ======================================
// POST TIKET BARU
// ADMIN DAN USER
// ======================================

app.post("/tickets", authenticateToken, async (req, res) => {
    const { title, description } = req.body;

    if (!title || title.trim() === "") {
        return res.status(400).json({
            error: "Title is required"
        });
    }

    const result = await db.execute({
        sql: "INSERT INTO ticket (title, description, status) VALUES (?, ?, 'open')",
        args: [title.trim(), description || ""]
    });

    const newTicket = await db.execute({
        sql: "SELECT * FROM ticket WHERE id = ?",
        args: [Number(result.lastInsertRowid)]
    });

    res.status(201).json(newTicket.rows[0]);
});

// ======================================
// UPDATE TIKET
// ADMIN DAN USER
// ======================================

app.put("/tickets/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { title, description, status } = req.body;

    const validStatuses = [
        "open",
        "in progress",
        "resolved"
    ];

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

    const result = await db.execute({
        sql: "UPDATE ticket SET title = ?, description = ?, status = ? WHERE id = ?",
        args: [title.trim(), description || "", status, id]
    });

    if (result.rowsAffected === 0) {
        return res.status(404).json({
            error: "Ticket not found"
        });
    }

    const updatedTicket = await db.execute({
        sql: "SELECT * FROM ticket WHERE id = ?",
        args: [id]
    });

    res.json(updatedTicket.rows[0]);
});

// ======================================
// DELETE TIKET
// KHUSUS ADMIN
// ======================================

app.delete(
    "/tickets/:id",
    authenticateToken,
    authorizeRole("admin"),
    async (req, res) => {
        const { id } = req.params;

        const result = await db.execute({
            sql: "DELETE FROM ticket WHERE id = ?",
            args: [id]
        });

        if (result.rowsAffected === 0) {
            return res.status(404).json({
                error: "Ticket not found"
            });
        }

        res.status(204).send();
    }
);

// ======================================
// ERROR HANDLER
// ======================================

app.use((err, req, res, next) => {
    console.error("Server error:", err);

    res.status(500).json({
        error: "Internal server error"
    });
});

// ======================================
// JALANKAN SERVER
// ======================================

if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log(`Server jalan di http://localhost:${PORT}`);
    });
}

module.exports = app;
