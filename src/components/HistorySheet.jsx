import OrderCard from "./OrderCard";

function HistorySheet({ orders, onClose }) {
  return (
    <>
      <button
        type="button"
        className="sheet-overlay"
        aria-label="Close recent orders"
        onClick={onClose}
      />
      <aside className="history-sheet">
        <div className="history-sheet__head">
          <h3>Recent orders</h3>
          <button type="button" className="ghost-button" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="history-sheet__body">
          {orders.length === 0 ? (
            <div className="empty-card">
              <strong>No orders yet</strong>
              <span>Your last orders will appear here.</span>
            </div>
          ) : (
            orders.map((order) => <OrderCard key={order.id} order={order} compact />)
          )}
        </div>
      </aside>
    </>
  );
}

export default HistorySheet;
