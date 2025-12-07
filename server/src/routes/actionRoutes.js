import express from "express";
import { blockCard, increaseLimit, checkBalance, viewCardDetails, checkCreditScore, addFunds, payBill, viewTransactions, checkEMI, payEMI, checkCardDeliveryStatus } from "../controllers/actionController.js";

const router = express.Router();

router.post("/block-card", blockCard);
router.post("/increase-limit", increaseLimit);
router.post("/check-balance", checkBalance);
router.post("/view-card-details", viewCardDetails);
router.post("/check-credit-score", checkCreditScore);
router.post("/add-funds", addFunds);
router.post("/pay-bill", payBill);
router.post("/view-transactions", viewTransactions);
router.post("/check-emi", checkEMI);
router.post("/pay-emi", payEMI);
router.post("/check-card-delivery-status", checkCardDeliveryStatus);

export default router;
