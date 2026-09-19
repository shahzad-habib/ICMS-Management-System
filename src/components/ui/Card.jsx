export function Card({ className = '', children }) {
  return (
    <div className={`icms-card ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children }) {
  return <div className={`flex flex-col space-y-1 pb-3 ${className}`}>{children}</div>;
}

export function CardTitle({ className = '', children }) {
  return <h3 className={`font-semibold tracking-tight text-lg text-[#0f172a] ${className}`}>{children}</h3>;
}

export function CardDescription({ className = '', children }) {
  return <p className={`text-xs text-[#94a3b8] ${className}`}>{children}</p>;
}

export function CardContent({ className = '', children }) {
  return <div className={`${className}`}>{children}</div>;
}

export function CardFooter({ className = '', children }) {
  return <div className={`flex items-center pt-3 ${className}`}>{children}</div>;
}
