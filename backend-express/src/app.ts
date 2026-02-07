import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createExpressMiddleware } from '@trpc/server/adapters/express';

import { errorHandler } from './middlewares/errorHandler.js';
import authRoutes from './modules/auth/auth.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import operatorRoutes from './modules/operator/operator.routes.js';
import carrierRoutes from './modules/carrier/carrier.routes.js';
import driverRoutes from './modules/driver/driver.routes.js';
import anomaliesRoutes from './modules/anomalies/anomalies.routes.js';
import { appRouter, createContext } from './trpc/index.js';

const app = express();

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// tRPC API for AI Agent
app.use('/trpc', createExpressMiddleware({
  router: appRouter,
  createContext,
}));

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/operator', operatorRoutes);
app.use('/carrier', carrierRoutes);
app.use('/driver', driverRoutes);
app.use('/anomalies', anomaliesRoutes);

app.use(errorHandler);

export default app;
