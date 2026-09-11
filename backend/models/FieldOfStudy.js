import mongoose from "mongoose";

const fieldOfStudySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    description: {
      type: String,
      trim: true
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

const FieldOfStudy = mongoose.model(
  "FieldOfStudy",
  fieldOfStudySchema
);

export default FieldOfStudy;