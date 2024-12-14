import { cn } from '~/lib/utils'
import React from 'react'

interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {}
interface ToolbarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

type ToolbarComponent = React.ForwardRefExoticComponent<ToolbarProps & React.RefAttributes<HTMLDivElement>> & {
  Button: React.ForwardRefExoticComponent<ToolbarButtonProps & React.RefAttributes<HTMLButtonElement>>
  Divider: () => JSX.Element
}

const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-1', className)}
        {...props}
      />
    )
  }
) as ToolbarComponent

const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
          className
        )}
        {...props}
      />
    )
  }
)

const ToolbarDivider = () => {
  return <div className="h-4 w-[1px] bg-border" />
}

Toolbar.Button = ToolbarButton
Toolbar.Divider = ToolbarDivider
Toolbar.displayName = 'Toolbar'
ToolbarButton.displayName = 'ToolbarButton'

export { Toolbar }
