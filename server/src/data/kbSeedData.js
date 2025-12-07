export const kbSeedData = [
  // --- 1. Account & Onboarding ---
  {
    category: "account_onboarding",
    question: "How do I apply for the credit card?",
    answer: "You can apply directly from the app by completing KYC and income verification.",
    tags: ["apply", "onboarding", "kyc"]
  },
  {
    category: "account_onboarding",
    question: "What documents are required for KYC?",
    answer: "We need a valid ID proof (Aadhar/PAN/Passport) and a recent address proof. Income proof may be required for higher limits.",
    tags: ["kyc", "documents", "id proof"]
  },
  {
    category: "account_onboarding",
    question: "How can I add an add-on card for my spouse?",
    answer: "Go to Account Settings > Manage Cards > Request Add-on Card. You will need their details and ID proof.",
    tags: ["add-on", "supplementary", "spouse"]
  },
  {
    category: "account_onboarding",
    question: "How do I update my mailing address?",
    answer: "Address changes require proof valid within the last 3 months. Submit the request under Profile > Edit Details.",
    tags: ["address", "update", "profile"]
  },

  // --- 2. Card Delivery ---
  {
    category: "card_delivery",
    question: "When will my card be delivered?",
    answer: "Physical cards are usually delivered within 5–7 business days after approval.",
    tags: ["card delivery", "shipping", "track"]
  },
  {
    category: "card_delivery",
    question: "How do I track my card delivery?",
    answer: "Once dispatched, you will receive an AWB number via SMS. You can also track it in the 'Card Status' section of the app.",
    tags: ["track", "status", "delivery"]
  },
  {
    category: "card_delivery",
    question: "My card was delivered but I missed it. What now?",
    answer: "The courier will re-attempt delivery 2 more times. You can also reschedule via the link in the SMS.",
    tags: ["missed delivery", "shipping", "courier"]
  },

  // --- 3. Transaction & EMI ---
  {
    category: "transaction_emi",
    question: "How do I convert a transaction to EMI?",
    answer: "Select the transaction in the app, choose ‘Convert to EMI’, and select tenure and interest plan.",
    tags: ["emi", "convert", "transaction", "installment"]
  },
  {
    category: "transaction_emi",
    question: "What is the minimum amount for EMI conversion?",
    answer: "Transactions above ₹2,500 are eligible for EMI conversion.",
    tags: ["emi", "limit", "minimum"]
  },
  {
    category: "transaction_emi",
    question: "How do I dispute a transaction?",
    answer: "Tap on the specific transaction > 'Report Issue'. You can choose 'Fraud', 'Double Charge', or 'Goods not received'.",
    tags: ["dispute", "fraud", "chargeback", "transaction"]
  },
  {
    category: "transaction_emi",
    question: "Are international transactions enabled by default?",
    answer: "No, for security, international usage is off by default. Enable it in Card Controls.",
    tags: ["international", "foreign", "enable"]
  },

  // --- 4. Bill & Statement ---
  {
    category: "bill_statement",
    question: "How can I download my statement?",
    answer: "Go to Bills & Statements in the app, choose the month, and tap ‘Download PDF’.",
    tags: ["bill", "statement", "pdf", "download"]
  },
  {
    category: "bill_statement",
    question: "When is my bill generated?",
    answer: "Your bill is generated on the 20th of every month. The due date is usually 20 days after generation.",
    tags: ["bill date", "cycle", "generation"]
  },
  {
    category: "bill_statement",
    question: "I see a charge I don't recognize on my statement.",
    answer: "Please check if it's a merchant name difference. If not, use the 'Dispute Transaction' feature immediately.",
    tags: ["unknown charge", "statement", "error"]
  },

  // --- 5. Repayments ---
  {
    category: "repayments",
    question: "What repayment options do I have?",
    answer: "You can pay via net banking, UPI, debit card, or set up auto-debit from your bank.",
    tags: ["repayment", "payment options", "pay"]
  },
  {
    category: "repayments",
    question: "How long does it take for a payment to reflect?",
    answer: "UPI payments are instant. Net banking may take up to 2 hours. Cheque payments take 3-5 working days.",
    tags: ["payment time", "reflect", "processing"]
  },
  {
    category: "repayments",
    question: "Can I pay just the minimum due?",
    answer: "Yes, but interest will be charged on the remaining balance (APR 36-42%). We recommend paying the full amount.",
    tags: ["minimum due", "interest", "full payment"]
  },

  // --- 6. Collections ---
  {
    category: "collections",
    question: "What happens if I miss my payment?",
    answer: "Late fees and interest may be charged, and your credit score can be impacted. Please pay at least the minimum due.",
    tags: ["overdue", "collections", "late payment"]
  },
  {
    category: "collections",
    question: "I am facing financial difficulty. Can I get a payment plan?",
    answer: "Yes, we have hardship programs. Please type 'Connect with agent' to discuss restructuring options.",
    tags: ["hardship", "financial difficulty", "restructure"]
  },
  {
    category: "collections",
    question: "Why am I receiving calls from collection agents?",
    answer: "Calls are initiated if payment is overdue by more than 7 days. Please make the payment to stop them.",
    tags: ["collection", "calls", "harassment"]
  }
];
``