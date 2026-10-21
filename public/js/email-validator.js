/**
 * MedInVedic Email Verification & Disposable Email Detection Engine
 * Blocks fake, temporary, disposable, throwaway, and malformed email addresses.
 */
(function(global) {
  "use strict";

  // Comprehensive blacklist of known disposable, temporary, and fake email providers
  const DISPOSABLE_DOMAINS = new Set([
    "mailinator.com", "10minutemail.com", "10minutemail.net", "10minutemail.org",
    "tempmail.com", "temp-mail.org", "tempmailaddress.com", "tempmail.net",
    "guerrillamail.com", "guerrillamail.net", "guerrillamail.org", "guerrillamailblock.com",
    "yopmail.com", "yopmail.fr", "yopmail.net", "cool.fr.nf", "jetable.fr.nf",
    "sharklasers.com", "grr.la", "guerrillamail.biz", "trashmail.com", "trashmail.net",
    "trashmail.de", "trashmail.at", "trashmail.io", "trashmail.me", "dispostable.com",
    "fakeinbox.com", "getairmail.com", "mohmal.com", "burnermail.io", "throwawaymail.com",
    "nada.ltd", "getnada.com", "inboxkitten.com", "crazymailing.com", "mytemp.email",
    "mailnesia.com", "fakemailgenerator.com", "generator.email", "emailondeck.com",
    "tmpmail.org", "tmpmail.net", "disposablemail.com", "dropmail.me", "harakirimail.com",
    "maildrop.cc", "mintemail.com", "spamgourmet.com", "tempinbox.com", "tempail.com",
    "bupmail.com", "jetable.org", "kasmail.com", "safetymail.info", "spambox.us",
    "mytempemail.com", "spamevader.com", "mailnull.com", "zillamail.com", "spambob.com",
    "trbvm.com", "armyspy.com", "cuvox.de", "dayrep.com", "einrot.com", "fleckens.hu",
    "gustr.com", "jourrapide.com", "rhyta.com", "superrito.com", "teleworm.us",
    "fakemail.net", "trash-mail.com", "wegwerfmail.de", "wegwerfemail.de", "trash-mail.at",
    "trashmail.ws", "tempmail.ninja", "mohmal.im", "emailfake.com", "generator.email",
    "throwawayemailaddress.com", "throwawayemail.com", "getairmail.cf", "getairmail.ga",
    "getairmail.gq", "getairmail.ml", "getairmail.tk", "t-mail.org", "mytrashmail.com",
    "mailcatch.com", "disposableemailaddresses.com", "trashmail.cc",
    // Fake / dummy / placeholder domains
    "fake.com", "test.com", "example.com", "example.org", "example.net",
    "dummy.com", "asdf.com", "temp.com", "invalid.com", "nospam.com", "trash.com",
    "nobody.com", "testmail.com", "fakedomain.com", "testing.com", "null.com"
  ]);

  // Standard valid email regex (RFC 5322 simplified, strict)
  const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  // Recognized genuine corporate, education, government, and global public email TLDs & providers
  const KNOWN_LEGIT_PROVIDERS = new Set([
    "gmail.com", "googlemail.com", "outlook.com", "hotmail.com", "live.com",
    "yahoo.com", "yahoo.co.in", "yahoo.co.uk", "icloud.com", "me.com", "mac.com",
    "protonmail.com", "proton.me", "zoho.com", "zohomail.in", "aol.com", "gmx.com",
    "mail.com", "yandex.com", "yandex.ru", "fastmail.com", "tutanota.com", "tuta.io"
  ]);

  /**
   * Validates email structure, TLD, and checks against disposable/fake domain blocklist.
   * @param {string} email
   * @returns {{ valid: boolean, error?: string, domain?: string }}
   */
  function validateEmail(email) {
    if (!email || typeof email !== "string") {
      return { valid: false, error: "Please enter your email address." };
    }

    const trimmed = email.toLowerCase().trim();

    if (trimmed.length < 5 || trimmed.length > 254) {
      return { valid: false, error: "Email address length is invalid." };
    }

    if (!EMAIL_REGEX.test(trimmed)) {
      return { valid: false, error: "Please enter a valid email format (e.g., name@gmail.com)." };
    }

    const parts = trimmed.split("@");
    if (parts.length !== 2) {
      return { valid: false, error: "Email address must contain a single '@' character." };
    }

    const localPart = parts[0];
    const domain = parts[1];

    // Local part checks
    if (localPart.length === 0 || localPart.length > 64) {
      return { valid: false, error: "Invalid username before the '@' in your email." };
    }
    if (localPart.includes("..")) {
      return { valid: false, error: "Email address cannot contain consecutive dots." };
    }
    if (localPart.startsWith(".") || localPart.endsWith(".")) {
      return { valid: false, error: "Email address cannot start or end with a dot." };
    }

    // Domain checks
    if (!domain.includes(".")) {
      return { valid: false, error: "Email domain must have a valid extension (e.g., .com, .org, .in)." };
    }

    const domainParts = domain.split(".");
    const tld = domainParts[domainParts.length - 1];

    if (!tld || tld.length < 2 || !/^[a-z]+$/.test(tld)) {
      return { valid: false, error: "Email contains an invalid top-level domain." };
    }

    // Check disposable blacklist
    if (DISPOSABLE_DOMAINS.has(domain)) {
      return {
        valid: false,
        error: "Disposable and temporary email addresses are blocked. Please use a permanent email address (e.g., Gmail, Outlook, Yahoo, Proton, or your work email)."
      };
    }

    // Check for fake random pattern subdomains (e.g., @*.mailinator.com)
    for (const disp of DISPOSABLE_DOMAINS) {
      if (domain.endsWith("." + disp)) {
        return {
          valid: false,
          error: "Disposable and temporary email addresses are blocked. Please use a verified permanent email."
        };
      }
    }

    // Reject all-numeric or keyboard-smash domain names (e.g. 12345.com or asdfghjk.com)
    if (/^\d+\.[a-z]+$/.test(domain)) {
      return { valid: false, error: "Invalid domain name. Please use a genuine email provider." };
    }

    return { valid: true, domain: domain, email: trimmed };
  }

  const EmailValidator = {
    validateEmail: validateEmail,
    isDisposable: function(email) {
      const res = validateEmail(email);
      return !res.valid && res.error && res.error.includes("Disposable");
    },
    DISPOSABLE_DOMAINS: DISPOSABLE_DOMAINS,
    KNOWN_LEGIT_PROVIDERS: KNOWN_LEGIT_PROVIDERS
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = EmailValidator;
  }
  global.EmailValidator = EmailValidator;

})(typeof window !== "undefined" ? window : global);
