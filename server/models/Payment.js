const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    planType: { type: String, enum: ['daily', 'hourly'], required: true },
    amount: { type: Number, required: true },
    mobileNumber: { type: String, required: true },
    transactionId: { type: String, unique: true, sparse: true },
    status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
    scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', sparse: true },
    errorMessage: { type: String, sparse: true },
    createdAt: { type: Date, default: Date.now },
    completedAt: { type: Date, sparse: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
