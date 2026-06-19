import OrderSheet from "../components/OrderSheet";
import {
  formatCurrency,
  orderStatusLabel,
  statusTone,
} from "../lib/canteenData";

function StepperGlyph({ type }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 12h12" />
      {type === "plus" ? <path d="M12 6v12" /> : null}
    </svg>
  );
}

function CustomerView({
  queueOrders,
  activeCustomerOrder,
  searchQuery,
  onSearchQueryChange,
  categories,
  activeCategory,
  onCategoryChange,
  activeKind,
  onKindChange,
  filteredMenu,
  expandedDescriptions,
  onToggleDescription,
  onClearFilters,
  cart,
  onUpdateCart,
  onQuickOrder,
  paymentMode,
  setPaymentMode,
  cartItems,
  cartTotal,
  clearCart,
  placeOrder,
  paymentError,
  onRetryOnlinePayment,
  onDismissPaymentError,
}) {
  const activeFilters = [];

  if (activeCategory !== "All") {
    activeFilters.push({
      key: "category",
      label: activeCategory,
      onRemove: () => onCategoryChange("All"),
    });
  }

  if (activeKind !== "All") {
    activeFilters.push({
      key: "kind",
      label: activeKind,
      onRemove: () => onKindChange("All"),
    });
  }

  if (searchQuery.trim()) {
    activeFilters.push({
      key: "search",
      label: `Search: ${searchQuery.trim()}`,
      onRemove: () => onSearchQueryChange(""),
    });
  }

  return (
    <div className="dashboard dashboard--customer">
      <section className="surface-card customer-hero">
        <p className="eyebrow">Canteen</p>
        <h2>Order and track</h2>
        <div className="customer-hero__meta">
          <span className="meta-pill">Open till 6:00 PM</span>
          <span className="meta-pill">{queueOrders.length} live tokens</span>
        </div>
        <div className="current-token">
          <span className="current-token__label">Current token</span>
          <strong>
            {activeCustomerOrder?.token
              ? `#${activeCustomerOrder.token}`
              : "No active token"}
          </strong>
          <span>
            {activeCustomerOrder
              ? orderStatusLabel(activeCustomerOrder.orderStatus)
              : "No live order"}
          </span>
        </div>
      </section>

      <section className="surface-card menu-panel">
        <div className="panel-head">
          <h3>Menu</h3>
        </div>
        <div className="filter-stack">
          <label className="menu-search">
            <span className="sr-only">Search menu</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder="Search dishes"
            />
          </label>
          <div className="chip-row">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`chip-button ${activeCategory === category ? "chip-button--active" : ""}`}
                onClick={() => onCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="chip-row">
            {["All", "Veg", "Non-Veg"].map((kind) => (
              <button
                key={kind}
                type="button"
                className={`chip-button ${activeKind === kind ? "chip-button--active" : ""}`}
                onClick={() => onKindChange(kind)}
              >
                {kind}
              </button>
            ))}
          </div>
          <div className="filter-summary">
            <strong className="results-count">
              {filteredMenu.length} dishes
            </strong>
            {activeFilters.length > 0 ? (
              <div className="active-filters">
                {activeFilters.map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    className="active-filter-chip"
                    onClick={filter.onRemove}
                  >
                    {filter.label}
                    <span aria-hidden="true">x</span>
                  </button>
                ))}
                <button
                  type="button"
                  className="ghost-button"
                  onClick={onClearFilters}
                >
                  Clear all
                </button>
              </div>
            ) : null}
          </div>
        </div>
        <div className="menu-list">
          {filteredMenu.map((item) => {
            const qty = cart[item.id] ?? 0;
            const expanded = Boolean(expandedDescriptions[item.id]);

            return (
              <article
                key={item.id}
                className={`menu-card ${expanded ? "menu-card--expanded" : ""} ${!item.available ? "menu-card--muted" : ""}`}
              >
                <div
                  className={`menu-card__visual menu-card__visual--${statusTone(item.available ? "confirmed" : "awaiting_payment")}`}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="menu-card__image"
                  />
                </div>
                <h4 className="menu-card__title">{item.name}</h4>
                <p
                  className={`menu-card__description ${expanded ? "menu-card__description--expanded" : ""}`}
                >
                  {item.description}
                </p>
                <button
                  type="button"
                  className="menu-card__more"
                  onClick={() => onToggleDescription(item.id)}
                >
                  {expanded ? "Show less" : "More"}
                </button>
                <strong className="menu-card__price">
                  {formatCurrency(item.price)}
                </strong>
                <div className="menu-card__tags">
                  <span
                    className={`pill pill--${item.kind === "Veg" ? "success" : "warning"}`}
                  >
                    {item.kind}
                  </span>
                  <span
                    className={`pill pill--${item.available ? "brand" : "muted"}`}
                  >
                    {item.available ? "Available" : "Sold out"}
                  </span>
                  <span className="pill pill--muted">{item.category}</span>
                </div>
                <div className="menu-card__footer">
                  <span className="menu-card__hint">
                    Add quantity or use quick checkout
                  </span>
                  <div className="menu-card__actions">
                    <button
                      type="button"
                      className="menu-card__order-now"
                      onClick={() => onQuickOrder(item.id)}
                      disabled={!item.available}
                    >
                      Order now
                    </button>
                    <div className="stepper">
                      <button
                        type="button"
                        aria-label={`Decrease ${item.name} quantity`}
                        onClick={() => onUpdateCart(item.id, -1)}
                        disabled={qty === 0}
                      >
                        <StepperGlyph type="minus" />
                      </button>
                      <span>{qty}</span>
                      <button
                        type="button"
                        aria-label={`Increase ${item.name} quantity`}
                        onClick={() => onUpdateCart(item.id, 1)}
                        disabled={!item.available}
                      >
                        <StepperGlyph type="plus" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <OrderSheet
        className="surface-card order-sheet order-sheet--desktop"
        paymentMode={paymentMode}
        setPaymentMode={setPaymentMode}
        cartItems={cartItems}
        cartTotal={cartTotal}
        clearCart={clearCart}
        placeOrder={placeOrder}
        paymentError={paymentError}
        onRetryOnlinePayment={onRetryOnlinePayment}
        onDismissPaymentError={onDismissPaymentError}
      />
    </div>
  );
}

export default CustomerView;
