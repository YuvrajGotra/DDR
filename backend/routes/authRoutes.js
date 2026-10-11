const express = require('express');
const router = express.Router();
const { loginAdmin, getAdminProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginAdmin);
router.get('/me', protect, getAdminProfile);
// Logout can be handled client-side by destroying the token

module.exports = router;
