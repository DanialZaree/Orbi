# Orbi — AI Conversational Assistant

Orbi is a modern full-stack AI assistant with multi-modal conversational support, live code syntax highlighting, rich Markdown and LaTeX formula rendering, session persistence, and secure authentication (Google OAuth 2.0 & Email/OTP verification).

---

## Features

- 🤖 **Multi-Modal AI Conversations**: Powered by Google Generative AI (Gemini) with automatic model fallback (`gemini-2.5-flash` → `gemini-2.0-flash` → `gemini-1.5-flash`). Supports text, images, videos, and document file attachments.
- 🎨 **Modern Responsive UI**: Built with React 19, Tailwind CSS v4, Lucide icons, and custom typewriter streaming presentation.
- 💻 **Syntax Highlighting & Math**: Shiki code highlighting with copy-to-clipboard functionality and KaTeX math formulas via `remark-math` and `rehype-katex`.
- 🔒 **Hardened Authentication**:
  - Google OAuth 2.0 via Google Identity Services (`@react-oauth/google`).
  - Local Email + Password registration with 4-digit OTP email verification powered by Resend.
  - Brute-force protection on OTP (maximum 5 attempts) and 60-second request cooldowns.
  - Signed JSON Web Tokens (JWT) with 15-day expiration and bcrypt password hashing.
- 🛡️ **Enterprise Security Hardening**:
  - Strict input sanitization and NoSQL injection defenses.
  - ReDoS-immune $O(1)$ Base64 Data URI parser.
  - Production error masking to prevent stack and internal database URI leakage.
  - Security headers: HSTS (Strict-Transport-Security), X-Content-Type-Options nosniff, SAMEORIGIN framing, and OAuth-safe COOP headers (`same-origin-allow-popups`).
  - Dual-tier rate limiting for general API requests and authentication routes.
- 🧪 **Automated Testing & Linting**: Built-in Vitest smoke tests for the frontend and Node.js native test runner (`node:test`) for the backend. ESLint 9 flat configurations for both client and server.

---

## Demo Video

https://github.com/user-attachments/assets/3ba4087f-4c9d-497d-96dd-23cfacf1a161

---

## Tech Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | React 19, Vite 7, Tailwind CSS v4, Wouter, Axios, Lucide React, Shiki, KaTeX |
| **Backend** | Node.js (>=20 LTS), Express.js 5, Mongoose 8, Google Generative AI SDK, Resend SDK, JWT, BcryptJS |
| **Database** | MongoDB Atlas / Local MongoDB instance |
| **Tooling & CI** | GitHub Actions, Dependabot, Vitest, Node Test Runner, ESLint 9, Prettier |

---

## Requirements

- **Node.js**: `v20.x` or `v22.x+` (LTS recommended; tested on Node 24 LTS)
- **npm**: `v10.x` or `v11.x`
- **MongoDB**: MongoDB instance or MongoDB Atlas cluster URI
- **Google AI Studio API Key**: For Gemini model access
- **Google Cloud OAuth 2.0 Credentials**: For Google Sign-In
- **Resend API Key**: (Optional for local dev) For sending verification emails

---

## Project Structure

```text
Orbi/
├── .github/
│   ├── dependabot.yml              # Dependabot automated dependency update config
│   └── workflows/
│       ├── ci.yml                  # Automated test, lint, audit & build workflow
│       └── react-doctor.yml        # React code health scanner
├── client/                         # Frontend Single Page Application (React 19 + Vite)
│   ├── public/                     # Static icons, fonts, and assets
│   ├── src/
│   │   ├── assets/                 # Brand images and illustrations
│   │   ├── components/             # React UI components (ChatWindow, Sidebar, Auth, etc.)
│   │   ├── context/                # Authentication context and global state
│   │   ├── lib/                    # Shared client utilities
│   │   ├── services/               # Axios API client
│   │   ├── App.jsx                 # Main application layout and routing
│   │   └── main.jsx                # Application root entry point
│   ├── .env.example                # Client environment template
│   ├── eslint.config.js            # ESLint 9 flat config for React
│   ├── jsconfig.json               # Path alias and module resolution config
│   ├── package.json                # Frontend manifests and dependencies
│   ├── vercel.json                 # Vercel deployment routing rewrites
│   └── vite.config.js              # Vite configuration with chunk splitting & proxy
├── server/                         # Backend REST API (Node.js + Express 5)
│   ├── controllers/                # Request handlers (authController, chatController)
│   ├── middleware/                 # Security headers, auth token verification, rate limiting
│   ├── models/                     # Mongoose schemas (User, Chat)
│   ├── routes/                     # Express route routers (/api/auth, /api/chat)
│   ├── utils/                      # Chat helpers, Data URI parsers, and test suites
│   ├── .env.example                # Server environment template
│   ├── eslint.config.js            # ESLint 9 flat config for Node.js
│   ├── package.json                # Backend manifests and dependencies
│   └── server.js                   # Server entry point, middleware & database connection
├── .gitignore                      # Workspace-wide git ignore rules (archives, env, caches)
├── CHANGELOG.md                    # Record of major changes, fixes, and security patches
├── package.json                    # Workspace orchestrator scripts
├── README.md                       # Documentation
└── SECURITY.md                     # Security vulnerability disclosure policy
```

