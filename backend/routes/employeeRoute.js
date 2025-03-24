// backend/routes/employeeRoute.js
import express from 'express';
import { loginEmployee, getEmployeeProfile } from '../controllers/employeeController.js';
import authEmployee from '../middleware/authEmployee.js';

const EmployeeRouter = express.Router();

EmployeeRouter.post('/login', loginEmployee);
EmployeeRouter.get('/profile', authEmployee, getEmployeeProfile);

export default EmployeeRouter;
