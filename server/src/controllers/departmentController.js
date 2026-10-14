import { Department } from '../models/Department.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const listDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find({ isActive: true }).sort({ name: 1 });
    return sendSuccess(res, departments);
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description, color, icon } = req.body;
    if (!name || !code) {
      return sendError(res, 'Department name and code are required', 400);
    }

    const dept = await Department.create({
      name,
      code: code.toUpperCase().trim(),
      description,
      color,
      icon,
    });

    return sendSuccess(res, dept, 'Department created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dept = await Department.findByIdAndUpdate(id, req.body, { new: true });
    if (!dept) {
      return sendError(res, 'Department not found', 404);
    }
    return sendSuccess(res, dept, 'Department updated');
  } catch (error) {
    next(error);
  }
};

export const deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Department.findByIdAndUpdate(id, { isActive: false });
    return sendSuccess(res, null, 'Department deactivated');
  } catch (error) {
    next(error);
  }
};
