const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'defaultdb',
    port: process.env.DB_PORT || 24023,
    // REQUIRED for Aiven Cloud connection
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Diagnostic check to confirm it works with the new cloud settings
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Cloud Database connection failed:', err.message);
    } else {
        console.log('✅ Connected to Aiven MySQL Database!');
        connection.release();
    }
});

module.exports = pool.promise();
