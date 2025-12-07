import mongoose from "mongoose";

const knowledgeBaseItemSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: [
        "account_onboarding",
        "card_delivery",
        "transaction_emi",
        "bill_statement",
        "repayments",
        "collections"
      ],
      required: true
    },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    tags: [String]
  },
  { timestamps: true }
);

export default mongoose.model("KnowledgeBaseItem", knowledgeBaseItemSchema);
