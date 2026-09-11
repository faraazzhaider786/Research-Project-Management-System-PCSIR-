import bcrypt from "bcryptjs";
import Employee from "../models/Employee.js";
import User from "../models/User.js";

const allowedRoles = [
  "admin",
  "employee",
  "director_pnd",
  "director_rd"
];

const safeUserQuery = (query) =>
  query.select("-password").populate("employee", "employeeId name designation email");

const isAllowedRole = (role) => allowedRoles.includes(role);

// Get all login accounts
export const getUsers = async (req, res) => {
  try {
    const users = await safeUserQuery(User.find().sort({ createdAt: -1 }));
    res.status(200).json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Failed to fetch user accounts" });
  }
};

// Get one login account
export const getUserById = async (req, res) => {
  try {
    const user = await safeUserQuery(User.findById(req.params.id));

    if (!user) {
      return res.status(404).json({ message: "User account not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Failed to fetch user account" });
  }
};

// Create a login account for an existing employee
export const createUser = async (req, res) => {
  try {
    const { employee, email, password, role = "employee" } = req.body;

    if (!employee || !email || !password) {
      return res.status(400).json({
        message: "Employee, email and password are required"
      });
    }

    if (!isAllowedRole(role)) {
      return res.status(400).json({
        message: "Invalid role"
      });
    }

    const employeeRecord = await Employee.findById(employee);
    if (!employeeRecord) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const [existingEmail, existingEmployee] = await Promise.all([
      User.findOne({ email: email.toLowerCase().trim() }),
      User.findOne({ employee })
    ]);

    if (existingEmail) {
      return res.status(400).json({ message: "Email already has an account" });
    }

    if (existingEmployee) {
      return res.status(400).json({
        message: "This employee already has a login account"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      employee,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role
    });

    const safeUser = await safeUserQuery(User.findById(user._id));
    res.status(201).json({
      message: "User account created successfully",
      user: safeUser
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "Failed to create user account" });
  }
};

// Update account details; password is replaced only when supplied
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User account not found" });
    }

    const { email, password, role, isActive } = req.body;

    if (role !== undefined && !isAllowedRole(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (email !== undefined) {
      const normalizedEmail = email.toLowerCase().trim();
      const duplicateEmail = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: user._id }
      });

      if (duplicateEmail) {
        return res.status(400).json({ message: "Email already has an account" });
      }

      user.email = normalizedEmail;
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();
    const safeUser = await safeUserQuery(User.findById(user._id));

    res.status(200).json({
      message: "User account updated successfully",
      user: safeUser
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Failed to update user account" });
  }
};

// Permanently remove a login account
export const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        message: "You cannot delete your own account"
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User account not found" });
    }

    await user.deleteOne();
    res.status(200).json({ message: "User account deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Failed to delete user account" });
  }
};
