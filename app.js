require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const groupRoutes = require('./routes/studygroup');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// UPDATED: Standard CORS config for Render deployment
app.use(cors({
  origin: true, // This allows your specific Render frontend to connect
  credentials: true
}));

app.use(express.json());

db.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => {
  console.log(`⚠️ 404 Error: ${req.method} request for ${req.originalUrl}`);
  res.status(404).json({ error: "Route not found on server." });
});

app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});

// UPDATED: Render automatically assigns a PORT; use 0.0.0.0 for deployment
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is LIVE on port ${PORT}`);
});
