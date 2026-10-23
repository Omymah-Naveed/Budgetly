# Budgetly

Budgetly is a full-stack MERN personal finance workspace for tracking income and expenses, planning monthly budgets, and understanding spending patterns. It combines a responsive React interface with a secure Express API, MongoDB persistence, JWT authentication, and Gmail-based password recovery.

The application is designed to be practical for everyday use and portfolio-ready: it includes authentication, profile management, historical budgets, analytics, data export, account deletion, and production-minded API security.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [Project Structure](#project-structure)
- [How to Run Locally](#how-to-run-locally)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Available Scripts](#available-scripts)
- [Security Notes](#security-notes)
- [Data Ownership](#data-ownership)
- [Troubleshooting](#troubleshooting)
- [Deployment Notes](#deployment-notes)

## Overview

Budgetly gives each user a private financial workspace. Users can record income and expenses, filter transactions, set category budgets for the current or previous months, and review charts that show cash flow and spending distribution. Passwords are hashed with bcrypt, API access is protected with JWT bearer tokens, and password reset links are delivered through Gmail SMTP.

The repository contains only application source code and example configuration. It does not contain a database dump, real credentials, or the original author's personal financial data.

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, Vite 8, Tailwind CSS 4, Recharts, Axios, Lucide React |
| Backend | Node.js, Express 5, MongoDB, Mongoose, JWT, bcryptjs |
| Email | Nodemailer with Gmail SMTP |
| Security | Helmet, restricted CORS, express-rate-limit, request body limits |
| Tooling | ESLint, npm, Vercel configuration for frontend routing |

## Key Features

### Authentication and Account Management

- User registration and login with JWT access tokens
- Passwords hashed with bcrypt before storage
- Protected profile updates with optional email-change verification
- Password change flow that verifies the current password
- Account deletion with password confirmation and typed `DELETE` confirmation
- Automatic removal of the user's transactions and budgets when an account is deleted

### Forgot and Reset Password

- Forgot-password request with a generic response to reduce account enumeration
- Cryptographically random reset tokens
- Reset tokens stored as SHA-256 hashes, never as plain text
- Single-use, 30-minute reset links
- Gmail SMTP delivery through Nodemailer
- Console fallback for local development when email credentials are not configured

### Personal Finance Tracking

- Add, edit, and delete income and expense transactions
- Category-based organization
- Transaction filtering by type and category
- Dashboard totals for income, expenses, and balance
- Recent transaction overview
- Responsive transaction table for desktop and mobile

### Budget Planning and History

- Monthly budgets by category
- Current-month and historical-month navigation
- Automatic seeding of default budgets for new accounts
- New periods inherit the most recent previous budget plan
- Total monthly budget tracking
- Budget progress indicators and spending comparisons
- Migration support for older budget records

### Insights, Export, and Experience

- Cash-flow chart across recent periods
- Expense distribution donut chart
- Category breakdown with spending insights
- CSV and JSON export
- Light and dark themes
- Responsive layout for desktop, tablet, and mobile
- Accessible forms, modals, and feedback states

### API Security

- Helmet security headers
- Strict CORS allow-list controlled by `CLIENT_URL`
- Rate limiting for authentication and password-reset routes
- 100 KB JSON request body limit
- Centralized JSON error handling
- No secrets committed to the repository

## Project Structure

```text
Budgetly/
├── backend/
│   ├── config/              # Shared configuration such as supported currencies
│   ├── middleware/          # JWT protection and rate limiters
│   ├── models/              # Mongoose models for users, transactions, and budgets
│   ├── routes/              # Authentication, transaction, and budget routes
│   ├── services/            # Budget seeding, migration, and email services
│   ├── .env.example         # Backend environment template
│   ├── package.json
│   └── server.js            # Express application and API entry point
├── frontend/
│   ├── public/              # Static icons and favicon
│   ├── src/
│   │   ├── assets/
│   │   ├── components/      # Auth, dashboard, budgets, transactions, settings, UI
│   │   ├── context/         # Authentication state
│   │   ├── data/            # Demo and fallback data
│   │   ├── pages/           # Authentication page
│   │   ├── services/        # Axios API clients
│   │   ├── utils/           # Finance, date, currency, CSV, and formatting helpers
│   │   ├── App.jsx
│   │   ├── Workspace.jsx
│   │   └── main.jsx
│   ├── .env.example         # Frontend environment template
│   ├── package.json
│   ├── vercel.json          # SPA routing for Vercel
│   └── vite.config.js
├── .gitignore
└── README.md
```

## How to Run Locally

### Prerequisites

- Node.js 22 or newer
- npm
- A MongoDB database, preferably a free MongoDB Atlas cluster
- A Gmail account with a Google App Password if you want password-reset emails

> Use your own MongoDB Atlas connection string. Do not use the original author's database. The repository does not include database credentials.

### 1. Clone the Repository

```bash
git clone https://github.com/Omymah-Naveed/Budgetly.git
cd Budgetly
```

### 2. Set Up the Backend

```bash
cd backend
npm install
```

Create your local environment file from the example:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Open `backend/.env` and replace the placeholder values with your own:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_random_secret
CLIENT_URL=http://localhost:5173
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_google_app_password
```

Generate a strong JWT secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Start the API:

```bash
npm run dev
```

The backend runs at `http://localhost:5000`. Verify it with:

```text
GET http://localhost:5000/api/health
```

### 3. Set Up the Frontend

Open a second terminal from the project root:

```bash
cd frontend
npm install
```

Create the frontend environment file:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Set the API URL:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### 4. Create Your Account

Register a new account from the authentication page. New accounts automatically receive a starter set of monthly category budgets. You can then add transactions, adjust budgets, switch currencies, export data, and test password recovery.

### MongoDB Atlas Notes

- Create your own Atlas cluster and database user.
- Add your current IP address to the Atlas network access list for local development.
- Set `MONGO_URI` to your own connection string.
- Keep the database username and password private.
- Cloud hosts with dynamic IP addresses may require broader network access; use a strong password and a database user limited to the required database.

### Gmail SMTP Notes

- Enable 2-Step Verification on the Gmail account.
- Create a Google App Password.
- Use that App Password as `EMAIL_PASS`; do not use the normal Gmail password.
- If email credentials are missing, the reset link is printed to the backend console for local development.

## Environment Variables

### Backend

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | API port. Defaults to `5000`. |
| `MONGO_URI` | Yes | MongoDB Atlas or local MongoDB connection string. |
| `JWT_SECRET` | Yes | Secret used to sign JWT access tokens. Use a long random value. |
| `CLIENT_URL` | Yes | Frontend origin used for CORS and password-reset links. Supports a comma-separated list; the first value is used in reset links. |
| `EMAIL_USER` | For email | Gmail address used by Nodemailer. |
| `EMAIL_PASS` | For email | Gmail App Password. Never use the normal account password. |

### Frontend

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | Production | API base URL including `/api`. Defaults to `http://localhost:5000/api` locally. Vite reads this value at build time. |

## API Endpoints

All endpoints are prefixed with `/api`. Protected routes require:

```text
Authorization: Bearer <jwt_token>
```

### Authentication

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | No | Create an account and receive a JWT. |
| `POST` | `/api/auth/login` | No | Authenticate and receive a JWT. |
| `GET` | `/api/auth/me` | Yes | Return the current user's profile. |
| `PUT` | `/api/auth/profile` | Yes | Update name, email, and currency. |
| `PUT` | `/api/auth/password` | Yes | Change the password after verifying the current one. |
| `POST` | `/api/auth/forgot-password` | No | Request a password-reset email. |
| `POST` | `/api/auth/reset-password/:token` | No | Set a new password using a valid reset token. |
| `DELETE` | `/api/auth/account` | Yes | Permanently delete the account and owned data. |

### Transactions

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/transactions` | Yes | List the user's transactions. |
| `POST` | `/api/transactions` | Yes | Create a transaction. |
| `PUT` | `/api/transactions/:id` | Yes | Update a transaction. |
| `DELETE` | `/api/transactions/:id` | Yes | Delete a transaction. |

### Budgets

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/budgets?year=YYYY&month=M` | Yes | Get budgets for a period. |
| `PUT` | `/api/budgets?year=YYYY&month=M` | Yes | Update the total monthly budget. |
| `PUT` | `/api/budgets/:category?year=YYYY&month=M` | Yes | Update a category budget. |

### Health

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/health` | No | API health check. |

## Available Scripts

### Backend

```bash
npm run dev      # Start the API with Node watch mode
npm start        # Start the API
```

### Frontend

```bash
npm run dev      # Start the Vite development server
npm run lint     # Run ESLint
npm run build    # Create a production build
npm run preview  # Preview the production build
```

## Security Notes

- Never commit `.env` files or real credentials.
- The root `.gitignore` excludes `.env`, `.env.*`, `node_modules`, build output, and Vercel local state.
- Use a unique, strong `JWT_SECRET` for every deployment.
- Use a Google App Password rather than a Gmail account password.
- Restrict MongoDB Atlas network access where possible.
- Rate limiting uses in-memory storage and is intended for a single-instance deployment. Multi-instance deployments should use a shared rate-limit store.
- Rotate any credential immediately if it is ever exposed.
- Do not include real connection strings, API keys, or passwords in screenshots, issues, or documentation.

## Data Ownership

This repository does not include a database or database credentials. Each user or deployment connects to its own MongoDB database through `MONGO_URI`.

Downloading or cloning this project does not copy the original author's data. If you configure your own MongoDB Atlas cluster, you will see your own empty database; default budgets are created when you register a new account. The original author's data remains in the original author's Atlas cluster and is unaffected.

## Troubleshooting

### Cannot Reach the API

- Confirm the backend is running on port `5000`.
- Confirm `frontend/.env` contains `VITE_API_URL=http://localhost:5000/api`.
- Restart the Vite development server after changing frontend environment variables.

### CORS Error

- Confirm `backend/.env` contains the exact frontend origin, for example `CLIENT_URL=http://localhost:5173`.
- Do not include a trailing slash unless your frontend actually uses one.

### MongoDB Connection Error

- Confirm `MONGO_URI` is correct and includes the database name.
- Confirm your current IP is allowed in MongoDB Atlas network access.
- Confirm the database user has permission to read and write the target database.

### Password Reset Email Not Received

- Confirm `EMAIL_USER` and `EMAIL_PASS` are set in `backend/.env`.
- Confirm `EMAIL_PASS` is a Google App Password, not the normal Gmail password.
- Check the backend console for email-delivery errors.
- In local development, the reset link is logged when email credentials are missing.

## Deployment Notes

- `frontend/vercel.json` configures SPA routing so direct visits to password-reset and application routes resolve correctly on Vercel.
- Deploy the API to a Node.js-compatible environment and configure the same backend environment variables there.
- Set the production `VITE_API_URL` to the deployed API URL, including `/api`.
- Set the production `CLIENT_URL` to the deployed frontend origin.
- Never commit environment files. Add secrets through the hosting provider's environment-variable settings.
- If the API is deployed to a serverless platform, use a serverless entrypoint and a cached database connection instead of the local `server.js` listener.

## Author

Omymah Naveed

- GitHub: [github.com/Omymah-Naveed](https://github.com/Omymah-Naveed)
- Repository: [github.com/Omymah-Naveed/Budgetly](https://github.com/Omymah-Naveed/Budgetly)
