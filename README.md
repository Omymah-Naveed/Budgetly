# Budgetly

A full-stack personal finance workspace for tracking income and expenses, planning monthly budgets, and understanding spending patterns.

## Features

- JWT authentication with bcrypt password hashing
- Forgot-password and reset-password flow with expiring, single-use tokens
- Profile management, currency preference, and password changes
- Income and expense tracking with category filtering
- Current and historical monthly budgets
- Dashboard analytics, cash-flow charts, and category breakdowns
- CSV and JSON data export
- Responsive light and dark themes
- Account deletion with password confirmation
- API security with Helmet, restricted CORS, rate limiting, and request size limits

## Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS 4, Recharts, Axios, Lucide React

**Backend:** Node.js, Express 5, MongoDB, Mongoose, JWT, bcryptjs, Nodemailer

## Project Structure

```text
Budgetly/
├── frontend/                 # React + Vite application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── data/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── vercel.json
└── backend/                  # Express API
    ├── config/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── services/
    └── server.js
```

## Local Development

### Prerequisites

- Node.js 22 or newer
- MongoDB database (local or MongoDB Atlas)
- Gmail account with a Google App Password for password-reset emails

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Fill in `backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
CLIENT_URL=http://localhost:5173
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-google-app-password
```

The API runs at `http://localhost:5000`. Health check:

```text
GET http://localhost:5000/api/health
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The application runs at `http://localhost:5173`.

## Environment Variables

### Backend

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | API port, defaults to `5000` |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret used to sign JWT access tokens |
| `CLIENT_URL` | Yes | Frontend URL used for CORS and reset links |
| `EMAIL_USER` | Yes* | Gmail address used to send reset emails |
| `EMAIL_PASS` | Yes* | Gmail App Password |

\* When email credentials are missing, the reset link is logged to the server console instead of being emailed.

### Frontend

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | No | API base URL, defaults to `http://localhost:5000/api` |

## Available Scripts

### Frontend

```bash
npm run dev      # Start Vite development server
npm run lint     # Run ESLint
npm run build    # Create production build
npm run preview  # Preview production build
```

### Backend

```bash
npm run dev      # Start API with Node watch mode
npm start        # Start API
```

## API Overview

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create an account |
| `POST` | `/api/auth/login` | Sign in |
| `GET` | `/api/auth/me` | Get current user |
| `PUT` | `/api/auth/profile` | Update profile |
| `PUT` | `/api/auth/password` | Change password |
| `POST` | `/api/auth/forgot-password` | Request a reset link |
| `POST` | `/api/auth/reset-password/:token` | Reset password |
| `DELETE` | `/api/auth/account` | Delete account and data |
| `GET` | `/api/transactions` | List transactions |
| `POST` | `/api/transactions` | Create a transaction |
| `PUT` | `/api/transactions/:id` | Update a transaction |
| `DELETE` | `/api/transactions/:id` | Delete a transaction |
| `GET` | `/api/budgets?year=YYYY&month=M` | Get monthly budgets |
| `PUT` | `/api/budgets?year=YYYY&month=M` | Update total monthly budget |
| `PUT` | `/api/budgets/:category?year=YYYY&month=M` | Update category budget |

All `/api/transactions`, `/api/budgets`, and protected `/api/auth` routes require an `Authorization: Bearer <token>` header.

## Deployment

The frontend is configured for Vercel. When importing the repository:

- Set the Vercel Root Directory to `frontend`
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Add `VITE_API_URL` with the deployed API URL, including `/api`

The Express backend requires a Node.js host such as Render or Railway, along with MongoDB Atlas. Set `CLIENT_URL` to the deployed frontend URL.

## Security Notes

- Never commit `.env` files or real credentials.
- Use a strong, unique `JWT_SECRET` in production.
- Use a Google App Password rather than a Gmail account password.
- Restrict MongoDB Atlas network access to trusted sources where possible.
- Rate limits use in-memory storage and are intended for single-instance deployments.
