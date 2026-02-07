import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/rbac.js';
import {
  createOperatorHandler,
  createTerminalHandler,
  listTerminalsHandler,
  getTerminalHandler,
  updateTerminalHandler,
  deleteTerminalHandler,
  listCarriersHandler,
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

const terminalSchema = z.object({
  name: z.string().min(1),
  status: z.enum(['ACTIVE', 'SUSPENDED']).optional(),
  maxSlots: z.number().int().min(0),
  availableSlots: z.number().int().min(0),
  coordX: z.number(),
  coordY: z.number()
});

router.post('/operators', (req, res, next) => {
  try {
    operatorSchema.parse(req.body);
    return createOperatorHandler(req, res);
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
router.get('/terminals/:id', getTerminalHandler);
router.put('/terminals/:id', updateTerminalHandler);
router.delete('/terminals/:id', deleteTerminalHandler);

router.get('/carriers', listCarriersHandler);
router.post('/carriers/:id/approve', approveCarrierHandler);
router.post('/carriers/:id/reject', rejectCarrierHandler);
router.get('/carriers/:id/drivers', listCarrierDriversHandler);

router.get('/dashboard/overview', dashboardOverviewHandler);

export default router;
