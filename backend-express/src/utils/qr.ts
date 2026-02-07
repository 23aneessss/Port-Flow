import { randomUUID } from 'crypto';

export function generateQrPayload(bookingId: string) {
  return `QR:${bookingId}:${randomUUID()}`;
}
