import { ClinicService } from '../models/ClinicService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const listServices = async (req, res, next) => {
  try {
    const { departmentId, category } = req.query;
    const query = { isActive: true };

    if (departmentId) query.departmentId = departmentId;
    if (category) query.category = category;

    const services = await ClinicService.find(query)
      .populate('departmentId', 'name code')
      .sort({ category: 1, name: 1 });

    return sendSuccess(res, services);
  } catch (error) {
    next(error);
  }
};

export const createService = async (req, res, next) => {
  try {
    const { name, code, departmentId, category, fee, durationMinutes, description } = req.body;
    if (!name || !code || !departmentId || fee === undefined) {
      return sendError(res, 'Name, code, departmentId, and fee are required', 400);
    }

    const service = await ClinicService.create({
      name,
      code: code.toUpperCase().trim(),
      departmentId,
      category,
      fee,
      durationMinutes,
      description,
    });

    return sendSuccess(res, service, 'Clinic service created', 201);
  } catch (error) {
    next(error);
  }
};

export const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const service = await ClinicService.findByIdAndUpdate(id, req.body, { new: true });
    if (!service) {
      return sendError(res, 'Service not found', 404);
    }
    return sendSuccess(res, service, 'Service updated');
  } catch (error) {
    next(error);
  }
};

export const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;
    await ClinicService.findByIdAndUpdate(id, { isActive: false });
    return sendSuccess(res, null, 'Service deactivated');
  } catch (error) {
    next(error);
  }
};
