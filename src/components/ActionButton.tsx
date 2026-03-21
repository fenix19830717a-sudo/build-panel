import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, XCircle } from 'lucide-react';
import { cn } from './Layout';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void> | void;
  loading?: boolean;
  onCancel?: () => void;
  lockDuration?: number; // default 1500ms
  showCancel?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  onClick,
  loading: externalLoading,
  onCancel,
  lockDuration = 1500,
  showCancel = false,
  className,
  disabled,
  ...props
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const lockTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isLoading = externalLoading || internalLoading;

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isLocked || isLoading || disabled) return;

    setIsLocked(true);
    setInternalLoading(true);

    try {
      if (onClick) {
        await onClick(e);
      }
    } finally {
      setInternalLoading(false);
      // Start the 1.5s lock after the action is done
      lockTimerRef.current = setTimeout(() => {
        setIsLocked(false);
      }, lockDuration);
    }
  };

  useEffect(() => {
    return () => {
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      <button
        {...props}
        onClick={handleClick}
        disabled={disabled || isLocked || isLoading}
        className={cn(
          "relative flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
      >
        {isLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
        {children}
        {isLocked && !isLoading && (
          <div className="absolute inset-0 bg-white/20 rounded-inherit pointer-events-none" />
        )}
      </button>
      
      {isLoading && showCancel && onCancel && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCancel();
          }}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Cancel Task"
        >
          <XCircle className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
