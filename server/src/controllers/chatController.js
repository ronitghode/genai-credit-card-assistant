import Conversation from "../models/Conversation.js";
import { generateAssistantResponse } from "../services/llmService.js";
import axios from "axios";

export const handleChat = async (req, res) => {
  try {
    const { userId = "demo-user", message, channel = "web" } = req.body;

    let conversation = await Conversation.findOne({ userId, channel });
    if (!conversation) {
      conversation = await Conversation.create({
        userId,
        channel,
        messages: []
      });
    }

    const history = conversation.messages.slice(-10); // last 10

    const aiResult = await generateAssistantResponse({
      userMessage: message,
      conversationHistory: history
    });

    const { type, action, params, answer } = aiResult;

    let actionResult = null;

    if (type === "ACTION" && action) {
      if (action === "BLOCK_CARD") {
        const resp = await axios.post(
          "http://localhost:3001/api/actions/block-card",
          { userId, ...params }
        );
        actionResult = resp.data;
      } else if (action === "INCREASE_LIMIT") {
        const resp = await axios.post(
          "http://localhost:3001/api/actions/increase-limit",
          { userId, ...params }
        );
        actionResult = resp.data;
      } else if (action === "UNBLOCK_CARD") {
        // Mocking UNBLOCK_CARD since no backend endpoint exists yet
        actionResult = {
          success: true,
          message: `Card for user ${userId} has been successfully UNBLOCKED. You can now use it for transactions.`
        };
      } else if (action === "CHECK_BALANCE") {
        const resp = await axios.post(
          "http://localhost:3001/api/actions/check-balance",
          { userId, ...params }
        );
        actionResult = resp.data;
      } else if (action === "VIEW_CARD_DETAILS") {
        const resp = await axios.post(
          "http://localhost:3001/api/actions/view-card-details",
          { userId, ...params }
        );
        actionResult = resp.data;
      } else if (action === "CHECK_CREDIT_SCORE") {
        const resp = await axios.post(
          "http://localhost:3001/api/actions/check-credit-score",
          { userId, ...params }
        );
        actionResult = resp.data;
      } else if (action === "ADD_FUNDS") {
        const resp = await axios.post(
          "http://localhost:3001/api/actions/add-funds",
          { userId, ...params }
        );
        actionResult = resp.data;
      } else if (action === "PAY_BILL") {
        const resp = await axios.post(
          "http://localhost:3001/api/actions/pay-bill",
          { userId, ...params }
        );
        actionResult = resp.data;
      } else if (action === "VIEW_TRANSACTIONS") {
        const resp = await axios.post(
          "http://localhost:3001/api/actions/view-transactions",
          { userId, ...params }
        );
        actionResult = resp.data;
      } else if (action === "CHECK_EMI") {
        const resp = await axios.post(
          "http://localhost:3001/api/actions/check-emi",
          { userId, ...params }
        );
        actionResult = resp.data;
      } else if (action === "PAY_EMI") {
        const resp = await axios.post(
          "http://localhost:3001/api/actions/pay-emi",
          { userId, ...params }
        );
        actionResult = resp.data;
      } else if (action === "VIEW_BILL") {
        const resp = await axios.post(
          "http://localhost:3001/api/bills/view-bill",
          { userId, ...params }
        );
        actionResult = resp.data;
      } else if (action === "DOWNLOAD_STATEMENT") {
        // For PDF download, we return a special response
        actionResult = {
          success: true,
          isPdfDownload: true,
          endpoint: "http://localhost:3001/api/bills/download-statement",
          params: { userId, ...params },
          message: `Your statement PDF is ready for download. Click the download button to save it.`
        };
      } else if (action === "BILL_HISTORY") {
        const resp = await axios.post(
          "http://localhost:3001/api/bills/bill-history",
          { userId, ...params }
        );
        actionResult = resp.data;
      } else if (action === "UPDATE_BILLING_ADDRESS") {
        const resp = await axios.post(
          "http://localhost:3001/api/bills/update-billing-address",
          { userId, ...params }
        );
        actionResult = resp.data;
      } else if (action === "CHECK_CARD_DELIVERY_STATUS") {
        const resp = await axios.post(
          "http://localhost:3001/api/actions/check-card-delivery-status",
          { userId, ...params }
        );
        actionResult = resp.data;
      }
      // you can add more actions similarly
    }

    conversation.messages.push({ role: "user", content: message });
    conversation.messages.push({ role: "assistant", content: answer });
    await conversation.save();

    return res.json({
      reply: answer,
      type,
      action,
      actionResult
    });
  } catch (err) {
    console.error("Chat error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};
