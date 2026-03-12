const express = require('express');
const router = express.Router();
const { getReports, getReportById, deleteReport } = require('../controllers/report.controller');

router.get('/', getReports);
router.get('/:id', getReportById);
router.delete('/:id', deleteReport);

module.exports = router;