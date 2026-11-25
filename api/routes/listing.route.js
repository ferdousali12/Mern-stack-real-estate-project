import express from "express";
import {
  createListing,
  deleteListing,
  getListing,
  getListings,
  updateListing,
} from "../controllers/listing.controller.js";
import { verifyUser } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getListings);
router.get("/get", getListings);
router.get("/:id", getListing);
router.post("/create", verifyUser, createListing);
router.put("/update/:id", verifyUser, updateListing);
router.delete("/delete/:id", verifyUser, deleteListing);

export default router;
