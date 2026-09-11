import FieldOfStudy from "../models/FieldOfStudy.js";

// Get all fields of study
export const getFieldsOfStudy = async (req, res) => {
  try {
    const fields = await FieldOfStudy.find().sort({ name: 1 });

    res.status(200).json(fields);
  } catch (error) {
    console.error("Get fields of study error:", error);

    res.status(500).json({
      message: "Failed to fetch fields of study"
    });
  }
};


// Get field of study by ID
export const getFieldOfStudyById = async (req, res) => {
  try {
    const field = await FieldOfStudy.findById(req.params.id);

    if (!field) {
      return res.status(404).json({
        message: "Field of study not found"
      });
    }

    res.status(200).json(field);
  } catch (error) {
    console.error("Get field of study error:", error);

    res.status(500).json({
      message: "Failed to fetch field of study"
    });
  }
};


// Create field of study
export const createFieldOfStudy = async (req, res) => {
  try {
    const {
      name,
      description
    } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Field of study name is required"
      });
    }

    const existingField = await FieldOfStudy.findOne({
      name
    });

    if (existingField) {
      return res.status(400).json({
        message: "Field of study already exists"
      });
    }

    const field = await FieldOfStudy.create({
      name,
      description
    });

    res.status(201).json({
      message: "Field of study created successfully",
      field
    });

  } catch (error) {
    console.error("Create field of study error:", error);

    res.status(500).json({
      message: "Failed to create field of study"
    });
  }
};


// Update field of study
export const updateFieldOfStudy = async (req, res) => {
  try {
    const field = await FieldOfStudy.findById(req.params.id);

    if (!field) {
      return res.status(404).json({
        message: "Field of study not found"
      });
    }

    const {
      name,
      description,
      isActive
    } = req.body;

    field.name = name ?? field.name;
    field.description = description ?? field.description;
    field.isActive = isActive ?? field.isActive;

    const updatedField = await field.save();

    res.status(200).json({
      message: "Field of study updated successfully",
      field: updatedField
    });

  } catch (error) {
    console.error("Update field of study error:", error);

    res.status(500).json({
      message: "Failed to update field of study"
    });
  }
};


// Delete field of study
export const deleteFieldOfStudy = async (req, res) => {
  try {
    const field = await FieldOfStudy.findById(req.params.id);

    if (!field) {
      return res.status(404).json({
        message: "Field of study not found"
      });
    }

    await field.deleteOne();

    res.status(200).json({
      message: "Field of study deleted successfully"
    });

  } catch (error) {
    console.error("Delete field of study error:", error);

    res.status(500).json({
      message: "Failed to delete field of study"
    });
  }
};