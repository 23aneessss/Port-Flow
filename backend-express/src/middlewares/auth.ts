import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface AuthUser {
  id: string;
  role: 'ADMIN' | 'OPERATOR' | 'CARRIER' | 'DRIVER';
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = header.replace('Bearer ', '').trim();
  try {
    const payload = jwt.verify(token, env.jwtSecret) as AuthUser;
    req.user = { id: payload.id, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
