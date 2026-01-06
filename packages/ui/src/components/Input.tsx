import React from 'react'
import { cn } from '../lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, type, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-surface-300 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700',
              'text-surface-100 placeholder:text-surface-500',
              'focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500',
              'transition-all duration-200',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-error-500 focus:ring-error-500/50 focus:border-error-500',
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-error-400">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-surface-500">{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-surface-300 mb-2">
            {label}
          </label>
        )}
        <select
          className={cn(
            'w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700',
            'text-surface-100 appearance-none cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500',
            'transition-all duration-200',
            error && 'border-error-500 focus:ring-error-500/50 focus:border-error-500',
            className
          )}
          ref={ref}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1.5 text-sm text-error-400">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-surface-300 mb-2">
            {label}
          </label>
        )}
        <textarea
          className={cn(
            'w-full px-4 py-3 rounded-xl bg-surface-800/50 border border-surface-700',
            'text-surface-100 placeholder:text-surface-500 resize-none',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500',
            'transition-all duration-200',
            error && 'border-error-500 focus:ring-error-500/50 focus:border-error-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-error-400">{error}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
