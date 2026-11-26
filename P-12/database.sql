
CREATE DATABASE hotel_booking;

USE hotel_booking;

-- USERS TABLE
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ROOMS TABLE
CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image VARCHAR(500),
    available BOOLEAN DEFAULT TRUE
);

-- BOOKINGS TABLE
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    room_id INT NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(30) DEFAULT 'Confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (room_id) REFERENCES rooms(id),

    CHECK (check_out > check_in),
    CHECK (total_price > 0)
);

-- INSERT ROOM DETAILS
INSERT INTO rooms
(room_name, description, price, image)
VALUES

('Deluxe Room',
 'Comfortable room with modern facilities and free Wi-Fi.',
 2500,
 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'),

('Luxury Suite',
 'Spacious suite with premium facilities and elegant interiors.',
 4500,
 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800'),

('Premium Room',
 'Premium accommodation with beautiful views and luxury services.',
 6000,
 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800');

-- DISPLAY TABLES
SELECT * FROM users;
SELECT * FROM rooms;
SELECT * FROM bookings;
