# Port Truck Booking Backend

Backend Express + TypeScript + PostgreSQL + Prisma.

## Installation

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env
```

Edit `.env` and set:

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME
JWT_SECRET=change_me
PORT=4000
```

3. Prisma migrate + generate + seed:

```bash
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed
```

4. Run in dev:

```bash
npm run dev
```

## Production

```bash
npm run build
npm run start
```

## Default Admin

- Email: `admin@port.com`
- Password: `Admin123!`

## Notes

- Uploads stored locally in `uploads/`.
- Carrier register requires `proof_document` (PDF) multipart field.
