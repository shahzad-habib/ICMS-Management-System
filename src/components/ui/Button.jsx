export function Button({ className = '', variant = 'primary', ...props }) {
  const baseClass = variant === 'primary' ? 'btn-primary' : '';
  return (
    <button
      className={`${baseClass} ${className}`}
      {...props}
    />
  );
}
