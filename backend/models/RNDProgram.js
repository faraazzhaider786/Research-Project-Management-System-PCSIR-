import mongoose from "mongoose";

const rndProgramSchema = new mongoose.Schema(
  {
    // Basic information
    title: {
      type: String,
      required: true,
      trim: true
    },

    rndType: {
      type: String,
      enum: ["national", "international"],
      required: true
    },

    sourceOfRND: {
      type: String,
      enum: [
        "PSDP Project",
        "RD&I of PCSIR",
        "SGF",
        "In-house R&D",
        "Collaborative Research",
        "Other Funding Agency",
        "Any other Program"
      ],
      required: true
    },

    // Organization
    complex: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complex",
      required: true
    },

    lab: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lab",
      required: true
    },

    center: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Center"
    },

    // Project leader
    projectLeader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true
    },

    // Associates
    associates: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee"
      }
    ],

    // Fields of study
    fieldsOfStudy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FieldOfStudy"
      }
    ],

    // Time
    year: {
      type: Number,
      required: true
    },

    duration: {
      type: Number,
      required: true
    },

    scheduledCompletionDate: {
      type: Date,
      required: true
    },

    // Research information
    background: {
      type: String
    },

    objective: {
      type: String
    },

    researchHighlights: {
      type: String
    },

    presentStatus: {
      type: String
    },

    targetsNextFiscalYear: {
      type: String
    },

    collaborators: {
      type: String
    },

    keywords: [
      {
        type: String,
        trim: true
      }
    ],

    // Funding
    fundingAgency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FundingAgency"
    },

    fundsAllocatedDetails: {
      type: String
    },

    // PSDP relationship
    psdpProject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PSDPProject"
    },

    // Socio-economic outcome
    socioEconomicOutcome: {
      type: String
    },

    // Graphical abstract
    graphicalAbstract: {
      type: String
    },

    // Official R&D ID
    rndId: {
      type: String,
      unique: true,
      sparse: true
    },

    // Workflow
    status: {
      type: String,
      enum: [
        "DRAFT",
        "SUBMITTED",
        "UNDER_SCRUTINY",
        "FORWARDED",
        "APPROVED",
        "REJECTED",
        "OBJECTED",
        "ACTIVE",
        "LAPSED",
        "EXTENSION_REQUESTED",
        "COMPLETED"
      ],
      default: "DRAFT"
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

const RNDProgram = mongoose.model(
  "RNDProgram",
  rndProgramSchema
);

export default RNDProgram;