import { Loader2 } from 'lucide-react';

const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
    xl: 'w-16 h-16',
  };

  return (
    <Loader2 className={`animate-spin text-primary-400 ${sizes[size]} ${className}`} />
  );
};

export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <Spinner size="xl" />
      <p className="text-surface-400 text-sm font-medium animate-pulse">Loading...</p>
    </div>
  </div>
);

export default Spinner;
