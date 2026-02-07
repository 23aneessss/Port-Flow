import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/rbac.js';
import { listAnomaliesHandler } from './anomalies.controller.js';

const router = Router();

router.use(requireAuth, requireRole(['ADMIN', 'OPERATOR']));

router.get('/', listAnomaliesHandler);

export default router;
