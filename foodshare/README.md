# FoodShare — Smart Food Donation and Distribution System

A full-stack, cloud-based web application connecting food donors with NGOs to
reduce food waste. Donors post surplus food, NGOs accept and collect it, and
admins oversee the whole platform.

## Tech Stack

| Layer      | Technology                                                        |
|------------|--------------------------------------------------------------------|
| Frontend   | React (Vite), Tailwind CSS, React Router DOM, Fetch API            |
| Backend    | Node.js, Express.js, JWT, bcrypt, express-validator, multer         |
| Database   | **Amazon DynamoDB** (no MongoDB/MySQL/Postgres/Firebase)           |
| File store | **Amazon S3** (food images)                                        |
| Messaging  | **Amazon SNS** (donation/user notifications)                       |
| Monitoring | **Amazon CloudWatch Logs**                                         |
| Security   | **IAM** roles/policies (least privilege, no hardcoded prod keys)   |
| Hosting    | **Amazon EC2** (Nginx + PM2)                                       |

## Project Structure

```
foodshare/
├── backend/                  # Express REST API (MVC)
│   ├── src/
│   │   ├── config/           # AWS SDK v3 clients, table names
│   │   ├── models/           # DynamoDB data-access layer (User, Donation)
│   │   ├── controllers/      # Business logic (auth, users, donations, admin)
│   │   ├── routes/           # REST route definitions
│   │   ├── middleware/       # JWT auth, role guard, validation, upload, errors
│   │   ├── utils/            # S3 upload, SNS publish, CloudWatch logger
│   │   ├── app.js            # Express app wiring
│   │   └── server.js         # Entry point
│   ├── scripts/               # createTables.js, createAdmin.js (one-off setup)
│   ├── aws/                   # iam-policy.json, s3-cors.json
│   └── .env.example
├── frontend/                  # React (Vite) SPA
│   └── src/
│       ├── api/               # Fetch API client + endpoint wrappers
│       ├── context/           # AuthContext (JWT session state)
│       ├── components/        # Navbar, Footer, DonationCard, ProtectedRoute…
│       └── pages/              # Landing, About, Contact, dashboards, forms
├── deployment/                # EC2_DEPLOYMENT.md, nginx.conf
└── TESTING.md                  # Manual + API test guide
```

## Roles & Features

- **Donor** — register/login, donate food (with image), view "My Donations",
  cancel a pending donation, mark an accepted donation completed, edit profile.
- **NGO** — register/login, browse "Available Donations" (search + filter),
  accept/reject donations, mark pickups completed, edit profile.
- **Admin** — dashboard with platform stats, manage users (block/unblock,
  delete), view all donations, seeded via a CLI script (`createAdmin.js`).

All roles share: JWT authentication, profile management, and logout.

## Quick Start (local development)

**Backend**
```bash
cd backend
npm install
cp .env.example .env        # set JWT_SECRET, AWS_REGION, table/bucket/topic names
node scripts/createTables.js
node scripts/createAdmin.js "Admin" admin@foodshare.org "ChangeMe123!"
npm run dev                  # http://localhost:5000
```

**Frontend**
```bash
cd frontend
npm install
cp .env.example .env        # VITE_API_BASE_URL=http://localhost:5000/api
npm run dev                  # http://localhost:5173
```

> Locally, the AWS SDK falls back to `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`
> in `.env` if set. In production on EC2, leave those unset and attach the IAM
> role from `backend/aws/iam-policy.json` instead — the SDK picks it up automatically.

## AWS Resources This App Uses

1. **DynamoDB** — `FoodShare_Users` (GSI: `email-index`) and
   `FoodShare_Donations` (GSIs: `donorId-index`, `status-index`). Created by
   `backend/scripts/createTables.js`.
2. **S3** — one bucket (`foodshare-food-images`) for donation photos, uploaded
   via `@aws-sdk/client-s3` from `backend/src/utils/s3.js`.
3. **SNS** — one topic (`FoodShareNotifications`) that fans out registration,
   new-donation, accepted, rejected, and completed events.
4. **CloudWatch Logs** — log group `/foodshare/backend` receives structured
   request/error logs from every API call.
5. **IAM** — a single least-privilege role/policy (`backend/aws/iam-policy.json`)
   scoped to exactly the DynamoDB tables, S3 bucket, SNS topic, and log group
   above.
6. **EC2** — hosts both the Express API (via PM2) and the built React app
   (served as static files by Nginx, which also reverse-proxies `/api`). See
   `deployment/EC2_DEPLOYMENT.md` for the full step-by-step.

## Documentation

- [`deployment/EC2_DEPLOYMENT.md`](deployment/EC2_DEPLOYMENT.md) — full EC2 + Nginx + PM2 setup
- [`TESTING.md`](TESTING.md) — curl-based API tests, AWS verification steps, manual QA checklist

## Security Notes

- Passwords are hashed with **bcrypt** (never stored in plaintext).
- All protected routes require a valid **JWT** (`Authorization: Bearer <token>`).
- Role-based access control is enforced server-side on every sensitive route,
  not just hidden in the UI.
- Production credentials come from the **EC2 IAM role**, not `.env` files —
  `.env` is only used for local development and is git-ignored.
