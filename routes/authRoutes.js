const express = require('express');
const router = express.Router();
const authController = require('../controllers/authcontroller');
const verifyToken = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', verifyToken, authController.getMe);

// ADDED: Route for password reset
router.put('/reset-password', verifyToken, authController.resetPassword);

router.delete('/user/:id', verifyToken, authController.deleteAccount);

module.exports = router;
