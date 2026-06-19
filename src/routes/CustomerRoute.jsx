import { useCanteen } from "../context/CanteenContext";
import CustomerView from "../views/CustomerView";

function CustomerRoute() {
  const canteen = useCanteen();

  return (
    <CustomerView
      queueOrders={canteen.queueOrders}
      activeCustomerOrder={canteen.activeCustomerOrder}
      searchQuery={canteen.searchQuery}
      onSearchQueryChange={canteen.setSearchQuery}
      categories={canteen.categories}
      activeCategory={canteen.activeCategory}
      onCategoryChange={canteen.setActiveCategory}
      activeKind={canteen.activeKind}
      onKindChange={canteen.setActiveKind}
      filteredMenu={canteen.filteredMenu}
      expandedDescriptions={canteen.expandedDescriptions}
      onToggleDescription={canteen.toggleItemDescription}
      onClearFilters={canteen.clearFilters}
      cart={canteen.cart}
      onUpdateCart={canteen.updateCart}
      onQuickOrder={canteen.quickOrder}
      paymentMode={canteen.paymentMode}
      setPaymentMode={canteen.setPaymentMode}
      cartItems={canteen.cartItems}
      cartTotal={canteen.cartTotal}
      clearCart={canteen.clearCart}
      placeOrder={canteen.placeOrder}
      paymentError={canteen.paymentError}
      onRetryOnlinePayment={canteen.retryOnlinePayment}
      onDismissPaymentError={canteen.dismissPaymentError}
    />
  );
}

export default CustomerRoute;
