import FundingAgency from "../models/FundingAgency.js";

// Get all funding agencies
export const getFundingAgencies = async (req, res) => {
  try {
    const agencies = await FundingAgency.find().sort({ name: 1 });

    res.status(200).json(agencies);
  } catch (error) {
    console.error("Get funding agencies error:", error);

    res.status(500).json({
      message: "Failed to fetch funding agencies"
    });
  }
};


// Get funding agency by ID
export const getFundingAgencyById = async (req, res) => {
  try {
    const agency = await FundingAgency.findById(req.params.id);

    if (!agency) {
      return res.status(404).json({
        message: "Funding agency not found"
      });
    }

    res.status(200).json(agency);
  } catch (error) {
    console.error("Get funding agency error:", error);

    res.status(500).json({
      message: "Failed to fetch funding agency"
    });
  }
};


// Create funding agency
export const createFundingAgency = async (req, res) => {
  try {
    const {
      name,
      description
    } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Funding agency name is required"
      });
    }

    const existingAgency = await FundingAgency.findOne({
      name
    });

    if (existingAgency) {
      return res.status(400).json({
        message: "Funding agency already exists"
      });
    }

    const agency = await FundingAgency.create({
      name,
      description
    });

    res.status(201).json({
      message: "Funding agency created successfully",
      agency
    });

  } catch (error) {
    console.error("Create funding agency error:", error);

    res.status(500).json({
      message: "Failed to create funding agency"
    });
  }
};


// Update funding agency
export const updateFundingAgency = async (req, res) => {
  try {
    const agency = await FundingAgency.findById(req.params.id);

    if (!agency) {
      return res.status(404).json({
        message: "Funding agency not found"
      });
    }

    const {
      name,
      description,
      isActive
    } = req.body;

    agency.name = name ?? agency.name;
    agency.description = description ?? agency.description;
    agency.isActive = isActive ?? agency.isActive;

    const updatedAgency = await agency.save();

    res.status(200).json({
      message: "Funding agency updated successfully",
      agency: updatedAgency
    });

  } catch (error) {
    console.error("Update funding agency error:", error);

    res.status(500).json({
      message: "Failed to update funding agency"
    });
  }
};


// Delete funding agency
export const deleteFundingAgency = async (req, res) => {
  try {
    const agency = await FundingAgency.findById(req.params.id);

    if (!agency) {
      return res.status(404).json({
        message: "Funding agency not found"
      });
    }

    await agency.deleteOne();

    res.status(200).json({
      message: "Funding agency deleted successfully"
    });

  } catch (error) {
    console.error("Delete funding agency error:", error);

    res.status(500).json({
      message: "Failed to delete funding agency"
    });
  }
};