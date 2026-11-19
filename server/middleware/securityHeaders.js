/**
 * Middleware to set modern security headers.
 * Protects against MIME sniffing, clickjacking, framing, and unauthorized resource embedding.
 */
const securityHeaders = (req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "SAMEORIGIN");

  // Enforce HTTPS (HSTS)
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  // Disable DNS prefetching
  res.setHeader("X-DNS-Prefetch-Control", "off");

  // Prevent IE from executing downloads in site's context
  res.setHeader("X-Download-Options", "noopen");

  // Referrer policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Disable legacy XSS filter
  res.setHeader("X-XSS-Protection", "0");

  // Cross-domain policies
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");

  // Cross-Origin policies compatible with OAuth popups and cross-origin clients
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

  // Origin-Agent-Cluster
  res.setHeader("Origin-Agent-Cluster", "?1");

  next();
};

module.exports = securityHeaders;
