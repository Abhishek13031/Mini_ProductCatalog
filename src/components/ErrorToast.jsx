export default function ErrorToast({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="toast toast-error" role="alert" aria-live="assertive">
      <p>{message}</p>
      <button type="button" onClick={onClose} aria-label="Dismiss error">
        Dismiss
      </button>
    </div>
  );
}
