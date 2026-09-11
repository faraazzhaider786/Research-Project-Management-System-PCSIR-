import Center from "../models/Center.js";

// Get all centers
export const getCenters = async (req, res) => {
  try {
    const centers = await Center.find().sort({ name: 1 });

    res.status(200).json(centers);
  } catch (error) {
    console.error("Get centers error:", error);

    res.status(500).json({
      message: "Failed to fetch centers"
    });
  }
};


// Get center by ID
export const getCenterById = async (req, res) => {
  try {
    const center = await Center.findById(req.params.id);

    if (!center) {
      return res.status(404).json({
        message: "Center not found"
      });
    }

    res.status(200).json(center);
  } catch (error) {
    console.error("Get center error:", error);

    res.status(500).json({
      message: "Failed to fetch center"
    });
  }
};


// Create center
export const createCenter = async (req, res) => {
  try {
    const {
      name,
      code,
      description
    } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        message: "Center name and code are required"
      });
    }

    const existingCenter = await Center.findOne({
      $or: [
        { name },
        { code }
      ]
    });

    if (existingCenter) {
      return res.status(400).json({
        message: "Center name or code already exists"
      });
    }

    const center = await Center.create({
      name,
      code,
      description
    });

    res.status(201).json({
      message: "Center created successfully",
      center
    });

  } catch (error) {
    console.error("Create center error:", error);

    res.status(500).json({
      message: "Failed to create center"
    });
  }
};


// Update center
export const updateCenter = async (req, res) => {
  try {
    const center = await Center.findById(req.params.id);

    if (!center) {
      return res.status(404).json({
        message: "Center not found"
      });
    }

    const {
      name,
      code,
      description,
      isActive
    } = req.body;

    center.name = name ?? center.name;
    center.code = code ?? center.code;
    center.description = description ?? center.description;
    center.isActive = isActive ?? center.isActive;

    const updatedCenter = await center.save();

    res.status(200).json({
      message: "Center updated successfully",
      center: updatedCenter
    });

  } catch (error) {
    console.error("Update center error:", error);

    res.status(500).json({
      message: "Failed to update center"
    });
  }
};


// Delete center
export const deleteCenter = async (req, res) => {
  try {
    const center = await Center.findById(req.params.id);

    if (!center) {
      return res.status(404).json({
        message: "Center not found"
      });
    }

    await center.deleteOne();

    res.status(200).json({
      message: "Center deleted successfully"
    });

  } catch (error) {
    console.error("Delete center error:", error);

    res.status(500).json({
      message: "Failed to delete center"
    });
  }
};