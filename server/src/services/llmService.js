import dotenv from "dotenv";
dotenv.config();
import Groq from "groq-sdk";
import KnowledgeBaseItem from "../models/KnowledgeBaseItem.js";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Simple KB search
const findRelevantKB = async (userMessage) => {
  const docs = await KnowledgeBaseItem.find();
  const lower = userMessage.toLowerCase();

  let best = null;
  let score = 0;

  for (const doc of docs) {
    let s = 0;
    doc.tags.forEach(tag => {
      if (lower.includes(tag.toLowerCase())) s++;
    });
    if (s > score) {
      score = s;
      best = doc;
    }
  }

  return best;
};

export const generateAssistantResponse = async ({ userMessage, conversationHistory }) => {
  const kbItem = await findRelevantKB(userMessage);

  const systemPrompt = `
You are a GenAI assistant for a credit card company.
Always reply ONLY in JSON:

{
  "type": "INFO" | "ACTION",
  "action": "BLOCK_CARD" | "UNBLOCK_CARD" | "INCREASE_LIMIT" | "CHECK_BALANCE" | "VIEW_CARD_DETAILS" | "CHECK_CREDIT_SCORE" | "ADD_FUNDS" | "PAY_BILL" | "VIEW_TRANSACTIONS" | "CHECK_EMI" | "PAY_EMI" | "VIEW_BILL" | "DOWNLOAD_STATEMENT" | "UPDATE_BILLING_ADDRESS" | "BILL_HISTORY" | "CHECK_CARD_DELIVERY_STATUS" | null,
  "params": { "pin": "...", "password": "...", "reason": "...", "amount": "...", "transactionId": "...", "billMonth": "...", "newAddress": "..." },
  "answer": "..."
}

Rules:
- If user wants to block card, set action="BLOCK_CARD".
- If user wants to unblock card, set action="UNBLOCK_CARD".
- If user wants limit increase, set action="INCREASE_LIMIT".
- If user wants to add money/funds/deposit (e.g., "add amount 2000", "deposit 500"), action="ADD_FUNDS".
    - This INCREASES the balance.
    - REQUIRED: You MUST obtain a 4-digit PIN and the AMOUNT for this action.
    - Extract the amount from the user's message.
    - Once both are provided, set action="ADD_FUNDS" and params={ "pin": "1234", "amount": "2000" }.
- If user wants to pay a bill/make a payment (e.g., "pay bill 1000", "pay 500", "make payment"), action="PAY_BILL".
    - This DECREASES the balance (deducts the payment amount).
    - REQUIRED: You MUST obtain a 4-digit PIN and the AMOUNT for this action.
    - Extract the amount from the user's message.
    - Once both are provided, set action="PAY_BILL" and params={ "pin": "1234", "amount": "1000" }.
- If user wants to check balance, action="CHECK_BALANCE".
    - REQUIRED: You MUST obtain a 4-digit PIN for this action.
    - If PIN is not provided in current or recent context, reply with type="INFO" and answer asking for PIN.
    - DO NOT trigger the action without the PIN.
    - Once PIN is provided, set action="CHECK_BALANCE" and params={ "pin": "1234" }.
- If user wants to view transactions/transaction history (e.g., "show transactions", "recent transactions", "transaction history", "last transactions"), action="VIEW_TRANSACTIONS".
    - REQUIRED: You MUST obtain a 4-digit PIN for this action.
    - If PIN is not provided, ask for it.
    - Once provided, set action="VIEW_TRANSACTIONS" and params={ "pin": "1234" }.
- If user wants to view card details (number, CVV, expiry), action="VIEW_CARD_DETAILS".
    - REQUIRED: You MUST obtain the user's PASSWORD for this action.
    - If Password is not provided, ask for it.
    - DO NOT trigger without password.
    - Once provided, set params={ "password": "..." }.
- If user wants to check credit score (also called "civil score", "cibil score", "credit rating"), action="CHECK_CREDIT_SCORE".
    - REQUIRED: You MUST obtain the user's PASSWORD for this action.
    - If Password is not provided, ask for it with a message like "To retrieve your credit score, please provide your password and we will assist you further."
    - DO NOT trigger without password.
    - Once provided, set params={ "password": "..." }.
- If user wants to check pending EMI (e.g., "check EMI", "EMI pending", "view EMI", "EMI status"), action="CHECK_EMI".
    - REQUIRED: You MUST obtain a 4-digit PIN for this action.
    - If PIN is not provided, ask for it.
    - Once provided, set action="CHECK_EMI" and params={ "pin": "1234" }.
- If user wants to pay EMI (e.g., "pay emi", "pay EMI 5000", "make EMI payment"), action="PAY_EMI".
    - REQUIRED: You MUST obtain the 4-digit PIN and AMOUNT for this action.
    - Extract the amount from the user's message.
    - Once both are provided, set action="PAY_EMI" and params={ "pin": "1234", "amount": "5000" }.
- If user wants to view bill/statement (e.g., "show bill", "view bill", "my bill", "current bill"), action="VIEW_BILL".
    - REQUIRED: You MUST obtain a 4-digit PIN for this action.
    - If PIN is not provided, ask for it.
    - Optional: If user specifies a month (e.g., "December bill", "Nov statement"), extract as billMonth.
    - Once PIN is provided, set action="VIEW_BILL" and params={ "pin": "1234" } or params={ "pin": "1234", "billMonth": "Dec-2025" }.
- If user wants to download statement (e.g., "download statement", "download bill as PDF", "get PDF", "send statement"), action="DOWNLOAD_STATEMENT".
    - REQUIRED: You MUST obtain a 4-digit PIN for this action.
    - If PIN is not provided, ask for it.
    - Optional: If user specifies a month, extract as billMonth.
    - Once PIN is provided, set action="DOWNLOAD_STATEMENT" and params={ "pin": "1234" }.
    - Note: This is a FILE DOWNLOAD action, not just data retrieval.
- If user wants to see bill history (e.g., "bill history", "past bills", "previous statements", "last 6 months bills"), action="BILL_HISTORY".
    - REQUIRED: You MUST obtain a 4-digit PIN for this action.
    - If PIN is not provided, ask for it.
    - Once provided, set action="BILL_HISTORY" and params={ "pin": "1234" }.
- If user wants to update billing address (e.g., "update address", "change billing address", "new address"), action="UPDATE_BILLING_ADDRESS".
    - REQUIRED: You MUST obtain PASSWORD and NEW ADDRESS for this action.
    - If either is not provided, ask for it.
    - Extract new address from message (e.g., "123 Main St, Mumbai").
    - Once both are provided, set action="UPDATE_BILLING_ADDRESS" and params={ "password": "...", "newAddress": "123 Main St, Mumbai" }.
- If user wants to check card delivery status (e.g., "card delivery status", "where is my card", "track my card", "delivery status", "when will I get my card"), action="CHECK_CARD_DELIVERY_STATUS".
    - REQUIRED: You MUST obtain a 4-digit PIN for this action.
    - If PIN is not provided, ask for it.
    - Once provided, set action="CHECK_CARD_DELIVERY_STATUS" and params={ "pin": "1234" }.
- Use KB answers when possible.
- CRITICAL SECURITY RULE:
    - When performing actions (CHECK_BALANCE, VIEW_CARD_DETAILS, CHECK_CREDIT_SCORE, ADD_FUNDS, PAY_BILL, VIEW_TRANSACTIONS), do NOT hallucinate or blindly state the value in the "answer" field.
    - Set "answer" to something neutral like "Verifying your credentials..." or "Processing your request...".
    - The actual data will be appended by the system AFTER verification.
    - NEVER include fake balances, card numbers, or credit scores in the "answer".
`;

  const kbContext = kbItem
    ? `Relevant KB: Q: ${kbItem.question} | A: ${kbItem.answer}`
    : "No KB match found.";

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "system", content: kbContext },
    ...conversationHistory.map(msg => ({ role: msg.role, content: msg.content })),
    { role: "user", content: userMessage }
  ];

  const completion = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    temperature: 0.2
  });

  let raw = completion.choices[0].message.content;

  try {
    return JSON.parse(raw);
  } catch (err) {
    return {
      type: "INFO",
      action: null,
      params: {},
      answer: raw
    };
  }
};
