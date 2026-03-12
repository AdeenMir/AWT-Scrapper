const mongoose = require('mongoose');

const scraperSchema = new mongoose.Schema({
  url: { type: String, required: true },
  label: { type: String, required: true },
  format: { type: String, enum: ['table', 'json', 'cards', 'csv'], default: 'table' },
  selector: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Scraper', scraperSchema);