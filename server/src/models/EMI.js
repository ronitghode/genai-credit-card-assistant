import mongoose from "mongoose";

const emiSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  transactionId: {
    type: String,
    required: true
  },
  originalAmount: {
    type: Number,
    required: true
  },
  emiAmount: {
    type: Number,
    required: true
  },
  tenure: {
    type: Number,
    required: true
  },
  paidInstallments: {
    type: Number,
    default: 0
  },
  remainingInstallments: {
    type: Number,
    required: true
  },
  nextEMIDate: {
    type: Date,
    required: true
  },
  nextEMIAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["Active", "Closed", "Overdue"],
    default: "Active"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for userId and transactionId
emiSchema.index({ userId: 1, transactionId: 1 }, { unique: true });

export default mongoose.model("EMI", emiSchema);
