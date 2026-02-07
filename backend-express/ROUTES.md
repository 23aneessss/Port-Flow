# Global Routes Overview

Base URL: `http://localhost:4000`

## Auth
- `POST /auth/login`

## Admin (ADMIN)
- `POST /admin/operators`
- `GET /admin/operator/:id`
- `PUT /admin/operator/:id`
- `DELETE /admin/operator/:id`
- `POST /admin/terminals`
- `GET /admin/terminals`
- `GET /admin/terminals/:id`
- `PUT /admin/terminals/:id`
- `DELETE /admin/terminals/:id`
- `GET /admin/carriers`
- `PUT /admin/carriers/:id`
- `POST /admin/carriers/:id/approve`
- `POST /admin/carriers/:id/reject`
- `GET /admin/carriers/:id/drivers`
- `GET /admin/dashboard/overview`

## Operator (OPERATOR)
- `GET /operator/bookings`
- `POST /operator/bookings/:id/approve`
- `POST /operator/bookings/:id/reject`
- `GET /operator/carriers/:carrierId/bookings`
- `GET /operator/terminals`
- `GET /operator/terminals/:id`
- `GET /operator/dashboard/overview`

## Carrier (CARRIER)
- `POST /carrier/register`
- `POST /carrier/drivers`
- `GET /carrier/drivers`
- `PUT /carrier/drivers/:id`
- `DELETE /carrier/drivers/:id`
- `GET /carrier/drivers/:id/trips`
- `GET /carrier/terminals`
- `POST /carrier/bookings`
- `GET /carrier/bookings`
- `PUT /carrier/bookings/:id`
- `DELETE /carrier/bookings/:id`

## Driver (DRIVER)
- `GET /driver/bookings/mine`
- `GET /driver/bookings/:id/qr`
- `GET /driver/notifications`
- `POST /driver/notifications/:id/read`

## Anomalies (ADMIN / OPERATOR)
- `GET /anomalies`

## Missing Endpoints
- None identified from the current codebase routes.
