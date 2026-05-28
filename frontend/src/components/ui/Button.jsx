export function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseStyle = "w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-teal";
  
  const variants = {
    primary: "bg-accent-coral text-text-primary shadow-neuro-sm hover:shadow-neuro-hover hover:brightness-105 active:shadow-neuro-inset",
    secondary: "bg-surface text-text-primary shadow-neuro-sm hover:shadow-neuro-hover active:shadow-neuro-inset",
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}