import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    designation: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      trim: true,
      lowercase: true
    },

    complex: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complex"
    },

    lab: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lab"
    },

    center: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Center"
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;