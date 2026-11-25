import jwt from "jsonwebtoken";
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
