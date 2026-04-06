import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";

const app = express();

// middlewares

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    Credential: true,
  }),
);
app.use(express.json({ limit: "20kb" }));

app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public"));
app.use(cookieParser());

import userRouter from "./routes/user.route.js";
import transactionRouter from "./routes/transaction.route.js";

// routes declaration once
//app.use("/users", userRouter);

app.use("/api/v2/users", userRouter);
app.use("/api/v2", transactionRouter);
export default app;
