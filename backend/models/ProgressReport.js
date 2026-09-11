import mongoose from "mongoose";

const progressReportSchema = new mongoose.Schema(
  {
    rndProgram: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RNDProgram",
      required: true
    },
    reportingPeriod: {
      type: String,
      required: true,
      trim: true
    },
    percentageComplete: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    workCompleted: {
      type: String,
      required: true,
      trim: true
    },
    currentActivities: {
      type: String,
      trim: true
    },
    problemsRisks: {
      type: String,
      trim: true
    },
    nextPlannedActivities: {
      type: String,
      trim: true
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

progressReportSchema.index({ rndProgram: 1, createdAt: -1 });

export default mongoose.model("ProgressReport", progressReportSchema);
