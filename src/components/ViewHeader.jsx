function ViewHeader({ activeView, dashboardTitle, queueCount }) {
  return (
    <header className="view-header surface-card">
      <span className="eyebrow">Canteen</span>
      <strong>{dashboardTitle}</strong>
      {activeView !== "customer" ? (
        <span className="nav-badge view-header__badge">{queueCount} live tokens</span>
      ) : null}
    </header>
  );
}

export default ViewHeader;
