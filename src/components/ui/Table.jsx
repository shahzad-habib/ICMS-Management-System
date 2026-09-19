export function Table({ className = '', children }) {
  return (
    <div className="w-full overflow-auto">
      <table className={`w-full caption-bottom text-sm ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className = '', children }) {
  return <thead className={`[&_tr]:border-b ${className}`}>{children}</thead>;
}

export function TableBody({ className = '', children }) {
  return <tbody className={`[&_tr:last-child]:border-0 ${className}`}>{children}</tbody>;
}

export function TableRow({ className = '', children }) {
  return (
    <tr className={`border-b transition-colors hover:bg-slate-50 data-[state=selected]:bg-slate-100 ${className}`}>
      {children}
    </tr>
  );
}

export function TableHead({ className = '', children }) {
  return (
    <th className={`h-9 px-3 py-1.5 text-left align-middle text-xs font-semibold text-[#64748b] uppercase tracking-wider [&:has([role=checkbox])]:pr-0 ${className}`}>
      {children}
    </th>
  );
}

export function TableCell({ className = '', children }) {
  return (
    <td className={`py-2 px-3 align-middle text-[#0f172a] text-sm [&:has([role=checkbox])]:pr-0 ${className}`}>
      {children}
    </td>
  );
}
