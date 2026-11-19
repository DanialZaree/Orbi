# Security Policy

## Supported Versions

Only the latest release of Orbi is actively supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of Orbi and user data seriously. If you discover a security vulnerability, please do **NOT** open a public issue.

Instead, please report security vulnerabilities responsibly:

1. Send an email to security/maintainer: `danialzaree0@gmail.com` (or submit a private security advisory on GitHub).
2. Include a detailed description of the vulnerability, reproduction steps, and impact.
3. We will acknowledge receipt within 48 hours and work on a remediation promptly.

## Security Practices in Orbi

- **Zero High/Critical Dependency CVEs**: Continuous scanning via GitHub Actions and Dependabot.
- **Authentication**: JWT authentication with expiry, bcrypt password hashing, and rate-limited 4-digit OTP registration with attempt throttling.
- **NoSQL Injection Defense**: Strict type validation, object identifier sanitization, and structured query constraints.
- **Header Protections**: Strict-Transport-Security (HSTS), X-Content-Type-Options nosniff, SAMEORIGIN framing, and OAuth-safe Cross-Origin-Opener-Policy (`same-origin-allow-popups`).
- **Secrets Management**: Never commit `.env` or production credentials. Use `.env.example` templates and manage credentials via secure runtime secret stores.
