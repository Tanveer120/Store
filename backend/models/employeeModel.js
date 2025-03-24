// backend/models/employeeModel.js
import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // Add additional fields if needed (e.g. role, department)
  },
  { timestamps: true }
);

const Employee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);
export default Employee;
