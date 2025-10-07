interface SimpleProgressProps {
  value: number;
  className?: string;
}

export function SimpleProgress({ value, className = '' }: SimpleProgressProps) {
  const percentage = Math.min(100, Math.max(0, value));

  return (
    <div className={`relative h-4 w-full overflow-hidden rounded-full bg-gray-200 ${className}`}>
      <div
        className="h-full bg-black transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
