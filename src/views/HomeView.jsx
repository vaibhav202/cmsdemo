function HomeView({ dashboards, onOpenDashboard }) {
  return (
    <section className="chooser-shell">
      <div className="chooser-card">
        <h1>Welcome to Canteen</h1>
        <p className="chooser-subhead">Choose your dashboard</p>
        <div className="chooser-grid">
          {dashboards.map((dashboard) => (
            <button
              key={dashboard.id}
              type="button"
              className="chooser-button"
              onClick={() => onOpenDashboard(dashboard.id)}
            >
              {dashboard.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HomeView;
