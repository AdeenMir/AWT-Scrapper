const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scraperId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scraper', required: true },
  interval: { type: String, required: true }, // cron expression e.g. "0 * * * *"
  status: { type: String, enum: ['active', 'paused'], default: 'active' },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', sparse: true },
  planType: { type: String, enum: ['free', 'daily', 'hourly'], default: 'free' },
  isPaid: { type: Boolean, default: false },
  lastRun: { type: Date },
  nextRun: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Schedule', scheduleSchema);