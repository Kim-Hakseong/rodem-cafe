'use client'

import { useState, useEffect, useMemo } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { CHOSUNG_LIST, DEPARTMENTS } from '@/lib/constants'
import { getAllChosungs, cn, formatPrice } from '@/lib/utils'
import type { SelectedMember } from '@/app/pos/page'

interface MemberSelectProps {
  onSelect: (member: SelectedMember) => void
}

type MemberRow = {
  id: string
  name: string
  department: string | null
  credit_balance: number | null
  prepaid_balance: number | null
}

export default function MemberSelect({ onSelect }: MemberSelectProps) {
  const [members, setMembers] = useState<MemberRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showChosung, setShowChosung] = useState(false)
  const [selectedDept, setSelectedDept] = useState<string | null>(null)
  const [enteredChosungs, setEnteredChosungs] = useState<string[]>([])

  useEffect(() => {
    const fetchMembers = async () => {
      const supabase = createSupabaseBrowser()
      const { data } = await supabase
        .from('member_balances')
        .select('id, name, department, credit_balance, prepaid_balance')
        .order('name')
      if (data) setMembers(data as MemberRow[])
      setLoading(false)
    }
    fetchMembers()
  }, [])

  // Real-time filtering: department + chosung prefix match
  const filtered = useMemo(() => {
    const inputStr = enteredChosungs.join('')
    return members.filter((m) => {
      if (selectedDept && m.department !== selectedDept) return false
      if (inputStr) return getAllChosungs(m.name).startsWith(inputStr)
      return true
    })
  }, [members, selectedDept, enteredChosungs])

  const handleDeptSelect = (dept: string | null) => {
    setSelectedDept(dept)
    setEnteredChosungs([])
    setShowChosung(true)
  }

  const handleBackToDept = () => {
    setShowChosung(false)
    setSelectedDept(null)
    setEnteredChosungs([])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-rodem-text-sub text-xl">성도 목록 불러오는 중...</div>
      </div>
    )
  }

  // Phase 1: Department selection
  if (!showChosung) {
    return (
      <div className="p-4">
        <h3 className="text-xl font-bold text-rodem-text mb-4 text-center">부서를 선택하세요</h3>
        <div className="grid grid-cols-2 gap-3">
          {DEPARTMENTS.map((dept) => {
            const count = members.filter((m) => m.department === dept).length
            return (
              <button
                key={dept}
                onClick={() => handleDeptSelect(dept)}
                className="p-5 rounded-rodem-sm border-2 border-rodem-border-light bg-gradient-to-br from-[#fefcf9] to-[#f8f4ec] text-center cursor-pointer hover:-translate-y-[2px] hover:shadow-md transition-all"
              >
                <div className="text-xl font-bold text-rodem-text">{dept}</div>
                <div className="text-base text-rodem-text-sub mt-1">{count}명</div>
              </button>
            )
          })}
          <button
            onClick={() => handleDeptSelect(null)}
            className="p-5 rounded-rodem-sm border-2 border-rodem-gold bg-rodem-gold-light text-center cursor-pointer hover:-translate-y-[2px] hover:shadow-md transition-all col-span-2"
          >
            <div className="text-xl font-bold text-rodem-gold">전체</div>
            <div className="text-base text-rodem-text-sub mt-1">{members.length}명</div>
          </button>
        </div>
      </div>
    )
  }

  // Phase 2: Chosung input + real-time filtered list
  return (
    <div className="p-4 flex flex-col gap-3">
      {/* Department indicator + back */}
      <div className="flex items-center justify-between">
        <div className="text-lg font-bold text-rodem-text">
          {selectedDept ? `📁 ${selectedDept}` : '📁 전체'}
          <span className="text-base font-normal text-rodem-text-sub ml-2">({filtered.length}명)</span>
        </div>
        <button
          onClick={handleBackToDept}
          className="text-base text-rodem-text-sub cursor-pointer bg-transparent border-none underline"
        >
          부서 변경
        </button>
      </div>

      {/* Entered chosungs display */}
      <div className="bg-white rounded-rodem-sm border-2 border-rodem-border-light p-3 flex items-center gap-2 min-h-[52px]">
        {enteredChosungs.length > 0 ? (
          <>
            {enteredChosungs.map((ch, i) => (
              <span
                key={i}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-rodem-gold-light text-rodem-gold text-xl font-bold shrink-0"
              >
                {ch}
              </span>
            ))}
            <button
              onClick={() => setEnteredChosungs((prev) => prev.slice(0, -1))}
              className="ml-auto text-base text-rodem-text-sub bg-transparent border-none cursor-pointer px-2"
            >
              ← 지우기
            </button>
          </>
        ) : (
          <span className="text-base text-rodem-text-sub">초성을 입력하세요 (예: ㄱㅎㅅ → 김학성)</span>
        )}
      </div>

      {/* Chosung buttons grid - compact */}
      <div className="grid grid-cols-7 gap-1.5">
        {CHOSUNG_LIST.map((ch) => (
          <button
            key={ch}
            onClick={() => setEnteredChosungs((prev) => [...prev, ch])}
            className="py-2.5 rounded-rodem-sm border border-rodem-border-light bg-white text-lg font-bold text-rodem-text cursor-pointer hover:bg-rodem-gold-light hover:border-rodem-gold active:scale-95 transition-all"
          >
            {ch}
          </button>
        ))}
      </div>

      {/* Real-time filtered member list */}
      {filtered.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-[36px] mb-2">🔍</div>
          <div className="text-lg text-rodem-text-sub">검색 결과가 없습니다</div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 max-h-[40vh] overflow-y-auto">
          {filtered.map((member) => {
            const hasCredit = (member.credit_balance ?? 0) > 0
            return (
              <button
                key={member.id}
                onClick={() =>
                  onSelect({
                    id: member.id!,
                    name: member.name!,
                    credit_balance: member.credit_balance ?? 0,
                    prepaid_balance: member.prepaid_balance ?? 0,
                  })
                }
                className={cn(
                  'p-3 rounded-rodem-sm border text-left cursor-pointer transition-all duration-200',
                  'bg-gradient-to-br from-[#fefcf9] to-[#f8f4ec]',
                  hasCredit ? 'border-rodem-orange' : 'border-rodem-border-light',
                  'hover:-translate-y-[2px] hover:shadow-md'
                )}
              >
                <div className="font-bold text-lg text-rodem-text">{member.name}</div>
                {hasCredit && (
                  <div className="text-sm text-rodem-orange font-semibold mt-1">
                    외상 {formatPrice(member.credit_balance!)}
                  </div>
                )}
                {(member.prepaid_balance ?? 0) > 0 && (
                  <div className="text-sm text-rodem-purple font-semibold mt-0.5">
                    선불 {formatPrice(member.prepaid_balance!)}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
