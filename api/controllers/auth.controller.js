import User from "../model/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { errorHandler } from "../error.js";

const cookieOptions = {
  httpOnly: true,
  sameSite: "strict",
  secure: process.env.NODE_ENV === "production",
};

const createToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return next(errorHandler(400, "Username, email, and password are required"));
  }

  if (password.length < 6) {
    return next(errorHandler(400, "Password must be at least 6 characters"));
  }

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      return next(errorHandler(409, "Username or email is already in use"));
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });

    await newUser.save();

    const { password: pass, ...rest } = newUser._doc;

    res
      .cookie("access_token", createToken(newUser), cookieOptions)
      .status(201)
      .json(rest);
  } catch (err) {
    next(err);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(errorHandler(400, "Email and password are required"));
  }

  try {
    const validUser = await User.findOne({ email });

    if (!validUser) {
      return next(errorHandler(404, "User not found!"));
    }

    const validPassword = bcrypt.compareSync(password, validUser.password);

    if (!validPassword) {
      return next(errorHandler(401, "Wrong credentials"));
    }

    const token = createToken(validUser);
    const { password: pass, ...rest } = validUser._doc;

    res.cookie("access_token", token, cookieOptions).status(200).json(rest);
  } catch (err) {
    next(err);
  }
};

export const signout = (req, res) => {
  res
    .clearCookie("access_token", cookieOptions)
    .status(200)
    .json("User signed out");
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};
