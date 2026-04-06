import mongoose from "mongoose";

const { Schema } = mongoose;

const transactionSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
    },
    description: {
      type: String,
    },
    paymentMethod: {
      type: String,
      enum: ["card", "upi", "netbanking"],
      // required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      //  required: true,
    },
  },
  { timestamps: true },
);

export const Transaction = mongoose.model("transaction", transactionSchema);
