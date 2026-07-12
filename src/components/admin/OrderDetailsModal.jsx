import { useEffect } from "react";
import {
  CalendarDays,
  Mail,
  MapPin,
  Package,
  Phone,
  StickyNote,
  UserRound,
  X,
} from "lucide-react";

function formatMoney(value, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(value) || 0);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
}

function OrderDetailsModal({ order, onClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!order) return null;

  return (
    <div className="admin-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="admin-modal admin-order-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-detail-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="admin-modal-header">
          <div>
            <p className="admin-eyebrow">SİPARİŞ DETAYI</p>
            <h2 id="order-detail-title">#{order.orderNumber}</h2>
          </div>
          <button className="admin-modal-close" type="button" onClick={onClose} aria-label="Kapat">
            <X size={20} />
          </button>
        </header>

        <div className="admin-order-detail-topline">
          <span className={`admin-status admin-status-${order.status}`}>{order.status}</span>
          <span className={`admin-payment-pill admin-payment-${order.paymentStatus}`}>
            {order.paymentStatus}
          </span>
          <span className="admin-order-date"><CalendarDays size={15} /> {formatDate(order.createdAt)}</span>
        </div>

        <div className="admin-order-detail-grid">
          <article className="admin-detail-card">
            <h3><UserRound size={17} /> Müşteri</h3>
            <strong>{order.customer?.fullName || "—"}</strong>
            <p><Mail size={14} /> {order.customer?.email || "—"}</p>
            <p><Phone size={14} /> {order.customer?.phone || "—"}</p>
          </article>

          <article className="admin-detail-card">
            <h3><MapPin size={17} /> Teslimat</h3>
            <strong>{order.customer?.city || "—"}</strong>
            <p>{order.customer?.address || "Adres bulunmuyor."}</p>
          </article>
        </div>

        {order.customer?.note ? (
          <article className="admin-detail-card admin-order-note">
            <h3><StickyNote size={17} /> Sipariş notu</h3>
            <p>{order.customer.note}</p>
          </article>
        ) : null}

        <section className="admin-order-items">
          <div className="admin-modal-section-title">
            <Package size={18} />
            <h3>Ürünler</h3>
          </div>

          <div className="admin-order-item-list">
            {(order.items || []).map((item) => (
              <article className="admin-order-item" key={`${item.productKey}-${item.title}`}>
                <div className="admin-product-thumb">
                  {item.imageUrl ? <img src={item.imageUrl} alt="" /> : item.image || "🛍️"}
                </div>
                <div className="admin-order-item-copy">
                  <strong>{item.title}</strong>
                  <span>{item.productKey}</span>
                  <small>{item.quantity} × {formatMoney(item.unitPrice, order.currency)}</small>
                </div>
                <strong>{formatMoney(item.lineTotal, order.currency)}</strong>
              </article>
            ))}
          </div>
        </section>

        <footer className="admin-order-totals">
          <div><span>Ara toplam</span><strong>{formatMoney(order.subtotal, order.currency)}</strong></div>
          <div><span>Kargo</span><strong>{formatMoney(order.shipping, order.currency)}</strong></div>
          <div className="admin-order-grand-total"><span>Toplam</span><strong>{formatMoney(order.total, order.currency)}</strong></div>
          <small>Ödeme yöntemi: {order.paymentMethod || "not_selected"}</small>
        </footer>
      </section>
    </div>
  );
}

export default OrderDetailsModal;
