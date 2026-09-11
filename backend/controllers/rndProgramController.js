import RNDProgram from "../models/RNDProgram.js";
import ApprovalHistory from "../models/ApprovalHistory.js";

const programPopulation = [
  { path: "complex", select: "name code" },
  { path: "lab", select: "name code" },
  { path: "center", select: "name code" },
  { path: "projectLeader", select: "employeeId name designation" },
  { path: "associates", select: "employeeId name designation" },
  { path: "fieldsOfStudy", select: "name description" },
  { path: "fundingAgency", select: "name description" },
  { path: "psdpProject", select: "referenceNumber title" },
  { path: "createdBy", select: "email role" }
];

const populateProgram = (query) => {
  programPopulation.forEach((population) => {
    query.populate(population);
  });

  return query;
};

export const detectLapsedPrograms = async () => {
  const now = new Date();
  const result = await RNDProgram.updateMany(
    {
      status: "ACTIVE",
      scheduledCompletionDate: { $lt: now },
      progressPercentage: { $lt: 100 }
    },
    {
      $set: {
        status: "LAPSED",
        lapsedAt: now
      }
    }
  );

  return result.modifiedCount;
};

const getVisibilityFilter = (user) => {
  if (user.role === "admin") {
    return {};
  }

  if (user.role === "employee") {
    const employeeId = user.employee?._id;

    return employeeId
      ? {
          $or: [
            { projectLeader: employeeId },
            { associates: employeeId }
          ]
        }
      : { _id: null };
  }

  if (user.role === "director_pnd") {
    return { status: "SUBMITTED" };
  }

  if (user.role === "director_rd") {
    return { status: "FORWARDED" };
  }

  return { _id: null };
};

// Get all R&D programs
export const getRNDPrograms = async (req, res) => {
  try {
    await detectLapsedPrograms();
    const query = RNDProgram.find(getVisibilityFilter(req.user)).sort({
      createdAt: -1
    });
    const programs = await populateProgram(query);

    res.status(200).json(programs);
  } catch (error) {
    console.error("Get R&D programs error:", error);

    res.status(500).json({
      message: "Failed to fetch R&D programs"
    });
  }
};

// Get R&D program by ID
export const getRNDProgramById = async (req, res) => {
  try {
    await detectLapsedPrograms();
    const program = await populateProgram(
      RNDProgram.findOne({
        _id: req.params.id,
        ...getVisibilityFilter(req.user)
      })
    );

    if (!program) {
      return res.status(404).json({
        message: "R&D program not found"
      });
    }

    res.status(200).json(program);
  } catch (error) {
    console.error("Get R&D program error:", error);

    res.status(500).json({
      message: "Failed to fetch R&D program"
    });
  }
};

// Create R&D program
export const createRNDProgram = async (req, res) => {
  try {
    const {
      title,
      rndType,
      sourceOfRND,
      complex,
      lab,
      center,
      projectLeader,
      associates,
      fieldsOfStudy,
      year,
      duration,
      scheduledCompletionDate,
      background,
      objective,
      researchHighlights,
      presentStatus,
      targetsNextFiscalYear,
      collaborators,
      keywords,
      fundingAgency,
      fundsAllocatedDetails,
      psdpProject,
      socioEconomicOutcome,
      graphicalAbstract
    } = req.body;

    if (
      !title ||
      !rndType ||
      !sourceOfRND ||
      !complex ||
      !lab ||
      !projectLeader ||
      year === undefined ||
      duration === undefined ||
      !scheduledCompletionDate
    ) {
      return res.status(400).json({
        message: "Title, type, source, organization, leader and schedule details are required"
      });
    }

    const program = await RNDProgram.create({
      title,
      rndType,
      sourceOfRND,
      complex,
      lab,
      center,
      projectLeader,
      associates,
      fieldsOfStudy,
      year,
      duration,
      scheduledCompletionDate,
      background,
      objective,
      researchHighlights,
      presentStatus,
      targetsNextFiscalYear,
      collaborators,
      keywords,
      fundingAgency,
      fundsAllocatedDetails,
      psdpProject,
      socioEconomicOutcome,
      graphicalAbstract,
      createdBy: req.user._id
    });

    const populatedProgram = await populateProgram(
      RNDProgram.findById(program._id)
    );

    res.status(201).json({
      message: "R&D program created successfully",
      program: populatedProgram
    });
  } catch (error) {
    console.error("Create R&D program error:", error);

    res.status(500).json({
      message: "Failed to create R&D program"
    });
  }
};

