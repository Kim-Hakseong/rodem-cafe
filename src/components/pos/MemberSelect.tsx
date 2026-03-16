'use client'

import { useState, useEffect, useMemo } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { CHOSUNG_LIST } from '@/lib/constants'
import { getFirstChosung, cn, formatPrice } from '@/lib/utils'
import type { SelectedMember } from '@/app/pos/page'

interface MemberSelectProps {
  onSelect: (member: SelectedMember) => void
}

type MemberRow = {
  id: string
  name: string
  credit_balance: number | null
  prepaid_balance: number | null
}

export default function MemberSelect({ onSelect }: MemberSelectProps) {
  const [members, setMembers] = useState<MemberRow[]>([])
  const [search, setSearch] = useState('')
  const [activeChosung, setActiveChosung] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMembers = async () => {
      const supabase = createSupabaseBrowser()
      const { data } = await supabase
        .from('member_balances')
        .select('id, name, credit_balance, prepaid_balance')
        .order('name')

      if (data) {
        setMembers(data as MemberRow[])
      }
      setLoading(false)
    }
    fetchMembers()
  }, [])

  const filtered = useMemo(() => {
    return members.filter((m) => {
      if (search) return m.name.includes(search)
      if (activeChosung) return getFirstChosung(m.name) === activeChosung
      return true
    })
  }, [members, search, activeChosung])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-rodem-text-sub text-lg">성도 목록 불러오는 중...</div>
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Search bar */}
      <input
        type="text"
        placeholder="이름 검색..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setActiveChosung(null) }}
        className="w-full p-3.5 rounded-rodem-sm border-2 border-rodem-border-light bg-rodem-card text-rodem-text text-base font-sans focus:outline-none focus:border-rodem-gold mb-3"
      />

      {/* Chosung filter */}
      <div className="flex flex-wrap gap-1 mb-4">
        <button
          onClick={() => { setActiveChosung(null); setSearch('') }}
          className={cn(
            'px-3 py-1.5 rounded-[10px] text-xs font-semibold cursor-pointer border',
            !activeChosung
              ? 'bg-rodem-gold text-white border-rodem-gold'
              : 'bg-rodem-card text-rodem-text-sub border-rodem-border-light'
          )}
        >
          전체
        </button>
        {CHOSUNG_LIST.map((ch) => (
          <button
            key={ch}
            onClick={() => { setActiveChosung(ch); setSearch('') }}
            className={cn(
              'px-3 py-1.5 rounded-[10px] text-xs font-semibold cursor-pointer border',
              activeChosung === ch
                ? 'bg-rodem-gold text-white border-rodem-gold'
                : 'bg-rodem-card text-rodem-text-sub border-rodem-border-light'
            )}
          >
            {ch}
          </button>
        ))}
      </div>

      {/* Member grid */}
      <div className="grid grid-cols-3 gap-2">
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
              <div className="font-bold text-sm text-rodem-text">{member.name}</div>
              {hasCredit && (
                <div className="text-[11px] text-rodem-orange font-semibold mt-1">
                  외상 {formatPrice(member.credit_balance!)}
                </div>
              )}
              {(member.prepaid_balance ?? 0) > 0 && (
                <div className="text-[11px] text-rodem-purple font-semibold mt-0.5">
                  선불 {formatPrice(member.prepaid_balance!)}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-rodem-text-sub">
          검색 결과가 없습니다
        </div>
      )}
    </div>
  )
}
