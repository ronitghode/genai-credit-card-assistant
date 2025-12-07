import mongoose from "mongoose";
import Bill from "./src/models/Bill.js";
import User from "./src/models/User.js";
import Transaction from "./src/models/Transaction.js";
import dotenv from "dotenv";

dotenv.config();

const seedBills = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Get existing users
    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    // Clear existing bills
    await Bill.deleteMany({});
    console.log("Cleared existing bills");

    // Create bills for each user
    const billRecords = [];

    for (const user of users) {
      // Get user's transactions
      const transactions = await Transaction.find({ userId: user.username })
        .sort({ timestamp: -1 })
        .limit(10);

      // Calculate bill amount
      const billAmount = transactions.reduce((sum, t) => {
        return sum + (t.type === "PAYMENT" ? -t.amount : t.amount);
      }, 0);

      // Create bills for last 3 months
      const today = new Date();

      for (let i = 0; i < 3; i++) {
        const billDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const billMonth = billDate.toLocaleString("en-US", { 
          month: "short", 
          year: "numeric" 
        }).replace(" ", "-");

        const billStartDate = new Date(
          billDate.getFullYear(),
          billDate.getMonth(),
          1
        );
        const billEndDate = new Date(
          billDate.getFullYear(),
          billDate.getMonth() + 1,
          0
        );
        const billGeneratedDate = new Date(billEndDate);
        billGeneratedDate.setDate(billGeneratedDate.getDate() + 5);
        
        const dueDate = new Date(billGeneratedDate);
        dueDate.setDate(dueDate.getDate() + 20);

        const totalAmount = Math.max(billAmount * (1 + i * 0.1), 0); // Varying amounts
        const minimumDue = Math.max(totalAmount * 0.05, 100);
        const creditLimit = 100000;
        const availableCredit = creditLimit - totalAmount;

        // Format transactions for bill
        const billTransactions = transactions
          .slice(0, 5)
          .map((t, idx) => ({
            transactionId: `TXN${idx + 1}`,
            date: t.timestamp,
            description: t.description,
            amount: t.amount,
            type: t.type === "PAYMENT" ? "CREDIT" : "DEBIT"
          }));

        const bill = new Bill({
          userId: user.username,
          billMonth,
          billStartDate,
          billEndDate,
          billGeneratedDate,
          dueDate,
          totalAmount,
          minimumDue,
          previousBalance: i === 0 ? 0 : totalAmount * 0.3,
          creditLimit,
          availableCredit,
          transactions: billTransactions,
          status: i === 0 ? "Unpaid" : i === 1 ? "Paid" : "PartiallyPaid",
          paidAmount: i === 0 ? 0 : i === 1 ? totalAmount : minimumDue,
          paymentDate: i > 0 ? new Date(dueDate.getTime() - 5 * 24 * 60 * 60 * 1000) : null
        });

        billRecords.push(bill);
      }
    }

    await Bill.insertMany(billRecords);
    console.log(`✅ Created ${billRecords.length} bill records`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding bills:", err.message);
    process.exit(1);
  }
};

seedBills();
