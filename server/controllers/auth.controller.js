const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { cookieOptions } = require("../utils/cookieOptions");

const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const setAuthCookie = (res, token) => {
  res.cookie("token", token, cookieOptions);
};

const toPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
});

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: email.toLowerCase(), password: hashed });

    const token = signToken(user._id);
    setAuthCookie(res, token);

    return res.status(201).json({ user: toPublicUser(user) });
  } catch (err) {
    return res.status(500).json({ message: "Signup failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials. Please create an account." });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials. Please create an account." });
    }

    const token = signToken(user._id);
    setAuthCookie(res, token);

    return res.status(200).json({ user: toPublicUser(user) });
  } catch (err) {
    return res.status(500).json({ message: "Login failed" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token", cookieOptions);
  return res.status(200).json({ message: "Logged out" });
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("name email");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    return res.status(200).json({ user: toPublicUser(user) });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch user" });
  }
};
