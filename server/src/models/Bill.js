import mongoose from "mongoose";

const billSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  billMonth: {
    // Format: "Dec-2025" or "December 2025"
    type: String,
    required: true
  },
  billStartDate: {
    type: Date,
    required: true
  },
  billEndDate: {
    type: Date,
    required: true
  },
  billGeneratedDate: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  minimumDue: {
    type: Number,
    required: true
  },
  previousBalance: {
    type: Number,
    default: 0
  },
  creditLimit: {
    type: Number,
    default: 100000
  },
  availableCredit: {
    type: Number,
    default: 100000
  },
  transactions: [
    {
      transactionId: {
        type: String
      },
      date: {
        type: Date
      },
      description: {
        type: String
      },
      amount: {
        type: Number
      },
      type: {
        type: String
      }
    }
  ],
  status: {
    type: String,
    enum: ["Unpaid", "Paid", "PartiallyPaid", "Overdue"],
    default: "Unpaid"
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  paymentDate: {
    type: Date,
    default: null
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

// Compound index for efficient queries
billSchema.index({ userId: 1, billMonth: 1 }, { unique: true });

export default mongoose.model("Bill", billSchema);
