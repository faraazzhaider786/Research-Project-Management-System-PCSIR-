import express from "express";

import {
  getCenters,
  getCenterById,
  createCenter,
  updateCenter,
  deleteCenter
} from "../controllers/centerController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();


// Anyone authenticated can view centers
router.get("/", protect, getCenters);

router.get("/:id", protect, getCenterById);


// Only admin can manage centers
router.post(
  "/",
  protect,
  authorize("admin"),
  createCenter
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateCenter
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteCenter
);

export default router;