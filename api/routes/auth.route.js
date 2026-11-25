import express from "express";
import {
  signup,
  signin,
  signout,
  getMe,
} from "../controllers/auth.controller.js";
import { verifyUser } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/signout", signout);
router.get("/me", verifyUser, getMe);

export default router;
