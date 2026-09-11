import mongoose from "mongoose";

const psdpProjectSchema = new mongoose.Schema(
  {
    referenceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    startYear: {
      type: Number
    },

    endYear: {
      type: Number
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

const PSDPProject = mongoose.model(
  "PSDPProject",
  psdpProjectSchema
);

export default PSDPProject;