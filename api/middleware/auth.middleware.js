import jwt from "jsonwebtoken";
import User from "../model/user.model.js";
import { errorHandler } from "../error.js";

export const verifyUser = (req, res, next) => {
  const token = req.cookies?.access_token;

  if (!token) {
    return next(errorHandler(401, "You must be signed in"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    next(errorHandler(401, "Your session is invalid or has expired"));
  }
};

export const requireRole =
  (...roles) =>
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id).select("role status");

      if (!user) {
        return next(errorHandler(401, "Your session is invalid"));
      }

      if (user.status === "disabled") {
        return next(errorHandler(403, "Your account has been disabled"));
      }

      if (!roles.includes(user.role)) {
        return next(errorHandler(403, "You do not have permission to perform this action"));
      }

      req.authUser = user;
      next();
    } catch (err) {
      next(err);
    }
  };
