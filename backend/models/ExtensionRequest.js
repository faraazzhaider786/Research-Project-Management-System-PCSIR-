import mongoose from "mongoose";

const extensionRequestSchema = new mongoose.Schema(
  {
    rndProgram: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RNDProgram",
      required: true,
      index: true
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    currentCompletionPercentage: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    currentCompletionDate: {
      type: Date,
      required: true
    },
    requestedCompletionDate: {
      type: Date,
      required: true
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    recoveryPlan: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["REQUESTED", "UNDER_REVIEW", "APPROVED", "REJECTED"],
      default: "REQUESTED"
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    reviewComment: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("ExtensionRequest", extensionRequestSchema);
