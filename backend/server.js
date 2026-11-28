
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
            error: "Inisialisasi database gagal."
        });
    }
});

// ======================================
// MIDDLEWARE AUTHENTICATION
// ======================================

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            error: "Akses ditolak. Token autentikasi diperlukan."
        });
    }

    if (!JWT_SECRET) {
        return res.status(500).json({
            error: "Konfigurasi JWT_SECRET belum tersedia."
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Mengambil data terbaru pengguna dari database
        const result = await db.execute({
            sql: `
                SELECT id, username, role, account_status
                FROM users
                WHERE id = ?
            `,
            args: [decoded.id]
        });

        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({
                error: "Akun pengguna tidak ditemukan."
            });
        }

        if (user.account_status !== "active") {
            return res.status(403).json({
                error: "Akun Anda tidak aktif. Silakan hubungi administrator."
            });
        }

        req.user = {
            id: Number(user.id),
            username: user.username,
            role: user.role
        };

        next();

    } catch (error) {
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return res.status(403).json({
                error: "Token autentikasi tidak valid atau telah kedaluwarsa."
            });
        }

        console.error("Authentication error:", error);

        res.status(500).json({
            error: "Proses autentikasi gagal."
        });
    }
};

// ======================================
// MIDDLEWARE AUTHORIZATION
// ======================================

const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: "Akses ditolak. Anda tidak memiliki izin untuk melakukan tindakan ini."
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
// AKUN BARU OTOMATIS PENDING
// ======================================

app.post("/register", async (req, res) => {
    const { full_name, username, email, password } = req.body;

    if (!full_name || !username || !email || !password) {
        return res.status(400).json({
            error: "Seluruh kolom wajib diisi."
        });
    }

    const cleanName = full_name.trim();
    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanUsername || !cleanEmail) {
        return res.status(400).json({
            error: "Data tidak boleh kosong."
        });
    }

    if (cleanUsername.length < 3) {
        return res.status(400).json({
            error: "Username harus terdiri dari minimal 3 karakter."
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            error: "Kata sandi harus terdiri dari minimal 6 karakter."
        });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
        return res.status(400).json({
            error: "Format alamat email tidak valid."
        });
    }

    // Memeriksa ketersediaan username
    const existingUsername = await db.execute({
        sql: "SELECT id FROM users WHERE username = ?",
        args: [cleanUsername]
    });

    if (existingUsername.rows.length > 0) {
        return res.status(409).json({
            error: "Username telah digunakan. Silakan gunakan username lain."
        });
    }

    // Memeriksa ketersediaan email
    const existingEmail = await db.execute({
        sql: "SELECT id FROM users WHERE email = ?",
        args: [cleanEmail]
    });

    if (existingEmail.rows.length > 0) {
        return res.status(409).json({
            error: "Alamat email telah terdaftar."
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.execute({
        sql: `
            INSERT INTO users
            (full_name, username, email, password, role, account_status)
            VALUES (?, ?, ?, ?, 'user', 'pending')
        `,
        args: [
            cleanName,
            cleanUsername,
            cleanEmail,
            hashedPassword
        ]
    });

    res.status(201).json({
        message: "Pendaftaran berhasil. Akun Anda sedang menunggu persetujuan administrator.",
        user: {
            id: Number(result.lastInsertRowid),
            full_name: cleanName,
            username: cleanUsername,
            email: cleanEmail,
            role: "user",
            account_status: "pending"
        }
    });
});

// ======================================
// LOGIN USER
// HANYA AKUN ACTIVE YANG BISA LOGIN
// ======================================

app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            error: "Username dan kata sandi wajib diisi."
        });
    }

    if (!JWT_SECRET) {
        return res.status(500).json({
            error: "Konfigurasi JWT_SECRET belum tersedia."
        });
    }

    const result = await db.execute({
        sql: "SELECT * FROM users WHERE username = ?",
        args: [username.trim()]
    });

    const user = result.rows[0];

    if (!user) {
        return res.status(401).json({
            error: "Username atau kata sandi yang Anda masukkan salah."
        });
    }

    const passwordMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!passwordMatch) {
        return res.status(401).json({
            error: "Username atau kata sandi yang Anda masukkan salah."
        });
    }

    if (user.account_status === "pending") {
        return res.status(403).json({
            error: "Akun Anda masih menunggu persetujuan administrator."
        });
    }

    if (user.account_status !== "active") {
        return res.status(403).json({
            error: "Akun Anda tidak aktif. Silakan hubungi administrator."
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
        message: "Login berhasil.",
        token,
        user: {
            id: Number(user.id),
            full_name: user.full_name,
            username: user.username,
            email: user.email,
            role: user.role
        }
    });
});

// ======================================
// ADMIN - GET SEMUA USER
// ======================================

app.get(
    "/admin/users",
    authenticateToken,
    authorizeRole("admin"),
    async (req, res) => {
        const result = await db.execute(`
            SELECT
                id,
                full_name,
                username,
                email,
                role,
                account_status
            FROM users
            ORDER BY
                CASE account_status
                    WHEN 'pending' THEN 1
                    WHEN 'active' THEN 2
                    WHEN 'rejected' THEN 3
                    WHEN 'disabled' THEN 4
                    ELSE 5
                END,
                id DESC
        `);

        res.json(result.rows);
    }
);

// ======================================
// ADMIN - UPDATE STATUS USER
// ======================================

app.patch(
    "/admin/users/:id/status",
    authenticateToken,
    authorizeRole("admin"),
    async (req, res) => {
        const { id } = req.params;
        const { account_status } = req.body;

        const allowedStatuses = [
            "active",
            "rejected",
            "disabled"
        ];

        if (!allowedStatuses.includes(account_status)) {
            return res.status(400).json({
                error: "Status akun yang diberikan tidak valid."
            });
        }

        // Memastikan akun target merupakan pengguna biasa
        const existingUser = await db.execute({
            sql: "SELECT id, role FROM users WHERE id = ?",
            args: [id]
        });

        const targetUser = existingUser.rows[0];

        if (!targetUser) {
            return res.status(404).json({
                error: "Akun pengguna tidak ditemukan."
            });
        }

        if (targetUser.role !== "user") {
            return res.status(403).json({
                error: "Status akun administrator tidak dapat diubah melalui endpoint ini."
            });
        }

        await db.execute({
            sql: "UPDATE users SET account_status = ? WHERE id = ?",
            args: [account_status, id]
        });

        res.json({
            message: "Status akun berhasil diperbarui.",
            user_id: Number(id),
            account_status
        });
    }
);

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
            error: "Tiket tidak ditemukan."
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
            error: "Judul tiket wajib diisi."
        });
    }

    const result = await db.execute({
        sql: `
            INSERT INTO ticket (title, description, status)
            VALUES (?, ?, 'open')
        `,
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
            error: "Judul tiket wajib diisi."
        });
    }

    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            error: "Status tiket yang diberikan tidak valid."
        });
    }

    const result = await db.execute({
        sql: `
            UPDATE ticket
            SET title = ?, description = ?, status = ?
            WHERE id = ?
        `,
        args: [title.trim(), description || "", status, id]
    });

    if (result.rowsAffected === 0) {
        return res.status(404).json({
            error: "Tiket tidak ditemukan."
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
                error: "Tiket tidak ditemukan."
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
        error: "Terjadi kesalahan pada server. Silakan coba kembali."
    });
});

// ======================================
// JALANKAN SERVER
// ======================================

if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log(`Server berjalan di http://localhost:${PORT}`);
    });
}

module.exports = app;
