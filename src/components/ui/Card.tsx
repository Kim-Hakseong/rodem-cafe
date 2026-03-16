'use client'

import { cn } from '@/lib/utils'

type CardVariant = 'default' | 'dark' | 'gold'

interface CardProps {
  variant?: CardVariant
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-gradient-to-br from-[#fefcf9] to-[#f8f4ec] border border-rodem-border-light shadow-[0_2px_12px_rgba(0,0,0,0.03)]',
  dark: 'bg-gradient-to-br from-[#4a4541] to-[#3a3632] text-white shadow-[0_4px_16px_rgba(60,55,50,0.15)]',
  gold: 'bg-gradient-to-br from-[#f2d76a] via-[#dbb44a] to-[#c9a020] text-white shadow-[0_6px_24px_rgba(201,162,39,0.2)]',
}

export default function Card({ variant = 'default', className, children, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-rodem p-5 transition-all duration-300',
        variantStyles[variant],
        onClick && 'cursor-pointer hover:-translate-y-[3px] hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)]',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
