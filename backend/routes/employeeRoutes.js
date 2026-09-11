import express from "express";

import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} from "../controllers/employeeController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();


// Anyone authenticated can view employees
router.get("/", protect, getEmployees);

router.get("/:id", protect, getEmployeeById);


// Only admin can create employees
router.post(
  "/",
  protect,
  authorize("admin"),
  createEmployee
);


// Only admin can update employees
router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateEmployee
);


// Only admin can delete employees
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteEmployee
);

export default router;