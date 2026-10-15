import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition ' +
  'duration-200 select-none disabled:cursor-not-allowed disabled:opacity-55 ' +
  'active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2'

const variants: Record<Variant, string> = {
  primary: 'bg-maroon text-white shadow-brand hover:bg-maroon-dark',
  secondary: 'bg-rose text-maroon hover:bg-rose-dark',
  outline: 'border border-line-strong text-maroon hover:border-maroon/40 hover:bg-rose',
  ghost: 'text-maroon hover:bg-rose',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-[13px]',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-7 text-[15px]',
}

function buttonStyles(variant: Variant, size: Size, className?: string): string {
  return cn(base, variants[variant], sizes[size], className)
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonStyles(variant, size, cn(fullWidth && 'w-full', className))}
      {...rest}
    >
      {leadingIcon}
      {children}
      {trailingIcon}
    </button>
  )
}

interface ButtonLinkProps extends LinkProps {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      className={buttonStyles(variant, size, cn(fullWidth && 'w-full', className))}
      {...rest}
    >
      {leadingIcon}
      {children}
      {trailingIcon}
    </Link>
  )
}
