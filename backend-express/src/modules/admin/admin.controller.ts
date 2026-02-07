import { Request, Response } from 'express';
import {
  createOperator,
  createTerminal,
  listTerminals,
  getTerminal,
  updateTerminal,
  deleteTerminal,
  listCarriers,
  approveCarrier,
  rejectCarrier,
  listCarrierDrivers,
  dashboardOverview
} from './admin.service.js';
import { AuthRequest } from '../../middlewares/auth.js';
import { CarrierStatus } from '@prisma/client';

export async function createOperatorHandler(req: AuthRequest, res: Response) {
  const result = await createOperator({
    email: req.body.email,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phone: req.body.phone,
    gender: req.body.gender,
    birthDate: new Date(req.body.birthDate)
  }, req.user!.id);
  return res.status(201).json(result);
}

export async function createTerminalHandler(req: AuthRequest, res: Response) {
  const terminal = await createTerminal({
    name: req.body.name,
    status: req.body.status,
    maxSlots: req.body.maxSlots,
    availableSlots: req.body.availableSlots,
    coordX: req.body.coordX,
    coordY: req.body.coordY
  }, req.user!.id);
  return res.status(201).json(terminal);
}

export async function listTerminalsHandler(_req: Request, res: Response) {
  const terminals = await listTerminals();
  return res.json(terminals);
}

export async function getTerminalHandler(req: Request, res: Response) {
  const terminal = await getTerminal(req.params.id);
  if (!terminal) return res.status(404).json({ message: 'Terminal not found' });
  return res.json(terminal);
}

export async function updateTerminalHandler(req: AuthRequest, res: Response) {
  const terminal = await updateTerminal(req.params.id, req.body, req.user!.id);
  return res.json(terminal);
}

export async function deleteTerminalHandler(req: AuthRequest, res: Response) {
  const terminal = await deleteTerminal(req.params.id, req.user!.id);
  return res.json(terminal);
}

export async function listCarriersHandler(req: Request, res: Response) {
  const status = req.query.status as CarrierStatus | undefined;
  const carriers = await listCarriers(status);
  return res.json(carriers);
}

export async function approveCarrierHandler(req: AuthRequest, res: Response) {
  const carrier = await approveCarrier(req.params.id, req.user!.id);
  return res.json(carrier);
}

export async function rejectCarrierHandler(req: AuthRequest, res: Response) {
  const carrier = await rejectCarrier(req.params.id, req.user!.id);
  return res.json(carrier);
}

export async function listCarrierDriversHandler(req: Request, res: Response) {
  const drivers = await listCarrierDrivers(req.params.id);
  return res.json(drivers);
}

export async function dashboardOverviewHandler(_req: Request, res: Response) {
  const data = await dashboardOverview();
  return res.json(data);
}
