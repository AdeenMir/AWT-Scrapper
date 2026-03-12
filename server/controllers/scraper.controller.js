const { scrape } = require('../services/scraper.service');
const { clean } = require('../services/cleaner.service');
const Report = require('../models/Report');
const Scraper = require('../models/Scraper');

const scrapeUrl = async (req, res) => {
  const { url, label, format, selector } = req.body;

  if (!url || !label) {
    return res.status(400).json({ error: 'URL and label are required' });
  }

  try {
    // Save scraper config
    let scraper = await Scraper.findOne({ url, label });
    if (!scraper) {
      scraper = await Scraper.create({ url, label, format, selector });
    }

    // Scrape and clean
    const rawData = await scrape(url, selector);
    const cleanedData = clean(rawData);

    // Save report
    const report = await Report.create({
      scraperId: scraper._id,
      url,
      format,
      rawData,
      cleanedData
    });

    res.status(200).json({ report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { scrapeUrl };