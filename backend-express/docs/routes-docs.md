# API Routes Documentation (Swagger-like)

## 1. API Info
- **Base URL**: `http://localhost:4000`
- **Content-Type**: `application/json`
- **Auth**: `Bearer JWT` (header `Authorization: Bearer <token>`)
- **Roles**: `ADMIN`, `OPERATOR`, `CARRIER`, `DRIVER`

## 2. Global Responses
- `200 OK`: lecture/mise à jour réussie
- `201 Created`: ressource créée
- `400 Bad Request`: validation ou règle métier
- `401 Unauthorized`: token absent/invalide
- `403 Forbidden`: rôle non autorisé
- `404 Not Found`: ressource introuvable (selon endpoint)
- `500 Internal Server Error`: erreur non gérée

## 3. Reusable Request Schemas

### `LoginRequest`
```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

### `CreateOperatorRequest`
```json
{
  "email": "operator@example.com",
  "password": "secret123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+212600000000",
  "gender": "M",
  "birthDate": "1990-01-01"
}
```

### `UpdateOperatorRequest` (all optional)
```json
{
  "email": "operator2@example.com",
  "password": "newpass123",
  "isActive": true,
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "+212611111111",
  "gender": "F",
  "birthDate": "1992-05-10"
}
```

### `CreateTerminalRequest`
```json
{
  "name": "Terminal A",
  "status": "ACTIVE",
  "maxSlots": 20,
  "availableSlots": 20,
  "coordX": 33.58,
  "coordY": -7.61
}
```

### `CarrierRegisterRequest`
```json
{
  "email": "carrier@example.com",
  "password": "secret123",
  "firstName": "Ali",
  "lastName": "Naji",
  "phone": "+212622222222",
  "gender": "M",
  "birthDate": "1988-03-02",
  "companyName": "Atlas Transport",
  "proofDocumentUrl": "https://example.com/proof.pdf"
}
```

### `CreateDriverRequest`
```json
{
  "email": "driver@example.com",
  "password": "secret123",
  "firstName": "Hamza",
  "lastName": "Rami",
  "phone": "+212633333333",
  "gender": "M",
  "birthDate": "1995-08-14",
  "truckNumber": "TRK-001",
  "truckPlate": "12345-A-6",
  "drivingLicenseUrl": "https://example.com/license.pdf"
}
```

### `CreateBookingRequest`
```json
{
  "terminalId": "uuid",
  "date": "2026-02-10",
  "startTime": "2026-02-10T09:00:00.000Z",
  "endTime": "2026-02-10T10:00:00.000Z",
  "driverUserId": "uuid"
}
```

## 4. Endpoints by Module

## Auth

### `POST /auth/login`
- **Auth**: Public
- **Body**: `LoginRequest`
- **Success**: `200` -> `{ token, role, userId }`
- **Errors**: `400`, `401`

---

## Admin (`ADMIN`)

### `POST /admin/operators`
- **Auth**: Bearer + role `ADMIN`
- **Body**: `CreateOperatorRequest`
- **Success**: `201`

### `GET /admin/operator/:id`
- **Auth**: Bearer + role `ADMIN`
- **Path Params**: `id` (UUID)
- **Success**: `200`
- **Errors**: `404`

### `PUT /admin/operator/:id`
- **Auth**: Bearer + role `ADMIN`
- **Path Params**: `id` (UUID)
- **Body**: `UpdateOperatorRequest`
- **Success**: `200`

### `DELETE /admin/operator/:id`
- **Auth**: Bearer + role `ADMIN`
- **Path Params**: `id` (UUID)
- **Success**: `200`

### `POST /admin/terminals`
- **Auth**: Bearer + role `ADMIN`
- **Body**: `CreateTerminalRequest`
- **Success**: `201`

### `GET /admin/terminals`
- **Auth**: Bearer + role `ADMIN`
- **Success**: `200`

### `GET /admin/terminals/:id`
- **Auth**: Bearer + role `ADMIN`
- **Path Params**: `id` (UUID)
- **Success**: `200`
- **Errors**: `404`

### `PUT /admin/terminals/:id`
- **Auth**: Bearer + role `ADMIN`
- **Path Params**: `id` (UUID)
- **Body**: partial terminal object
- **Success**: `200`

### `DELETE /admin/terminals/:id`
- **Auth**: Bearer + role `ADMIN`
- **Path Params**: `id` (UUID)
- **Success**: `200`

### `GET /admin/carriers`
- **Auth**: Bearer + role `ADMIN`
- **Query**: `status` optional (`PENDING | APPROVED | REJECTED | SUSPENDED`)
- **Success**: `200`

### `PUT /admin/carriers/:id`
- **Auth**: Bearer + role `ADMIN`
- **Path Params**: `id` (UUID)
- **Body**: partial carrier fields (`email`, `status`, `proofDocumentUrl`, etc.)
- **Success**: `200`

### `POST /admin/carriers/:id/approve`
- **Auth**: Bearer + role `ADMIN`
- **Path Params**: `id` (UUID)
- **Success**: `200`

### `POST /admin/carriers/:id/reject`
- **Auth**: Bearer + role `ADMIN`
- **Path Params**: `id` (UUID)
- **Success**: `200`

### `GET /admin/carriers/:id/drivers`
- **Auth**: Bearer + role `ADMIN`
- **Path Params**: `id` (UUID carrier user id)
- **Success**: `200`

### `GET /admin/dashboard/overview`
- **Auth**: Bearer + role `ADMIN`
- **Success**: `200` -> KPI dashboard object

---

## Operator (`OPERATOR`)

### `GET /operator/bookings`
- **Auth**: Bearer + role `OPERATOR`
- **Query**: `status` optional (booking status)
- **Success**: `200`

### `POST /operator/bookings/:id/approve`
- **Auth**: Bearer + role `OPERATOR`
- **Path Params**: `id` (booking UUID)
- **Success**: `200`
- **Errors**: `400`, `403`, `404`

### `POST /operator/bookings/:id/reject`
- **Auth**: Bearer + role `OPERATOR`
- **Path Params**: `id` (booking UUID)
- **Success**: `200`
- **Errors**: `400`, `403`, `404`

### `GET /operator/carriers/:carrierId/bookings`
- **Auth**: Bearer + role `OPERATOR`
- **Path Params**: `carrierId` (UUID)
- **Success**: `200`

### `GET /operator/terminals`
- **Auth**: Bearer + role `OPERATOR`
- **Success**: `200`

### `GET /operator/terminals/:id`
- **Auth**: Bearer + role `OPERATOR`
- **Path Params**: `id` (UUID)
- **Success**: `200`
- **Errors**: `404`

### `GET /operator/dashboard/overview`
- **Auth**: Bearer + role `OPERATOR`
- **Success**: `200` -> KPI dashboard object

---

## Carrier (`CARRIER`)

### `POST /carrier/register`
- **Auth**: Public
- **Body**: `CarrierRegisterRequest`
- **Success**: `201` -> `{ user, profile }`
- **Notes**: profile status initial `PENDING`

### `POST /carrier/drivers`
- **Auth**: Bearer + role `CARRIER`
- **Body**: `CreateDriverRequest`
- **Success**: `201`
- **Errors**: `400` (ex: carrier not approved)

### `GET /carrier/drivers`
- **Auth**: Bearer + role `CARRIER`
- **Success**: `200`

### `PUT /carrier/drivers/:id`
- **Auth**: Bearer + role `CARRIER`
- **Path Params**: `id` (driver user UUID)
- **Body**: partial driver profile
- **Success**: `200`

### `DELETE /carrier/drivers/:id`
- **Auth**: Bearer + role `CARRIER`
- **Path Params**: `id` (driver user UUID)
- **Success**: `200`

### `GET /carrier/drivers/:id/trips`
- **Auth**: Bearer + role `CARRIER`
- **Path Params**: `id` (driver user UUID)
- **Success**: `200`

### `GET /carrier/terminals`
- **Auth**: Bearer + role `CARRIER`
- **Success**: `200` -> terminals `{ id, name }`

### `POST /carrier/bookings`
- **Auth**: Bearer + role `CARRIER`
- **Body**: `CreateBookingRequest`
- **Success**: `201`
- **Errors**: `400` (ex: carrier not approved)

### `GET /carrier/bookings`
- **Auth**: Bearer + role `CARRIER`
- **Success**: `200`

### `PUT /carrier/bookings/:id`
- **Auth**: Bearer + role `CARRIER`
- **Path Params**: `id` (booking UUID)
- **Body**: partial booking (business-rules apply)
- **Success**: `200`

### `DELETE /carrier/bookings/:id`
- **Auth**: Bearer + role `CARRIER`
- **Path Params**: `id` (booking UUID)
- **Success**: `200`

---

## Driver (`DRIVER`)

### `GET /driver/bookings/mine`
- **Auth**: Bearer + role `DRIVER`
- **Success**: `200`

### `GET /driver/history`
- **Auth**: Bearer + role `DRIVER`
- **Success**: `200` (bookings consommés)

### `GET /driver/bookings/:id/qr`
- **Auth**: Bearer + role `DRIVER`
- **Path Params**: `id` (booking UUID)
- **Success**: `200` -> `{ qr_payload }`
- **Errors**: `400` (not assigned/not confirmed/too early)

### `GET /driver/profile`
- **Auth**: Bearer + role `DRIVER`
- **Success**: `200`
- **Errors**: `404`

### `GET /driver/notifications`
- **Auth**: Bearer + role `DRIVER`
- **Success**: `200`

### `POST /driver/notifications/:id/read`
- **Auth**: Bearer + role `DRIVER`
- **Path Params**: `id` (notification UUID)
- **Success**: `200`
- **Errors**: `400`

---

## Anomalies (`ADMIN`, `OPERATOR`)

### `GET /anomalies`
- **Auth**: Bearer + role `ADMIN` or `OPERATOR`
- **Success**: `200`

## 5. cURL Quick Start

### Login
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"secret123"}'
```

### Example protected route
```bash
curl http://localhost:4000/admin/dashboard/overview \
  -H "Authorization: Bearer <TOKEN>"
```

## 6. Notes
- Cette doc est alignée sur les routes actuelles de `ROUTES.md` et les validations présentes dans le code.
- Certaines réponses détaillées dépendent des modèles Prisma et peuvent évoluer.
