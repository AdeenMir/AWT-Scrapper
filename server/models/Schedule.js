const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  scraperId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scraper', required: true },
  interval: { type: String, required: true }, // cron expression e.g. "0 * * * *"
  status: { type: String, enum: ['active', 'paused'], default: 'active' },
  lastRun: { type: Date },
  nextRun: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Schedule', scheduleSchema);