const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    const { FullName, Email, Password, Program, YearOfStudy, Role } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(Password, salt);
        await db.execute(
            'INSERT INTO users (FullName, Email, PasswordHash, Program, YearOfStudy, Role) VALUES (?, ?, ?, ?, ?, ?)',
            [FullName, Email, hash, Program, YearOfStudy, Role]
        );
        res.status(201).json({ msg: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const login = async (req, res) => {
    const { Email, Password } = req.body;
    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE Email = ?', [Email]);
        if (rows.length === 0) return res.status(400).json({ msg: "Invalid Credentials" });

        const user = rows[0];
        const isMatch = await bcrypt.compare(Password, user.PasswordHash);
        if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

        const token = jwt.sign({ id: user.UserID }, process.env.JWT_SECRET || 'secret123', { expiresIn: '24h' });
        res.status(200).json({ token, user: { id: user.UserID, name: user.FullName, role: user.Role } });
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
};

const getMe = async (req, res) => {
    try {
        // ADDED Email and Role to the selection so they appear on your Profile page
        const [rows] = await db.execute(
            'SELECT FullName, Email, Program, YearOfStudy, Role FROM users WHERE UserID = ?',
            [req.user.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error("SQL Error in getMe:", error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// ADDED: Password Reset Logic
const resetPassword = async (req, res) => {
    const { password } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        await db.execute(
            'UPDATE users SET PasswordHash = ? WHERE UserID = ?',
            [hashedPassword, req.user.id]
        );
        res.status(200).json({ msg: "Password updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteAccount = async (req, res) => {
    try {
        await db.execute('DELETE FROM users WHERE UserID = ?', [req.params.id || req.user.id]);
        res.json({ msg: "Account deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { register, login, getMe, resetPassword, deleteAccount };
