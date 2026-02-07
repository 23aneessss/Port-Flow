# API Endpoints (MVP)

Base URL: `http://localhost:4000`

## Auth

`POST /auth/login`
- Body (JSON):
```json
{
  "email": "admin@port.com",
  "password": "Admin123!"
}
```
- Response: `{ token, role, userId }`

## Admin (ADMIN)

`POST /admin/operators`
- Body (JSON):
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

`GET /admin/operator/:id`

`PUT /admin/operator/:id`
- Body (JSON): any updatable operator fields

`DELETE /admin/operator/:id`

`POST /admin/terminals`
- Body (JSON):
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

`GET /admin/terminals`

`GET /admin/terminals/:id`

`PUT /admin/terminals/:id`
- Body (JSON): any updatable fields from create terminal

`DELETE /admin/terminals/:id`

`GET /admin/carriers?status=PENDING|APPROVED|REJECTED|SUSPENDED`

`PUT /admin/carriers/:id`
- Body (JSON): any updatable carrier fields

`POST /admin/carriers/:id/approve`

`POST /admin/carriers/:id/reject`

`GET /admin/carriers/:id/drivers`

`GET /admin/dashboard/overview`

## Operator (OPERATOR)

`GET /operator/bookings?status=PENDING|CONFIRMED|REJECTED|CANCELLED|CONSUMED`

`POST /operator/bookings/:id/approve`

`POST /operator/bookings/:id/reject`

`GET /operator/carriers/:carrierId/bookings`

`GET /operator/terminals`

`GET /operator/terminals/:id`

`GET /operator/dashboard/overview`

## Carrier (CARRIER)

`POST /carrier/register`
- Content-Type: `application/json`
- Body (JSON):
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

`POST /carrier/drivers`
- Body (JSON):
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

`GET /carrier/drivers`

`PUT /carrier/drivers/:id`
- Body (JSON): any updatable driver fields

`DELETE /carrier/drivers/:id`

`GET /carrier/drivers/:id/trips`

`GET /carrier/terminals`

`POST /carrier/bookings`
- Body (JSON):
```json
{
  "terminalId": "UUID",
  "date": "2026-02-07T00:00:00.000Z",
  "startTime": "2026-02-07T10:00:00.000Z",
  "endTime": "2026-02-07T11:00:00.000Z",
  "driverUserId": "UUID"
}
```

`GET /carrier/bookings`

`PUT /carrier/bookings/:id`
- Body (JSON): any updatable booking fields
- Only if status = `PENDING`

`DELETE /carrier/bookings/:id`
- Only if status = `PENDING`

## Driver (DRIVER)

`GET /driver/bookings/mine`

`GET /driver/bookings/:id/qr`

`GET /driver/notifications`

`POST /driver/notifications/:id/read`

## Anomalies (ADMIN / OPERATOR)

`GET /anomalies`

## Headers

For all protected endpoints:

```
Authorization: Bearer <JWT>
Content-Type: application/json
```
