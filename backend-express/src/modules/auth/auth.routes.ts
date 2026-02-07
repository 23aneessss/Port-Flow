import { Router } from 'express';
import { z } from 'zod';
import { loginHandler } from './auth.controller.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

router.post('/login', (req, res, next) => {
  try {
    loginSchema.parse(req.body);
    return loginHandler(req, res);
  } catch (err) {
    return next(err);
  }
});

export default router;
