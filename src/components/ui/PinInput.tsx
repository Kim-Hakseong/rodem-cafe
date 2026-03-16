'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface PinInputProps {
  length?: number
  onComplete: (pin: string) => void
  error?: boolean
  disabled?: boolean
  onReset?: () => void
}

export default function PinInput({
  length = 6,
  onComplete,
  error = false,
  disabled = false,
  onReset,
}: PinInputProps) {
  const [pin, setPin] = useState('')

  // Reset pin when error changes to false
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setPin('')
        onReset?.()
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [error, onReset])

  const handleKey = useCallback((k: string) => {
    if (disabled) return

    if (k === 'del') {
      setPin((p) => p.slice(0, -1))
      return
    }
    if (k === 'clear') {
      setPin('')
      return
    }
    if (pin.length >= length) return

    const next = pin + k
    setPin(next)
    if (next.length === length) {
      onComplete(next)
    }
  }, [disabled, pin, length, onComplete])

  const keys = ['1','2','3','4','5','6','7','8','9','clear','0','del']

  return (
    <div className="flex flex-col items-center gap-7">
      {/* Dots */}
      <div className="flex gap-3.5">
        {Array.from({ length }, (_, i) => (
          <div
            key={i}
            className={cn(
              'w-[13px] h-[13px] rounded-full transition-all duration-200',
              pin.length > i
                ? error
                  ? 'bg-rodem-red scale-125'
                  : 'bg-rodem-gold scale-125 shadow-[0_0_8px_rgba(201,162,39,0.3)]'
                : 'bg-rodem-border scale-100'
            )}
          />
        ))}
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-2 max-w-[270px]">
        {keys.map((k) => (
          <button
            key={k}
            onClick={() => handleKey(k)}
            disabled={disabled}
            className={cn(
              'w-20 h-14 rounded-xl border border-rodem-border-light',
              'bg-gradient-to-b from-white to-[#f8f6f2]',
              'font-semibold cursor-pointer',
              'disabled:opacity-30 disabled:cursor-not-allowed',
              k === 'clear' ? 'text-rodem-red text-[13px]' : k === 'del' ? 'text-[13px]' : 'text-[22px]',
              'text-rodem-text'
            )}
          >
            {k === 'del' ? '⌫' : k === 'clear' ? '초기화' : k}
          </button>
        ))}
      </div>
    </div>
  )
}
