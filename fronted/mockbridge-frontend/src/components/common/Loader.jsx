export default function Loader({ label = 'Loading...', fullscreen = false }) {
  return (
    <div className={fullscreen ? 'loader-page' : 'loader-inline'} role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