// Update R&D program
export const updateRNDProgram = async (req, res) => {
  try {
    const program = await RNDProgram.findById(req.params.id);

    if (!program) {
      return res.status(404).json({
        message: "R&D program not found"
      });
    }

    const allowedFields = [
      "title",
      "rndType",
      "sourceOfRND",
      "complex",
      "lab",
      "center",
      "projectLeader",
      "associates",
      "fieldsOfStudy",
      "year",
      "duration",
      "scheduledCompletionDate",
      "background",
      "objective",
      "researchHighlights",
      "presentStatus",
      "targetsNextFiscalYear",
      "collaborators",
      "keywords",
      "fundingAgency",
      "fundsAllocatedDetails",
      "psdpProject",
      "socioEconomicOutcome",
      "graphicalAbstract"
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        program[field] = req.body[field];
      }
    });

    const updatedProgram = await program.save();
    const populatedProgram = await populateProgram(
      RNDProgram.findById(updatedProgram._id)
    );

    res.status(200).json({
      message: "R&D program updated successfully",
      program: populatedProgram
    });
  } catch (error) {
    console.error("Update R&D program error:", error);

    res.status(500).json({
      message: "Failed to update R&D program"
    });
  }
};

// Delete R&D program
export const deleteRNDProgram = async (req, res) => {
  try {
    const program = await RNDProgram.findById(req.params.id);

    if (!program) {
      return res.status(404).json({
        message: "R&D program not found"
      });
    }

    await program.deleteOne();

    res.status(200).json({
      message: "R&D program deleted successfully"
    });
  } catch (error) {
    console.error("Delete R&D program error:", error);

    res.status(500).json({
      message: "Failed to delete R&D program"
    });
  }
};

const getComment = (req) => (
  typeof req.body?.comment === "string" ? req.body.comment.trim() : ""
);

const findVisibleProgram = async (req) => (
  RNDProgram.findOne({
    _id: req.params.id,
    ...getVisibilityFilter(req.user)
  })
);

const recordWorkflowAction = async ({
  program,
  action,
  previousStatus,
  newStatus,
  performedBy,
  comment
}) => {
  program.status = newStatus;
  await program.save();
  await ApprovalHistory.create({
    rndProgram: program._id,
    action,
    performedBy,
    previousStatus,
    newStatus,
    comment
  });
};

const workflowError = (res, message, status = 400) => (
  res.status(status).json({ message })
);

// Submit an R&D program for P&D review.
export const submitRNDProgram = async (req, res) => {
  try {
    const program = await RNDProgram.findById(req.params.id);
    if (!program) return workflowError(res, "R&D program not found", 404);
    if (!["DRAFT", "OBJECTED"].includes(program.status)) {
      return workflowError(res, `Cannot submit a program with status ${program.status}`);
    }

    await recordWorkflowAction({
      program,
      action: "SUBMITTED",
      previousStatus: program.status,
      newStatus: "SUBMITTED",
      performedBy: req.user._id,
      comment: getComment(req)
    });

    return res.status(200).json({ message: "R&D program submitted successfully" });
  } catch (error) {
    console.error("Submit R&D program error:", error);
    return res.status(500).json({ message: "Failed to submit R&D program" });
  }
};

