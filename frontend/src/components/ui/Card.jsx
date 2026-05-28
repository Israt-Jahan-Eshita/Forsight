export function Card({ children, className = '' }) {
  return (
    <div className={`bg-surface rounded-lg shadow-neuro p-8 ${className}`}>
      {children}
    </div>
  );
}