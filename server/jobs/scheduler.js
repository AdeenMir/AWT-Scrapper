const Schedule = require('../models/Schedule');
const Scraper = require('../models/Scraper');
const { scrape } = require('../services/scraper.service');
const { clean } = require('../services/cleaner.service');
const Report = require('../models/Report');

const activeJobs = {};

module.exports = (cron) => {
  // Run every minute to check for active schedules
  cron.schedule('* * * * *', async () => {
    try {
      const schedules = await Schedule.find({ status: 'active' }).populate('scraperId');

      for (const schedule of schedules) {
        const jobKey = schedule._id.toString();

        // Skip if already registered
        if (activeJobs[jobKey]) continue;

        // Register the cron job
        const job = cron.schedule(schedule.interval, async () => {
          try {
            const scraper = await Scraper.findById(schedule.scraperId);
            if (!scraper) return;

            const rawData = await scrape(scraper.url, scraper.selector);
            const cleanedData = clean(rawData);

            await Report.create({
              scraperId: scraper._id,
              url: scraper.url,
              format: scraper.format,
              rawData,
              cleanedData
            });

            // Update lastRun
            schedule.lastRun = new Date();
            await schedule.save();

            console.log(`Scheduled scrape done for: ${scraper.url}`);
          } catch (err) {
            console.error(`Scheduled scrape failed: ${err.message}`);
          }
        });

        activeJobs[jobKey] = job;
      }

      // Stop jobs that have been paused or deleted
      for (const jobKey of Object.keys(activeJobs)) {
        const schedule = await Schedule.findById(jobKey);
        if (!schedule || schedule.status === 'paused') {
          activeJobs[jobKey].stop();
          delete activeJobs[jobKey];
        }
      }
    } catch (err) {
      console.error('Scheduler error:', err.message);
    }
  });

  console.log('Scheduler initialized');
};