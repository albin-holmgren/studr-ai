import { cn } from '~/lib/utils'
import React from 'react'

interface DropdownButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

export const DropdownButton = React.forwardRef<HTMLButtonElement, DropdownButtonProps>(
  ({ className, active, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
          active && 'bg-muted',
          className
        )}
        {...props}
      />
    )
  }
)

interface DropdownCategoryTitleProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DropdownCategoryTitle = React.forwardRef<HTMLDivElement, DropdownCategoryTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('px-2 py-1.5 text-xs font-medium text-muted-foreground', className)}
        {...props}
      />
    )
  }
)

DropdownButton.displayName = 'DropdownButton'
DropdownCategoryTitle.displayName = 'DropdownCategoryTitle'
