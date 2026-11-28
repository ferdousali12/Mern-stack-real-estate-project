import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import authrouter from "./routes/auth.route.js";
import userrouter from "./routes/user.route.js";
import listingrouter from "./routes/listing.route.js";
import adminrouter from "./routes/admin.route.js";
import User from "./model/user.model.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/estate")
  .then(async () => {
    console.log("Connected to estate DB!");

    await Promise.all([
      User.updateMany(
        { role: { $exists: false } },
        { $set: { role: "buyer" } },
      ),
      User.updateMany(
        { status: { $exists: false } },
        { $set: { status: "active" } },
      ),
    ]);
  })
  .catch((err) => console.error("Connection error:", err));

app.listen(3000, () => {
  console.log("the server is on the 3000 port");
});

app.use("/api/auth", authrouter);
app.use("/api/user", userrouter);
app.use("/api/listing", listingrouter);
app.use("/api/admin", adminrouter);

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
