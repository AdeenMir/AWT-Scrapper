const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { getProfile, updateProfile } = require('../controllers/user.controller');

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

module.exports = router;
