import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_TTL_SECONDS = 12 * 60 * 60;

function createHttpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function getAdminConfig() {
  const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || "");
  const secret = String(process.env.ADMIN_TOKEN_SECRET || "");

  if (!email || !password || secret.length < 32) {
    throw createHttpError(
      "Admin authentication is not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD and an ADMIN_TOKEN_SECRET of at least 32 characters.",
      503
    );
  }

  return { email, password, secret };
}

function safeEqual(leftValue, rightValue) {
  const left = Buffer.from(String(leftValue));
  const right = Buffer.from(String(rightValue));

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

function signPayload(encodedPayload, secret) {
  return createHmac("sha256", secret).update(encodedPayload).digest("base64url");
}

export function verifyAdminCredentials(email, password) {
  const config = getAdminConfig();
  const normalizedEmail = String(email || "").trim().toLowerCase();

  return safeEqual(normalizedEmail, config.email) && safeEqual(password, config.password);
}

export function createAdminToken() {
  const config = getAdminConfig();
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = {
    sub: "kemalreis-admin",
    email: config.email,
    iat: issuedAt,
    exp: issuedAt + TOKEN_TTL_SECONDS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = signPayload(encodedPayload, config.secret);

  return `${encodedPayload}.${signature}`;
}

export function verifyAdminToken(token) {
  const config = getAdminConfig();
  const [encodedPayload, signature, extraPart] = String(token || "").split(".");

  if (!encodedPayload || !signature || extraPart) {
    throw createHttpError("Invalid admin session.", 401);
  }

  const expectedSignature = signPayload(encodedPayload, config.secret);

  if (!safeEqual(signature, expectedSignature)) {
    throw createHttpError("Invalid admin session.", 401);
  }

  let payload;

  try {
    payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
  } catch {
    throw createHttpError("Invalid admin session.", 401);
  }

  const now = Math.floor(Date.now() / 1000);

  if (
    payload.sub !== "kemalreis-admin" ||
    payload.email !== config.email ||
    !Number.isFinite(payload.exp) ||
    payload.exp <= now
  ) {
    throw createHttpError("Admin session expired.", 401);
  }

  return payload;
}
