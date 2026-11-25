import express from "express";
import { updateUser } from "../controllers/user.controller.js";
import { verifyUser } from "../middleware/auth.middleware.js";

const router = express.Router();

router.put("/:userId/update", verifyUser, updateUser);

export default router;
