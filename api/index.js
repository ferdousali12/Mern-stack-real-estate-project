import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import authrouter from "./routes/auth.route.js";
import userrouter from "./routes/user.route.js";
import listingrouter from "./routes/listing.route.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/estate")
  .then(() => console.log("Connected to estate DB!"))
  .catch((err) => console.error("Connection error:", err));

app.listen(3000, () => {
  console.log("the server is on the 3000 port");
});

app.use("/api/auth", authrouter);
app.use("/api/user", userrouter);
app.use("/api/listing", listingrouter);

app.use((err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err.code === 11000) {
    statusCode = 409;
    message = "Username or email is already in use";
  }

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
