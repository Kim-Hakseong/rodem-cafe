'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import PinInput from '@/components/ui/PinInput'

type MemberData = {
  id: string
  name: string
  prepaid_balance: number
  credit_balance: number
}

type OrderRow = {
  id: string
  total_price: number
  created_at: string
  order_items: { quantity: number; menu_items: { name: string } | null }[]
}

export default function MyPage() {
  const params = useParams()
  const token = params.token as string
  const [member, setMember] = useState<MemberData | null>(null)
  const [authenticated, setAuthenticated] = useState(false)
  const [pinError, setPinError] = useState(false)
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [notFound, setNotFound] = useState(false)
  const [hasPin, setHasPin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMember = async () => {
      const supabase = createSupabaseBrowser()
      const { data } = await supabase
        .from('members')
        .select('id, name, prepaid_balance, personal_pin')
        .eq('qr_token', token)
        .single()

      if (data) {
        setHasPin(!!data.personal_pin)
        // Fetch balance from view
        const { data: balance } = await supabase
          .from('member_balances')
          .select('credit_balance, prepaid_balance')
          .eq('id', data.id)
          .single()

        setMember({
          id: data.id,
          name: data.name,
          prepaid_balance: balance?.prepaid_balance ?? 0,
          credit_balance: balance?.credit_balance ?? 0,
        })
        // If no PIN set, skip authentication
        if (!data.personal_pin) setAuthenticated(true)
      } else {
        setNotFound(true)
      }
      setLoading(false)
    }
    fetchMember()
  }, [token])

  useEffect(() => {
    if (authenticated && member) {
      const fetchOrders = async () => {
        const supabase = createSupabaseBrowser()
        const { data } = await supabase
          .from('orders')
          .select('id, total_price, created_at, order_items(quantity, menu_items(name))')
          .eq('member_id', member.id)
          .order('created_at', { ascending: false })
          .limit(20)
        if (data) setOrders(data as unknown as OrderRow[])
      }
      fetchOrders()
    }
  }, [authenticated, member])

  const handlePinComplete = async (pin: string) => {
    const res = await fetch('/api/pin/verify-personal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId: member?.id, pin }),
    })
    if (res.ok) { setAuthenticated(true); setPinError(false) }
    else setPinError(true)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-rodem-bg font-sans"><div className="text-rodem-text-sub">불러오는 중...</div></div>
  if (notFound) return <div className="min-h-screen flex items-center justify-center bg-rodem-bg font-sans"><div className="text-center"><div className="text-4xl mb-4">🔍</div><div className="text-rodem-text font-bold">찾을 수 없습니다</div><div className="text-base text-rodem-text-sub mt-2">유효하지 않은 QR코드입니다</div></div></div>

  // PIN auth for personal page
  if (!authenticated && hasPin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#efebe4] via-[#e5e0d8] to-[#dedad2] font-sans">
        <div className="text-[42px] mb-4">🔒</div>
        <h2 className="text-[22px] font-bold mb-2 text-rodem-text">{member?.name}님</h2>
        <p className="text-base text-rodem-text-sub mb-8">개인 PIN 4자리를 입력하세요</p>
        {pinError && <p className="text-rodem-red text-base font-semibold mb-3">PIN이 틀렸습니다</p>}
        <PinInput length={4} onComplete={handlePinComplete} error={pinError} onReset={() => setPinError(false)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-rodem-bg font-sans">
      <div className="bg-gradient-to-br from-[#4a4541] to-[#3a3632] text-white p-5 text-center">
        <div className="text-[32px] mb-2">🌿</div>
        <h1 className="text-[22px] font-bold">{member?.name}님</h1>
        <p className="text-sm opacity-70 mt-1">로뎀나무 카페</p>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-4 rounded-rodem-sm bg-rodem-orange-light border border-rodem-orange/20">
            <div className="text-sm text-rodem-orange mb-1">📋 외상</div>
            <div className="text-[22px] font-bold text-rodem-orange">{formatPrice(member?.credit_balance ?? 0)}</div>
          </div>
          <div className="p-4 rounded-rodem-sm bg-rodem-purple-light border border-rodem-purple/20">
            <div className="text-sm text-rodem-purple mb-1">💰 선불</div>
            <div className="text-[22px] font-bold text-rodem-purple">{formatPrice(member?.prepaid_balance ?? 0)}</div>
          </div>
        </div>

        <h3 className="font-bold text-lg text-rodem-text mb-3">최근 주문</h3>
        <div className="space-y-2">
          {orders.map((order) => (
            <div key={order.id} className="p-3 rounded-rodem-sm bg-rodem-card border border-rodem-border-light">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-rodem-text-sub">
                  {new Date(order.created_at).toLocaleDateString('ko-KR')}
                </span>
                <span className="text-base font-bold text-rodem-text">{formatPrice(order.total_price)}</span>
              </div>
              <div className="text-sm text-rodem-text-sub">
                {order.order_items?.map((item, i) => (
                  <span key={i}>{(item.menu_items as unknown as { name: string })?.name} x{item.quantity}{i < order.order_items.length - 1 ? ', ' : ''}</span>
                ))}
              </div>
            </div>
          ))}
          {orders.length === 0 && <div className="text-center py-8 text-rodem-text-sub text-base">주문 이력이 없습니다</div>}
        </div>
      </div>
    </div>
  )
}
