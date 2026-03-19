'use client'

import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'green' | 'ghost'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-br from-[#f2d76a] via-[#dbb44a] to-[#c9a020] text-white shadow-[0_6px_24px_rgba(201,162,39,0.2),0_1px_0_rgba(255,255,255,0.25)_inset]',
  secondary: 'bg-rodem-card border border-rodem-border-light text-rodem-text shadow-[0_2px_12px_rgba(0,0,0,0.03)]',
  danger: 'bg-rodem-red text-white shadow-[0_4px_16px_rgba(196,80,80,0.2)]',
  green: 'bg-gradient-to-br from-[#6ab07e] to-[#4a9060] text-white shadow-[0_4px_16px_rgba(90,154,110,0.2)]',
  ghost: 'bg-transparent border border-rodem-border-light text-rodem-text-sub',
}

const sizeStyles = {
  sm: 'px-3 py-2 text-base rounded-[10px]',
  md: 'px-5 py-3 text-lg rounded-rodem-sm',
  lg: 'px-7 py-4 text-xl rounded-rodem-sm',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'font-bold transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
