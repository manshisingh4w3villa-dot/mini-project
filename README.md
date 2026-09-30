# Nook Workspaces

A full-stack co-working space booking platform built on the PERN stack (PostgreSQL, Express, React, Node.js). Supports user authentication (standard and Google OAuth), profile management, workspace discovery and booking, subscription-based pricing plans with Stripe payments, and an admin panel.

**Live app:** https://mini-projectfrontend.vercel.app
**API:** https://mini-project-backend-beta.vercel.app

---

## Features

- Email/password signup with bcrypt password hashing
- Email verification via [Resend](https://resend.com)
- JWT-based login and session handling
- Google OAuth login with account-merge logic (social login links to an existing account sharing the same email, rather than creating a duplicate)
- Profile management, including profile picture upload
- Coworking location and workspace browsing
- Slot-based workspace booking
- Subscription pricing plans with Stripe payment processing
- Admin panel for user and booking management

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Context API, Axios |
| Backend | Node.js, Express |
| Database | PostgreSQL ([Neon](https://neon.tech) in production) |
| Auth | JWT, Google OAuth 2.0, bcrypt |
| Email | Resend |
| Payments | Stripe |
| File storage | Cloudinary |
| Hosting | Vercel (frontend and backend deployed as separate projects) |

## Project Structure

```
mini-project/
├── backend/
│   ├── src/
│   │   ├── config/         # DB connection, URL helpers
│   │   ├── controllers/    # Route handlers (auth, bookings, admin, payments...)
│   │   ├── routes/         # Express route definitions
│   │   ├── middleware/     # Auth middleware, error handling
│   │   ├── models/         # Database queries
│   │   ├── utils/
│   │   └── cron/           # Scheduled jobs (booking cleanup, plan expiration)
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/        # AuthContext (global auth state)
│   │   ├── services/       # API client, auth service
│   │   └── App.jsx
│   ├── index.html
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (local instance for development)
- A [Resend](https://resend.com) API key
- A [Google Cloud](https://console.cloud.google.com) OAuth client ID and secret
- A [Stripe](https://stripe.com) account (test mode is fine)

### 1. Clone the repo

```bash
git clone https://github.com/manshisingh4w3villa-dot/mini-project.git
cd mini-project
```

### 2. Set up the database

```bash
createdb coworking_db
psql -d coworking_db -c "CREATE USER coworking_user WITH PASSWORD 'yourpassword';"
psql -d coworking_db -c "GRANT ALL ON SCHEMA public TO coworking_user;"
```

Apply the schema (see `backend/schema.sql` if present, or run migrations if the project uses them).

### 3. Backend setup

```bash
cd backend
npm install
cp .env.example .env   # fill in real values, see below
npm run dev
```

Backend runs on `http://localhost:3000` by default.

### 4. Frontend setup

```bash
cd ../frontend
npm install
cp .env.example .env   # fill in real values, see below
npm run dev
```

Frontend runs on `http://localhost:5173` by default.

## Environment Variables

### `backend/.env`

```
PORT=3000
DATABASE_URL=postgresql://coworking_user:yourpassword@localhost:5432/coworking_db
JWT_SECRET=

# Public URLs, used for OAuth redirects and CORS
API_BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# Google OAuth — register these callback URLs in Google Cloud Console:
# http://localhost:3000/api/auth/google/callback
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Email verification (Resend)
RESEND_API_KEY=
EMAIL_FROM=onboarding@resend.dev   # use a verified domain sender in production

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Cloudinary (profile picture uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Google Maps (address autosuggest / map display)
GOOGLE_MAPS_API_KEY=
```

### `frontend/.env`

```
VITE_API_URL=http://localhost:3000/api
```

## Deployment

The backend and frontend are deployed as **two separate Vercel projects** from this one repository, with their respective `Root Directory` set to `backend` and `frontend`.

- Database is hosted on [Neon](https://neon.tech) (serverless PostgreSQL) in production.
- `FRONTEND_URL` and `API_BASE_URL` on the backend must point to the real deployed URLs (not `localhost`) for CORS and OAuth redirects to work correctly.
- `VITE_API_URL` on the frontend is baked in at build time — update it and redeploy (`vercel --prod`) if the backend URL changes.
- A `vercel.json` rewrite rule in `frontend/` is required so client-side routes (e.g. `/verify-email`) don't 404 on direct navigation:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```

## Key API Endpoints

| Method / Path | Purpose |
|---|---|
| `POST /api/auth/signup` | Create account, send verification email |
| `POST /api/auth/login` | Authenticate, issue JWT |
| `GET /api/auth/google` | Begin Google OAuth flow |
| `GET /api/auth/google/callback` | Complete OAuth, merge or create account |
| `GET /api/auth/verify-email` | Confirm email via token |
| `GET /api/locations`, `/api/workspaces` | Browse coworking locations and workspaces |
| `POST /api/bookings` | Create a booking |
| `POST /api/payments/webhook` | Stripe payment webhook handler |
| `/api/admin/*` | Admin-only user and booking management |

## Known Limitations

- **Cron jobs** (booking slot cleanup, plan-expiration checks) are built for a long-running Node process and don't reliably execute on Vercel's serverless model. Move to [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) or an external scheduler for production use.
- **Email delivery** uses Resend's sandbox sender (`onboarding@resend.dev`), which only delivers to the account owner's own verified email. A custom verified domain is required for real user delivery.
- **Social login** currently supports Google only. Facebook was scoped out (no developer account available at the time); Instagram's login APIs require a Business/Creator account and don't fit a general consumer signup flow.

## License

This project was built as part of an SDE trainee evaluation exercise.
