export function Input({ value, onChange, ...rest }) {
  return (
    <input
      className="py-1 px-2 border bg-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-hover"
      value={value}
      onChange={onChange}
      {...rest}
    />
  );
}
