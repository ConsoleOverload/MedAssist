import { Invoice } from '../models/Invoice.js';
import { Patient } from '../models/Patient.js';
import { recordAuditEvent } from '../services/auditService.js';
import { createNotification } from '../services/notificationService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const listInvoices = async (req, res, next) => {
  try {
    const { patientId, status, page = 1, limit = 50 } = req.query;
    const query = {};

    if (req.user.role === 'patient') {
      if (!req.user.patientId) return sendSuccess(res, []);
      query.patientId = req.user.patientId;
    } else {
      if (patientId) query.patientId = patientId;
      if (status) query.status = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [invoices, total] = await Promise.all([
      Invoice.find(query)
        .populate('patientId', 'firstName lastName mrn phone email')
        .populate('appointmentId', 'appointmentNumber appointmentDate')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Invoice.countDocuments(query),
    ]);

    return sendSuccess(res, invoices, 'Invoices retrieved', 200, {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
};

export const createInvoice = async (req, res, next) => {
  try {
    const { patientId, appointmentId, encounterId, items, discount = 0, tax = 0 } = req.body;

    if (!patientId || !Array.isArray(items) || items.length === 0) {
      return sendError(res, 'Patient ID and at least one billable item are required', 400);
    }

    const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) || 1) * Number(item.unitPrice), 0);
    const totalAmount = Math.max(0, subtotal - Number(discount) + Number(tax));
    const balanceAmount = totalAmount;

    const count = await Invoice.countDocuments();
    const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(count + 1).padStart(3, '0')}`;

    const invoice = await Invoice.create({
      invoiceNumber,
      patientId,
      appointmentId,
      encounterId,
      items,
      subtotal,
      discount: Number(discount),
      tax: Number(tax),
      totalAmount,
      paidAmount: 0,
      balanceAmount,
      status: 'pending',
      createdBy: req.user.userId,
    });

    const patient = await Patient.findById(patientId);
    if (patient?.userId) {
      await createNotification({
        userId: patient.userId,
        title: 'New Clinic Invoice Generated',
        message: `Invoice ${invoiceNumber} for $${totalAmount.toFixed(2)} has been generated.`,
        type: 'billing',
        link: '/patient/invoices',
      });
    }

    await recordAuditEvent({
      actorId: req.user.userId,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'INVOICE_CREATE',
      resourceType: 'Invoice',
      resourceId: invoice._id,
      outcome: 'success',
      details: { invoiceNumber, totalAmount },
      req,
    });

    return sendSuccess(res, invoice, 'Invoice generated successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const recordPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, method = 'cash', transactionReference = '', notes = '' } = req.body;

    const paymentAmount = Number(amount);
    if (!paymentAmount || paymentAmount <= 0) {
      return sendError(res, 'Valid payment amount greater than zero is required', 400);
    }

    const invoice = await Invoice.findById(id).populate('patientId');
    if (!invoice) return sendError(res, 'Invoice not found', 404);

    if (invoice.status === 'paid') {
      return sendError(res, 'This invoice has already been paid in full', 400);
    }

    const receiptNumber = `RCP-${Date.now().toString().slice(-6)}`;

    invoice.payments.push({
      receiptNumber,
      amount: paymentAmount,
      method,
      transactionReference,
      paidAt: new Date(),
      receivedBy: req.user.userId,
      notes,
    });

    invoice.paidAmount += paymentAmount;
    invoice.balanceAmount = Math.max(0, invoice.totalAmount - invoice.paidAmount);

    if (invoice.balanceAmount === 0) {
      invoice.status = 'paid';
    } else {
      invoice.status = 'partially_paid';
    }

    await invoice.save();

    await recordAuditEvent({
      actorId: req.user.userId,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'PAYMENT_RECORD',
      resourceType: 'Invoice',
      resourceId: invoice._id,
      outcome: 'success',
      details: { amount: paymentAmount, method, receiptNumber, remainingBalance: invoice.balanceAmount },
      req,
    });

    return sendSuccess(res, invoice, `Payment of $${paymentAmount.toFixed(2)} recorded. Receipt: ${receiptNumber}`);
  } catch (error) {
    next(error);
  }
};

export const getInvoiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id)
      .populate('patientId')
      .populate('appointmentId')
      .populate('createdBy', 'name');

    if (!invoice) return sendError(res, 'Invoice not found', 404);

    if (req.user.role === 'patient') {
      if (!req.user.patientId || req.user.patientId.toString() !== invoice.patientId._id.toString()) {
        return sendError(res, 'Access denied', 403);
      }
    }

    return sendSuccess(res, invoice);
  } catch (error) {
    next(error);
  }
};
