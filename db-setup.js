const mysql = require('mysql2/promise');
require('dotenv').config();

const setupDatabase = async () => {
    // This logic only removes the "mysql://" part if it exists
    let cleanHost = process.env.DB_HOST || "";
    cleanHost = cleanHost.replace(/^mysql:\/\/|https?:\/\//, ''); // Remove protocols
    cleanHost = cleanHost.split(':')[0]; // Remove port if it's there
    cleanHost = cleanHost.trim();

    console.log(`Connecting to host: ${cleanHost}`);

    try {
        const connection = await mysql.createConnection({
            host: cleanHost,
            user: process.env.DB_USER.trim(),
            password: process.env.DB_PASSWORD.trim(),
            database: 'defaultdb',
            port: 24023, 
            ssl: { rejectUnauthorized: false },
            multipleStatements: true 
        });

        console.log("✅ Connected to Aiven MySQL! Creating tables...");
        
        // ... rest of your sqlScript ...


        const sqlScript = `
        CREATE TABLE IF NOT EXISTS users (
            UserID bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            FullName varchar(100) NOT NULL,
            Email varchar(100) NOT NULL UNIQUE,
            PasswordHash text NOT NULL,
            Program varchar(100) DEFAULT NULL,
            YearOfStudy int(11) DEFAULT NULL,
            Role enum('Student','Admin') NOT NULL,
            CreatedAt timestamp NOT NULL DEFAULT current_timestamp()
        ) ENGINE=InnoDB;

        CREATE TABLE IF NOT EXISTS studygroups (
            GroupID bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            GroupName varchar(150) NOT NULL,
            CourseCode varchar(20) NOT NULL,
            CourseName varchar(150) DEFAULT NULL,
            Faculty varchar(100) DEFAULT NULL,
            Description text DEFAULT NULL,
            MeetingLocation varchar(255) DEFAULT NULL,
            LeaderID int(11) DEFAULT NULL,
            CreatedAt timestamp NOT NULL DEFAULT current_timestamp()
        ) ENGINE=InnoDB;

        CREATE TABLE IF NOT EXISTS memberships (
            MembershipID bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            UserID int(11) DEFAULT NULL,
            GroupID int(11) DEFAULT NULL,
            JoinedAt timestamp NOT NULL DEFAULT current_timestamp(),
            UNIQUE KEY UserID (UserID, GroupID)
        ) ENGINE=InnoDB;

        CREATE TABLE IF NOT EXISTS announcements (
            AnnouncementID int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
            GroupID bigint(20) UNSIGNED NOT NULL,
            UserID int(11) NOT NULL,
            Message text NOT NULL,
            CreatedAt timestamp NOT NULL DEFAULT current_timestamp()
        ) ENGINE=InnoDB;

        CREATE TABLE IF NOT EXISTS studysessions (
            SessionID bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            GroupID int(11) DEFAULT NULL,
            SessionDate date NOT NULL,
            SessionTime time NOT NULL,
            LocationLink text DEFAULT NULL,
            SessionDescription text DEFAULT NULL,
            CreatedAt timestamp NOT NULL DEFAULT current_timestamp()
        ) ENGINE=InnoDB;

        CREATE TABLE IF NOT EXISTS groupposts (
            PostID bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            GroupID int(11) DEFAULT NULL,
            UserID int(11) DEFAULT NULL,
            Content text NOT NULL,
            CreatedAt timestamp NOT NULL DEFAULT current_timestamp()
        ) ENGINE=InnoDB;

        INSERT IGNORE INTO users (UserID, FullName, Email, PasswordHash, Program, YearOfStudy, Role) VALUES 
        (2, 'wandwasi bashir', 'wandwasibashir@gmail.com', '$2b$10$hOQjDiFehF7n5koqGyjgruUPyvPu4mWyPJCO2IR5zZzHEEEBtNPli', 'BSIT', 1, 'Admin'),
        (3, 'Mutonyi Afsa', 'afsa@gmail.com', '$2b$10$D8wSTIjhBlmUSzg6vue.fO5jT.KQhHk0qV49qq5RN9MSkI.7Ch2xy', 'BBA', 0, 'Student'),
        (14, 'Nambuya Elizabeth', 'elizabeth@gmail.com', '$2b$10$ovzaaycoUPqdUcc.ImZT4.Dv5x8x1I36eZvmf8tWuNGJ9iuzYj1YK', 'BBA', 3, 'Student');

        INSERT IGNORE INTO studygroups (GroupID, GroupName, CourseCode, Faculty, Description, LeaderID) VALUES 
        (7, 'WEB 2', 'C023', 'COMPUTING', 'web design', 2);

        INSERT IGNORE INTO memberships (UserID, GroupID) VALUES (2, 7), (14, 7);
        `;

        await connection.query(sqlScript);
        console.log("\n🚀 Success! All tables created and data imported to Aiven!");
        await connection.end();

    } catch (err) {
        console.error("❌ Error during setup:", err.message);
    }
};

setupDatabase();
