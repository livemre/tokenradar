interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

export function Badge({ children, color, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{
        backgroundColor: color ? `${color}15` : undefined,
        color: color || undefined,
        border: color ? `1px solid ${color}30` : undefined,
      }}
    >
      {children}
    </span>
  );
}
