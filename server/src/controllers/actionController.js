// These are MOCK implementations -> Now upgrading to use DB where applicable.
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import EMI from "../models/EMI.js";

export const blockCard = async (req, res) => {
  const { userId, reason } = req.body;
  // pretend we called core-banking API
  return res.json({
    success: true,
    status: "CARD_BLOCKED",
    message: `Card for user ${userId} has been blocked for reason: ${reason || "not specified"}.`
  });
};

export const increaseLimit = async (req, res) => {
  const { userId, requestedLimit } = req.body;
  // pretend we ran eligibility check
  const approvedLimit = Math.min(requestedLimit || 30010, 100000);

  return res.json({
    success: true,
    status: "LIMIT_UPDATE_REQUESTED",
    approvedLimit,
    message: `Your limit increase request is submitted. Tentative approved limit: ₹${approvedLimit}.`
  });
};

export const checkBalance = async (req, res) => {
  const { userId, pin } = req.body;

  try {
    const user = await User.findOne({ username: userId });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found. Please ensure you are registered."
      });
    }

    const isMatch = await user.comparePin(pin);
    if (!isMatch) {
      return res.json({
        success: false,
        balance: null,
        message: "Incorrect PIN verification failed."
      });
    }

    return res.json({
      success: true,
      balance: user.balance,
      message: `Your current balance is $${user.balance}.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const viewCardDetails = async (req, res) => {
  const { userId, password } = req.body;

  try {
    const user = await User.findOne({ username: userId });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found."
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.json({
        success: false,
        message: "Incorrect Password. Access denied."
      });
    }

    // Return dummy card details on success
    return res.json({
      success: true,
      message: `Card Number: 4532 **** **** 1234\nExpiry: 12/28\nCVV: ***\nStatus: Active`
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const checkCreditScore = async (req, res) => {
  const { userId, password } = req.body;

  try {
    const user = await User.findOne({ username: userId });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found."
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.json({
        success: false,
        message: "Incorrect Password. Access denied."
      });
    }

    // Return credit score on success
    return res.json({
      success: true,
      creditScore: user.creditScore,
      message: `Your credit score is ${user.creditScore}. This is considered ${user.creditScore >= 750 ? 'excellent' : user.creditScore >= 650 ? 'good' : 'fair'}.`
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addFunds = async (req, res) => {
  const { userId, amount, pin } = req.body;

  try {
    const user = await User.findOne({ username: userId });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found."
      });
    }

    const isMatch = await user.comparePin(pin);
    if (!isMatch) {
      return res.json({
        success: false,
        message: "Incorrect PIN. Transaction failed."
      });
    }

    // Update balance
    const depositAmount = parseFloat(amount) || 0;
    user.balance = (user.balance || 0) + depositAmount;
    await user.save();

    // Log transaction
    await Transaction.create({
      userId: user.username,
      type: "DEPOSIT",
      amount: depositAmount,
      description: `Deposit of $${depositAmount}`,
      balanceAfter: user.balance
    });

    return res.json({
      success: true,
      newBalance: user.balance,
      message: `Successfully added $${depositAmount} to your account. Your new balance is $${user.balance}.`
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const payBill = async (req, res) => {
  const { userId, amount, pin } = req.body;

  try {
    const user = await User.findOne({ username: userId });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found."
      });
    }

    const isMatch = await user.comparePin(pin);
    if (!isMatch) {
      return res.json({
        success: false,
        message: "Incorrect PIN. Payment failed."
      });
    }

    // Deduct payment amount from balance
    const paymentAmount = parseFloat(amount) || 0;
    user.balance = (user.balance || 0) - paymentAmount;
    await user.save();

    // Log transaction
    await Transaction.create({
      userId: user.username,
      type: "PAYMENT",
      amount: paymentAmount,
      description: `Bill payment of $${paymentAmount}`,
      balanceAfter: user.balance
    });

    return res.json({
      success: true,
      newBalance: user.balance,
      message: `Payment of $${paymentAmount} processed successfully. Your new balance is $${user.balance}.`
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const viewTransactions = async (req, res) => {
  const { userId, pin } = req.body;

  try {
    const user = await User.findOne({ username: userId });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found."
      });
    }

    const isMatch = await user.comparePin(pin);
    if (!isMatch) {
      return res.json({
        success: false,
        message: "Incorrect PIN. Access denied."
      });
    }

    // Fetch last 10 transactions
    const transactions = await Transaction.find({ userId: user.username })
      .sort({ timestamp: -1 })
      .limit(10);

    if (transactions.length === 0) {
      return res.json({
        success: true,
        transactions: [],
        message: "No transactions found."
      });
    }

    // Format transactions
    const formattedTransactions = transactions.map(t => ({
      type: t.type,
      amount: t.amount,
      description: t.description,
      balanceAfter: t.balanceAfter,
      date: t.timestamp.toISOString().split('T')[0],
      time: t.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }));

    return res.json({
      success: true,
      transactions: formattedTransactions,
      isTableView: true,
      message: `Recent Transactions (${formattedTransactions.length} transactions)`
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const checkEMI = async (req, res) => {
  const { userId, pin } = req.body;

  try {
    const user = await User.findOne({ username: userId });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found. Please ensure you are registered."
      });
    }

    const isMatch = await user.comparePin(pin);
    if (!isMatch) {
      return res.json({
        success: false,
        message: "Incorrect PIN. Access denied."
      });
    }

    // Fetch EMI data from database
    let emiData = await EMI.find({ userId: user.username });

    console.log(`Checking EMI for user: ${user.username}, found ${emiData.length} records`);

    // If no EMI exists, create sample EMI records for demonstration
    if (emiData.length === 0) {
      console.log(`Creating sample EMI records for user: ${user.username}`);
      
      const sampleEMIs = [
        {
          userId: user.username,
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
          userId: user.username,
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

      try {
        emiData = await EMI.insertMany(sampleEMIs);
        console.log(`Successfully created ${emiData.length} EMI records`);
      } catch (insertErr) {
        // If insertion fails due to duplicate, just fetch existing records
        console.error("EMI insertion error:", insertErr.message);
        emiData = await EMI.find({ userId: user.username });
        console.log(`After error, found ${emiData.length} EMI records`);
      }
    }

    if (emiData.length === 0) {
      return res.json({
        success: true,
        emiData: [],
        totalPending: 0,
        isTableView: true,
        message: "No active EMI found."
      });
    }

    // Format EMI data for display
    const formattedEMI = emiData.map(emi => ({
      transactionId: emi.transactionId,
      originalAmount: emi.originalAmount,
      emiAmount: emi.emiAmount,
      tenure: emi.tenure,
      paidInstallments: emi.paidInstallments,
      remainingInstallments: emi.remainingInstallments,
      nextEMIDate: emi.nextEMIDate.toISOString().split('T')[0],
      nextEMIAmount: emi.nextEMIAmount,
      status: emi.status
    }));

    const totalPending = formattedEMI.reduce((sum, emi) => sum + (emi.remainingInstallments * emi.emiAmount), 0);

    return res.json({
      success: true,
      emiData: formattedEMI,
      totalPending: totalPending,
      isTableView: true,
      message: `You have ${formattedEMI.length} active EMI(s) with total pending amount: ₹${totalPending}. Here are the details:`
    });

  } catch (error) {
    console.error("checkEMI error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const payEMI = async (req, res) => {
  const { userId, amount, pin, transactionId } = req.body;

  try {
    const user = await User.findOne({ username: userId });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found."
      });
    }

    const isMatch = await user.comparePin(pin);
    if (!isMatch) {
      return res.json({
        success: false,
        message: "Incorrect PIN. Payment failed."
      });
    }

    const paymentAmount = parseFloat(amount) || 0;

    // Find the EMI record
    let emi = await EMI.findOne({ transactionId, userId: user.username });

    if (!emi) {
      return res.json({
        success: false,
        message: "EMI record not found."
      });
    }

    // Check if payment amount matches EMI amount
    if (paymentAmount !== emi.emiAmount) {
      return res.json({
        success: false,
        message: `Invalid payment amount. Expected ₹${emi.emiAmount}, but received ₹${paymentAmount}.`
      });
    }

    // Update EMI record
    emi.paidInstallments += 1;
    emi.remainingInstallments -= 1;

    // Set next EMI date (30 days from now)
    const nextDate = new Date(emi.nextEMIDate);
    nextDate.setDate(nextDate.getDate() + 30);
    emi.nextEMIDate = nextDate;

    // Check if all EMIs are paid
    if (emi.remainingInstallments === 0) {
      emi.status = "Closed";
      emi.nextEMIAmount = 0;
    }

    await emi.save();

    // Deduct payment from user balance
    user.balance = (user.balance || 0) - paymentAmount;
    await user.save();

    // Log transaction
    await Transaction.create({
      userId: user.username,
      type: "EMI_PAYMENT",
      amount: paymentAmount,
      description: `EMI payment for transaction ${transactionId}`,
      balanceAfter: user.balance
    });

    const message = emi.remainingInstallments === 0
      ? `EMI payment of ₹${paymentAmount} processed successfully. All EMIs for transaction ${transactionId} are now closed. Your new balance is ₹${user.balance}.`
      : `EMI payment of ₹${paymentAmount} processed successfully. Remaining EMIs: ${emi.remainingInstallments}. Your new balance is ₹${user.balance}.`;

    return res.json({
      success: true,
      newBalance: user.balance,
      emiStatus: {
        transactionId,
        paidInstallments: emi.paidInstallments,
        remainingInstallments: emi.remainingInstallments,
        status: emi.status
      },
      message
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const checkCardDeliveryStatus = async (req, res) => {
  const { userId, pin } = req.body;

  try {
    const user = await User.findOne({ username: userId });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found. Please ensure you are registered."
      });
    }

    const isMatch = await user.comparePin(pin);
    if (!isMatch) {
      return res.json({
        success: false,
        message: "Incorrect PIN verification failed."
      });
    }

    // Get card delivery details
    const deliveryStatus = user.cardDeliveryStatus || "Pending";
    const trackingNumber = user.trackingNumber || "Not yet assigned";
    const expectedDeliveryDate = user.expectedDeliveryDate 
      ? user.expectedDeliveryDate.toLocaleDateString("en-IN")
      : "Not yet scheduled";

    let statusMessage = "";
    switch (deliveryStatus) {
      case "Delivered":
        statusMessage = `✅ Your card has been delivered on ${user.cardDeliveryDate?.toLocaleDateString("en-IN") || "N/A"}. Thank you for your patience.`;
        break;
      case "In Transit":
        statusMessage = `📦 Your card is in transit. Expected delivery: ${expectedDeliveryDate}. Tracking: ${trackingNumber}`;
        break;
      case "Pending":
        statusMessage = `⏳ Your card is being prepared for dispatch. We'll send you tracking details soon.`;
        break;
      case "Cancelled":
        statusMessage = `❌ Your card order has been cancelled. Please contact support for more details.`;
        break;
      default:
        statusMessage = `Status: ${deliveryStatus}`;
    }

    return res.json({
      success: true,
      cardDeliveryStatus: deliveryStatus,
      trackingNumber,
      expectedDeliveryDate,
      message: statusMessage
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
