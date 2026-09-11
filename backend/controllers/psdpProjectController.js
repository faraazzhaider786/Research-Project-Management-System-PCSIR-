import PSDPProject from "../models/PSDPProject.js";

// Get all PSDP projects
export const getPSDPProjects = async (req, res) => {
  try {
    const projects = await PSDPProject.find().sort({ title: 1 });

    res.status(200).json(projects);
  } catch (error) {
    console.error("Get PSDP projects error:", error);

    res.status(500).json({
      message: "Failed to fetch PSDP projects"
    });
  }
};

// Get PSDP project by ID
export const getPSDPProjectById = async (req, res) => {
  try {
    const project = await PSDPProject.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "PSDP project not found"
      });
    }

    res.status(200).json(project);
  } catch (error) {
    console.error("Get PSDP project error:", error);

    res.status(500).json({
      message: "Failed to fetch PSDP project"
    });
  }
};

// Create PSDP project
export const createPSDPProject = async (req, res) => {
  try {
    const {
      referenceNumber,
      title,
      description,
      startYear,
      endYear
    } = req.body;

    if (!referenceNumber || !title) {
      return res.status(400).json({
        message: "Reference number and title are required"
      });
    }

    const existingProject = await PSDPProject.findOne({
      referenceNumber
    });

    if (existingProject) {
      return res.status(400).json({
        message: "PSDP project reference number already exists"
      });
    }

    const project = await PSDPProject.create({
      referenceNumber,
      title,
      description,
      startYear,
      endYear
    });

    res.status(201).json({
      message: "PSDP project created successfully",
      project
    });
  } catch (error) {
    console.error("Create PSDP project error:", error);

    res.status(500).json({
      message: "Failed to create PSDP project"
    });
  }
};

// Update PSDP project
export const updatePSDPProject = async (req, res) => {
  try {
    const project = await PSDPProject.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "PSDP project not found"
      });
    }

    const {
      referenceNumber,
      title,
      description,
      startYear,
      endYear,
      isActive
    } = req.body;

    if (referenceNumber && referenceNumber !== project.referenceNumber) {
      const existingProject = await PSDPProject.findOne({
        referenceNumber,
        _id: { $ne: project._id }
      });

      if (existingProject) {
        return res.status(400).json({
          message: "PSDP project reference number already exists"
        });
      }
    }

    project.referenceNumber = referenceNumber ?? project.referenceNumber;
    project.title = title ?? project.title;
    project.description = description ?? project.description;
    project.startYear = startYear ?? project.startYear;
    project.endYear = endYear ?? project.endYear;
    project.isActive = isActive ?? project.isActive;

    const updatedProject = await project.save();

    res.status(200).json({
      message: "PSDP project updated successfully",
      project: updatedProject
    });
  } catch (error) {
    console.error("Update PSDP project error:", error);

    res.status(500).json({
      message: "Failed to update PSDP project"
    });
  }
};

// Delete PSDP project
export const deletePSDPProject = async (req, res) => {
  try {
    const project = await PSDPProject.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "PSDP project not found"
      });
    }

    await project.deleteOne();

    res.status(200).json({
      message: "PSDP project deleted successfully"
    });
  } catch (error) {
    console.error("Delete PSDP project error:", error);

    res.status(500).json({
      message: "Failed to delete PSDP project"
    });
  }
};
