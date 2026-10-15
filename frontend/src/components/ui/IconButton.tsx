import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

import { cn } from '@/lib/cn'

type Size = 'sm' | 'md' | 'lg'
type Variant = 'solid' | 'soft' | 'plain'

const sizes: Record<Size, string> = {
  sm: 'size-9',
  md: 'size-11',
  lg: 'size-12',
}

const variants: Record<Variant, string> = {
  solid: 'bg-maroon text-white hover:bg-maroon-dark',
  soft: 'bg-maroon/6 text-maroon hover:bg-maroon/12',
  plain: 'text-maroon hover:bg-maroon/6',
}

function iconButtonStyles(size: Size, variant: Variant, className?: string): string {
  return cn(
    'relative inline-flex shrink-0 items-center justify-center rounded-full transition duration-200 active:scale-95',
    sizes[size],
    variants[variant],
    className,
  )
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible name — the button has no visible text. */
  label: string
  size?: Size
  variant?: Variant
  children: ReactNode
}

export function IconButton({
  label,
  size = 'md',
  variant = 'soft',
  className,
  children,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={iconButtonStyles(size, variant, className)}
      {...rest}
    >
      {children}
    </button>
  )
}

interface IconLinkProps extends LinkProps {
  label: string
  size?: Size
  variant?: Variant
  children: ReactNode
}

/** Same visual treatment as IconButton, but navigates. */
export function IconLink({
  label,
  size = 'md',
  variant = 'soft',
  className,
  children,
  ...rest
}: IconLinkProps) {
  return (
    <Link
      aria-label={label}
      title={label}
      className={iconButtonStyles(size, variant, className)}
      {...rest}
    >
      {children}
    </Link>
  )
}
