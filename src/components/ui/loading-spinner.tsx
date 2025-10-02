import React from 'react';
import { cn } from './utils';
import { Loader2 } from 'lucide-react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'muted' | 'white';
  text?: string;
  className?: string;
  showText?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6', 
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
};

const variantClasses = {
  default: 'text-foreground',
  primary: 'text-primary',
  muted: 'text-muted-foreground',
  white: 'text-white'
};

export function LoadingSpinner({
  size = 'md',
  variant = 'muted',
  text = '로딩 중...',
  className,
  showText = false
}: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="flex flex-col items-center space-y-2">
        <Loader2 
          className={cn(
            'animate-spin',
            sizeClasses[size],
            variantClasses[variant]
          )} 
        />
        {showText && text && (
          <p className={cn('text-sm', variantClasses[variant])}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
}

// 페이지 전체 로딩을 위한 컴포넌트
export function PageLoadingSpinner({
  text = '로딩 중...',
  className
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div className={cn('min-h-screen flex items-center justify-center', className)}>
      <LoadingSpinner 
        size="lg" 
        variant="muted" 
        text={text} 
        showText={true}
      />
    </div>
  );
}

// 인라인 로딩을 위한 컴포넌트
export function InlineLoadingSpinner({
  text,
  className
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <LoadingSpinner size="sm" variant="muted" />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}

// 버튼 내부 로딩을 위한 컴포넌트
export function ButtonLoadingSpinner({
  className
}: {
  className?: string;
}) {
  return (
    <LoadingSpinner 
      size="sm" 
      variant="default" 
      className={cn('mr-2', className)}
    />
  );
}
