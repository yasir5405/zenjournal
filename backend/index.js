import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth.route.js";
import { journalRouter } from "./routes/journal.route.js";
import { connectDB } from "./config/db.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { verifyJWT } from "./middlewares/auth.middleware.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // Allow cookies to be sent with requests
  })
);
app.use(cookieParser());

connectDB();

app.get("/", (req, res) => {
  res.status(200).json({
    message:
      "Welcome to ZenJournal - a Mental Health Logging + AI Reflection app",
  });
});

app.get("/test", (req, res, next) => {
  const error = new Error("Test Error.");
  error.statusCode = 690;
  next(error);
});

// Debug route to test authentication
app.get("/auth/test-protected", verifyJWT, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Authentication working correctly",
    userId: req.userId,
  });
});

app.use("/auth", authRouter);
app.use("/journal", journalRouter);

//Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`The server is running on: http://localhost:${PORT}`);
});
