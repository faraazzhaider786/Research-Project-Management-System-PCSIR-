import Complex from "../models/Complex.js";

// Get all complexes
export const getComplexes = async (req, res) => {
  try {
    const complexes = await Complex.find()
      .sort({ name: 1 });

    res.status(200).json(complexes);
  } catch (error) {
    console.error("Get complexes error:", error);

    res.status(500).json({
      message: "Failed to fetch complexes"
    });
  }
};


// Get single complex
export const getComplexById = async (req, res) => {
  try {
    const complex = await Complex.findById(req.params.id);

    if (!complex) {
      return res.status(404).json({
        message: "Complex not found"
      });
    }

    res.status(200).json(complex);

  } catch (error) {
    console.error("Get complex error:", error);

    res.status(500).json({
      message: "Failed to fetch complex"
    });
  }
};


// Create complex
export const createComplex = async (req, res) => {
  try {
    const {
      name,
      code,
      description
    } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        message: "Complex name and code are required"
      });
    }

    const existingComplex = await Complex.findOne({
      $or: [
        { name },
        { code }
      ]
    });

    if (existingComplex) {
      return res.status(400).json({
        message: "Complex name or code already exists"
      });
    }

    const complex = await Complex.create({
      name,
      code,
      description
    });

    res.status(201).json({
      message: "Complex created successfully",
      complex
    });

  } catch (error) {
    console.error("Create complex error:", error);

    res.status(500).json({
      message: "Failed to create complex"
    });
  }
};


// Update complex
export const updateComplex = async (req, res) => {
  try {
    const complex = await Complex.findById(req.params.id);

    if (!complex) {
      return res.status(404).json({
        message: "Complex not found"
      });
    }

    const {
      name,
      code,
      description,
      isActive
    } = req.body;

    complex.name = name ?? complex.name;
    complex.code = code ?? complex.code;
    complex.description = description ?? complex.description;
    complex.isActive = isActive ?? complex.isActive;

    const updatedComplex = await complex.save();

    res.status(200).json({
      message: "Complex updated successfully",
      complex: updatedComplex
    });

  } catch (error) {
    console.error("Update complex error:", error);

    res.status(500).json({
      message: "Failed to update complex"
    });
  }
};


// Delete complex
export const deleteComplex = async (req, res) => {
  try {
    const complex = await Complex.findById(req.params.id);

    if (!complex) {
      return res.status(404).json({
        message: "Complex not found"
      });
    }

    await complex.deleteOne();

    res.status(200).json({
      message: "Complex deleted successfully"
    });

  } catch (error) {
    console.error("Delete complex error:", error);

    res.status(500).json({
      message: "Failed to delete complex"
    });
  }
};