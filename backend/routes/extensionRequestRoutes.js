import express from "express";
import {
  createExtensionRequest,
  forwardExtensionRequest,
  getExtensionRequests,
  reviewExtensionRequest
} from "../controllers/extensionRequestController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", protect, getExtensionRequests);
router.post("/", protect, authorize("employee"), createExtensionRequest);
router.post("/:id/forward", protect, authorize("admin"), forwardExtensionRequest);
router.post("/:id/review", protect, authorize("director_pnd"), reviewExtensionRequest);

export default router;
