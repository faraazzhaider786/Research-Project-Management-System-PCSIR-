import express from "express";

import {
  getRNDPrograms,
  getRNDProgramById,
  createRNDProgram,
  updateRNDProgram,
  deleteRNDProgram,
  submitRNDProgram,
  forwardRNDProgram,
  objectRNDProgram,
  rejectRNDProgram,
  approveRNDProgram,
  getRNDProgramHistory,
  detectLapsedPrograms
} from "../controllers/rndProgramController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", protect, getRNDPrograms);
router.post("/detect-lapsed", protect, authorize("admin"), async (req, res) => {
  try {
    const updatedCount = await detectLapsedPrograms();
    res.status(200).json({
      message: `${updatedCount} overdue active project(s) marked as lapsed`,
      updatedCount
    });
  } catch (error) {
    console.error("Detect lapsed projects error:", error);
    res.status(500).json({ message: "Unable to detect lapsed projects" });
  }
});
router.get("/:id/history", protect, getRNDProgramHistory);
router.get("/:id", protect, getRNDProgramById);

router.post("/", protect, authorize("admin"), createRNDProgram);
router.put("/:id", protect, authorize("admin"), updateRNDProgram);
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteRNDProgram
);

router.post("/:id/submit", protect, authorize("admin"), submitRNDProgram);
router.post(
  "/:id/forward",
  protect,
  authorize("director_pnd"),
  forwardRNDProgram
);
router.post(
  "/:id/object",
  protect,
  authorize("director_pnd", "director_rd"),
  objectRNDProgram
);
router.post(
  "/:id/reject",
  protect,
  authorize("director_pnd", "director_rd"),
  rejectRNDProgram
);
router.post(
  "/:id/approve",
  protect,
  authorize("director_rd"),
  approveRNDProgram
);
export default router;
