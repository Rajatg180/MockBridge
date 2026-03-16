import { createPortal } from 'react-dom';

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  isLoading = false,
  onConfirm,
  onClose,
}) {
  if (!open) {
    return null;
  }

  return createPortal(
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-card__header">
          <h3>{title}</h3>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        <p className="modal-card__description">{description}</p>

        <div className="modal-card__actions">
          <button
            type="button"
            className="button button--ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`button ${tone === 'danger' ? 'button--danger' : 'button--primary'}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Please wait...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
