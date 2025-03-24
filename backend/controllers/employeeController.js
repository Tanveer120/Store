// backend/controllers/employeeController.js
import Employee from '../models/employeeModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

/**
 * Employee Login
 * Expects req.body: { email, password }
 */
export const loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find the employee by email
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(400).json({ success: false, message: 'Employee not found' });
    }
    // Direct comparison since passwords are stored as plain text
    if (password !== employee.password) {
      return res.status(400).json({ success: false, message: 'Incorrect password' });
    }
    // Create a token and send response
    const token = createToken(employee._id);
    res.status(200).json({
      success: true,
      message: 'Employee logged in successfully',
      token,
      employee: { id: employee._id, name: employee.name, email: employee.email },
    });
  } catch (error) {
    console.error("Error in employee login:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmployeeProfile = async (req, res) => {
  try {
    // Assuming your auth middleware sets req.employeeId (or similar)
    const employee = await Employee.findById(req.employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    res.status(200).json({ success: true, employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};