function ToastNotice({ toast, onUndo }) {
  if (!toast) {
    return null;
  }

  return (
    <div className="toast">
      <span>{toast.message}</span>
      <button type="button" className="toast__action" onClick={onUndo}>
        Undo
      </button>
    </div>
  );
}

export default ToastNotice;
