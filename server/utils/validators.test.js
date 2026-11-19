const { describe, it } = require("node:test");
const assert = require("node:assert");
const { isValidEmail } = require("./validators");

describe("isValidEmail", () => {
  it("should validate standard email addresses", () => {
    assert.strictEqual(isValidEmail("user@example.com"), true);
    assert.strictEqual(isValidEmail("john.doe@sub.domain.co.uk"), true);
    assert.strictEqual(isValidEmail("user+tag@example.org"), true);
    assert.strictEqual(isValidEmail("support@orbiai.ir"), true);
    assert.strictEqual(isValidEmail("user_name@example.io"), true);
    assert.strictEqual(isValidEmail("USER@EXAMPLE.COM"), true);
  });

  it("should reject invalid email formats", () => {
    assert.strictEqual(isValidEmail(""), false);
    assert.strictEqual(isValidEmail("   "), false);
    assert.strictEqual(isValidEmail(null), false);
    assert.strictEqual(isValidEmail(undefined), false);
    assert.strictEqual(isValidEmail(12345), false);
    assert.strictEqual(isValidEmail("plainaddress"), false);
    assert.strictEqual(isValidEmail("@missinglocal.com"), false);
    assert.strictEqual(isValidEmail("missingdomain@"), false);
    assert.strictEqual(isValidEmail("user@nodot"), false);
    assert.strictEqual(isValidEmail("user@domain.c"), false); // TLD must be >= 2 chars
    assert.strictEqual(isValidEmail("user@-invalid.com"), false); // leading hyphen in domain label
    assert.strictEqual(isValidEmail("user@invalid-.com"), false); // trailing hyphen in domain label
    assert.strictEqual(isValidEmail("user@domain..com"), false); // empty domain label
    assert.strictEqual(isValidEmail("user..name@domain.com"), false); // consecutive dots in local part
    assert.strictEqual(isValidEmail(".user@domain.com"), false); // leading dot in local part
    assert.strictEqual(isValidEmail("user.@domain.com"), false); // trailing dot in local part
    assert.strictEqual(isValidEmail("user@exam ple.com"), false); // space in domain
    assert.strictEqual(isValidEmail("user name@example.com"), false); // space in local part
    assert.strictEqual(isValidEmail("user@domain@another.com"), false); // multiple @
  });

  it("should reject oversized emails exceeding RFC limits", () => {
    const longLocal = "a".repeat(65) + "@example.com";
    assert.strictEqual(isValidEmail(longLocal), false);

    const longTotal = "a".repeat(60) + "@" + "b".repeat(60) + "." + "c".repeat(60) + "." + "d".repeat(70) + ".com";
    assert.strictEqual(isValidEmail(longTotal), false);
  });

  it("should handle ReDoS attack payloads in sub-millisecond linear time", () => {
    const attackPayload = "a".repeat(100000) + "@" + "b".repeat(100000) + ".com";
    const startTime = Date.now();
    const result = isValidEmail(attackPayload);
    const elapsed = Date.now() - startTime;

    assert.strictEqual(result, false);
    assert.ok(elapsed < 50, `Expected elapsed < 50ms, got ${elapsed}ms`);
  });
});
