import { orderStatusLabel, statusTone } from "../lib/canteenData";

function QueueView({
  queueBoardRef,
  isQueueFullscreen,
  queueOrders,
  readyFlashes = {},
  onToggleQueueFullscreen,
}) {
  return (
    <section
      ref={queueBoardRef}
      className={`surface-card queue-board ${isQueueFullscreen ? "queue-board--fullscreen" : ""}`}
    >
      <div className="panel-head panel-head--queue">
        <div className="queue-toolbar">
          <h3>Live queue</h3>
          <div className="queue-legend">
            <span>
              <i className="legend-dot legend-dot--brand" />
              Confirmed
            </span>
            <span>
              <i className="legend-dot legend-dot--warning" />
              Processing
            </span>
            <span>
              <i className="legend-dot legend-dot--success" />
              Ready
            </span>
          </div>
        </div>
        <button
          type="button"
          className="ghost-button queue-fullscreen-button"
          onClick={onToggleQueueFullscreen}
          aria-pressed={isQueueFullscreen}
        >
          {isQueueFullscreen ? "Exit fullscreen" : "Fullscreen"}
        </button>
      </div>
      <div className="queue-grid">
        {queueOrders.length === 0 ? (
          <div className="empty-card">
            <strong>No active tokens</strong>
            <span>Paid orders appear here automatically.</span>
          </div>
        ) : (
          queueOrders.map((order) => (
            <article
              key={order.id}
              className={`token-card token-card--${statusTone(order.orderStatus)} ${readyFlashes[order.id] ? "token-card--flash" : ""}`}
            >
              <span className="token-card__label">Token</span>
              <strong>#{order.token}</strong>
              <span>{orderStatusLabel(order.orderStatus)}</span>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default QueueView;
