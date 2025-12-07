import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    type: {
        type: String,
        required: true,
        enum: ["DEPOSIT", "PAYMENT", "TRANSFER", "REFUND", "FEE"]
    },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    balanceAfter: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for faster queries
transactionSchema.index({ userId: 1, timestamp: -1 });

export default mongoose.model("Transaction", transactionSchema);
