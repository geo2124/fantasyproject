import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium font-sans uppercase tracking-wide",
          "disabled:opacity-50 disabled:pointer-events-none",
          // Size
          {
            'h-8 px-3 text-xs': size === 'sm',
            'h-10 px-4 text-sm': size === 'md',
            'h-12 px-6 text-base': size === 'lg',
          },
          // Variant
          {
            'bg-brand text-bg hover:bg-brand-hover': variant === 'primary',
            'bg-surface text-text-primary hover:bg-border': variant === 'secondary',
            'border border-border text-text-primary hover:bg-border': variant === 'outline',
            'bg-transparent text-text-primary hover:bg-surface': variant === 'ghost',
            'bg-danger text-bg hover:bg-danger-hover': variant === 'danger'
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
