export function Input({ className = '', ...props }) {
  return (
    <input
      className={`icms-input ${className}`}
      {...props}
    />
  );
}
