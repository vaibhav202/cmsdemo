import { Outlet, useLocation } from "react-router-dom";
import HistorySheet from "../components/HistorySheet";
import NetworkBanner from "../components/NetworkBanner";
import OrderSheet from "../components/OrderSheet";
import ToastNotice from "../components/ToastNotice";
import { useCanteen } from "../context/CanteenContext";
import { pathViewMap } from "../lib/canteenData";

function AppShellLayout() {
  const location = useLocation();
  const canteen = useCanteen();
  const activeView = pathViewMap[location.pathname] ?? null;

  return (
    <main className="app-shell" data-theme={canteen.theme}>
      <div className="app-frame">
        <NetworkBanner
          isOnline={canteen.isOnline}
          hint={canteen.networkHint}
          onDismissHint={canteen.dismissNetworkHint}
        />
        <Outlet />

        {canteen.historyOpen && activeView === "customer" ? (
          <HistorySheet
            orders={canteen.customerOrders}
            onClose={() => canteen.setHistoryOpen(false)}
          />
        ) : null}

        {canteen.cartSheetOpen && activeView === "customer" ? (
          <>
            <button
              type="button"
              className="sheet-overlay"
              aria-label="Close basket"
              onClick={() => canteen.setCartSheetOpen(false)}
            />
            <OrderSheet
              className="surface-card order-sheet order-sheet--modal"
              dismissible
              paymentMode={canteen.paymentMode}
              setPaymentMode={canteen.setPaymentMode}
              cartItems={canteen.cartItems}
              cartTotal={canteen.cartTotal}
              clearCart={canteen.clearCart}
              placeOrder={canteen.placeOrder}
              paymentError={canteen.paymentError}
              onRetryOnlinePayment={canteen.retryOnlinePayment}
              onDismissPaymentError={canteen.dismissPaymentError}
              onClose={() => canteen.setCartSheetOpen(false)}
            />
          </>
        ) : null}

        <ToastNotice toast={canteen.toast} onUndo={canteen.undoToast} />
      </div>
    </main>
  );
}

export default AppShellLayout;
