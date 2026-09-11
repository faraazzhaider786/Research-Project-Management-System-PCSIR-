import express from "express";

import {
  getFieldsOfStudy,
  getFieldOfStudyById,
  createFieldOfStudy,
  updateFieldOfStudy,
  deleteFieldOfStudy
} from "../controllers/fieldOfStudyController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();


// Authenticated users can view fields
router.get("/", protect, getFieldsOfStudy);

router.get("/:id", protect, getFieldOfStudyById);


// Only admin can manage fields
router.post(
  "/",
  protect,
  authorize("admin"),
  createFieldOfStudy
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateFieldOfStudy
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteFieldOfStudy
);

export default router;