import { useCanteen } from "../context/CanteenContext";
import StaffView from "../views/StaffView";

function StaffRoute() {
  const canteen = useCanteen();

  return (
    <StaffView
      pendingPayments={canteen.pendingPayments}
      activeKitchenOrders={canteen.activeKitchenOrders}
      onConfirmOfflinePayment={canteen.confirmOfflinePayment}
      onAdvanceOrder={canteen.advanceOrder}
    />
  );
}

export default StaffRoute;
