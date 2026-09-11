import express from "express";

import {
  getComplexes,
  getComplexById,
  createComplex,
  updateComplex,
  deleteComplex
} from "../controllers/complexController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();


// Authenticated users can view complexes
router.get("/", protect, getComplexes);

router.get("/:id", protect, getComplexById);


// Only admin can manage complexes
router.post(
  "/",
  protect,
  authorize("admin"),
  createComplex
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateComplex
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteComplex
);

export default router;