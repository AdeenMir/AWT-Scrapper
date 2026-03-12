import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

export const scrapeUrl = (data) => API.post('/scraper/scrape', data);
export const getReports = () => API.get('/reports');
export const getReportById = (id) => API.get(`/reports/${id}`);
export const deleteReport = (id) => API.delete(`/reports/${id}`);
export const getSchedules = () => API.get('/schedules');
export const createSchedule = (data) => API.post('/schedules', data);
export const toggleSchedule = (id) => API.patch(`/schedules/${id}/toggle`);
export const deleteSchedule = (id) => API.delete(`/schedules/${id}`);