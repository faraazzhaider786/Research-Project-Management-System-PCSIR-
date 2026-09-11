import mongoose from "mongoose";

const labSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    code: {
      type: String,
      required: true,
      trim: true
    },

    complex: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complex",
      required: true
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

const Lab = mongoose.model("Lab", labSchema);

export default Lab;