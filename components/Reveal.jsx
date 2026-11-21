"use client";

export default function Reveal({ children, delay = 0, className = "" }) {
  return (
    <div className={`reveal ${className}`} style={delay ? { animationDelay: `${delay}s` } : undefined}>
      {children}
    </div>
  );
}

export function Stagger({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

export const item = {};
