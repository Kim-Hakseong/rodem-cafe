'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import Modal from '@/components/ui/Modal'

interface CreditManagerProps {
  onClose: () => void
}

type CreditMember = {
  id: string
  name: string
  credit_balance: number
}

export default function CreditManager({ onClose }: CreditManagerProps) {
  const [members, setMembers] = useState<CreditMember[]>([])
  const [loading, setLoading] = useState(true)
  const [settling, setSettling] = useState<string | null>(null)
  const [settleMethod, setSettleMethod] = useState<'cash' | 'transfer'>('cash')

  const fetchMembers = async () => {
    const supabase = createSupabaseBrowser()
    const { data } = await supabase
      .from('member_balances')
      .select('id, name, credit_balance')
      .gt('credit_balance', 0)
      .order('name')

    if (data) setMembers(data as CreditMember[])
    setLoading(false)
  }

  useEffect(() => { fetchMembers() }, [])

  const handleSettle = async (memberId: string, amount: number) => {
    try {
      const res = await fetch('/api/credit/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, amount, method: settleMethod }),
      })

      if (res.ok) {
        setSettling(null)
        fetchMembers()
      }
    } catch {
      alert('정산 처리에 실패했습니다.')
    }
  }

  const totalCredit = members.reduce((sum, m) => sum + m.credit_balance, 0)

  return (
    <Modal isOpen onClose={onClose} title="💰 외상 관리" maxWidth="max-w-md">
      {loading ? (
        <div className="text-center py-8 text-rodem-text-sub">불러오는 중...</div>
      ) : (
        <>
          <div className="bg-rodem-orange-light p-4 rounded-rodem-sm mb-4 border border-rodem-orange/20">
            <div className="text-xs text-rodem-orange mb-1">총 미정산 외상</div>
            <div className="text-2xl font-bold text-rodem-orange">{formatPrice(totalCredit)}</div>
            <div className="text-xs text-rodem-text-sub mt-1">{members.length}명</div>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {members.map((member) => (
              <div key={member.id} className="p-3 rounded-rodem-sm bg-rodem-card border border-rodem-border-light">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm text-rodem-text">{member.name}</div>
                    <div className="text-rodem-orange font-bold text-sm">{formatPrice(member.credit_balance)}</div>
                  </div>
                  {settling === member.id ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={settleMethod}
                        onChange={(e) => setSettleMethod(e.target.value as 'cash' | 'transfer')}
                        className="text-xs p-1 rounded border border-rodem-border-light bg-white"
                      >
                        <option value="cash">현금</option>
                        <option value="transfer">이체</option>
                      </select>
                      <button
                        onClick={() => handleSettle(member.id, member.credit_balance)}
                        className="px-3 py-1.5 rounded-[10px] bg-rodem-green text-white text-xs font-bold cursor-pointer"
                      >
                        확인
                      </button>
                      <button
                        onClick={() => setSettling(null)}
                        className="text-rodem-text-sub text-xs cursor-pointer bg-transparent border-none"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSettling(member.id)}
                      className="px-3 py-1.5 rounded-[10px] bg-rodem-green-light border border-rodem-green text-rodem-green text-xs font-bold cursor-pointer"
                    >
                      정산
                    </button>
                  )}
                </div>
              </div>
            ))}
            {members.length === 0 && (
              <div className="text-center py-8 text-rodem-text-sub text-sm">미정산 외상이 없습니다</div>
            )}
          </div>
        </>
      )}
    </Modal>
  )
}
