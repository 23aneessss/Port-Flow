import { prisma } from '../../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    return null;
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return null;
  }
  const token = jwt.sign({ id: user.id, role: user.role }, env.jwtSecret, {
    expiresIn: '12h'
  });
  return { token, role: user.role, userId: user.id };
}
