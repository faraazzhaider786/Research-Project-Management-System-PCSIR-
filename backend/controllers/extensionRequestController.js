import ExtensionRequest from "../models/ExtensionRequest.js";
import RNDProgram from "../models/RNDProgram.js";
import ApprovalHistory from "../models/ApprovalHistory.js";

const findProgram = (id) => RNDProgram.findById(id);
const employeeIdOf = (user) => user.employee?._id?.toString();

const isLeader = (program, user) => (
  user.role === "employee"
  && employeeIdOf(user)
  && program.projectLeader.toString() === employeeIdOf(user)
);

const canViewProgram = (program, user) => (
  user.role === "admin"
  || user.role === "director_pnd"
  || user.role === "director_rd"
  || isLeader(program, user)
  || (user.role === "employee" && program.associates.some((id) => id.toString() === employeeIdOf(user)))
);

const populateRequest = (query) => query
  .populate({
    path: "rndProgram",
    select: "title rndId status progressPercentage scheduledCompletionDate projectLeader associates"
  })
  .populate("requestedBy", "email role employee")
  .populate("reviewedBy", "email role");

const recordExtensionHistory = async (request, action, previousStatus, newStatus, user, comment) => (
  ApprovalHistory.create({
    rndProgram: request.rndProgram,
    action,
    performedBy: user._id,
    previousStatus,
    newStatus,
    comment
  })
);

export const getExtensionRequests = async (req, res) => {
  try {
    const requests = await populateRequest(
      ExtensionRequest.find().sort({ createdAt: -1 })
    );
    res.status(200).json(requests.filter((request) => canViewProgram(request.rndProgram, req.user)));
  } catch (error) {
    console.error("Get extension requests error:", error);
    res.status(500).json({ message: "Unable to load extension requests" });
  }
};

export const createExtensionRequest = async (req, res) => {
  try {
    const program = await findProgram(req.body.rndProgram);
    if (!program) return res.status(404).json({ message: "R&D program not found" });
    if (!isLeader(program, req.user)) return res.status(403).json({ message: "Only the project leader can request an extension" });
    if (!["ACTIVE", "LAPSED"].includes(program.status)) return res.status(400).json({ message: "Extensions can only be requested for active or lapsed projects" });

    const requestedDate = new Date(req.body.requestedCompletionDate);
    if (!req.body.reason?.trim() || !req.body.recoveryPlan?.trim() || Number.isNaN(requestedDate.getTime())) {
      return res.status(400).json({ message: "Requested date, reason, and recovery plan are required" });
    }
    if (requestedDate <= program.scheduledCompletionDate) {
      return res.status(400).json({ message: "Requested completion date must be later than the current deadline" });
    }
    const existing = await ExtensionRequest.findOne({
      rndProgram: program._id,
      status: { $in: ["REQUESTED", "UNDER_REVIEW"] }
    });
    if (existing) return res.status(409).json({ message: "This project already has an extension request under review" });

    const request = await ExtensionRequest.create({
      rndProgram: program._id,
      requestedBy: req.user._id,
      currentCompletionPercentage: program.progressPercentage,
      currentCompletionDate: program.scheduledCompletionDate,
      requestedCompletionDate: requestedDate,
      reason: req.body.reason,
      recoveryPlan: req.body.recoveryPlan
    });
    const previousStatus = program.status;
    program.status = "EXTENSION_REQUESTED";
    await program.save();
    await recordExtensionHistory(request, "EXTENSION_REQUESTED", previousStatus, program.status, req.user, req.body.reason);
    res.status(201).json({ message: "Extension request submitted successfully", request: await populateRequest(ExtensionRequest.findById(request._id)) });
  } catch (error) {
    console.error("Create extension request error:", error);
    res.status(500).json({ message: "Unable to submit extension request" });
  }
};

export const forwardExtensionRequest = async (req, res) => {
  try {
    const request = await ExtensionRequest.findById(req.params.id).populate("rndProgram");
    if (!request) return res.status(404).json({ message: "Extension request not found" });
    if (request.status !== "REQUESTED" || request.rndProgram.status !== "EXTENSION_REQUESTED") return res.status(400).json({ message: "This extension request is not awaiting administrative review" });
    const previousStatus = request.rndProgram.status;
    request.rndProgram.status = "EXTENSION_REVIEW";
    await request.rndProgram.save();
    request.status = "UNDER_REVIEW";
    request.reviewedBy = req.user._id;
    request.reviewComment = req.body.comment?.trim();
    await request.save();
    await recordExtensionHistory(request, "EXTENSION_FORWARDED", previousStatus, "EXTENSION_REVIEW", req.user, request.reviewComment);
    res.status(200).json({ message: "Extension request forwarded for director review" });
  } catch (error) {
    console.error("Forward extension request error:", error);
    res.status(500).json({ message: "Unable to forward extension request" });
  }
};

export const reviewExtensionRequest = async (req, res) => {
  try {
    const request = await ExtensionRequest.findById(req.params.id).populate("rndProgram");
    if (!request) return res.status(404).json({ message: "Extension request not found" });
    if (
      request.status !== "UNDER_REVIEW"
      || !["EXTENSION_REQUESTED", "EXTENSION_REVIEW"].includes(request.rndProgram.status)
    ) {
      return res.status(400).json({ message: "This extension request is not awaiting director review" });
    }
    const comment = req.body.comment?.trim();
    if (!comment) return res.status(400).json({ message: "A review comment is required" });
    const approved = req.body.decision === "approve";
    const previousStatus = request.rndProgram.status;
    if (request.rndProgram.status === "EXTENSION_REQUESTED") {
      request.rndProgram.status = "EXTENSION_REVIEW";
    }
    request.status = approved ? "APPROVED" : "REJECTED";
    request.reviewedBy = req.user._id;
    request.reviewComment = comment;
    await request.save();
    request.rndProgram.status = approved ? "ACTIVE" : "LAPSED";
    if (approved) request.rndProgram.scheduledCompletionDate = request.requestedCompletionDate;
    await request.rndProgram.save();
    await recordExtensionHistory(request, approved ? "EXTENSION_APPROVED" : "EXTENSION_REJECTED", previousStatus, request.rndProgram.status, req.user, comment);
    res.status(200).json({ message: `Extension request ${approved ? "approved" : "rejected"} successfully` });
  } catch (error) {
    console.error("Review extension request error:", error);
    res.status(500).json({ message: "Unable to review extension request" });
  }
};
