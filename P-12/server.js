
const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

app.use(helmet({
    crossOriginResourcePolicy: false
}));

app.use(cors({
    origin: "http://localhost:3000"
}));

app.use(express.json({ limit: "10kb" }));
app.use(express.static("public"));

// Rate limiting
app.use("/api", rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
}));

// DATABASE CONNECTION
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});


// AUTHENTICATION MIDDLEWARE
function authenticate(req, res, next) {

    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Please login first."
        });
    }

    const token = header.split(" ")[1];

    try {

        req.user = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Invalid or expired token."
        });

    }
}


// USER REGISTRATION
app.post("/api/register", async (req, res) => {

    try {

        const { name, email, password } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            name.trim().length < 3 ||
            name.trim().length > 100 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
            !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password)
        ) {
            return res.status(400).json({
                message: "Enter valid details. Password needs 8 characters, uppercase, lowercase, number and symbol."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await pool.execute(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [name.trim(), email.trim().toLowerCase(), hashedPassword]
        );

        res.status(201).json({
            message: "Registration successful. Please login."
        });

    } catch (error) {

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Email already registered."
            });
        }

        console.error(error);

        res.status(500).json({
            message: "Registration failed."
        });

    }

});


// USER LOGIN
app.post("/api/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                message: "Enter email and password."
            });
        }

        const [users] = await pool.execute(
            "SELECT * FROM users WHERE email = ?",
            [email.trim().toLowerCase()]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const user = users[0];

        const validPassword = await bcrypt.compare(
            password,
            user.password
        );

        if (!validPassword) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "2h"
            }
        );

        res.json({
            message: "Login successful.",
            token: token,
            name: user.name
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Login failed."
        });

    }

});


// GET ALL ROOMS - REST API
app.get("/api/rooms", async (req, res) => {

    try {

        const [rooms] = await pool.execute(
            "SELECT * FROM rooms WHERE available = TRUE"
        );

        res.json(rooms);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Unable to fetch rooms."
        });

    }

});


// CREATE HOTEL BOOKING
app.post("/api/bookings", authenticate, async (req, res) => {

    let connection;

    try {

        const { room_id, check_in, check_out } = req.body;

        const validDate = value =>
            typeof value === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(value) &&
            !Number.isNaN(Date.parse(value)) &&
            new Date(value).toISOString().slice(0, 10) === value;

        if (
            !Number.isInteger(Number(room_id)) ||
            !validDate(check_in) ||
            !validDate(check_out) ||
            check_out <= check_in
        ) {
            return res.status(400).json({
                message: "Invalid room or booking dates."
            });
        }

        if (
            new Date(check_in + "T00:00:00Z") <
            new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z")
        ) {
            return res.status(400).json({
                message: "Check-in date cannot be in the past."
            });
        }

        connection = await pool.getConnection();

        await connection.beginTransaction();

        // Lock room row to prevent simultaneous bookings
        const [rooms] = await connection.execute(
            "SELECT * FROM rooms WHERE id = ? AND available = TRUE FOR UPDATE",
            [Number(room_id)]
        );

        if (rooms.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Room not found."
            });
        }

        // Check overlapping reservations
        const [existing] = await connection.execute(
            `SELECT id FROM bookings
             WHERE room_id = ?
             AND status = 'Confirmed'
             AND check_in < ?
             AND check_out > ?`,
            [Number(room_id), check_out, check_in]
        );

        if (existing.length > 0) {

            await connection.rollback();

            return res.status(409).json({
                message: "Room is already booked for these dates."
            });

        }

        const start = new Date(check_in + "T00:00:00Z");
        const end = new Date(check_out + "T00:00:00Z");

        const nights = Math.round(
            (end - start) / 86400000
        );

        const total = Number(rooms[0].price) * nights;

        const [result] = await connection.execute(
            `INSERT INTO bookings
             (user_id, room_id, check_in, check_out, total_price)
             VALUES (?, ?, ?, ?, ?)`,
            [
                req.user.id,
                Number(room_id),
                check_in,
                check_out,
                total
            ]
        );

        await connection.commit();

        res.status(201).json({
            message: "Booking successful!",
            booking_id: result.insertId,
            nights: nights,
            total_price: total
        });

    } catch (error) {

        if (connection) {
            await connection.rollback();
        }

        console.error(error);

        res.status(500).json({
            message: "Booking failed."
        });

    } finally {

        if (connection) {
            connection.release();
        }

    }

});


// GET CUSTOMER BOOKING HISTORY
app.get("/api/bookings", authenticate, async (req, res) => {

    try {

        const [bookings] = await pool.execute(
            `SELECT b.id, r.room_name, b.check_in,
                    b.check_out, b.total_price, b.status
             FROM bookings b
             JOIN rooms r ON b.room_id = r.id
             WHERE b.user_id = ?
             ORDER BY b.created_at DESC`,
            [req.user.id]
        );

        res.json(bookings);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Unable to fetch bookings."
        });

    }

});


// SERVER START
async function startServer() {

    try {

        await pool.query("SELECT 1");

        console.log("MySQL connected successfully!");

        const port = process.env.PORT || 3000;

        app.listen(port, () => {
            console.log(
                `Hotel Booking System running at http://localhost:${port}`
            );
        });

    } catch (error) {

        console.error("Database connection failed:", error.message);
        process.exit(1);

    }

}

startServer();
