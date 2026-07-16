import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { runWithOptionalMongoTransaction } from "./mongoTransactions.js";

const DEFAULT_SWEEP_LIMIT = 100;

function normalizeLimit(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) return DEFAULT_SWEEP_LIMIT;
  return Math.min(parsed, 500);
}

function getReleaseFilter(orderId) {
  return {
    _id: orderId,
    stockReserved: true,
    stockReleasedAt: null,
    stockCommittedAt: null,
    paymentStatus: { $ne: "paid" },
  };
}

function getReleaseUpdate({ status, paymentStatus, releasedAt }) {
  return {
    $set: {
      status,
      paymentStatus,
      stockReserved: false,
      stockReleasedAt: releasedAt,
      reservationExpiresAt: null,
    },
  };
}

function createStockRestoreOperations(items = []) {
  return items.map((item) => ({
    updateOne: {
      filter: { key: item.productKey },
      update: { $inc: { stock: item.quantity } },
    },
  }));
}

async function releaseWithTransaction(
  orderId,
  { status, paymentStatus },
  session
) {
  const releasedAt = new Date();
  const releasedOrder = await Order.findOneAndUpdate(
    getReleaseFilter(orderId),
    getReleaseUpdate({ status, paymentStatus, releasedAt }),
    {
      returnDocument: "after",
      runValidators: true,
      session,
    }
  );

  if (!releasedOrder) return null;

  const operations = createStockRestoreOperations(releasedOrder.items);

  if (operations.length > 0) {
    await Product.bulkWrite(operations, {
      ordered: false,
      session,
    });
  }

  return releasedOrder;
}

async function releaseWithCompensation(orderId, { status, paymentStatus }) {
  const releasedAt = new Date();
  const previousOrder = await Order.findOneAndUpdate(
    getReleaseFilter(orderId),
    getReleaseUpdate({ status, paymentStatus, releasedAt }),
    {
      returnDocument: "before",
      runValidators: true,
    }
  );

  if (!previousOrder) return null;

  try {
    const operations = createStockRestoreOperations(previousOrder.items);

    if (operations.length > 0) {
      await Product.bulkWrite(operations, { ordered: false });
    }

    return await Order.findById(orderId);
  } catch (error) {
    try {
      await Order.updateOne(
        {
          _id: orderId,
          stockReserved: false,
          stockReleasedAt: releasedAt,
        },
        {
          $set: {
            status: previousOrder.status,
            paymentStatus: previousOrder.paymentStatus,
            stockReserved: true,
            stockReleasedAt: previousOrder.stockReleasedAt || null,
            reservationExpiresAt: previousOrder.reservationExpiresAt || null,
          },
        }
      );
    } catch (rollbackError) {
      console.error("Could not restore order reservation state:", rollbackError);
    }

    throw error;
  }
}

export async function releaseOrderStock(
  orderOrId,
  {
    status = "expired",
    paymentStatus = "failed",
  } = {}
) {
  const orderId = orderOrId?._id || orderOrId;
  if (!orderId) return null;

  const options = { status, paymentStatus };

  return runWithOptionalMongoTransaction({
    transaction: (session) => releaseWithTransaction(orderId, options, session),
    fallback: () => releaseWithCompensation(orderId, options),
  });
}

export async function releaseExpiredOrderReservations({
  limit = DEFAULT_SWEEP_LIMIT,
} = {}) {
  const expiredOrders = await Order.find({
    stockReserved: true,
    stockReleasedAt: null,
    stockCommittedAt: null,
    paymentStatus: { $ne: "paid" },
    reservationExpiresAt: { $ne: null, $lte: new Date() },
  })
    .select({ _id: 1 })
    .sort({ reservationExpiresAt: 1 })
    .limit(normalizeLimit(limit))
    .lean();

  let releasedCount = 0;

  for (const order of expiredOrders) {
    const releasedOrder = await releaseOrderStock(order._id);

    if (releasedOrder) {
      releasedCount += 1;
    }
  }

  return {
    checkedCount: expiredOrders.length,
    releasedCount,
  };
}
