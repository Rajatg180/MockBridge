export function Modal({ open, title, description, children, onClose }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>{title}</h3>
            {description ? <p className="muted">{description}</p> : null}
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            x
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
