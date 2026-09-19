export function Label({ className = '', children, ...props }) {
  return (
    <label
      className={`text-sm font-medium leading-none text-[#0f172a] ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}
