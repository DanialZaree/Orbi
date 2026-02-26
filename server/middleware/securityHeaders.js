/**
 * Custom middleware to set security headers, mimicking the behavior of 'helmet'.
 * Used because 'helmet' package could not be installed due to environment restrictions.
 */
const securityHeaders = (req, res, next) => {
  // Prevent browsers from performing MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Prevent clickjacking by restricting where the page can be framed
  res.setHeader("X-Frame-Options", "SAMEORIGIN");

  // Enforce HTTPS
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=15552000; includeSubDomains"
  );

  // Disable DNS prefetching
  res.setHeader("X-DNS-Prefetch-Control", "off");

  // Prevent IE from opening downloads in the site context
  res.setHeader("X-Download-Options", "noopen");

  // Control how much referrer information is shared
  res.setHeader("Referrer-Policy", "no-referrer");

  // Disable XSS filter in older browsers as it can introduce vulnerabilities
  res.setHeader("X-XSS-Protection", "0");

  // Restrict where cross-origin resources can be loaded
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");

  // Set Cross-Origin policies
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");

  // Origin-Agent-Cluster
  res.setHeader("Origin-Agent-Cluster", "?1");

  // Content Security Policy
  // Note: A more complex CSP might be needed depending on the application's needs.
  // This is a basic secure default.
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; base-uri 'self'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src 'self'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; upgrade-insecure-requests"
  );

  next();
};

module.exports = securityHeaders;
