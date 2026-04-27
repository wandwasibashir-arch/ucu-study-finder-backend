const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admincontroller');
const verifyToken = require('../middleware/auth');

if (adminController && adminController.getSystemStats) {
    router.get('/stats', verifyToken, adminController.getSystemStats);
} else {
    console.error("❌ ERROR: adminController.getSystemStats is undefined!");
}

if (adminController && adminController.getAllUsers) {
    router.get('/users', verifyToken, adminController.getAllUsers);
}

// --- ADDED PART: FETCH ROUTES ---
if (adminController && adminController.getAllGroups) {
    router.get('/groups', verifyToken, adminController.getAllGroups);
}

if (adminController && adminController.getAllSessions) {
    router.get('/sessions', verifyToken, adminController.getAllSessions);
}

if (adminController && adminController.getAllAnnouncements) {
    router.get('/announcements', verifyToken, adminController.getAllAnnouncements);
}

// --- ADDED PART: DELETE ROUTES ---
if (adminController && adminController.deleteUser) {
    router.delete('/users/:id', verifyToken, adminController.deleteUser);
}

if (adminController && adminController.deleteGroup) {
    router.delete('/groups/:id', verifyToken, adminController.deleteGroup);
}

if (adminController && adminController.deleteSession) {
    router.delete('/sessions/:id', verifyToken, adminController.deleteSession);
}

if (adminController && adminController.deleteAnnouncement) {
    router.delete('/announcements/:id', verifyToken, adminController.deleteAnnouncement);
}

module.exports = router;
