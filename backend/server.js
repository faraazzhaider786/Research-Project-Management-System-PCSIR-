import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import complexRoutes from "./routes/complexRoutes.js";
import labRoutes from "./routes/labRoutes.js";
import centerRoutes from "./routes/centerRoutes.js";
import fieldOfStudyRoutes from "./routes/fieldOfStudyRoutes.js";
import fundingAgencyRoutes from "./routes/fundingAgencyRoutes.js";
import psdpProjectRoutes from "./routes/psdpProjectRoutes.js";
import rndProgramRoutes from "./routes/rndProgramRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/complexes", complexRoutes);
app.use("/api/labs", labRoutes);
app.use("/api/centers", centerRoutes);
app.use("/api/fields-of-study", fieldOfStudyRoutes);
app.use("/api/funding-agencies", fundingAgencyRoutes);
app.use("/api/psdp-projects", psdpProjectRoutes);
app.use("/api/rnd-programs", rndProgramRoutes);
app.use("/api/users", userRoutes);
app.get("/", (req, res) => {
  res.json({
    message: "PCSIR Research Project Management System API is running"
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();