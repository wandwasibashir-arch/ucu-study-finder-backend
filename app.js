require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const groupRoutes = require('./routes/studygroup');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// --- AUTOMATIC DATABASE INITIALIZATION ---
const initDB = async () => {
    try {
        const connection = await db.getConnection();
        console.log('🛠️ Checking/Creating Database Tables...');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                UserID SERIAL PRIMARY KEY,
                FullName varchar(100) NOT NULL,
                Email varchar(100) NOT NULL UNIQUE,
                PasswordHash text NOT NULL,
                Program varchar(100) DEFAULT NULL,
                YearOfStudy int(11) DEFAULT NULL,
                Role enum('Student','Admin') NOT NULL,
                CreatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS studygroups (
                GroupID SERIAL PRIMARY KEY,
                GroupName varchar(150) NOT NULL,
                CourseCode varchar(20) NOT NULL,
                CourseName varchar(150) DEFAULT NULL,
                Faculty varchar(100) DEFAULT NULL,
                Description text DEFAULT NULL,
                MeetingLocation varchar(255) DEFAULT NULL,
                LeaderID bigint UNSIGNED DEFAULT NULL,
                CreatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS memberships (
                MembershipID SERIAL PRIMARY KEY,
                UserID bigint UNSIGNED DEFAULT NULL,
                GroupID bigint UNSIGNED DEFAULT NULL,
                JoinedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS announcements (
                AnnouncementID SERIAL PRIMARY KEY,
                GroupID bigint UNSIGNED NOT NULL,
                UserID bigint UNSIGNED NOT NULL,
                Message text NOT NULL,
                CreatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS studysessions (
                SessionID SERIAL PRIMARY KEY,
                GroupID bigint UNSIGNED DEFAULT NULL,
                SessionDate date NOT NULL,
                SessionTime time NOT NULL,
                LocationLink text DEFAULT NULL,
                SessionDescription text DEFAULT NULL,
                CreatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
        `);

        console.log('✅ All tables verified/created successfully');
        connection.release();
    } catch (err) {
        console.error('❌ Error during table creation:', err.message);
    }
};

// Start DB check
initDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => {
    res.status(404).json({ error: "Route not found on server." });
});

app.use((err, req, res, next) => {
    console.error("🔥 Server Error:", err.stack);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is LIVE on port ${PORT}`);
});
