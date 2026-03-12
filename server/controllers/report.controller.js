const Report = require('../models/Report');

const getReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 }).populate('scraperId');
    res.status(200).json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate('scraperId');
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.status(200).json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteReport = async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getReports, getReportById, deleteReport };