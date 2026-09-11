import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import Employee from "./models/Employee.js";
import User from "./models/User.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      email: "admin@pcsir.gov.pk"
    });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit(0);
    }

    // Create employee
    const employee = await Employee.create({
      employeeId: "ADMIN001",
      name: "System Administrator",
      designation: "Administrator",
      email: "admin@pcsir.gov.pk"
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(
      "Admin@123",
      10
    );

    // Create admin user
    const admin = await User.create({
      employee: employee._id,
      email: "admin@pcsir.gov.pk",
      password: hashedPassword,
      role: "admin"
    });

    console.log("Admin created successfully");
    console.log("Email:", admin.email);
    console.log("Password: Admin@123");

    await mongoose.connection.close();

    process.exit(0);

  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();