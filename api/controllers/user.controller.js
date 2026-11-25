import User from "../model/user.model.js";
import bcrypt from "bcryptjs";
import { errorHandler } from "../error.js";

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.userId) {
    return next(errorHandler(403, "You can only update your own profile"));
  }

  const { username, email, password } = req.body;

  if (!username && !email && !password) {
    return next(errorHandler(400, "Nothing to update"));
  }

  if (password && password.length < 6) {
    return next(errorHandler(400, "Password must be at least 6 characters"));
  }

  try {
    const updates = {};

    if (username) updates.username = username;
    if (email) updates.email = email;
    if (password) updates.password = bcrypt.hashSync(password, 10);

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: updates },
      { new: true },
    ).select("-password");

    if (!updatedUser) {
      return next(errorHandler(404, "User not found"));
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
};
