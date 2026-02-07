import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/rbac.js';
import {
  listMyBookingsHandler,
  listMyHistoryHandler,
  getBookingQrHandler,
  getMyProfileHandler,
  listNotificationsHandler,
  markNotificationReadHandler
} from './driver.controller.js';

const router = Router();

router.use(requireAuth, requireRole(['DRIVER']));

router.get('/bookings/mine', listMyBookingsHandler);
router.get('/history', listMyHistoryHandler);
router.get('/bookings/:id/qr', getBookingQrHandler);
router.get('/profile', getMyProfileHandler);
router.get('/notifications', listNotificationsHandler);
router.post('/notifications/:id/read', markNotificationReadHandler);

export default router;
