import express from "express";

import {
  getFundingAgencies,
  getFundingAgencyById,
  createFundingAgency,
  updateFundingAgency,
  deleteFundingAgency
} from "../controllers/fundingAgencyController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();


// Authenticated users can view funding agencies
router.get("/", protect, getFundingAgencies);

router.get("/:id", protect, getFundingAgencyById);


// Only admin can manage funding agencies
router.post(
  "/",
  protect,
  authorize("admin"),
  createFundingAgency
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateFundingAgency
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteFundingAgency
);

export default router;