import express from "express";
import { createProgressReport, getProgressReports } from "../controllers/progressReportController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getProgressReports);
router.post("/", protect, createProgressReport);

export default router;
