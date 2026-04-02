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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon-512.png" alt="로뎀나무 카페" className="w-28 h-28 mx-auto mb-3 drop-shadow-[0_4px_12px_rgba(0,0,0,0.08)]" />
        <h1 className="text-[34px] font-extrabold text-rodem-gold tracking-tight mb-2">로뎀나무</h1>
        <p className="text-lg text-rodem-text-sub font-medium">청주남부교회 카페</p>
      </div>

      {/* 3 main buttons */}
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
            <div>봉사자</div>
            <div className="text-[15px] font-normal opacity-85 mt-0.5">주문 · 정산 · 미결제 · 관리</div>
          </div>
        </button>

        <button
          onClick={() => router.push('/manage')}
          className="p-7 rounded-rodem border border-rodem-border-light bg-gradient-to-br from-[#fefcf9] to-[#f8f4ec] text-rodem-text cursor-pointer text-[22px] font-bold flex items-center gap-4 shadow-[0_2px_12px_rgba(0,0,0,0.03),0_1px_0_rgba(255,255,255,0.7)_inset] hover:-translate-y-[3px] transition-transform duration-300"
        >
          <span className="text-[34px]">⚙️</span>
          <div className="text-left">
            <div>관리</div>
            <div className="text-[15px] font-normal text-rodem-text-sub mt-0.5">정산 · 성도관리 · 메뉴 · 설정</div>
          </div>
        </button>
      </div>

      {/* Small link for customer lookup */}
      <button
        onClick={() => router.push('/lookup')}
        className="mt-6 text-base text-rodem-text-sub cursor-pointer bg-transparent border-none underline underline-offset-2 relative z-10"
      >
        👀 고객 내역확인
      </button>
    </div>
  )
}
