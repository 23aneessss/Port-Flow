# HowtoTestRoutes

Base URL: `http://localhost:4000`

All protected routes require:

```
Authorization: Bearer <JWT>
Content-Type: application/json
```

## Auth

### POST /auth/login
Login for any role (ADMIN/OPERATOR/CARRIER/DRIVER).

Body:
```json
{
  "email": "admin@port.com",
  "password": "Admin123!"
}
```

Response:
```json
{
  "token": "<JWT>",
  "role": "ADMIN",
  "userId": "uuid"
}
```

## Admin (ADMIN)

### POST /admin/operators
Create operator.

Body:
```json
{
  "email": "op1@port.com",
  "password": "Op123456",
  "firstName": "Sam",
  "lastName": "Doe",
  "phone": "+1-555-100",
  "gender": "M",
  "birthDate": "1990-01-01"
}
```

### GET /admin/operator/:id
Get operator by user id.

Path params:
- `id` = operator userId (UUID)

### PUT /admin/operator/:id
Update operator.

Body (any subset):
```json
{
  "email": "op1@port.com",
  "password": "NewPass123",
  "isActive": true,
  "firstName": "Sam",
  "lastName": "Doe",
  "phone": "+1-555-101",
  "gender": "M",
  "birthDate": "1990-01-02"
}
```

### DELETE /admin/operator/:id
Deactivate operator (sets `isActive = false`).

Path params:
- `id` = operator userId (UUID)

### POST /admin/terminals
Create terminal.

Body:
```json
{
  "name": "Terminal A",
  "status": "ACTIVE",
  "maxSlots": 20,
  "availableSlots": 20,
  "coordX": 12.34,
  "coordY": 56.78
}
```

### GET /admin/terminals
List terminals.

### GET /admin/terminals/:id
Get terminal by id.

### PUT /admin/terminals/:id
Update terminal.

Body (any subset):
```json
{
  "name": "Terminal A",
  "status": "SUSPENDED",
  "maxSlots": 30,
  "availableSlots": 10,
  "coordX": 12.3,
  "coordY": 56.7
}
```

### DELETE /admin/terminals/:id
Delete terminal by id.

### GET /admin/carriers?status=PENDING|APPROVED|REJECTED|SUSPENDED
List carriers (optional status filter).

### PUT /admin/carriers/:id
Update carrier profile and/or user.

Body (any subset):
```json
{
  "email": "carrier1@port.com",
  "password": "NewPass123",
  "isActive": true,
  "firstName": "Ali",
  "lastName": "Khan",
  "phone": "+1-555-300",
  "gender": "M",
  "birthDate": "1990-01-01",
  "companyName": "Port Logistics",
  "status": "APPROVED",
  "proofDocumentUrl": "https://example.com/proof.pdf"
}
```

### POST /admin/carriers/:id/approve
Approve carrier.

### POST /admin/carriers/:id/reject
Reject carrier.

### GET /admin/carriers/:id/drivers
List all drivers for a carrier.

### GET /admin/dashboard/overview
Admin dashboard stats.

## Operator (OPERATOR)

### GET /operator/bookings?status=PENDING|CONFIRMED|REJECTED|CANCELLED|CONSUMED
List bookings (optional status filter).

### POST /operator/bookings/:id/approve
Approve booking.

### POST /operator/bookings/:id/reject
Reject booking.

### GET /operator/carriers/:carrierId/bookings
List bookings for a carrier.

### GET /operator/terminals
List terminals (includes slots and coords).

### GET /operator/terminals/:id
Get terminal by id.

### GET /operator/dashboard/overview
Operator dashboard stats (same as admin).

## Carrier (CARRIER)

### POST /carrier/register
Register a carrier (creates User + CarrierProfile).

Body:
```json
{
  "email": "carrier1@port.com",
  "password": "Carrier123",
  "firstName": "Ali",
  "lastName": "Khan",
  "phone": "+1-555-300",
  "gender": "M",
  "birthDate": "1990-01-01",
  "companyName": "Port Logistics",
  "proofDocumentUrl": "https://example.com/proof.pdf"
}
```

### GET /carrier/terminals
List terminals for carriers (only `id` and `name`).

### POST /carrier/drivers
Create driver.

Body:
```json
{
  "email": "driver1@port.com",
  "password": "Driver123",
  "firstName": "Ali",
  "lastName": "Khan",
  "phone": "+1-555-200",
  "gender": "M",
  "birthDate": "1995-02-02",
  "truckNumber": "TRK-001",
  "truckPlate": "ABC-123",
  "drivingLicenseUrl": "https://example.com/license.pdf"
}
```

### GET /carrier/drivers
List drivers for this carrier.

### PUT /carrier/drivers/:id
Update driver (any fields).

### DELETE /carrier/drivers/:id
Delete driver.

### GET /carrier/drivers/:id/trips
List trips for a driver.

### POST /carrier/bookings
Create booking.

Body:
```json
{
  "terminalId": "UUID",
  "date": "2026-02-07T00:00:00.000Z",
  "startTime": "2026-02-07T10:00:00.000Z",
  "endTime": "2026-02-07T11:00:00.000Z",
  "driverUserId": "UUID"
}
```

### GET /carrier/bookings
List bookings for this carrier.

### PUT /carrier/bookings/:id
Update booking (only if status is `PENDING`).

### DELETE /carrier/bookings/:id
Delete booking (only if status is `PENDING`).

## Driver (DRIVER)

### GET /driver/bookings/mine
List bookings assigned to the driver.

### GET /driver/history
List consumed bookings for the driver.

### GET /driver/bookings/:id/qr
Get QR payload for booking.

### GET /driver/profile
Get driver profile.

### GET /driver/notifications
List notifications.

### POST /driver/notifications/:id/read
Mark notification as read.

## Anomalies (ADMIN / OPERATOR)

### GET /anomalies
List anomalies.

## Suggested Test Order (Minimum Setup)

1. `POST /auth/login` (admin)
2. `POST /admin/terminals`
3. `POST /carrier/register`
4. `POST /auth/login` (carrier)
5. `POST /admin/carriers/:id/approve`
6. `POST /carrier/drivers`
7. `POST /carrier/bookings`
8. `POST /auth/login` (operator)
9. `POST /operator/bookings/:id/approve`
10. `POST /auth/login` (driver)
11. `GET /driver/bookings/mine`
12. `GET /driver/bookings/:id/qr`
