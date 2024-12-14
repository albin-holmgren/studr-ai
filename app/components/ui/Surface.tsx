import { cn } from '~/lib/utils'
import React from 'react'

interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-background rounded-md border shadow-sm',
          className
        )}
        {...props}
      />
    )
  }
)

Surface.displayName = 'Surface'
