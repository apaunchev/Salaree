export function Select({ children, value, onChange, ...rest }) {
  return (
    <select
      className="p-1 border bg-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-hover"
      value={value}
      onChange={onChange}
      {...rest}
    >
      {children}
    </select>
  );
}
