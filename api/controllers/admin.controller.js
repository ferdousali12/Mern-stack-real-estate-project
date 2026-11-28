import User from "../model/user.model.js";
import { errorHandler } from "../error.js";

const allowedRoles = ["admin", "agent", "owner", "buyer"];
const allowedStatuses = ["active", "disabled"];

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!allowedRoles.includes(role)) {
      return next(errorHandler(400, "Invalid role"));
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: { role } },
      { new: true },
    ).select("-password");

    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return next(errorHandler(400, "Invalid status"));
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: { status } },
      { new: true },
    ).select("-password");

    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};
