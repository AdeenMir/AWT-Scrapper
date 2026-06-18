import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
});

export const login = (data) => API.post("/auth/login", data);
export const signup = (data) => API.post("/auth/signup", data);
export const logout = () => API.post("/auth/logout");
export const getMe = () => API.get("/auth/me");

export const scrapeUrl = (data) => API.post("/scraper/scrape", data);
export const getReports = () => API.get("/reports");
export const getReportById = (id) => API.get(`/reports/${id}`);
export const deleteReport = (id) => API.delete(`/reports/${id}`);
export const getSchedules = () => API.get("/schedules");
export const createSchedule = (data) => API.post("/schedules", data);
export const toggleSchedule = (id) => API.patch(`/schedules/${id}/toggle`);
export const deleteSchedule = (id) => API.delete(`/schedules/${id}`);

// Payment endpoints
export const processPayment = (data) => API.post("/payments/process", data);
export const verifyPayment = (data) => API.post("/payments/verify", data);
export const getPayments = () => API.get("/payments");

// User endpoints
export const getUserProfile = () => API.get("/user/profile");
export const updateUserProfile = (data) => API.put("/user/profile", data);
