'use client'

interface HeaderProps {
  title: string
  onBack?: () => void
  right?: React.ReactNode
}

export default function Header({ title, onBack, right }: HeaderProps) {
  return (
    <div className="flex items-center px-4 py-3.5 bg-gradient-to-br from-[#4a4541] to-[#3a3632] text-white gap-3 sticky top-0 z-10 shadow-[0_2px_16px_rgba(60,55,50,0.12)] backdrop-blur-[16px]">
      {onBack && (
        <button
          onClick={onBack}
          className="bg-white/10 border-none text-white w-9 h-9 rounded-[10px] text-lg cursor-pointer flex items-center justify-center"
        >
          ←
        </button>
      )}
      <h2 className="text-[17px] font-bold flex-1 tracking-tight">{title}</h2>
      {right}
    </div>
  )
}
