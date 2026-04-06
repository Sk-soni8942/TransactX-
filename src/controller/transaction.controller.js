import { Transaction } from "../model/transaction.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTransaction = asyncHandler(async (req, res) => {
  const { amount, type, category, date, description } = req.body;

  if (!amount || !type || !category) {
    throw new ApiError(400, "Amount, type and category are required");
  }

  const transaction = await Transaction.create({
    user: req.user._id,
    amount,
    type,
    category,
    date,
    description,
  });

  return res.status(200).json(new ApiResponse(200, transaction));
});

const getTransactions = asyncHandler(async (req, res) => {
  const { type, category, startDate, endDate } = req.query;

  let filter = { user: req.user._id };

  if (type) filter.type = type;
  if (category) filter.category = category;

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const transactions = await Transaction.find(filter).sort({ date: -1 });

  return res.status(200).json(new ApiResponse(200, transactions));
});


const updateTransaction = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;

  const transaction = await Transaction.findById(transactionId);

  if (!transaction) {
    res.status(404);
    throw new Error("Transaction not found");
  }


  if (transaction.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Unauthorized");
  }

  const updated = await Transaction.findByIdAndUpdate(transactionId, req.body, {
    new: true,
  });

  res.status(200).json(updated);
});


const deleteTransaction = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;

  const transaction = await Transaction.findById(transactionId);

  if (!transaction) {
    res.status(404);
    throw new Error("Transaction not found");
  }

  if (transaction.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Unauthorized");
  }

  await Transaction.findByIdAndDelete(transactionId);

  res.status(200).json({ message: "Transaction deleted" });
});

export {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
};
