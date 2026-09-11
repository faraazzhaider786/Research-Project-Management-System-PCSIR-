import mongoose from "mongoose";

const fundingAgencySchema = new mongoose.Schema(
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

const FundingAgency = mongoose.model(
  "FundingAgency",
  fundingAgencySchema
);

export default FundingAgency;