const User = require('../models/User');

const getProfile = async (req, res) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferredPaymentNumber: user.preferredPaymentNumber || '',
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const updateProfile = async (req, res) => {
  const userId = req.userId;
  const { name, email, preferredPaymentNumber } = req.body;

  if (!name && !email && preferredPaymentNumber === undefined) {
    return res.status(400).json({ error: 'At least one field is required' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update fields if provided
    if (name) user.name = name.trim();
    if (email) {
      const emailLower = email.toLowerCase().trim();
      // Check if email is already in use
      const existingUser = await User.findOne({ email: emailLower, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(409).json({ error: 'Email already in use' });
      }
      user.email = emailLower;
    }
    if (preferredPaymentNumber !== undefined) {
      user.preferredPaymentNumber = preferredPaymentNumber ? preferredPaymentNumber.trim() : '';
    }

    await user.save();

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferredPaymentNumber: user.preferredPaymentNumber || '',
      },
      message: 'Profile updated successfully',
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { getProfile, updateProfile };
