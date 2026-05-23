import { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`glass-card rounded-xl p-5 hover-premium ${className}`}>{children}</div>
  );
}
