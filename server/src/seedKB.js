import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import KnowledgeBaseItem from "./models/KnowledgeBaseItem.js";
import { kbSeedData } from "./data/kbSeedData.js";

dotenv.config();

const seed = async () => {
  await connectDB();
  await KnowledgeBaseItem.deleteMany();
  await KnowledgeBaseItem.insertMany(kbSeedData);
  console.log("KB seeded");
  process.exit(0);
};

seed();
