export default function LoadingState({ label = 'Loading...', fullScreen = false, className = '' }) {
  const classes = [
    'loading-state',
    fullScreen ? 'loading-state-screen' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} role="status" aria-live="polite" aria-busy="true">
      {fullScreen && <span className="loading-brand-mark" aria-hidden="true">n</span>}
      <span className="loading-spinner" aria-hidden="true" />
      <span className="loading-label">{label}</span>
    </div>
  );
}
