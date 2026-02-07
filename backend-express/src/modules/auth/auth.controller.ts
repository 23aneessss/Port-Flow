import { Request, Response } from 'express';
import { login } from './auth.service.js';

export async function loginHandler(req: Request, res: Response) {
  const { email, password } = req.body;
  const result = await login(email, password);
  if (!result) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  return res.json(result);
}
