const Schedule = require('../models/Schedule');
const Scraper = require('../models/Scraper');

const createSchedule = async (req, res) => {
  const { scraperId, interval } = req.body;
  if (!scraperId || !interval) {
    return res.status(400).json({ error: 'scraperId and interval are required' });
  }
  try {
    const scraper = await Scraper.findById(scraperId);
    if (!scraper) return res.status(404).json({ error: 'Scraper not found' });

    const schedule = await Schedule.create({ scraperId, interval });
    res.status(201).json(schedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find().populate('scraperId');
    res.status(200).json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const toggleSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });

    schedule.status = schedule.status === 'active' ? 'paused' : 'active';
    await schedule.save();
    res.status(200).json(schedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteSchedule = async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Schedule deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createSchedule, getSchedules, toggleSchedule, deleteSchedule };