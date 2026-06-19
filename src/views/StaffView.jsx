import { useEffect, useState } from "react";
import EmptyMini from "../components/EmptyMini";
import OrderCard from "../components/OrderCard";

function StaffView({
  pendingPayments,
  activeKitchenOrders,
  onConfirmOfflinePayment,
  onAdvanceOrder,
}) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 30000);

    return () => window.clearInterval(timer);
  }, []);

  function isOverdue(order) {
    if (!["confirmed", "processing"].includes(order.orderStatus)) {
      return false;
    }

    if (!order.createdAtMs) {
      return false;
    }

    return now - order.createdAtMs > 8 * 60 * 1000;
  }

  const confirmedOrders = activeKitchenOrders.filter(
    (order) => order.orderStatus === "confirmed",
  );
  const processingOrders = activeKitchenOrders.filter(
    (order) => order.orderStatus === "processing",
  );
  const readyOrders = activeKitchenOrders.filter(
    (order) => order.orderStatus === "ready",
  );

  return (
    <div className="dashboard dashboard--staff">
      <section className="surface-card board-lane board-lane--pending">
        <div className="panel-head">
          <h3>Awaiting payment</h3>
        </div>
        <div className="lane-list">
          {pendingPayments.length === 0 ? (
            <EmptyMini text="No counter payments waiting." />
          ) : (
            pendingPayments.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                actionLabel="Confirm payment"
                onAction={() => onConfirmOfflinePayment(order.id)}
              />
            ))
          )}
        </div>
      </section>

      <section className="surface-card board-lane board-lane--confirmed">
        <div className="panel-head">
          <h3>Confirmed</h3>
        </div>
        <div className="lane-list">
          {confirmedOrders.length === 0 ? (
            <EmptyMini text="No fresh tokens waiting." />
          ) : (
            confirmedOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                overdue={isOverdue(order)}
                actionLabel="Start prep"
                onAction={() => onAdvanceOrder(order.id)}
              />
            ))
          )}
        </div>
      </section>

      <section className="surface-card board-lane board-lane--processing">
        <div className="panel-head">
          <h3>Processing</h3>
        </div>
        <div className="lane-list">
          {processingOrders.length === 0 ? (
            <EmptyMini text="Nothing is cooking right now." />
          ) : (
            processingOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                overdue={isOverdue(order)}
                actionLabel="Mark ready"
                onAction={() => onAdvanceOrder(order.id)}
              />
            ))
          )}
        </div>
      </section>

      <section className="surface-card board-lane board-lane--ready">
        <div className="panel-head">
          <h3>Ready</h3>
        </div>
        <div className="lane-list">
          {readyOrders.length === 0 ? (
            <EmptyMini text="No pickup-ready tokens." />
          ) : (
            readyOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                actionLabel="Complete"
                onAction={() => onAdvanceOrder(order.id)}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default StaffView;
