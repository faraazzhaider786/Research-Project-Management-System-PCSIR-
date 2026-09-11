import Lab from "../models/Lab.js";
import Complex from "../models/Complex.js";

// Get all labs
export const getLabs = async (req, res) => {
  try {
    const labs = await Lab.find()
      .populate("complex", "name code")
      .sort({ name: 1 });

    res.status(200).json(labs);
  } catch (error) {
    console.error("Get labs error:", error);

    res.status(500).json({
      message: "Failed to fetch labs"
    });
  }
};


// Get labs by complex
export const getLabsByComplex = async (req, res) => {
  try {
    const labs = await Lab.find({
      complex: req.params.complexId,
      isActive: true
    })
      .populate("complex", "name code")
      .sort({ name: 1 });

    res.status(200).json(labs);
  } catch (error) {
    console.error("Get labs by complex error:", error);

    res.status(500).json({
      message: "Failed to fetch labs"
    });
  }
};


// Get single lab
export const getLabById = async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.id)
      .populate("complex", "name code");

    if (!lab) {
      return res.status(404).json({
        message: "Lab not found"
      });
    }

    res.status(200).json(lab);
  } catch (error) {
    console.error("Get lab error:", error);

    res.status(500).json({
      message: "Failed to fetch lab"
    });
  }
};


// Create lab
export const createLab = async (req, res) => {
  try {
    const {
      name,
      code,
      complex,
      description
    } = req.body;

    if (!name || !code || !complex) {
      return res.status(400).json({
        message: "Lab name, code and complex are required"
      });
    }

    // Make sure the complex exists
    const existingComplex = await Complex.findById(complex);

    if (!existingComplex) {
      return res.status(404).json({
        message: "Complex not found"
      });
    }

    // Check duplicate lab code
    const existingLab = await Lab.findOne({ code });

    if (existingLab) {
      return res.status(400).json({
        message: "Lab code already exists"
      });
    }

    const lab = await Lab.create({
      name,
      code,
      complex,
      description
    });

    const populatedLab = await Lab.findById(lab._id)
      .populate("complex", "name code");

    res.status(201).json({
      message: "Lab created successfully",
      lab: populatedLab
    });

  } catch (error) {
    console.error("Create lab error:", error);

    res.status(500).json({
      message: "Failed to create lab"
    });
  }
};


// Update lab
export const updateLab = async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.id);

    if (!lab) {
      return res.status(404).json({
        message: "Lab not found"
      });
    }

    const {
      name,
      code,
      complex,
      description,
      isActive
    } = req.body;

    // If complex is being changed, verify it exists
    if (complex) {
      const existingComplex = await Complex.findById(complex);

      if (!existingComplex) {
        return res.status(404).json({
          message: "Complex not found"
        });
      }

      lab.complex = complex;
    }

    lab.name = name ?? lab.name;
    lab.code = code ?? lab.code;
    lab.description = description ?? lab.description;
    lab.isActive = isActive ?? lab.isActive;

    const updatedLab = await lab.save();

    const populatedLab = await Lab.findById(updatedLab._id)
      .populate("complex", "name code");

    res.status(200).json({
      message: "Lab updated successfully",
      lab: populatedLab
    });

  } catch (error) {
    console.error("Update lab error:", error);

    res.status(500).json({
      message: "Failed to update lab"
    });
  }
};


// Delete lab
export const deleteLab = async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.id);

    if (!lab) {
      return res.status(404).json({
        message: "Lab not found"
      });
    }

    await lab.deleteOne();

    res.status(200).json({
      message: "Lab deleted successfully"
    });

  } catch (error) {
    console.error("Delete lab error:", error);

    res.status(500).json({
      message: "Failed to delete lab"
    });
  }
};