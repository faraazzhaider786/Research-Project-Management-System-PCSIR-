import express from "express";

import {
  getLabs,
  getLabsByComplex,
  getLabById,
  createLab,
  updateLab,
  deleteLab
} from "../controllers/labController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();


// Authenticated users can view labs
router.get("/", protect, getLabs);

router.get("/complex/:complexId", protect, getLabsByComplex);

router.get("/:id", protect, getLabById);


// Only admin can manage labs
router.post(
  "/",
  protect,
  authorize("admin"),
  createLab
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateLab
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteLab
);

export default router;