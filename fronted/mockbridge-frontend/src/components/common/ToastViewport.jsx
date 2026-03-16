import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { removeToast } from '../../features/ui/uiSlice';

function ToastItem({ toast }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      dispatch(removeToast(toast.id));
    }, toast.duration || 4500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [dispatch, toast.duration, toast.id]);

  return (
    <div className={`toast toast--${toast.type}`} role="status" aria-live="polite">
      <div className="toast__content">
        <strong>{toast.title}</strong>
        {toast.message ? <p>{toast.message}</p> : null}
      </div>
      <button
        type="button"
        className="icon-button"
        onClick={() => dispatch(removeToast(toast.id))}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}

export default function ToastViewport() {
  const toasts = useSelector((state) => state.ui.toasts);

  if (!toasts.length) {
    return null;
  }

  return (
    <div className="toast-viewport">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
