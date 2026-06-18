const { scrape } = require('../services/scraper.service');
const { clean } = require('../services/cleaner.service');
const Report = require('../models/Report');
const Scraper = require('../models/Scraper');

const scrapeUrl = async (req, res) => {
  const {
    url,
    label,
    format,
    itemSelector,
    fields,
    enablePagination,
    maxPages,
    paginationType,
    nextPageSelector
  } = req.body;

  if (!url || !label) return res.status(400).json({ error: 'URL and label are required' });
  if (!Array.isArray(fields) || fields.length === 0) {
    return res.status(400).json({ error: 'At least one field is required' });
  }

  const validFields = fields
    .map((f) => ({
      key: (f.key || '').trim(),
      selector: (f.selector || '').trim(),
      type: f.type || 'text',
      attr: (f.attr || '').trim()
    }))
    .filter((f) => f.key && f.selector);

  if (!validFields.length) {
    return res.status(400).json({ error: 'No valid fields found' });
  }

  try {
    let scraper = await Scraper.findOne({ url, label });

    const payload = {
      url,
      label,
      format: format || 'table',
      itemSelector: (itemSelector || '').trim(),
      fields: validFields,
      enablePagination: !!enablePagination,
      maxPages: Number(maxPages) || 1,
      paginationType: paginationType || 'query',
      nextPageSelector: (nextPageSelector || '').trim()
    };

    if (!scraper) scraper = await Scraper.create(payload);
    else {
      Object.assign(scraper, payload);
      await scraper.save();
    }

    const rawData = await scrape(url, payload);
    const cleanedData = clean(rawData);

    let diffData = null;
    const lastReport = await Report.findOne({ scraperId: scraper._id }).sort({ createdAt: -1 });

    if (lastReport?.cleanedData?.length) {
      const prev = new Set(lastReport.cleanedData.map((i) => i.text));
      const curr = new Set(cleanedData.map((i) => i.text));
      const added = cleanedData.filter((i) => !prev.has(i.text));
      const removed = lastReport.cleanedData.filter((i) => !curr.has(i.text));
      diffData = { added, removed, addedCount: added.length, removedCount: removed.length };
    }

    const report = await Report.create({
      scraperId: scraper._id,
      url,
      format: payload.format,
      rawData,
      cleanedData,
      diffData
    });

    res.status(200).json({ report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Scraping failed' });
  }
};

module.exports = { scrapeUrl };