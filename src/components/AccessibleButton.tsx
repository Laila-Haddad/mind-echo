import React from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  children: React.ReactNode;
}

const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  variant = 'primary',
  size = 'large',
  loading = false,
  className,
  children,
  disabled,
  ...props
}) => {
  const { t } = useTranslation();
  const baseClasses = "font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2";
  
  const variantClasses = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/50",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 focus:ring-secondary/50",
    danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive/50",
  };

  const sizeClasses = {
    small: "px-4 py-2 text-sm min-h-[40px]",
    medium: "px-6 py-3 text-base min-h-[48px]",
    large: "px-8 py-4 text-lg min-h-[64px] min-w-[200px]",
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        isDisabled && " bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/50 opacity-50 cursor-not-allowed",
        className
      )}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center space-x-2">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>{t('status.processing-proccess')}</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default AccessibleButton;