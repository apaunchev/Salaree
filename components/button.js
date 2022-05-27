export function Button({ children, onClick, ...rest }) {
  return (
    <button
      className="py-1 px-2 rounded-md text-sm text-white font-semibold bg-brand hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-hover disabled:bg-gray-400"
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}
