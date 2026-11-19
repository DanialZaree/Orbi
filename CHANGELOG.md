# Changelog

All notable changes to the Orbi project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased] - 2026-11-19

### Modernization & Security Hardening (`modernize/orbi-update`)

#### Added
- **Automated Testing**:
  - Added frontend smoke test suites using Vitest and `@testing-library/react` (`client/src/lib/utils.test.js`, `client/src/components/ui/spinner.test.jsx`, `client/src/components/NotFound/index.test.jsx`).
  - Wired up backend tests (`node:test`) and client tests under unified root scripts (`npm test`, `npm run test:server`, `npm run test:client`).
- **Backend Linting**:
  - Configured ESLint 9 Flat Config for Node.js backend (`server/eslint.config.js`).
  - Unified workspace linting via root `npm run lint`.
- **CI / CD Pipeline**:
  - Added GitHub Actions workflow (`.github/workflows/ci.yml`) to install, lint, test, build, and run dependency security audits on Node.js 20 and 22 across PRs and pushes.
  - Added Dependabot configuration (`.github/dependabot.yml`) for weekly automated dependency updates across root, frontend, backend, and GitHub Actions.
- **Security & Templates**:
  - Added `SECURITY.md` detailing vulnerability disclosure guidelines and security standards.
  - Added `server/.env.example` and overhauled `client/.env.example`.
  - Added development reverse proxy in `client/vite.config.js` to streamline local API requests to `/api`.

#### Security Fixes & Hardening
- **Zero High/Critical CVEs**:
  - Remediated critical prototype pollution & discriminator poisoning in `mongoose`.
  - Remediated critical IP spoofing in `proxy-addr`.
  - Remediated critical command injection in `shell-quote` (via `concurrently` upgrade).
  - Remediated 9 high-severity vulnerabilities in `axios`, `vite`, `undici`, `brace-expansion`, and `browserslist`.
- **Credential Protection**:
  - Removed committed 8MB `server.zip` archive containing unencrypted production `.env` secrets.
  - Sanitized `client/.env` by removing backend credentials (`VITE_MONGO_URI`, `VITE_GEMINI_API_KEY`, `VITE_JWT_SECRET`) which were being bundled into public client assets.
  - Added archive extensions (`*.zip`, `*.tar`, `*.tgz`) to root `.gitignore`.
- **CodeQL & Workflow Hardening**:
  - Remediated CodeQL polynomial regular expression denial-of-service (ReDoS) alerts (#30, #31, #32) in `server/controllers/authController.js` by replacing backtracking regex with linear $O(n)$ parser `isValidEmail` enforcing RFC 5321 limits.
  - Resolved CodeQL workflow permissions alert (#33) in `.github/workflows/ci.yml` by enforcing least-privilege `permissions: contents: read`.
- **NoSQL Injection Prevention**:
  - Enforced strict string type checks and email regex validation across all authentication endpoints (`loginWithEmail`, `requestEmailOTP`, `verifyEmailAndRegister`).
  - Added string type checks and length constraints on chat titles and messages.
- **Brute-Force & Denial of Service Hardening**:
  - Added attempt counter (`otpAttempts`) to user schema, locking OTPs after 5 failed attempts.
  - Added 60-second cooldown protection on OTP requests to prevent email flooding.
  - Enforced maximum password length (128 characters) to mitigate bcrypt hashing CPU exhaustion attacks.
  - Enforced maximum attachment count (10 items) per chat message.
- **ReDoS Mitigation**:
  - Replaced regular expression Base64 Data URI matching with an $O(1)$ string-slicing parser, preventing event loop blocking on multi-megabyte media payloads.
- **Header & CORS Hardening**:
  - Updated `Cross-Origin-Opener-Policy` to `same-origin-allow-popups` to support Google OAuth 2.0 authentication.
  - Updated `Cross-Origin-Resource-Policy` to `cross-origin`.
  - Enforced Strict-Transport-Security (HSTS) with 1-year max-age.
  - Prevented CORS middleware from throwing unhandled 500 errors on disallowed origins.
  - Masked internal server error messages in production on 500 status responses.

#### Changed & Performance Optimizations
- **Build & Chunk Optimization**:
  - Configured Rollup `manualChunks` in `client/vite.config.js` to split vendor packages (`vendor-react`, `vendor-markdown`, `vendor-icons`).
  - Reduced main client bundle size from 910 kB down to 447 kB (over 50% reduction).
  - Cut client build time from 11.5s down to 4.3s.
- **Dependency Upgrades**:
  - `concurrently`: updated from `8.2.2` to `^10.0.7`.
  - `prettier`: updated from `3.6.2` to `^3.10.1`.
  - `prettier-plugin-tailwindcss`: updated from `0.7.1` to `^0.8.1`.
  - `mongoose`: updated to `8.24.10` (resolving critical vulnerabilities).
  - `axios`: updated to `^1.19.0` (resolving prototype pollution & SSRF CVEs).
  - `vite`: updated to `^7.3.8`.
  - `vitest`: updated to `^4.1.12`.
  - `tailwindcss`: updated to `^4.3.5`.
  - `wouter`: updated to `^3.13.0`.
- **Model Fallbacks**:
  - Replaced unsupported model identifiers (`gemini-3.5-flash-lite`, `gemini-3.1-flash-lite`) with active, supported Google Gemini models (`gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-flash`).
- **Accessibility**:
  - Converted non-interactive modal close `<div>` elements into accessible `<button type="button">` with descriptive ARIA labels.
  - Added `aria-label` attributes to password visibility toggle buttons.
- **Documentation**:
  - Fully rewrote `README.md` with detailed architecture, installation, environment variables, test, build, and deployment instructions.

#### Removed
- Deleted obsolete root prototype mockup `code.html`.
- Deleted unused duplicate re-export file `server/utils/chatUtils.js`.
- Deleted default starter template assets `client/src/assets/react.svg` and `client/public/vite.svg`.
- Deleted tracked `server.zip` archive.
