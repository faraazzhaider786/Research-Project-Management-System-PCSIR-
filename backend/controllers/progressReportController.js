import ProgressReport from "../models/ProgressReport.js";
import RNDProgram from "../models/RNDProgram.js";

const canAccessProgram = (program, user) => {
  if (!program) return false;
  if (["admin", "director_pnd", "director_rd"].includes(user.role)) return true;
  const employeeId = user.employee?._id?.toString();
  return user.role === "employee" && employeeId
    && [program.projectLeader, ...(program.associates || [])]
      .some((id) => id.toString() === employeeId);
};

const reportPopulation = (query) => query
  .populate("rndProgram", "title rndId status progressPercentage projectLeader associates")
  .populate("submittedBy", "email role employee");

export const getProgressReports = async (req, res) => {
  try {
    const reports = await reportPopulation(
      ProgressReport.find().sort({ createdAt: -1 })
    );
    const visible = reports.filter((report) => canAccessProgram(report.rndProgram, req.user));
    res.status(200).json(visible);
  } catch (error) {
    console.error("Get progress reports error:", error);
    res.status(500).json({ message: "Unable to load progress reports" });
  }
};

export const createProgressReport = async (req, res) => {
  try {
    if (!["employee", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Only employees or administrators can submit progress reports" });
    }
    const {
      rndProgram,
      reportingPeriod,
      percentageComplete,
      workCompleted,
      currentActivities,
      problemsRisks,
      nextPlannedActivities
    } = req.body;
    const program = await RNDProgram.findById(rndProgram);

    if (!canAccessProgram(program, req.user)) {
      return res.status(403).json({ message: "You are not assigned to this project" });
    }
    if (!reportingPeriod || !workCompleted || percentageComplete === undefined) {
      return res.status(400).json({ message: "Reporting period, completion percentage, and work completed are required" });
    }
    const percentage = Number(percentageComplete);
    if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
      return res.status(400).json({ message: "Completion percentage must be between 0 and 100" });
    }

    const report = await ProgressReport.create({
      rndProgram,
      reportingPeriod,
      percentageComplete: percentage,
      workCompleted,
      currentActivities,
      problemsRisks,
      nextPlannedActivities,
      submittedBy: req.user._id
    });

    program.progressPercentage = percentage;
    if (percentage === 100) program.status = "COMPLETED";
    await program.save();

    const populatedReport = await reportPopulation(ProgressReport.findById(report._id));
    res.status(201).json({ message: "Progress report submitted successfully", report: populatedReport });
  } catch (error) {
    console.error("Create progress report error:", error);
    res.status(500).json({ message: "Unable to submit progress report" });
  }
};