// Forward a submitted program to the R&D directorate.
export const forwardRNDProgram = async (req, res) => {
  try {
    const program = await RNDProgram.findById(req.params.id);
    if (!program) return workflowError(res, "R&D program not found", 404);
    if (program.status !== "SUBMITTED") {
      return workflowError(res, `Cannot forward a program with status ${program.status}`);
    }

    const comment = getComment(req);
    if (!comment) return workflowError(res, "A comment is required to forward a program");

    await recordWorkflowAction({
      program,
      action: "FORWARDED",
      previousStatus: "SUBMITTED",
      newStatus: "FORWARDED",
      performedBy: req.user._id,
      comment
    });

    return res.status(200).json({ message: "R&D program forwarded successfully" });
  } catch (error) {
    console.error("Forward R&D program error:", error);
    return res.status(500).json({ message: "Failed to forward R&D program" });
  }
};

const reviewRNDProgram = async (req, res, action) => {
  try {
    const program = await RNDProgram.findById(req.params.id);
    if (!program) return workflowError(res, "R&D program not found", 404);

    const expectedStatus = req.user.role === "director_pnd" ? "SUBMITTED" : "FORWARDED";
    if (program.status !== expectedStatus) {
      return workflowError(
        res,
        `The ${action.toLowerCase()} action is not available for status ${program.status}`
      );
    }

    const comment = getComment(req);
    if (!comment) return workflowError(res, `A comment is required to ${action.toLowerCase()} a program`);

    const newStatus = action === "OBJECTED" ? "OBJECTED" : "REJECTED";
    await recordWorkflowAction({
      program,
      action,
      previousStatus: expectedStatus,
      newStatus,
      performedBy: req.user._id,
      comment
    });

    return res.status(200).json({
      message: `R&D program ${action === "OBJECTED" ? "objected to" : "rejected"} successfully`
    });
  } catch (error) {
    console.error(`${action} R&D program error:`, error);
    return res.status(500).json({
      message: `Failed to ${action === "OBJECTED" ? "object to" : "reject"} R&D program`
    });
  }
};

export const objectRNDProgram = (req, res) => reviewRNDProgram(req, res, "OBJECTED");
export const rejectRNDProgram = (req, res) => reviewRNDProgram(req, res, "REJECTED");

const nextOfficialRndId = async (year) => {
  const prefix = `RND-${year}-`;
  const programs = await RNDProgram.find({
    rndId: { $regex: `^${prefix}\\d{4}$` }
  }).select("rndId").lean();
  const sequence = programs.reduce((highest, program) => {
    const current = Number(program.rndId.slice(-4));
    return Number.isInteger(current) && current > highest ? current : highest;
  }, 0) + 1;

  return `${prefix}${String(sequence).padStart(4, "0")}`;
};

// Approve a forwarded program and activate it with an official R&D ID.
export const approveRNDProgram = async (req, res) => {
  const comment = getComment(req);
  if (!comment) return workflowError(res, "A comment is required to approve a program");

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const program = await RNDProgram.findById(req.params.id);
      if (!program) return workflowError(res, "R&D program not found", 404);
      if (program.status !== "FORWARDED") {
        return workflowError(res, `Cannot approve a program with status ${program.status}`);
      }

      const previousStatus = program.status;
      program.rndId = await nextOfficialRndId(program.year);
      program.status = "ACTIVE";
      await program.save();
      await ApprovalHistory.create({
        rndProgram: program._id,
        action: "APPROVED",
        performedBy: req.user._id,
        previousStatus,
        newStatus: "ACTIVE",
        comment
      });

      return res.status(200).json({
        message: "R&D program approved and activated successfully",
        rndId: program.rndId
      });
    } catch (error) {
      if (error?.code === 11000 && attempt < 4) continue;
      console.error("Approve R&D program error:", error);
      return res.status(500).json({ message: "Failed to approve R&D program" });
    }
  }

  return workflowError(res, "Could not generate a unique official R&D ID", 409);
};

// Get the approval history for a project visible to the current user.
export const getRNDProgramHistory = async (req, res) => {
  try {
    const program = await findVisibleProgram(req);
    if (!program) return workflowError(res, "R&D program not found", 404);

    const history = await ApprovalHistory.find({ rndProgram: program._id })
      .populate("performedBy", "email role")
      .sort({ createdAt: 1 });

    return res.status(200).json(history);
  } catch (error) {
    console.error("Get R&D program history error:", error);
    return res.status(500).json({ message: "Failed to fetch R&D program history" });
  }
};
