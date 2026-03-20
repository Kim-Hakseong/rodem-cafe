'use client'

import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#efebe4] via-[#e5e0d8] to-[#dedad2] relative overflow-hidden font-sans">
      {/* Decorative circles */}
      <div className="absolute top-[8%] left-[10%] w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(201,162,39,0.06)_0%,transparent_70%)]" />
      <div className="absolute bottom-[12%] right-[5%] w-[220px] h-[220px] rounded-full bg-[radial-gradient(circle,rgba(90,154,110,0.04)_0%,transparent_70%)]" />

      {/* Logo */}
      <div className="text-center mb-12 relative z-10">
        <div className="text-[58px] mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.06)]">🌿</div>
        <h1 className="text-[34px] font-extrabold text-rodem-gold tracking-tight mb-2">로뎀나무</h1>
        <p className="text-lg text-rodem-text-sub font-medium">청주남부교회 카페</p>
      </div>

      {/* Mode buttons */}
      <div className="flex flex-col gap-3.5 w-full max-w-[360px] sm:max-w-[500px] relative z-10">
        <button
          onClick={() => router.push('/pos?mode=customer')}
          className="p-7 rounded-rodem border-none bg-gradient-to-br from-[#6ab07e] to-[#4a9060] text-white cursor-pointer text-[22px] font-bold flex items-center gap-4 shadow-[0_6px_24px_rgba(90,154,110,0.25),0_1px_0_rgba(255,255,255,0.25)_inset] hover:-translate-y-[3px] transition-transform duration-300"
        >
          <span className="text-[34px]">🛒</span>
          <div className="text-left">
            <div>주문 하기</div>
            <div className="text-[15px] font-normal opacity-85 mt-0.5">직접 메뉴를 골라 주문하세요</div>
          </div>
        </button>

        <button
          onClick={() => router.push('/pos')}
          className="p-7 rounded-rodem border-none bg-gradient-to-br from-[#f2d76a] via-[#dbb44a] to-[#c9a020] text-white cursor-pointer text-[22px] font-bold flex items-center gap-4 shadow-[0_6px_24px_rgba(201,162,39,0.2),0_1px_0_rgba(255,255,255,0.25)_inset] hover:-translate-y-[3px] transition-transform duration-300"
        >
          <span className="text-[34px]">📋</span>
          <div className="text-left">
            <div>봉사자 페이지</div>
            <div className="text-[15px] font-normal opacity-85 mt-0.5">주문 접수 · 결제 기록 · 외상 관리</div>
          </div>
        </button>

        <button
          onClick={() => router.push('/lookup')}
          className="p-7 rounded-rodem border border-rodem-border-light bg-gradient-to-br from-[#fefcf9] to-[#f8f4ec] text-rodem-text cursor-pointer text-[22px] font-bold flex items-center gap-4 shadow-[0_2px_12px_rgba(0,0,0,0.03),0_1px_0_rgba(255,255,255,0.7)_inset] hover:-translate-y-[3px] transition-transform duration-300"
        >
          <span className="text-[34px]">👀</span>
          <div className="text-left">
            <div>고객 내역확인</div>
            <div className="text-[15px] font-normal text-rodem-text-sub mt-0.5">잔액 조회 · 주문 내역 확인</div>
          </div>
        </button>
      </div>

      {/* Admin links */}
      <div className="grid grid-cols-4 gap-2 w-full max-w-[360px] sm:max-w-[500px] mt-8 relative z-10">
        {[
          { href: '/prepaid', icon: '💰', label: '선불충전' },
          { href: '/dashboard', icon: '📊', label: '정산' },
          { href: '/members', icon: '👥', label: '성도관리' },
          { href: '/menu', icon: '🍽️', label: '메뉴관리' },
        ].map((item) => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className="flex flex-col items-center gap-1 py-3 rounded-rodem-sm border border-rodem-border-light bg-rodem-card/80 text-rodem-text-sub cursor-pointer hover:bg-rodem-card transition-colors text-sm font-semibold"
          >
            <span className="text-[22px]">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex gap-3 mt-4 relative z-10">
        <button
          onClick={() => router.push('/settings')}
          className="text-sm text-rodem-text-light cursor-pointer bg-transparent border-none underline underline-offset-2"
        >
          ⚙️ PIN 설정
        </button>
        <button
          onClick={() => router.push('/admin')}
          className="text-sm text-rodem-text-light cursor-pointer bg-transparent border-none underline underline-offset-2"
        >
          🔐 관리자
        </button>
      </div>
    </div>
  )
}
