interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
}

export function Skeleton({ className = '', variant = 'rect' }: SkeletonProps) {
  const shapeClass =
    variant === 'circle'
      ? 'rounded-full'
      : variant === 'text'
        ? 'rounded h-4'
        : 'rounded';

  return <div className={`skeleton ${shapeClass} ${className}`} />;
}
