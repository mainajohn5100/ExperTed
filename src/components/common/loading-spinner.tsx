
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  className?: string;
  size?: number; // size of the icon
}

export function LoadingSpinner({ className, size = 8 }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader2 className={`h-${size} w-${size} animate-spin text-primary`} />
    </div>
  );
}
