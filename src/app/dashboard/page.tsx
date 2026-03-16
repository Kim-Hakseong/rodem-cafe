'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { formatPrice, cn } from '@/lib/utils'
import Header from '@/components/ui/Header'
import PinInput from '@/components/ui/PinInput'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from 'recharts'
import * as XLSX from 'xlsx'

type OrderData = {
  id: string
  total_price: number
  created_at: string
  member_id: string
  order_payments: { method: string; amount: number }[]
  order_items: { quantity: number; unit_price: number; menu_items: { name: string; category: string } | null }[]
  members: { name: string } | null
}

const TABS = ['일별', '주간', '월간', '고객별', 'Export'] as const
const COLORS = ['#c9a227', '#5a9a6e', '#4a7fd4', '#d49a4a', '#7c5fbf', '#c45050']
const METHOD_LABELS: Record<string, string> = { cash: '현금', transfer: '이체', credit: '외상', prepaid: '선불' }
const METHOD_COLORS: Record<string, string> = { cash: '#5a9a6e', transfer: '#4a7fd4', credit: '#d49a4a', prepaid: '#7c5fbf' }

function getDateRange(tab: string): { start: Date; end: Date; prevStart: Date; prevEnd: Date } {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (tab === '일별') {
    const prev = new Date(today); prev.setDate(prev.getDate() - 1)
    return { start: today, end: now, prevStart: prev, prevEnd: today }
  }
  if (tab === '주간') {
    const day = today.getDay()
    const weekStart = new Date(today); weekStart.setDate(weekStart.getDate() - day)
    const prevWeekStart = new Date(weekStart); prevWeekStart.setDate(prevWeekStart.getDate() - 7)
    return { start: weekStart, end: now, prevStart: prevWeekStart, prevEnd: weekStart }
  }
  // Monthly
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return { start: monthStart, end: now, prevStart: prevMonthStart, prevEnd: monthStart }
}

