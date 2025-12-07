import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";

dotenv.config();

const seedCardDeliveryStatus = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb+srv://indianwizard0:1234567890@cluster0.rsr1pud.mongodb.net/";
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    // Get all users
    const users = await User.find();
    console.log(`Found ${users.length} users`);

    // Set different delivery statuses for different users
    for (let i = 0; i < users.length; i++) {
      const statuses = ["Pending", "In Transit", "Delivered"];
      const status = statuses[i % statuses.length];
      
      users[i].cardDeliveryStatus = status;
      users[i].trackingNumber = `INR${Math.random().toString(36).substring(7).toUpperCase()}`;
      
      if (status === "In Transit") {
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + Math.floor(Math.random() * 5) + 1);
        users[i].expectedDeliveryDate = deliveryDate;
      } else if (status === "Delivered") {
        const deliveredDate = new Date();
        deliveredDate.setDate(deliveredDate.getDate() - Math.floor(Math.random() * 10) - 1);
        users[i].cardDeliveryDate = deliveredDate;
      }
      
      await users[i].save();
      console.log(`✅ Updated ${users[i].username}: Status = ${status}`);
    }

    console.log("✅ Card delivery status seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding card delivery status:", error);
    process.exit(1);
  }
};

seedCardDeliveryStatus();
