import Employee from "../models/Employee.js";

// Get all employees
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate("complex", "name code")
      .populate("lab", "name code")
      .populate("center", "name code")
      .sort({ name: 1 });

    res.status(200).json(employees);
  } catch (error) {
    console.error("Get employees error:", error);

    res.status(500).json({
      message: "Failed to fetch employees"
    });
  }
};


// Get single employee
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate("complex", "name code")
      .populate("lab", "name code")
      .populate("center", "name code");

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    res.status(200).json(employee);
  } catch (error) {
    console.error("Get employee error:", error);

    res.status(500).json({
      message: "Failed to fetch employee"
    });
  }
};


// Create employee
export const createEmployee = async (req, res) => {
  try {
    const {
      employeeId,
      name,
      designation,
      email,
      complex,
      lab,
      center
    } = req.body;

    if (!employeeId || !name || !designation) {
      return res.status(400).json({
        message: "Employee ID, name and designation are required"
      });
    }

    const existingEmployee = await Employee.findOne({
      employeeId
    });

    if (existingEmployee) {
      return res.status(400).json({
        message: "Employee ID already exists"
      });
    }

    const employee = await Employee.create({
      employeeId,
      name,
      designation,
      email,
      complex,
      lab,
      center
    });

    res.status(201).json({
      message: "Employee created successfully",
      employee
    });

  } catch (error) {
    console.error("Create employee error:", error);

    res.status(500).json({
      message: "Failed to create employee"
    });
  }
};


// Update employee
export const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    const {
      employeeId,
      name,
      designation,
      email,
      complex,
      lab,
      center,
      isActive
    } = req.body;

    employee.employeeId = employeeId ?? employee.employeeId;
    employee.name = name ?? employee.name;
    employee.designation = designation ?? employee.designation;
    employee.email = email ?? employee.email;
    employee.complex = complex ?? employee.complex;
    employee.lab = lab ?? employee.lab;
    employee.center = center ?? employee.center;
    employee.isActive = isActive ?? employee.isActive;

    const updatedEmployee = await employee.save();

    res.status(200).json({
      message: "Employee updated successfully",
      employee: updatedEmployee
    });

  } catch (error) {
    console.error("Update employee error:", error);

    res.status(500).json({
      message: "Failed to update employee"
    });
  }
};


// Delete employee
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    await employee.deleteOne();

    res.status(200).json({
      message: "Employee deleted successfully"
    });

  } catch (error) {
    console.error("Delete employee error:", error);

    res.status(500).json({
      message: "Failed to delete employee"
    });
  }
};