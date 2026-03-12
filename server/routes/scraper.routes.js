const express = require('express');
const router = express.Router();
const { scrapeUrl } = require('../controllers/scraper.controller');

router.post('/scrape', scrapeUrl);

module.exports = router;