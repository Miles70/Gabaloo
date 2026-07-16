import { CustomerSession } from "../models/CustomerSession.js";
import { hashCustomerToken } from "../services/customerAuthService.js";

function readBearerToken(request) {
  const authorization = String(request.headers.authorization || "").trim();
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || "";
}

async function authenticateCustomer(request, { required }) {
  const token = readBearerToken(request);

  if (!token) {
    if (!required) {
      request.customer = null;
      request.customerSession = null;
      return;
    }

    const error = new Error("Customer authentication is required.");
    error.statusCode = 401;
    throw error;
  }

  const session = await CustomerSession.findOne({
    tokenHash: hashCustomerToken(token),
    expiresAt: { $gt: new Date() },
  }).populate("customer");

  if (!session?.customer) {
    const error = new Error("Customer session is invalid or expired.");
    error.statusCode = 401;
    throw error;
  }

  request.customer = session.customer;
  request.customerSession = session;

  if (
    !session.lastUsedAt ||
    Date.now() - new Date(session.lastUsedAt).getTime() > 15 * 60 * 1000
  ) {
    session.lastUsedAt = new Date();
    await session.save();
  }
}

export async function requireCustomer(request, response, next) {
  try {
    await authenticateCustomer(request, { required: true });
    next();
  } catch (error) {
    next(error);
  }
}

export async function optionalCustomer(request, response, next) {
  try {
    await authenticateCustomer(request, { required: false });
    next();
  } catch (error) {
    next(error);
  }
}
