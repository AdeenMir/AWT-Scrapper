const Schedule = require('../models/Schedule');
const Scraper = require('../models/Scraper');
const Payment = require('../models/Payment');

// Pricing and plan mapping for intervals
const INTERVAL_PRICING = {
  '* * * * *': { planType: 'minute', price: 5.0, isPaid: true },
  '0 * * * *': { planType: 'hourly', price: 2.0, isPaid: true },
  '0 */6 * * *': { planType: 'six_hourly', price: 1.0, isPaid: true },
  '0 */12 * * *': { planType: 'twelve_hourly', price: 0.75, isPaid: true },
  '0 0 * * *': { planType: 'daily', price: 0.5, isPaid: true },
  '0 0 * * 0': { planType: 'weekly', price: 0, isPaid: false },
};

const determinePlanType = (interval) => {
  return INTERVAL_PRICING[interval] || { planType: 'free', price: 0, isPaid: false };
};

const createSchedule = async (req, res) => {
  const { scraperId, interval, paymentId } = req.body;
  const userId = req.userId;

  if (!scraperId || !interval) {
    return res.status(400).json({ error: 'scraperId and interval are required' });
  }

  try {
    const scraper = await Scraper.findById(scraperId);
    if (!scraper) return res.status(404).json({ error: 'Scraper not found' });

    const planConfig = determinePlanType(interval);
    let payment = null;

    // Check if paid schedule
    if (planConfig.isPaid) {
      if (!paymentId) {
        return res.status(400).json({ error: `Payment required for ${planConfig.planType} schedule` });
      }

      // Verify payment
      payment = await Payment.findById(paymentId);
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      if (payment.userId.toString() !== userId) {
        return res.status(403).json({ error: 'Unauthorized payment' });
      }

      if (payment.status !== 'success') {
        return res.status(400).json({ error: 'Payment not verified' });
      }

      if (payment.planType !== planConfig.planType) {
        return res.status(400).json({ error: 'Payment plan type does not match schedule interval' });
      }
    }

    const schedule = await Schedule.create({
      userId,
      scraperId,
      interval,
      planType: planConfig.planType,
      isPaid: planConfig.isPaid,
      paymentId: payment ? payment._id : null,
    });

    // Link schedule to payment
    if (payment) {
      payment.scheduleId = schedule._id;
      await payment.save();
    }

    const populatedSchedule = await Schedule.findById(schedule._id).populate('scraperId').populate('paymentId');
    res.status(201).json(populatedSchedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSchedules = async (req, res) => {
  const userId = req.userId;

  try {
    const schedules = await Schedule.find({ userId }).populate('scraperId').populate('paymentId');
    res.status(200).json({ schedules });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const toggleSchedule = async (req, res) => {
  const userId = req.userId;

  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });

    // Verify ownership
    if (schedule.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    schedule.status = schedule.status === 'active' ? 'paused' : 'active';
    await schedule.save();
    res.status(200).json(schedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteSchedule = async (req, res) => {
  const userId = req.userId;

  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });

    // Verify ownership
    if (schedule.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Schedule.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Schedule deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createSchedule, getSchedules, toggleSchedule, deleteSchedule };