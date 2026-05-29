export default function ProgressBar({ progress }) {
  if (progress <= 0 || progress >= 100) return null;

  return (
    <section className="progress-wrap" aria-live="polite">
      <div className="progress-track">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <span>{progress}% imported</span>
    </section>
  );
}
