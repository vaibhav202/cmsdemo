function NavGlyph({ type }) {
  if (type === "home") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 10.8 12 4l8 6.8v8.2a1 1 0 0 1-1 1h-4.8v-5.6H9.8V20H5a1 1 0 0 1-1-1z" />
      </svg>
    );
  }

  if (type === "theme") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3.8a8.2 8.2 0 1 0 8.2 8.2A8.2 8.2 0 0 1 12 3.8z" />
      </svg>
    );
  }

  if (type === "basket") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6.4 8h11.2l-1 10a1 1 0 0 1-1 .9H8.4a1 1 0 0 1-1-.9L6.4 8zm3-2.2a2.6 2.6 0 1 1 5.2 0h2a4.6 4.6 0 1 0-9.2 0z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5z" />
    </svg>
  );
}

function NavButton({ label, icon, active = false, children, ...props }) {
  return (
    <button
      type="button"
      className={`nav-button nav-button--side ${active ? "nav-button--state-active" : ""}`}
      {...props}
    >
      <span className="nav-button__icon">
        <NavGlyph type={icon} />
      </span>
      <span className="nav-button__text">
        <span className="nav-button__label">{label}</span>
      </span>
      {children}
    </button>
  );
}

function SideNavigation({
  activeView,
  dashboardTitle,
  theme,
  queueCount,
  cartCount,
  profileOpen,
  cartOpen,
  onGoHome,
  onToggleTheme,
  onToggleCartSheet,
  onToggleProfile,
  onOpenHistory,
  onAccountClick,
}) {
  const isCustomer = activeView === "customer";

  return (
    <aside className="side-nav surface-card">
      <div className="side-nav__brand">
        <span>Canteen</span>
        <strong>{dashboardTitle}</strong>
      </div>
      <div
        className={`side-nav__actions ${isCustomer ? "side-nav__actions--customer" : "side-nav__actions--utility"}`}
      >
        <NavButton label="Home" icon="home" onClick={onGoHome} />

        <NavButton
          label={theme === "dark" ? "Light" : "Dark"}
          icon="theme"
          onClick={onToggleTheme}
        />

        {isCustomer ? (
          <>
            <NavButton
              label="Basket"
              icon="basket"
              active={cartOpen}
              onClick={onToggleCartSheet}
            >
              {cartCount > 0 ? (
                <span className="nav-count">{cartCount}</span>
              ) : null}
            </NavButton>

            <div className="profile-wrap profile-wrap--nav">
              <NavButton
                label="Profile"
                icon="profile"
                active={profileOpen}
                onClick={onToggleProfile}
              />
              {profileOpen ? (
                <div className="profile-menu">
                  <button
                    type="button"
                    className="profile-menu__item"
                    onClick={onOpenHistory}
                  >
                    Recent orders
                  </button>
                  <button
                    type="button"
                    className="profile-menu__item"
                    onClick={onAccountClick}
                  >
                    Account
                  </button>
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <span className="nav-badge nav-badge--side">{queueCount} live</span>
        )}
      </div>
    </aside>
  );
}

export default SideNavigation;