export default function DashboardPage() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [pinError, setPinError] = useState(false)
  const [tab, setTab] = useState<typeof TABS[number]>('일별')
  const [orders, setOrders] = useState<OrderData[]>([])
  const [allOrders, setAllOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)

  const handlePinComplete = useCallback(async (pin: string) => {
    const res = await fetch('/api/pin/verify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin, type: 'admin' }),
    })
    if (res.ok) { setAuthenticated(true); setPinError(false) } else setPinError(true)
  }, [])

  const fetchOrders = useCallback(async (start: Date) => {
    const supabase = createSupabaseBrowser()
    const { data } = await supabase
      .from('orders')
      .select('id, total_price, created_at, member_id, order_payments(method, amount), order_items(quantity, unit_price, menu_items(name, category)), members(name)')
      .gte('created_at', start.toISOString())
      .order('created_at', { ascending: false })
    if (data) setOrders(data as unknown as OrderData[])
    setLoading(false)
  }, [])

  const fetchAllOrders = useCallback(async () => {
    const supabase = createSupabaseBrowser()
    const { data } = await supabase
      .from('orders')
      .select('id, total_price, created_at, member_id, order_payments(method, amount), order_items(quantity, unit_price, menu_items(name, category)), members(name)')
      .order('created_at', { ascending: false })
      .limit(5000)
    if (data) setAllOrders(data as unknown as OrderData[])
  }, [])

  useEffect(() => {
    if (authenticated) {
      const { start } = getDateRange(tab)
      fetchOrders(start)
      fetchAllOrders()
    }
  }, [authenticated, tab, fetchOrders, fetchAllOrders])

  // Summary calculations
  const summary = useMemo(() => {
    const s = { cash: 0, transfer: 0, credit: 0, prepaid: 0, total: 0, count: 0 }
    orders.forEach((o) => {
      s.count++
      o.order_payments?.forEach((p) => {
        s[p.method as keyof typeof s] = (s[p.method as keyof typeof s] || 0) + p.amount
        s.total += p.amount
      })
    })
    return s
  }, [orders])

  // Pie chart data
  const pieData = useMemo(() => {
    return ['cash', 'transfer', 'credit', 'prepaid']
      .map((m) => ({ name: METHOD_LABELS[m], value: summary[m as keyof typeof summary] as number, color: METHOD_COLORS[m] }))
      .filter((d) => d.value > 0)
  }, [summary])

  // Bar chart data (by method)
  const barData = useMemo(() => {
    return ['cash', 'transfer', 'credit', 'prepaid'].map((m) => ({
      name: METHOD_LABELS[m],
      amount: summary[m as keyof typeof summary] as number,
      fill: METHOD_COLORS[m],
    }))
  }, [summary])

  // Customer stats
  const customerStats = useMemo(() => {
    const map = new Map<string, { name: string; total: number; count: number; credit: number }>()
    allOrders.forEach((o) => {
      const name = (o.members as unknown as { name: string })?.name || '알수없음'
      const existing = map.get(o.member_id) || { name, total: 0, count: 0, credit: 0 }
      existing.total += o.total_price
      existing.count++
      o.order_payments?.forEach((p) => { if (p.method === 'credit') existing.credit += p.amount })
      map.set(o.member_id, existing)
    })
    return Array.from(map.entries())
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.total - a.total)
  }, [allOrders])

  // Excel export
  const handleExport = () => {
    const wb = XLSX.utils.book_new()

    // Sheet 1: All orders
    const orderRows = allOrders.map((o) => ({
      날짜: new Date(o.created_at).toLocaleDateString('ko-KR'),
      시간: new Date(o.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      성도: (o.members as unknown as { name: string })?.name || '',
      금액: o.total_price,
      결제: o.order_payments?.map((p) => METHOD_LABELS[p.method]).join('+') || '',
      메뉴: o.order_items?.map((i) => `${(i.menu_items as unknown as { name: string })?.name}x${i.quantity}`).join(', ') || '',
    }))
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(orderRows), '전체주문')

    // Sheet 2: Customer stats
    const custRows = customerStats.map((c) => ({
      이름: c.name, 총액: c.total, 주문수: c.count, 외상: c.credit,
    }))
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(custRows), '고객별')

    // Sheet 3: Menu stats
    const menuMap = new Map<string, { count: number; revenue: number }>()
    allOrders.forEach((o) => o.order_items?.forEach((i) => {
      const name = (i.menu_items as unknown as { name: string })?.name || '알수없음'
      const existing = menuMap.get(name) || { count: 0, revenue: 0 }
      existing.count += i.quantity || 1
      existing.revenue += i.unit_price * (i.quantity || 1)
      menuMap.set(name, existing)
    }))
    const menuRows = Array.from(menuMap.entries())
      .map(([name, v]) => ({ 메뉴: name, 판매수: v.count, 매출: v.revenue }))
      .sort((a, b) => b.매출 - a.매출)
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(menuRows), '메뉴별')

    XLSX.writeFile(wb, `로뎀나무_정산_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  // PIN screen
  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#efebe4] via-[#e5e0d8] to-[#dedad2] font-sans relative">
        <button onClick={() => router.push('/')} className="absolute top-4 left-4 bg-gradient-to-br from-[#f0ece4] to-[#e8e3da] border-none text-sm text-rodem-text-sub cursor-pointer py-2 px-3.5 rounded-[10px]">← 뒤로</button>
        <div className="text-[40px] mb-4">📊</div>
        <h2 className="text-[22px] font-bold mb-2 text-rodem-text">정산 대시보드</h2>
        <p className="text-sm text-rodem-text-sub mb-8">관리자 PIN을 입력하세요</p>
        {pinError && <p className="text-rodem-red text-sm font-semibold mb-3">PIN이 틀렸습니다</p>}
        <PinInput onComplete={handlePinComplete} error={pinError} onReset={() => setPinError(false)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-rodem-bg font-sans">
      <Header title="📊 정산 대시보드" onBack={() => router.push('/')} />

      {/* Tabs */}
      <div className="flex gap-1 px-4 py-3 border-b border-rodem-border-light overflow-x-auto">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn(
            'px-4 py-2 rounded-rodem-sm text-sm font-semibold whitespace-nowrap cursor-pointer border',
            tab === t ? 'bg-rodem-gold text-white border-rodem-gold' : 'bg-rodem-card text-rodem-text-sub border-rodem-border-light'
          )}>
            {t}
          </button>
        ))}
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-center py-12 text-rodem-text-sub">불러오는 중...</div>
        ) : tab === 'Export' ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📥</div>
            <h3 className="text-lg font-bold text-rodem-text mb-2">종합 Export</h3>
            <p className="text-sm text-rodem-text-sub mb-6">전체주문 · 고객별 · 메뉴별 3시트 엑셀</p>
            <button onClick={handleExport} className="px-8 py-4 rounded-rodem-sm bg-gradient-to-br from-[#f2d76a] via-[#dbb44a] to-[#c9a020] text-white font-bold text-base cursor-pointer shadow-[0_6px_24px_rgba(201,162,39,0.2)]">
              📥 엑셀 다운로드
            </button>
          </div>
        ) : tab === '고객별' ? (
          <>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="p-3 rounded-rodem-sm bg-rodem-card border border-rodem-border-light">
                <div className="text-xs text-rodem-text-sub mb-1">총 고객</div>
                <div className="text-xl font-bold text-rodem-text">{customerStats.length}명</div>
              </div>
              <div className="p-3 rounded-rodem-sm bg-rodem-orange-light border border-rodem-orange/20">
                <div className="text-xs text-rodem-orange mb-1">외상 합계</div>
                <div className="text-lg font-bold text-rodem-orange">{formatPrice(customerStats.reduce((s, c) => s + c.credit, 0))}</div>
              </div>
              <div className="p-3 rounded-rodem-sm bg-rodem-gold-light border border-rodem-gold/20">
                <div className="text-xs text-rodem-gold mb-1">최다 이용</div>
                <div className="text-sm font-bold text-rodem-text">{customerStats[0]?.name || '-'}</div>
              </div>
            </div>

            {/* Top 10 bar */}
            <h4 className="font-bold text-sm text-rodem-text mb-3">TOP 10 고객</h4>
            <div className="h-64 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerStats.slice(0, 10)} layout="vertical">
                  <XAxis type="number" tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                  <YAxis type="category" dataKey="name" width={60} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => formatPrice(Number(v))} />
                  <Bar dataKey="total" fill="#c9a227" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Customer list */}
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {customerStats.slice(0, 30).map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-rodem-sm bg-rodem-card border border-rodem-border-light">
                  <div>
                    <div className="text-sm font-semibold text-rodem-text">{c.name}</div>
                    <div className="text-xs text-rodem-text-sub">{c.count}건</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-rodem-text">{formatPrice(c.total)}</div>
                    {c.credit > 0 && <div className="text-[11px] text-rodem-orange">외상 {formatPrice(c.credit)}</div>}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {['cash', 'transfer', 'credit', 'prepaid'].map((m) => (
                <div key={m} className="p-3 rounded-rodem-sm bg-rodem-card border border-rodem-border-light">
                  <div className="text-xs text-rodem-text-sub mb-1">{METHOD_LABELS[m]}</div>
                  <div className="text-lg font-bold" style={{ color: METHOD_COLORS[m] }}>
                    {formatPrice(summary[m as keyof typeof summary] as number)}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-[#4a4541] to-[#3a3632] text-white p-4 rounded-rodem-sm mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs opacity-70 mb-1">총 매출</div>
                  <div className="text-2xl font-bold">{formatPrice(summary.total)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs opacity-70 mb-1">주문 수</div>
                  <div className="text-2xl font-bold">{summary.count}건</div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-rodem-card p-4 rounded-rodem-sm border border-rodem-border-light">
                <h4 className="text-xs font-bold text-rodem-text mb-2">결제방식별</h4>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={60} label={({ name }) => name}>
                        {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip formatter={(v) => formatPrice(Number(v))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-rodem-card p-4 rounded-rodem-sm border border-rodem-border-light">
                <h4 className="text-xs font-bold text-rodem-text mb-2">금액 비교</h4>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v) => formatPrice(Number(v))} />
                      <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                        {barData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent orders table */}
            <h4 className="font-bold text-sm text-rodem-text mb-3">최근 주문</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {orders.slice(0, 20).map((o) => (
                <div key={o.id} className="flex items-center justify-between p-3 rounded-rodem-sm bg-rodem-card border border-rodem-border-light">
                  <div>
                    <div className="text-sm font-semibold text-rodem-text">{(o.members as unknown as { name: string })?.name}</div>
                    <div className="text-xs text-rodem-text-sub">
                      {new Date(o.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} · {o.order_payments?.map(p => METHOD_LABELS[p.method]).join('+')}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-rodem-text">{formatPrice(o.total_price)}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
