function NetworkBanner({ isOnline, hint, onDismissHint }) {
  if (isOnline && !hint) {
    return null;
  }

  const tone = hint?.tone ?? (isOnline ? "success" : "warning");
  const message =
    hint?.message ??
    "You are offline. Online payment and live updates may pause.";

  return (
    <div className={`network-banner network-banner--${tone}`} role="status">
      <span>{message}</span>
      <div className="network-banner__actions">
        {isOnline ? (
          <button
            type="button"
            className="ghost-button"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        ) : null}
        {hint ? (
          <button type="button" className="ghost-button" onClick={onDismissHint}>
            Dismiss
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default NetworkBanner;
