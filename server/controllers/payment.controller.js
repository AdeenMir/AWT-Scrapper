const Payment = require('../models/Payment');

// Plan pricing based on frequency
const PRICING = {
  '* * * * *': { planType: 'minute', price: 5.0 },      // Every minute
  '0 * * * *': { planType: 'hourly', price: 2.0 },      // Every hour
  '0 */6 * * *': { planType: 'six_hourly', price: 1.0 }, // Every 6 hours
  '0 */12 * * *': { planType: 'twelve_hourly', price: 0.75 }, // Every 12 hours
  '0 0 * * *': { planType: 'daily', price: 0.5 },        // Every day
  '0 0 * * 0': { planType: 'weekly', price: 0 },         // Every week (free)
};

// Generate fake transaction ID
const generateTransactionId = () => {
  return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

// Process payment - simulate with delay and 10% failure rate
const processPayment = async (req, res) => {
  const { interval, mobileNumber } = req.body;
  const userId = req.userId;

  if (!interval || !mobileNumber) {
    return res.status(400).json({ error: 'interval and mobileNumber are required' });
  }

  if (!PRICING[interval]) {
    return res.status(400).json({ error: 'Invalid interval. Must be a valid cron expression' });
  }

  try {
    const { planType, price: amount } = PRICING[interval];

    // Create pending payment record
    const payment = await Payment.create({
      userId,
      planType,
      amount,
      mobileNumber,
      status: 'pending',
    });

    // Simulate 1.5s processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate 10% failure rate
    const shouldFail = Math.random() < 0.1;

    if (shouldFail) {
      payment.status = 'failed';
      payment.errorMessage = 'Transaction declined. Please try again.';
      await payment.save();
      return res.status(400).json({
        error: 'Payment processing failed',
        transactionId: payment._id,
        message: 'Transaction declined. Please try again.',
      });
    }

    // Success case
    const transactionId = generateTransactionId();
    payment.transactionId = transactionId;
    payment.status = 'success';
    payment.completedAt = new Date();
    await payment.save();

    res.status(200).json({
      success: true,
      transactionId,
      paymentId: payment._id,
      amount,
      planType,
      message: 'Payment processed successfully',
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Verify payment before creating schedule
const verifyPayment = async (req, res) => {
  const { paymentId } = req.body;
  const userId = req.userId;

  if (!paymentId) {
    return res.status(400).json({ error: 'paymentId is required' });
  }

  try {
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (payment.status !== 'success') {
      return res.status(400).json({ error: 'Payment not successful' });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Get user's payments
const getPayments = async (req, res) => {
  const userId = req.userId;

  try {
    const payments = await Payment.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(payments);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { processPayment, verifyPayment, getPayments };
