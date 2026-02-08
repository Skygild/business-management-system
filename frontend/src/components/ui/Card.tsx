interface CardProps {
  title?: string;
  children: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
}

const paddingClasses = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({ title, children, padding = 'md', className = '' }: CardProps) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white shadow-sm ${paddingClasses[padding]} ${className}`}>
      {title && <h3 className="mb-3 text-base font-semibold text-gray-900">{title}</h3>}
      {children}
    </div>
  );
}
