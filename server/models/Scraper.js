const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    selector: { type: String, required: true },
    type: { type: String, enum: ['text', 'attr', 'html'], default: 'text' },
    attr: { type: String, default: '' }
  },
  { _id: false }
);

const scraperSchema = new mongoose.Schema({
  url: { type: String, required: true },
  label: { type: String, required: true },
  format: { type: String, enum: ['table', 'json', 'cards', 'csv'], default: 'table' },

  // New generic extraction model
  itemSelector: { type: String, default: '' },
  fields: { type: [fieldSchema], default: [] },

  enablePagination: { type: Boolean, default: false },
  maxPages: { type: Number, default: 1, min: 1, max: 50 },
  paginationType: { type: String, enum: ['query', 'nextLink'], default: 'query' },
  nextPageSelector: { type: String, default: '' },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Scraper', scraperSchema);