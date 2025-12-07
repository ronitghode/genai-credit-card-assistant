import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, required: true }
  },
  { timestamps: true }
);

const conversationSchema = new mongoose.Schema(
  {
    userId: { type: String }, // mock user ID
    channel: { type: String, default: "web" }, // web/app/whatsapp etc.
    messages: [messageSchema]
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", conversationSchema);
