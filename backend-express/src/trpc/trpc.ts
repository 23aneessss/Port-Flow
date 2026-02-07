import { initTRPC, TRPCError } from '@trpc/server';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface AuthUser {
  id: string;
  role: 'ADMIN' | 'OPERATOR' | 'CARRIER' | 'DRIVER';
}

export interface Context {
  req: Request;
  res: Response;
  user: AuthUser | null;
  token: string | null;
}

/**
 * Create context for each tRPC request
 */
export function createContext({ req, res }: { req: Request; res: Response }): Context {
  const header = req.headers.authorization;
  let user: AuthUser | null = null;
  let token: string | null = null;

  if (header && header.startsWith('Bearer ')) {
    token = header.replace('Bearer ', '').trim();
    try {
      const payload = jwt.verify(token, env.jwtSecret) as AuthUser;
      user = { id: payload.id, role: payload.role };
    } catch {
      // Invalid token, user remains null
    }
  }

  return { req, res, user, token };
}

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;

/**
 * Middleware to require authentication
 */
const isAuthed = middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      token: ctx.token!,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);

/**
 * Middleware to require specific roles
 */
export function requireRole(...roles: AuthUser['role'][]) {
  return middleware(({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
    }
    if (!roles.includes(ctx.user.role)) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Insufficient permissions' });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
        token: ctx.token!,
      },
    });
  });
}
