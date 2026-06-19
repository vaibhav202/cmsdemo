import { orderStatusLabel, statusTone } from "../lib/canteenData";

function OrderCard({
  order,
  actionLabel,
  onAction,
  compact = false,
  overdue = false,
}) {
  return (
    <article
      className={`order-card ${compact ? "order-card--compact" : ""} ${overdue ? "order-card--overdue" : ""}`}
    >
      <div className="order-card__head">
        <div>
          <span className="order-card__token">
            {order.token ? `#${order.token}` : "No token"}
          </span>
          <h4>{order.customer}</h4>
        </div>
        <span className={`pill pill--${statusTone(order.orderStatus)}`}>
          {orderStatusLabel(order.orderStatus)}
        </span>
      </div>
      <p>{order.summary}</p>
      <div className="order-card__meta">
        <span>{order.createdAtLabel}</span>
        <span>
          {order.paymentMode === "online"
            ? "Online paid"
            : order.paymentStatus === "paid"
              ? "Counter paid"
              : "Pay at counter"}
        </span>
      </div>
      {overdue ? <span className="pill pill--danger">Overdue</span> : null}
      {order.note ? <small>{order.note}</small> : null}
      {actionLabel ? (
        <button
          type="button"
          className="primary-button primary-button--wide"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      ) : null}
    </article>
  );
}

export default OrderCard;
