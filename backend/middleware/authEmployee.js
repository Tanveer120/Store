// backend/middleware/authEmployee.js
import jwt from "jsonwebtoken";
import Employee from "../models/employeeModel.js";

const authEmployee = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized, token missing" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const employee = await Employee.findById(decoded.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    // Attach employee data to the request object for later use
    req.employeeId = employee._id;
    req.employee = employee;
    next();
  } catch (error) {
    console.error("AuthEmployee error:", error);
    res.status(401).json({ success: false, message: "Not authorized, token failed" });
  }
};

export default authEmployee;
