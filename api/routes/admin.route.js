import express from "express";
import {
  getUsers,
  updateUserRole,
  updateUserStatus,
} from "../controllers/admin.controller.js";
import { requireRole, verifyUser } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(verifyUser, requireRole("admin"));
router.get("/users", getUsers);
router.patch("/users/:userId/role", updateUserRole);
router.patch("/users/:userId/status", updateUserStatus);

export default router;
