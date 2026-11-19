/**
 * Safely validates an email address in O(n) linear time without regular expressions,
 * eliminating any risk of catastrophic backtracking (ReDoS / polynomial ReDoS).
 * Enforces RFC 5321 length limits (total <= 254 chars, local part <= 64 chars, domain <= 253 chars).
 *
 * @param {string} email
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  if (!email || typeof email !== "string") {
    return false;
  }

  const trimmed = email.trim();
  if (trimmed.length < 3 || trimmed.length > 254) {
    return false;
  }

  const atIndex = trimmed.indexOf("@");
  // Exactly one '@' required, cannot be first or last character
  if (atIndex <= 0 || atIndex !== trimmed.lastIndexOf("@") || atIndex === trimmed.length - 1) {
    return false;
  }

  const localPart = trimmed.slice(0, atIndex);
  const domainPart = trimmed.slice(atIndex + 1);

  if (localPart.length === 0 || localPart.length > 64) {
    return false;
  }
  if (domainPart.length < 3 || domainPart.length > 253) {
    return false;
  }

  // Local part cannot start/end with dot, or have consecutive dots
  if (localPart.startsWith(".") || localPart.endsWith(".") || localPart.includes("..")) {
    return false;
  }

  // Check local part characters (ASCII visible, exclude control chars and disallow delimiters)
  for (let i = 0; i < localPart.length; i++) {
    const code = localPart.charCodeAt(i);
    if (
      code <= 32 ||
      code >= 127 ||
      code === 64 || // @
      code === 34 || // "
      code === 40 || // (
      code === 41 || // )
      code === 60 || // <
      code === 62 || // >
      code === 91 || // [
      code === 93 || // ]
      code === 92 || // \
      code === 44 || // ,
      code === 59 || // ;
      code === 58    // :
    ) {
      return false;
    }
  }

  // Domain must contain at least one dot separating labels
  const lastDotIndex = domainPart.lastIndexOf(".");
  if (lastDotIndex <= 0 || lastDotIndex === domainPart.length - 1) {
    return false;
  }

  // Check domain labels
  const labels = domainPart.split(".");
  for (const label of labels) {
    if (label.length === 0 || label.length > 63) {
      return false;
    }
    if (label.startsWith("-") || label.endsWith("-")) {
      return false;
    }
    for (let i = 0; i < label.length; i++) {
      const code = label.charCodeAt(i);
      const isAlphaNumHyphen =
        (code >= 48 && code <= 57) || // 0-9
        (code >= 65 && code <= 90) || // A-Z
        (code >= 97 && code <= 122) || // a-z
        code === 45; // -
      if (!isAlphaNumHyphen) {
        return false;
      }
    }
  }

  // Top-level domain must be at least 2 alphabetic characters
  const tld = labels[labels.length - 1];
  if (tld.length < 2) {
    return false;
  }
  for (let i = 0; i < tld.length; i++) {
    const code = tld.charCodeAt(i);
    const isAlpha = (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
    if (!isAlpha) {
      return false;
    }
  }

  return true;
};

module.exports = {
  isValidEmail,
};
