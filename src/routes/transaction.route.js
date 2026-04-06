import express from "express";
import {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} from "../controller/transaction.controller.js";

import { verifyJWT } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorization.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
const router = express.Router();

router
  .route("/transactions")
  .post(upload.none(), verifyJWT, authorizeRoles("admin"), createTransaction);

router
  .route("/transactions")
  .get(
    upload.none(),
    verifyJWT,
    authorizeRoles("admin", "analyst", "viewer"),
    getTransactions,
  );

router
  .route("/transactions/:transactionId")
  .patch(verifyJWT, authorizeRoles("admin", "analyst"), updateTransaction)
  .delete(verifyJWT, authorizeRoles("admin"), deleteTransaction);

export default router;
