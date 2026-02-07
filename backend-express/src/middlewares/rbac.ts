import { NextFunction, Response } from 'express';
import { AuthRequest } from './auth.js';

export function requireRole(roles: Array<'ADMIN' | 'OPERATOR' | 'CARRIER' | 'DRIVER'>) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return next();
  };
}
