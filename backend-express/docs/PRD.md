# PRD — Port Booking Backend (MVP)

## 1. Summary
The MVP is a role-based backend for managing port terminal bookings. It supports admins, operators, carriers, and drivers, with core workflows for registration, approval, booking creation, and confirmation.

## 2. Goals
- Enable carriers to register and request bookings at terminals.
- Allow admins to manage terminals, carriers, and operators.
- Allow operators to approve/reject bookings and view dashboards.
- Allow drivers to view assigned bookings, QR codes, and notifications.
- Provide audit logging and anomaly visibility.

## 3. Non-Goals (MVP)
- Payments or billing.
- Real-time tracking / live location.
- Complex scheduling or recurring bookings.
- Public-facing terminal availability API.
- Multi-language content management.

## 4. Users & Roles
- ADMIN: system owner; manages terminals, carriers, operators; sees full dashboards.
- OPERATOR: operational staff; approves/rejects bookings; sees dashboards and terminal stats.
- CARRIER: transport company; registers; manages drivers; creates bookings.
- DRIVER: assigned to bookings; views own bookings and QR codes.

## 5. Core Entities (Data Model)
- User (role, email, password, isActive)
- CarrierProfile
- OperatorProfile
- DriverProfile
- Terminal (status, slots)
- Booking (status, terminal, carrier, driver)
- Notification (for drivers)
- AuditLog (actions)
- Anomaly (system anomalies)

## 6. MVP Functional Requirements

### Auth
- Login via `POST /auth/login` returning JWT + role.

### Admin
- Create operators.
- CRUD terminals.
- View and update carriers (including approve/reject).
- View carrier drivers.
- View dashboard overview stats.

### Operator
- List bookings (with status filter).
- Approve/reject bookings (adjust slots and notify driver).
- View bookings for a given carrier.
- View terminals and terminal details.
- View dashboard overview stats.

### Carrier
- Register (creates user + profile).
- Manage drivers (CRUD).
- Create bookings (requires carrier approval).
- View, update, delete own bookings (only while PENDING).
- View terminals list (id + name only).

### Driver
- View own bookings.
- View booking QR.
- View and mark notifications as read.

### Anomalies
- Admin/Operator can view anomalies list.

## 7. Booking Flow (MVP)
1. Carrier registers.
2. Admin approves carrier.
3. Carrier creates driver.
4. Carrier creates booking (PENDING).
5. Operator approves or rejects booking.
6. If approved: terminal slots decrease; driver gets notification.
7. Driver views booking and QR.

## 8. Status & Rules
- Carrier must be APPROVED to create drivers or bookings.
- Booking can be updated/deleted only when status is PENDING.
- Terminal slot availability enforced on booking approval.

## 9. API Surface (MVP)
See `ROUTES.md`, `API.md`, and `HowtoTestRoutes.md` for endpoint list and payloads.

## 10. Security
- JWT auth for protected endpoints.
- Role-based access control (ADMIN/OPERATOR/CARRIER/DRIVER).
- Basic validation via zod.

## 11. Observability
- Audit logs for key actions.
- Anomalies endpoint for admin/operator.

## 12. MVP Success Metrics
- Carriers can register, be approved, and create bookings end-to-end.
- Operators can approve bookings and manage terminal capacity.
- Drivers can log in and retrieve assigned bookings and QR.

## 13. Future Enhancements
- Public terminal availability endpoint.
- Advanced booking conflict checks.
- Booking cancellation and consumption workflow.
- Reporting exports (CSV/PDF).
- Webhooks or email/SMS notifications.

