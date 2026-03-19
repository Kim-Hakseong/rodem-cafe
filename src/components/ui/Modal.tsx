'use client'

import { useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  maxWidth?: string
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[rgba(74,69,65,0.4)] backdrop-blur-[10px]" />

      {/* Content */}
      <div
        className={`relative w-full ${maxWidth} bg-gradient-to-br from-[#fefcf9] to-[#f8f4ec] rounded-rodem shadow-[0_20px_60px_rgba(0,0,0,0.12)] max-h-[85vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between p-5 border-b border-rodem-border-light">
            <h3 className="text-xl font-bold text-rodem-text">{title}</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-[10px] bg-rodem-border-light text-rodem-text-sub flex items-center justify-center text-base hover:bg-rodem-border"
            >
              ✕
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
