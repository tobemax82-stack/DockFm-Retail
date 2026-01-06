import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-surface-700/50 text-surface-300 border border-surface-600/50',
        brand: 'bg-brand-500/20 text-brand-300 border border-brand-500/30',
        accent: 'bg-accent-500/20 text-accent-300 border border-accent-500/30',
        success: 'bg-success-500/20 text-success-400 border border-success-500/30',
        warning: 'bg-warning-500/20 text-warning-400 border border-warning-500/30',
        error: 'bg-error-500/20 text-error-400 border border-error-500/30',
      },
      size: {
        sm: 'px-2 py-0.5 text-2xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, dot, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, className }))}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              variant === 'success' && 'bg-success-400',
              variant === 'warning' && 'bg-warning-400',
              variant === 'error' && 'bg-error-400',
              variant === 'brand' && 'bg-brand-400',
              variant === 'accent' && 'bg-accent-400',
              variant === 'default' && 'bg-surface-400'
            )}
          />
        )}
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

export { badgeVariants }
