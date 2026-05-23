import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

const variants: Record<Variant, string> = {
  primary: 'bg-accent-blue text-white hover:bg-accent-blue/90',
  secondary: 'bg-primary-blue text-white hover:bg-primary-blue/90',
  danger: 'bg-danger-red text-white hover:bg-danger-red/90',
  ghost: 'bg-transparent text-text-primary hover:bg-slate-100',
};

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
