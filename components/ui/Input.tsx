import { InputHTMLAttributes } from 'react';

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 ${className}`}
      {...props}
    />
  );
}
