interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'safe' | 'warning' | 'danger' | null;
  interactive?: boolean;
}

export function Card({ children, className = '', glow, interactive = false }: CardProps) {
  const glowClass = glow ? `glow-${glow}` : '';
  const baseClass = interactive ? 'glass-card-interactive' : 'glass-card';

  return (
    <div className={`${baseClass} p-4 ${glowClass} ${className}`}>
      {children}
    </div>
  );
}
