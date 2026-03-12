const express = require('express');
const router = express.Router();
const { createSchedule, getSchedules, toggleSchedule, deleteSchedule } = require('../controllers/schedule.controller');

router.post('/', createSchedule);
router.get('/', getSchedules);
router.patch('/:id/toggle', toggleSchedule);
router.delete('/:id', deleteSchedule);

module.exports = router;