import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md';

const variants: Record<Variant, string> = {
  primary: 'bg-accent-blue text-white hover:bg-accent-blue/90',
  secondary: 'bg-primary-blue text-white hover:bg-primary-blue/90',
  danger: 'bg-danger-red text-white hover:bg-danger-red/90',
  ghost: 'bg-transparent text-text-primary hover:bg-slate-100',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-medium transition disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
