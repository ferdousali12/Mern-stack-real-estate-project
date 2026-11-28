import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    //user input required
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "agent", "owner", "buyer"],
      default: "buyer",
    },
    status: {
      type: String,
      enum: ["active", "disabled"],
      default: "active",
    },
  },
  { timestamps: true },
);
const User = mongoose.model("User", userSchema);

export default User;
