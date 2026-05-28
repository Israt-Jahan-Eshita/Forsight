export function Input({ label, type = 'text', placeholder, ...props }) {
  return (
    <div className="flex flex-col space-y-2 mb-4">
      {label && (
        <label className="text-sm font-medium text-text-muted px-1">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        className="w-full bg-background rounded-md shadow-neuro-inset px-4 py-3 
                   border-none outline-none focus-visible:ring-2 focus-visible:ring-accent-teal 
                   text-text-primary placeholder:text-text-muted/50 transition-shadow"
        {...props}
      />
    </div>
  );
}