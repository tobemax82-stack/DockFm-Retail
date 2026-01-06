import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/utils'

const cardVariants = cva(
  'rounded-2xl transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'bg-surface-900/50 backdrop-blur-xl border border-surface-700/50',
        solid: 'bg-surface-900 border border-surface-800',
        glass: 'bg-surface-900/30 backdrop-blur-2xl border border-surface-700/30',
        gradient: 'bg-gradient-to-br from-surface-900/80 to-surface-950/80 backdrop-blur-xl border border-surface-700/50',
        brand: 'bg-brand-500/10 backdrop-blur-xl border border-brand-500/20',
        accent: 'bg-accent-500/10 backdrop-blur-xl border border-accent-500/20',
      },
      hover: {
        true: 'hover:bg-surface-800/60 hover:border-surface-600 hover:shadow-lg hover:scale-[1.01] cursor-pointer',
        false: '',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      hover: false,
      padding: 'md',
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, hover, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, hover, padding, className }))}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card'

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5', className)}
    {...props}
  />
))

CardHeader.displayName = 'CardHeader'

export const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-xl font-semibold text-surface-100', className)}
    {...props}
  />
))

CardTitle.displayName = 'CardTitle'

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-surface-400', className)}
    {...props}
  />
))

CardDescription.displayName = 'CardDescription'

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
))

CardContent.displayName = 'CardContent'

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4', className)}
    {...props}
  />
))

CardFooter.displayName = 'CardFooter'

export { cardVariants }
