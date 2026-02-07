import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.js';
import { listAnomalies } from './anomalies.service.js';

export async function listAnomaliesHandler(req: AuthRequest, res: Response) {
  const role = req.user!.role;
  const data = await listAnomalies(role as 'ADMIN' | 'OPERATOR', req.user!.id);
  return res.json(data);
}