---

## Environment Variables

### 1. Server Environment (`server/.env`)

Copy `server/.env.example` to `server/.env`:

```bash
cp server/.env.example server/.env
```

| Variable | Description | Example / Default |
| --- | --- | --- |
| `PORT` | Server listening port | `5000` |
| `CLIENT_URL` | Frontend origin for CORS | `http://localhost:5173` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/orbi` |
| `GEMINI_API_KEY` | Google Gemini API Key | `AIzaSy...` |
| `GOOGLE_CLIENT_ID` | Google OAuth Web Client ID | `123456...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET`| Google OAuth Client Secret | `GOCSPX-...` |
| `JWT_SECRET` | Secret key for signing JWTs (min 32 chars) | `your_secure_random_string` |
| `RESEND_API_KEY` | Resend API key for OTP emails | `re_...` |
| `EMAIL_FROM` | Sender display name and address | `"Orbi" <support@orbiai.ir>` |

### 2. Client Environment (`client/.env`)

Copy `client/.env.example` to `client/.env`:

```bash
cp client/.env.example client/.env
```

| Variable | Description | Default |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Backend base URL (leave empty in dev to use Vite proxy) | `http://localhost:5000/api` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID for sign-in button | `123456...apps.googleusercontent.com` |

> [!WARNING]
> Never put server secrets (such as `MONGO_URI`, `JWT_SECRET`, or `GEMINI_API_KEY`) into the `client/.env` file. Any variable prefixed with `VITE_` is compiled into the public client bundle and exposed to all visitors.

---

## Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/danialzaree/orbi.git
   cd orbi
   ```

2. **Install all dependencies**:
   ```bash
   # Install root orchestration tools
   npm install

   # Install client dependencies
   cd client && npm install && cd ..

   # Install server dependencies
   cd server && npm install && cd ..
   ```

---

## Running the Application

### Development Mode (Concurrent Frontend & Backend)

Run both the server (`localhost:5000`) and the Vite development server (`localhost:5173`) in one command:

```bash
npm run dev
```

Or run them individually:

```bash
# Terminal 1: Backend
npm run start-server

# Terminal 2: Frontend
npm run start-client
```

---

## Testing & Linting

### Run All Tests
Runs both backend test suites (`node:test`) and frontend test suites (`vitest`):
```bash
npm test
```

### Run Linters
Runs ESLint across both the server and client:
```bash
npm run lint
```

### Format Codebase
Formats all files with Prettier:
```bash
npm run format
```

---

## Building for Production

Compile and optimize the client application:
```bash
npm run build
```
Production assets are generated in `client/dist/` with automated manual chunk splitting for optimal cacheability and load times.

---

## Deployment

### Frontend (Vercel)
The `client` is pre-configured for Vercel deployment with client-side SPA routing (`client/vercel.json`).
1. Connect the repository to Vercel.
2. Set Root Directory to `client`.
3. Configure environment variables (`VITE_API_BASE_URL`, `VITE_GOOGLE_CLIENT_ID`).
4. Build command: `npm run build`, Output directory: `dist`.

### Backend (Node.js / VPS / Docker / Cloud)
1. Set `NODE_ENV=production`.
2. Configure all environment variables in your hosting environment (`PORT`, `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, etc.).
3. Start the server using:
   ```bash
   npm start --prefix server
   ```

---

## License

MIT License. Created by [Danial Zaree](https://github.com/danialzaree).
