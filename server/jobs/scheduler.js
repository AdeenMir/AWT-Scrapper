// jobs/scheduler.js — Runs active schedules automatically using node-cron
const Schedule = require('../models/Schedule');
const Scraper = require('../models/Scraper');
const Report = require('../models/Report');
const { scrape } = require('../services/scraper.service');
const { clean } = require('../services/cleaner.service');

module.exports = (cron) => {
  // Check every minute which schedules are due
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const schedules = await Schedule.find({ status: 'active' }).populate('scraperId');

      for (const schedule of schedules) {
        // Skip if nextRun is in the future
        if (schedule.nextRun && schedule.nextRun > now) continue;

        const scraper = schedule.scraperId;
        if (!scraper) continue;

        console.log(`[Scheduler] Running scrape for: ${scraper.label}`);

        try {
          const rawData = await scrape(scraper.url, {
            selector: scraper.selector,
            nameSelector: scraper.nameSelector,
            priceSelector: scraper.priceSelector,
            selectors: scraper.selectors || [],
            enablePagination: scraper.enablePagination,
            maxPages: scraper.maxPages
          });

          const cleanedData = clean(rawData);

          // Scrape diff
          let diffData = null;
          const lastReport = await Report.findOne({ scraperId: scraper._id }).sort({ createdAt: -1 });
          if (lastReport && lastReport.cleanedData) {
            const prevTexts = new Set(lastReport.cleanedData.map(i => i.text));
            const currTexts = new Set(cleanedData.map(i => i.text));
            const added = cleanedData.filter(i => !prevTexts.has(i.text));
            const removed = lastReport.cleanedData.filter(i => !currTexts.has(i.text));
            diffData = { added, removed, addedCount: added.length, removedCount: removed.length };
          }

          await Report.create({
            scraperId: scraper._id,
            url: scraper.url,
            format: scraper.format,
            rawData,
            cleanedData,
            diffData
          });

          // Update schedule timestamps
          schedule.lastRun = now;
          schedule.nextRun = getNextRun(schedule.interval);
          await schedule.save();

          console.log(`[Scheduler] Done: ${scraper.label} — ${cleanedData.length} items`);
        } catch (err) {
          console.error(`[Scheduler] Failed: ${scraper.label} —`, err.message);
        }
      }
    } catch (err) {
      console.error('[Scheduler] Error:', err.message);
    }
  });

  console.log('[Scheduler] Running — checks every minute');
};

// Calculate when the schedule should next run based on cron expression
const getNextRun = (cronExpression) => {
  try {
    const parts = cronExpression.split(' ');
    const now = new Date();
    // Simple estimation based on common intervals
    const intervals = {
      '* * * * *':     1,
      '0 * * * *':     60,
      '0 */6 * * *':   360,
      '0 */12 * * *':  720,
      '0 0 * * *':     1440,
      '0 0 * * 0':     10080
    };
    const minutesToAdd = intervals[cronExpression] || 60;
    return new Date(now.getTime() + minutesToAdd * 60 * 1000);
  } catch {
    return new Date(Date.now() + 60 * 60 * 1000); // default 1 hour
  }
};