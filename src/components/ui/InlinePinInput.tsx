'use client'

import { useState, useCallback } from 'react'
import PinInput from './PinInput'

interface InlinePinInputProps {
  title: string
  subtitle: string
  onComplete: (pin: string) => Promise<boolean>
}

export default function InlinePinInput({ title, subtitle, onComplete }: InlinePinInputProps) {
  const [error, setError] = useState(false)

  const handleComplete = useCallback(async (pin: string) => {
    const success = await onComplete(pin)
    if (!success) setError(true)
  }, [onComplete])

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-[36px] mb-3">🔒</div>
      <h3 className="text-xl font-bold text-rodem-text mb-1">{title}</h3>
      <p className="text-base text-rodem-text-sub mb-6">{subtitle}</p>
      {error && <p className="text-rodem-red text-base font-semibold mb-3">PIN이 틀렸습니다</p>}
      <PinInput onComplete={handleComplete} error={error} onReset={() => setError(false)} />
    </div>
  )
}
