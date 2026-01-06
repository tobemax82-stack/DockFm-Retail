import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-950 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-brand text-white shadow-glow hover:shadow-glow-lg hover:scale-[1.02] active:scale-[0.98]',
        secondary: 'glass border-surface-600 text-surface-100 hover:bg-surface-800 hover:border-surface-500',
        ghost: 'text-surface-300 hover:text-surface-100 hover:bg-surface-800/50',
        danger: 'bg-error-500/20 text-error-400 border border-error-500/30 hover:bg-error-500/30 hover:border-error-500/50',
        success: 'bg-success-500/20 text-success-400 border border-success-500/30 hover:bg-success-500/30 hover:border-success-500/50',
        accent: 'bg-accent-500/20 text-accent-400 border border-accent-500/30 hover:bg-accent-500/30 hover:border-accent-500/50',
      },
      size: {
        sm: 'px-3 py-1.5 text-xs rounded-lg',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base rounded-2xl',
        xl: 'px-8 py-4 text-lg rounded-2xl',
        icon: 'p-2.5 aspect-square',
        'icon-lg': 'p-4 aspect-square rounded-2xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { buttonVariants }
