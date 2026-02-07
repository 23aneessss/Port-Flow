import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/rbac.js';
import {
  createOperatorHandler,
  getOperatorHandler,
  updateOperatorHandler,
  deleteOperatorHandler,
  createTerminalHandler,
  listTerminalsHandler,
  getTerminalHandler,
  updateTerminalHandler,
  deleteTerminalHandler,
  listCarriersHandler,
  updateCarrierHandler,
  approveCarrierHandler,
  rejectCarrierHandler,
  listCarrierDriversHandler,
  dashboardOverviewHandler
} from './admin.controller.js';

const router = Router();

router.use(requireAuth, requireRole(['ADMIN']));

const operatorSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(3),
  gender: z.string().min(1),
  birthDate: z.string()
});

const operatorUpdateSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  isActive: z.boolean().optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().min(3).optional(),
  gender: z.string().min(1).optional(),
  birthDate: z.string().optional()
});

const carrierUpdateSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  isActive: z.boolean().optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().min(3).optional(),
  gender: z.string().min(1).optional(),
  birthDate: z.string().optional(),
  companyName: z.string().min(1).optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']).optional(),
  proofDocumentUrl: z.string().url().optional()
});

const terminalSchema = z.object({
  name: z.string().min(1),
  status: z.enum(['ACTIVE', 'SUSPENDED']).optional(),
  maxSlots: z.number().int().min(0),
  availableSlots: z.number().int().min(0),
  coordX: z.number(),
  coordY: z.number()
});

const idParamSchema = z.object({
  id: z.string().uuid()
});

router.post('/operators', (req, res, next) => {
  try {
    operatorSchema.parse(req.body);
    return createOperatorHandler(req, res);
  } catch (err) {
    return next(err);
  }
});

router.get('/operator/:id', (req, res, next) => {
  try {
    idParamSchema.parse(req.params);
    return getOperatorHandler(req, res);
  } catch (err) {
    return next(err);
  }
});
router.put('/operator/:id', (req, res, next) => {
  try {
    idParamSchema.parse(req.params);
    operatorUpdateSchema.parse(req.body);
    return updateOperatorHandler(req, res);
  } catch (err) {
    return next(err);
  }
});
router.delete('/operator/:id', (req, res, next) => {
  try {
    idParamSchema.parse(req.params);
    return deleteOperatorHandler(req, res);
  } catch (err) {
    return next(err);
  }
});

router.post('/terminals', (req, res, next) => {
  try {
    terminalSchema.parse(req.body);
    return createTerminalHandler(req, res);
  } catch (err) {
    return next(err);
  }
});

router.get('/terminals', listTerminalsHandler);
router.get('/terminals/:id', (req, res, next) => {
  try {
    idParamSchema.parse(req.params);
    return getTerminalHandler(req, res);
  } catch (err) {
    return next(err);
  }
});
router.put('/terminals/:id', (req, res, next) => {
  try {
    idParamSchema.parse(req.params);
    return updateTerminalHandler(req, res);
  } catch (err) {
    return next(err);
  }
});
router.delete('/terminals/:id', (req, res, next) => {
  try {
    idParamSchema.parse(req.params);
    return deleteTerminalHandler(req, res);
  } catch (err) {
    return next(err);
  }
});

router.get('/carriers', listCarriersHandler);
router.put('/carriers/:id', (req, res, next) => {
  try {
    idParamSchema.parse(req.params);
    carrierUpdateSchema.parse(req.body);
    return updateCarrierHandler(req, res);
  } catch (err) {
    return next(err);
  }
});
router.post('/carriers/:id/approve', (req, res, next) => {
  try {
    idParamSchema.parse(req.params);
    return approveCarrierHandler(req, res);
  } catch (err) {
    return next(err);
  }
});
router.post('/carriers/:id/reject', (req, res, next) => {
  try {
    idParamSchema.parse(req.params);
    return rejectCarrierHandler(req, res);
  } catch (err) {
    return next(err);
  }
});
router.get('/carriers/:id/drivers', (req, res, next) => {
  try {
    idParamSchema.parse(req.params);
    return listCarrierDriversHandler(req, res);
  } catch (err) {
    return next(err);
  }
});

router.get('/dashboard/overview', dashboardOverviewHandler);

export default router;
