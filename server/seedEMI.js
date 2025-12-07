import mongoose from "mongoose";
import EMI from "./src/models/EMI.js";
import dotenv from "dotenv";

dotenv.config();

const seedEMI = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing EMI data
    await EMI.deleteMany({});
    console.log("Cleared existing EMI data");

    // Create sample EMI data for demo user
    const emiRecords = [
      {
        userId: "demo-user-123",
        transactionId: "TXN001",
        originalAmount: 50000,
        emiAmount: 5000,
        tenure: 12,
        paidInstallments: 3,
        remainingInstallments: 9,
        nextEMIDate: new Date("2025-01-07"),
        nextEMIAmount: 5000,
        status: "Active"
      },
      {
        userId: "demo-user-123",
        transactionId: "TXN002",
        originalAmount: 30000,
        emiAmount: 3000,
        tenure: 10,
        paidInstallments: 5,
        remainingInstallments: 5,
        nextEMIDate: new Date("2025-01-15"),
        nextEMIAmount: 3000,
        status: "Active"
      }
    ];

    await EMI.insertMany(emiRecords);
    console.log("✅ EMI data seeded successfully");
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding EMI data:", err.message);
    process.exit(1);
  }
};

seedEMI();
