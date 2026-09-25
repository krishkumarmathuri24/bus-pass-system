# Cloud-Based Bus Pass System

A full-stack bus pass booking system: React + Tailwind frontend, Node/Express
backend, PostgreSQL via Sequelize, JWT auth, and signed QR-code tickets.

## Why this design solves Task 3

| Requirement | How it's addressed |
|---|---|
| Ticket loss/theft prevention | Passes are digital, tied to your account. QR codes encode a **signed JWT**, not raw data — a screenshotted/copied QR fails signature or status checks on scan (`backend/src/utils/qrcode.js`, `POST /tickets/validate`). |
| Incorrect pricing | The client never sends a price. `POST /tickets/book` looks up price server-side from the `Pricing` table only (`backend/src/routes/tickets.js`). |
| High traffic / dynamic provisioning | Stateless Express instances behind a load balancer, ready for auto-scaling (see Deployment). Rate limiting protects a single instance until the scaler catches up. |
| Scalability & reliability | Horizontal scaling, health-check endpoint (`GET /health`) for orchestrators, stateless API so any instance can serve any request. |
| Seamless booking UX | Responsive React/Tailwind frontend: Home, Book Ticket, My Passes, Bus Tracker. |

## Folder structure

```
bus-pass-system/
├── backend/         Express API (auth, tickets, buses, users)
│   ├── src/
│   │   ├── config/db.js
│   │   ├── models/        User, Bus, Pricing, Ticket
│   │   ├── routes/        auth, tickets, buses, users
│   │   ├── middleware/auth.js
│   │   ├── utils/qrcode.js
│   │   └── server.js
│   └── seed/seed.js       sample buses + pricing
├── frontend/        React app
│   └── src/
│       ├── pages/         Home, Login, BookTicket, MyPasses, BusTracker
│       ├── components/Navbar.jsx
│       ├── context/AuthContext.jsx
│       └── api/axios.js
├── docker/          Dockerfile.backend, Dockerfile.frontend, docker-compose.yml
└── docs/README.md
```

## Running locally

### Option A — Docker (recommended, no local Postgres/Node needed)

```bash
git clone <your-repo-url> bus-pass-system
cd bus-pass-system
docker compose -f docker/docker-compose.yml up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Seed sample data (in a second terminal, once containers are up):
  ```bash
  docker compose -f docker/docker-compose.yml exec backend npm run seed
  ```

### Option B — Manual (Node + local Postgres)

1. **Database**: create a Postgres database named `bus_pass_db`.
2. **Backend**
   ```bash
   cd backend
   cp .env.example .env    # fill in DB credentials + JWT_SECRET
   npm install
   npm run seed             # sample buses & pricing
   npm run dev               # http://localhost:5000
   ```
3. **Frontend**
   ```bash
   cd frontend
   npm install
   # optional: create .env with
   #   REACT_APP_API_URL=http://localhost:5000
   #   REACT_APP_GOOGLE_MAPS_API_KEY=your_key   (Bus Tracker map)
   npm start                 # http://localhost:3000
   ```

## Deploying to the cloud (Railway/Heroku free tier)

Both platforms work the same way for this stack:

1. **Provision a Postgres add-on/plugin** — it gives you a `DATABASE_URL`.
   The backend already prefers `DATABASE_URL` over individual `DB_*` vars
   (`backend/src/config/db.js`), so no code change is needed.
2. **Deploy the backend**
   - Point the platform at `docker/Dockerfile.backend`, build context = repo root.
   - Set environment variables: `DATABASE_URL` (auto-set by the add-on),
     `JWT_SECRET`, `JWT_EXPIRES_IN`.
   - Run the seed once after first deploy: `npm run seed` (via the platform's one-off dyno/shell).
3. **Deploy the frontend**
   - Point the platform at `docker/Dockerfile.frontend`, build context = repo root.
   - Set `REACT_APP_API_URL` to your deployed backend URL and
     `REACT_APP_GOOGLE_MAPS_API_KEY` if you want live tracking, **before building**
     (Create React App bakes env vars in at build time).
4. **Auto-scaling**: on Railway/Heroku's free tier this is limited, but the
   backend is written to support it out of the box — it's stateless (no
   in-memory sessions), reads its port from `process.env.PORT`, and exposes
   `GET /health` for the platform's health checks. On a platform with real
   autoscaling (e.g. AWS ECS/Fargate, Google Cloud Run), you can point the
   scaler at CPU or request-count thresholds using the same Docker image.

## API overview

| Method & path | Auth | Purpose |
|---|---|---|
| `POST /auth/signup` | – | Create account, returns JWT |
| `POST /auth/login` | – | Log in, returns JWT |
| `GET /users/me` | user | Current profile |
| `GET /buses` | – | List active routes |
| `GET /buses/:id/pricing` | – | Active prices for a route |
| `GET /buses/:id/location` | – | Dummy live GPS position |
| `POST /tickets/book` | user | Book a pass, returns ticket + QR image |
| `GET /tickets/mine` | user | "My Passes" list |
| `GET /tickets/:id/qr` | user | Re-fetch QR image for an existing pass |
| `POST /tickets/validate` | admin | Conductor/scanner: validate & consume a QR |

## Notes & next steps

- Migrations: this scaffold uses `sequelize.sync()` for simplicity. For a
  real deployment, switch to `sequelize-cli` migrations.
- Payments: no payment processor is wired in — add Stripe/Razorpay in the
  `/tickets/book` flow before marking a ticket paid.
- Real GPS: `Bus.currentLat/currentLng` is demo data. A production tracker
  would have bus-mounted devices push position updates (e.g. via MQTT or a
  websocket) instead of reading a static DB column.
