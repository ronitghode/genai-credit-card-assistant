import express from "express";
import { viewBill, downloadStatement, getBillHistory, updateBillingAddress } from "../controllers/billController.js";

const router = express.Router();

router.post("/view-bill", viewBill);
router.post("/download-statement", downloadStatement);
router.post("/bill-history", getBillHistory);
router.post("/update-billing-address", updateBillingAddress);

export default router;
