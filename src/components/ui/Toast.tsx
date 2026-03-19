'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  isVisible: boolean
  onClose: () => void
  duration?: number
}

const typeStyles = {
  success: 'bg-gradient-to-br from-[#6ab07e] to-[#4a9060] text-white',
  error: 'bg-rodem-red text-white',
  info: 'bg-gradient-to-br from-[#4a4541] to-[#3a3632] text-white',
}

export default function Toast({
  message,
  type = 'info',
  isVisible,
  onClose,
  duration = 3000,
}: ToastProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShow(true)
      const timer = setTimeout(() => {
        setShow(false)
        setTimeout(onClose, 300)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible && !show) return null

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-rodem-sm shadow-lg',
        'transition-all duration-300 font-semibold text-base',
        typeStyles[type],
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}
    >
      {message}
    </div>
  )
}
