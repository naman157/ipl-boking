# 🏏 IPL Ticket Booking — Full Stack App

A complete IPL 2025 ticket booking platform with React frontend, Node.js/Express backend, MongoDB, and Stripe payments.

---

## 🗂️ Project Structure

```
ipl-booking/
├── backend/               # Node.js + Express API
│   ├── models/            # Mongoose schemas (User, Match, Booking, Seat)
│   ├── routes/            # REST API routes
│   ├── middleware/        # JWT auth middleware
│   ├── server.js          # Main Express server
│   └── .env.example       # Environment variables template
│
└── frontend/              # React app
    └── src/
        ├── components/    # Navbar, MatchCard
        ├── pages/         # All page components
        ├── context/       # AuthContext (global state)
        └── utils/         # Axios API helpers
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Stripe account (for payments)

---

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and Stripe keys
npm run dev
# API running at http://localhost:5000
```

**Seed sample matches** (first-time only):
```bash
curl -X POST http://localhost:5000/api/matches/seed
```

---

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your Stripe publishable key
npm start
# App running at http://localhost:3000
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for JWT signing (any long random string) |
| `STRIPE_SECRET_KEY` | Stripe secret key (sk_test_...) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret (whsec_...) |
| `CLIENT_URL` | Frontend URL for CORS |

### Frontend (`frontend/.env`)
| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | Backend API URL |
| `REACT_APP_STRIPE_PK` | Stripe publishable key (pk_test_...) |

---

## 🏗️ API Endpoints

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user (auth required) |
| PUT | `/api/auth/profile` | Update profile (auth required) |

### Matches
| Method | Route | Description |
|---|---|---|
| GET | `/api/matches` | List all matches (filter: status, city, team) |
| GET | `/api/matches/:id` | Get match details |
| POST | `/api/matches/seed` | Seed sample IPL 2025 matches |

### Seats
| Method | Route | Description |
|---|---|---|
| GET | `/api/seats/:matchId` | Get all seats for a match |
| POST | `/api/seats/:matchId/generate` | Generate seat layout |
| POST | `/api/seats/:matchId/hold` | Hold seats for 10 min (auth) |
| POST | `/api/seats/:matchId/release` | Release held seats (auth) |

### Bookings
| Method | Route | Description |
|---|---|---|
| GET | `/api/bookings/my` | Get user's bookings (auth) |
| GET | `/api/bookings/:id` | Get booking details (auth) |
| POST | `/api/bookings/create` | Create booking (auth) |
| POST | `/api/bookings/:id/confirm` | Confirm after payment (auth) |
| POST | `/api/bookings/:id/cancel` | Cancel booking (auth) |

### Payments
| Method | Route | Description |
|---|---|---|
| POST | `/api/payments/create-intent` | Create Stripe payment intent (auth) |
| POST | `/api/payments/verify` | Verify payment success (auth) |
| POST | `/api/payments/webhook` | Stripe webhook handler |

---

## ✨ Features

- 🏟️ **Match Schedule** — All IPL 2025 fixtures with team colors, venue, timing
- 🗺️ **Stadium Map** — Visual seat picker with category zones (Platinum/Gold/Silver/General)
- 💺 **Seat Grid** — Row-by-row seat selection with live availability
- ⏱️ **10-Min Hold** — Seats held while you complete checkout
- 💳 **Payment Flow** — Stripe-powered with card details form
- 🎟️ **E-Ticket** — QR-coded booking confirmation
- 📋 **Booking History** — View, download, cancel past bookings
- 🔐 **JWT Auth** — Secure login/register with bcrypt passwords

---

## 🎨 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Axios |
| Styling | CSS Variables, Google Fonts (Bebas Neue + DM Sans) |
| Backend | Node.js, Express 4 |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Payments | Stripe |
| Notifications | react-hot-toast |

---

## 🚀 Production Deployment

**Backend**: Deploy to Railway, Render, or EC2. Set all env vars.

**Frontend**: `npm run build` → deploy `/build` to Vercel, Netlify, or S3.

**MongoDB**: Use MongoDB Atlas for managed cloud database.

**Stripe**: Switch to live keys (`sk_live_`, `pk_live_`) when going live.

---

## 📝 Notes

- The checkout page uses a simulated payment in demo mode. For production, integrate Stripe Elements for real card processing.
- Seat generation (`POST /api/seats/:matchId/generate`) must be called once per match before seat selection works.
- Expired seat holds are automatically released on the next seats fetch.
