'use client'

import { cn } from '@/lib/utils'

interface StepIndicatorProps {
  steps: string[]
  current: number
}

export default function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div className="flex gap-1 px-4 py-3 bg-rodem-card border-b border-rodem-border-light">
      {steps.map((step, i) => (
        <div
          key={step}
          className={cn(
            'flex-1 text-center py-1.5 text-xs border-b-[3px] transition-all duration-200',
            i <= current
              ? 'font-bold text-rodem-gold border-rodem-gold'
              : 'font-medium text-rodem-text-light border-rodem-border-light'
          )}
        >
          {step}
        </div>
      ))}
    </div>
  )
}
