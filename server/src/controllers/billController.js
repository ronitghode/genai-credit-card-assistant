import Bill from "../models/Bill.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import PDFDocument from "pdfkit";

// Helper function to generate PDF statement
const generatePDFStatement = (bill, user) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        bufferPages: true,
        margin: 50,
        size: "A4"
      });

      let buffers = [];

      doc.on("data", (data) => {
        buffers.push(data);
      });

      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Header
      doc.fontSize(20).font("Helvetica-Bold").text("CREDIT CARD STATEMENT", {
        align: "center"
      });
      doc.moveDown(0.5);

      // Company info
      doc.fontSize(10).font("Helvetica").text(
        "GenAI Credit Card Company",
        {
          align: "center"
        }
      );
      doc.text("Fintech Solutions Pvt. Ltd.", { align: "center" });
      doc.text("support@genaicc.com | +91-800-GENAI-CC", { align: "center" });
      doc.moveDown(1);

      // Divider
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(1);

      // User Information
      doc.fontSize(11).font("Helvetica-Bold").text("ACCOUNT HOLDER INFORMATION");
      doc.fontSize(10).font("Helvetica");
      doc.text(`Name: ${user.fullName}`);
      doc.text(`Email: ${user.email}`);
      doc.text(`Phone: ${user.phone}`);
      doc.text(`Address: ${user.address || "Not provided"}`);
      doc.moveDown(0.5);

      // Bill Period
      doc.fontSize(11).font("Helvetica-Bold").text("BILLING PERIOD");
      doc.fontSize(10).font("Helvetica");
      const billStartFormatted = bill.billStartDate.toISOString().split("T")[0];
      const billEndFormatted = bill.billEndDate.toISOString().split("T")[0];
      const billGeneratedFormatted = bill.billGeneratedDate
        .toISOString()
        .split("T")[0];
      const dueFormatted = bill.dueDate.toISOString().split("T")[0];

      doc.text(`Statement Period: ${billStartFormatted} to ${billEndFormatted}`);
      doc.text(`Statement Generated: ${billGeneratedFormatted}`);
      doc.text(`Payment Due Date: ${dueFormatted}`);
      doc.moveDown(1);

      // Divider
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(1);

      // Summary Table
      doc.fontSize(11).font("Helvetica-Bold").text("ACCOUNT SUMMARY");
      doc.moveDown(0.5);

      const tableTop = doc.y;
      const col1X = 50;
      const col2X = 300;

      doc.fontSize(10).font("Helvetica");

      // Row 1: Previous Balance
      doc.text("Previous Balance:", col1X);
      doc.fontSize(10).font("Helvetica").text(
        `₹${bill.previousBalance.toLocaleString("en-IN")}`,
        col2X,
        tableTop
      );

      const row2Y = tableTop + 25;
      doc.text("Purchases & Debits:", col1X, row2Y);
      doc.text(
        `₹${(
          bill.totalAmount - bill.previousBalance
        ).toLocaleString("en-IN")}`,
        col2X,
        row2Y
      );

      const row3Y = row2Y + 25;
      doc.fontSize(11).font("Helvetica-Bold").text("Total Amount Due:", col1X, row3Y);
      doc.fontSize(11).font("Helvetica-Bold").text(
        `₹${bill.totalAmount.toLocaleString("en-IN")}`,
        col2X,
        row3Y
      );

      const row4Y = row3Y + 25;
      doc.fontSize(10).font("Helvetica").text("Minimum Due:", col1X, row4Y);
      doc.text(`₹${bill.minimumDue.toLocaleString("en-IN")}`, col2X, row4Y);

      const row5Y = row4Y + 25;
      doc.text("Paid Amount:", col1X, row5Y);
      doc.text(`₹${bill.paidAmount.toLocaleString("en-IN")}`, col2X, row5Y);

      const row6Y = row5Y + 25;
      doc.text("Available Credit:", col1X, row6Y);
      doc.text(
        `₹${(bill.creditLimit - bill.totalAmount)
          .toLocaleString("en-IN")}`,
        col2X,
        row6Y
      );

      doc.moveDown(2);

      // Status
      doc.fontSize(11).font("Helvetica-Bold").text("BILL STATUS");
      doc.fontSize(10)
        .font("Helvetica")
        .text(
          `Status: ${bill.status}`,
          50,
          doc.y
        );
      if (bill.paymentDate) {
        const paymentDateFormatted = bill.paymentDate
          .toISOString()
          .split("T")[0];
        doc.text(`Payment Received On: ${paymentDateFormatted}`);
      }

      doc.moveDown(1);

      // Divider
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(1);

      // Transactions Table
      doc.fontSize(11).font("Helvetica-Bold").text("TRANSACTION DETAILS");
      doc.moveDown(0.5);

      // Table Headers
      const tableHeaderY = doc.y;
      const widths = {
        date: 80,
        description: 200,
        type: 80,
        amount: 100
      };

      doc.fontSize(9).font("Helvetica-Bold");
      doc.text("Date", 50, tableHeaderY);
      doc.text("Description", 50 + widths.date, tableHeaderY);
      doc.text("Type", 50 + widths.date + widths.description, tableHeaderY);
      doc.text("Amount", 50 + widths.date + widths.description + widths.type, tableHeaderY);

      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.5);

      // Table Rows
      doc.fontSize(9).font("Helvetica");

      if (bill.transactions && bill.transactions.length > 0) {
        bill.transactions.forEach((txn) => {
          const txnDate = new Date(txn.date).toISOString().split("T")[0];
          doc.text(txnDate, 50);
          doc.text(txn.description, 50 + widths.date, doc.y - 12, { width: widths.description });
          doc.text(txn.type, 50 + widths.date + widths.description, doc.y - 12);
          doc.text(
            `₹${txn.amount.toLocaleString("en-IN")}`,
            50 + widths.date + widths.description + widths.type,
            doc.y - 12
          );
          doc.moveDown(0.5);
        });
      } else {
        doc.text("No transactions in this billing period", 50);
        doc.moveDown(0.5);
      }

      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(1);

      // Important Notes
      doc.fontSize(11).font("Helvetica-Bold").text("IMPORTANT INFORMATION");
      doc.fontSize(9).font("Helvetica");
      doc.text(
        "• Please ensure payment is made before the due date to avoid late fees."
      );
      doc.text("• Interest at 36-42% p.a. will be charged on unpaid balance.");
      doc.text("• Minimum due is the lesser of 5% of outstanding balance or ₹100.");
      doc.text(
        "• This is a computer-generated document and does not require a signature."
      );

      doc.moveDown(1);

      // Footer
      doc.fontSize(8).font("Helvetica");
      doc.text(
        "Generated on: " + new Date().toISOString().split("T")[0],
        50,
        doc.page.height - 50,
        { align: "center" }
      );
      doc.text(
        "For queries, contact support@genaicc.com",
        50,
        doc.page.height - 30,
        { align: "center" }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

export const viewBill = async (req, res) => {
  const { userId, pin, billMonth } = req.body;

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

    // Get current month if not specified
    const today = new Date();
    const currentMonth = billMonth || `${today.toLocaleString("en-US", { month: "short" })}-${today.getFullYear()}`;

    let bill = await Bill.findOne({ userId: user.username, billMonth: currentMonth });

    // If no bill exists for this month, create a sample one
    if (!bill) {
      console.log(`Creating sample bill for user: ${user.username}, month: ${currentMonth}`);

      // Get last 5 transactions for bill
      const transactions = await Transaction.find({ userId: user.username })
        .sort({ timestamp: -1 })
        .limit(5);

      const billAmount = transactions.reduce((sum, t) => {
        return sum + (t.type === "PAYMENT" ? -t.amount : t.amount);
      }, 0);

      const billStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
      const billEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const billGeneratedDate = new Date();
      const dueDate = new Date(billGeneratedDate);
      dueDate.setDate(dueDate.getDate() + 20);

      bill = new Bill({
        userId: user.username,
        billMonth: currentMonth,
        billStartDate,
        billEndDate,
        billGeneratedDate,
        dueDate,
        totalAmount: Math.max(billAmount, 0),
        minimumDue: Math.max(billAmount * 0.05, 100),
        previousBalance: 0,
        creditLimit: 100000,
        availableCredit: 100000 - Math.max(billAmount, 0),
        transactions: transactions.map((t) => ({
          transactionId: "TXN" + Date.now(),
          date: t.timestamp,
          description: t.description,
          amount: t.amount,
          type: t.type === "PAYMENT" ? "CREDIT" : "DEBIT"
        })),
        status: "Unpaid"
      });

      await bill.save();
      console.log(`Bill created for user: ${user.username}`);
    }

    // Format bill for display
    const formattedBill = {
      billMonth: bill.billMonth,
      totalAmount: bill.totalAmount,
      minimumDue: bill.minimumDue,
      dueDate: bill.dueDate.toISOString().split("T")[0],
      status: bill.status,
      creditLimit: bill.creditLimit,
      availableCredit: bill.availableCredit,
      transactionCount: bill.transactions.length
    };

    return res.json({
      success: true,
      bill: formattedBill,
      isTableView: false,
      message: `Your ${bill.billMonth} bill is ready. Total amount due: ₹${bill.totalAmount}. Due date: ${formattedBill.dueDate}. Status: ${bill.status}`
    });
  } catch (error) {
    console.error("viewBill error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const downloadStatement = async (req, res) => {
  const { userId, pin, billMonth } = req.body;

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

    // Get current month if not specified
    const today = new Date();
    const currentMonth = billMonth || `${today.toLocaleString("en-US", { month: "short" })}-${today.getFullYear()}`;

    let bill = await Bill.findOne({ userId: user.username, billMonth: currentMonth });

    if (!bill) {
      return res.json({
        success: false,
        message: `No bill found for ${currentMonth}. Please request to view bill first.`
      });
    }

    // Generate PDF
    const pdfBuffer = await generatePDFStatement(bill, user);

    // Send PDF as download
    const filename = `Statement_${user.username}_${bill.billMonth}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    console.error("downloadStatement error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getBillHistory = async (req, res) => {
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

    // Get last 6 bills
    const bills = await Bill.find({ userId: user.username })
      .sort({ billMonth: -1 })
      .limit(6);

    if (bills.length === 0) {
      return res.json({
        success: true,
        bills: [],
        message: "No bill history found."
      });
    }

    const formattedBills = bills.map((bill) => ({
      billMonth: bill.billMonth,
      totalAmount: bill.totalAmount,
      paidAmount: bill.paidAmount,
      status: bill.status,
      dueDate: bill.dueDate.toISOString().split("T")[0]
    }));

    return res.json({
      success: true,
      bills: formattedBills,
      message: `Bill history for last ${formattedBills.length} months retrieved.`
    });
  } catch (error) {
    console.error("getBillHistory error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBillingAddress = async (req, res) => {
  const { userId, password, newAddress } = req.body;

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
        message: "Incorrect password. Update failed."
      });
    }

    if (!newAddress || newAddress.trim().length === 0) {
      return res.json({
        success: false,
        message: "Please provide a valid address."
      });
    }

    user.address = newAddress;
    await user.save();

    return res.json({
      success: true,
      message: `Billing address updated successfully. New address: ${newAddress}`
    });
  } catch (error) {
    console.error("updateBillingAddress error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
