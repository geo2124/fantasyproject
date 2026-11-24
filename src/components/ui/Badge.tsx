import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center px-2 py-0.5 border text-xs font-semibold uppercase tracking-wider font-mono",
        {
          "border-transparent bg-border text-text-primary": variant === 'default',
          "border-transparent bg-brand text-bg": variant === 'success',
          "border-transparent bg-yellow-500 text-black": variant === 'warning',
          "border-transparent bg-danger text-bg": variant === 'danger',
          "border-border text-text-secondary": variant === 'outline',
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
