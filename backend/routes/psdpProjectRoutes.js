import express from "express";

import {
  getPSDPProjects,
  getPSDPProjectById,
  createPSDPProject,
  updatePSDPProject,
  deletePSDPProject
} from "../controllers/psdpProjectController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Authenticated users can view PSDP projects
router.get("/", protect, getPSDPProjects);

router.get("/:id", protect, getPSDPProjectById);

// Only admin can manage PSDP projects
router.post(
  "/",
  protect,
  authorize("admin"),
  createPSDPProject
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  updatePSDPProject
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deletePSDPProject
);

export default router;
