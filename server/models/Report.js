const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  scraperId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scraper', required: true },
  url: { type: String, required: true },
  format: { type: String, required: true },
  rawData: { type: mongoose.Schema.Types.Mixed },
  cleanedData: { type: mongoose.Schema.Types.Mixed },
  // Feature 6: scrape diff
  diffData: { type: mongoose.Schema.Types.Mixed, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);