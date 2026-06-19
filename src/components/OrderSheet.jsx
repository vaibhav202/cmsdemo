import { formatCurrency } from "../lib/canteenData";

function OrderSheet({
  className,
  dismissible = false,
  paymentMode,
  setPaymentMode,
  cartItems,
  cartTotal,
  clearCart,
  placeOrder,
  paymentError,
  onRetryOnlinePayment,
  onDismissPaymentError,
  onClose,
}) {
  return (
    <aside className={className}>
      <div className="panel-head panel-head--sheet">
        <h3>Basket</h3>
        {dismissible ? (
          <button type="button" className="ghost-button" onClick={onClose}>
            Close
          </button>
        ) : null}
      </div>
      <div className="chip-row chip-row--payment">
        <button
          type="button"
          className={`chip-button ${paymentMode === "online" ? "chip-button--active" : ""}`}
          onClick={() => setPaymentMode("online")}
        >
          Online
        </button>
        <button
          type="button"
          className={`chip-button ${paymentMode === "offline" ? "chip-button--active" : ""}`}
          onClick={() => setPaymentMode("offline")}
        >
          Pay at counter
        </button>
      </div>
      <div className="order-sheet__scroll">
        {paymentError ? (
          <div className="payment-error-card">
            <strong>{paymentError}</strong>
            <div className="payment-error-card__actions">
              <button
                type="button"
                className="ghost-button"
                onClick={onRetryOnlinePayment}
              >
                Retry online
              </button>
              <button
                type="button"
                className="ghost-button"
                onClick={onDismissPaymentError}
              >
                Dismiss
              </button>
            </div>
          </div>
        ) : null}
        <div className="cart-list">
          {cartItems.length === 0 ? (
            <div className="empty-card">
              <strong>Nothing added yet</strong>
              <span>Select a dish to start the basket.</span>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="cart-line">
                <div>
                  <strong>{item.name}</strong>
                  <br />
                  <span>
                    {item.qty} x {formatCurrency(item.price)}
                  </span>
                </div>
                <strong>{formatCurrency(item.lineTotal)}</strong>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="order-sheet__footer">
        <div className="order-sheet__total">
          <span>Total payable</span>
          <strong>{formatCurrency(cartTotal)}</strong>
        </div>
        <div className="order-sheet__actions">
          <button type="button" className="ghost-button" onClick={clearCart}>
            Clear
          </button>
          <button type="button" className="primary-button" onClick={placeOrder}>
            Place order
          </button>
        </div>
      </div>
    </aside>
  );
}

export default OrderSheet;
