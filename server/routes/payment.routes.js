const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { processPayment, verifyPayment, getPayments } = require('../controllers/payment.controller');

router.post('/process', authenticate, processPayment);
router.post('/verify', authenticate, verifyPayment);
router.get('/', authenticate, getPayments);

module.exports = router;
