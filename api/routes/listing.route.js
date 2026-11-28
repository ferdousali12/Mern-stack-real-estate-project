import express from "express";
import {
  createListing,
  deleteListing,
  getListing,
  getListings,
  updateListing,
} from "../controllers/listing.controller.js";
import { requireRole, verifyUser } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getListings);
router.get("/get", getListings);
router.get("/:id", getListing);
router.post("/create", verifyUser, requireRole("admin", "agent", "owner"), createListing);
router.put("/update/:id", verifyUser, requireRole("admin", "agent", "owner"), updateListing);
router.delete("/delete/:id", verifyUser, requireRole("admin", "agent", "owner"), deleteListing);

export default router;
