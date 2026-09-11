import mongoose from "mongoose";

const approvalHistorySchema = new mongoose.Schema(
  {
    rndProgram: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RNDProgram",
      required: true,
      index: true
    },
    action: {
      type: String,
      enum: ["SUBMITTED", "FORWARDED", "OBJECTED", "REJECTED", "APPROVED"],
      required: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    previousStatus: {
      type: String,
      required: true
    },
    newStatus: {
      type: String,
      required: true
    },
    comment: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const ApprovalHistory = mongoose.model(
  "ApprovalHistory",
  approvalHistorySchema
);

export default ApprovalHistory;
