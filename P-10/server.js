
const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const helmet = require("helmet");
const session = require("express-session");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(express.static("public"));

// MySQL connection
const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "finsecure",
    waitForConnections: true,
    connectionLimit: 10
});

// Session configuration
if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET must be configured.");
}

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000
    }
}));

// Limit repeated login attempts
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        message: "Too many login attempts. Try again later."
    }
});

// Email validation
function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Password validation
function validPassword(password) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);
}


// EMPLOYEE REGISTRATION
app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                message: "Invalid registration details."
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();

        if (
            cleanName.length < 2 ||
            cleanName.length > 100 ||
            !validEmail(cleanEmail) ||
            cleanEmail.length > 150 ||
            !validPassword(password)
        ) {
            return res.status(400).json({
                message: "Please enter valid registration details."
            });
        }

        // Hash password before storing
        const hashedPassword = await bcrypt.hash(password, 12);

        // Prepared statement prevents SQL Injection
        await db.execute(
            "INSERT INTO employees (name, email, password) VALUES (?, ?, ?)",
            [cleanName, cleanEmail, hashedPassword]
        );

        res.status(201).json({
            message: "Registration successful!"
        });

    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Registration could not be completed."
            });
        }

        console.error("Registration error:", error.message);

        res.status(500).json({
            message: "Something went wrong. Please try again."
        });
    }
});


// EMPLOYEE LOGIN
app.post("/login", loginLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            email.length > 150 ||
            password.length > 72
        ) {
            return res.status(400).json({
                message: "Invalid email or password."
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        if (!validEmail(cleanEmail)) {
            return res.status(400).json({
                message: "Invalid email or password."
            });
        }

        // Secure parameterized query
        const [rows] = await db.execute(
            "SELECT id, name, password FROM employees WHERE email = ?",
            [cleanEmail]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const employee = rows[0];

        // Compare entered password with stored hash
        const match = await bcrypt.compare(
            password,
            employee.password
        );

        if (!match) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        // Regenerate session after successful login
        req.session.regenerate((err) => {
            if (err) {
                return res.status(500).json({
                    message: "Login could not be completed."
                });
            }

            req.session.employeeId = employee.id;

            res.json({
                message: "Login successful! Welcome " + employee.name
            });
        });

    } catch (error) {
        console.error("Login error:", error.message);

        res.status(500).json({
            message: "Something went wrong. Please try again."
        });
    }
});


// Protected employee dashboard
app.get("/dashboard", (req, res) => {
    if (!req.session.employeeId) {
        return res.status(401).json({
            message: "Please login first."
        });
    }

    res.json({
        message: "You are authenticated."
    });
});


// Logout
app.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                message: "Logout failed."
            });
        }

        res.clearCookie("connect.sid");
        res.json({
            message: "Logged out successfully."
        });
    });
});


// General error handler
app.use((err, req, res, next) => {
    console.error("Server error:", err.message);

    res.status(500).json({
        message: "Internal server error."
    });
});


// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
