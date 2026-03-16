'use client'

import { useState, useEffect, useMemo } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { CATEGORIES } from '@/lib/constants'
import { cn, formatPrice } from '@/lib/utils'
import type { CartItem } from '@/app/pos/page'

interface MenuSelectProps {
  cart: CartItem[]
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>
  onNext: () => void
  onBack: () => void
  cartTotal: number
}

type MenuItem = {
  id: string
  name: string
  price: number
  category: string
  temp_type: string | null
}

const EMOJI_MAP: Record<string, string> = {
  '커피': '☕', '음료': '🧃', '차': '🍵', '과자': '🍪', '기타': '🧊',
}

export default function MenuSelect({ cart, setCart, onNext, onBack, cartTotal }: MenuSelectProps) {
  const [menus, setMenus] = useState<MenuItem[]>([])
  const [category, setCategory] = useState('전체')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMenus = async () => {
      const supabase = createSupabaseBrowser()
      const { data } = await supabase
        .from('menu_items')
        .select('id, name, price, category, temp_type')
        .eq('is_active', true)
        .order('sort_order')
      if (data) setMenus(data)
      setLoading(false)
    }
    fetchMenus()
  }, [])

  const filtered = useMemo(() => {
    if (category === '전체') return menus
    return menus.filter((m) => m.category === category)
  }, [menus, category])

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const idx = prev.findIndex((c) => c.id === item.id)
      if (idx >= 0) {
        return prev.map((c, i) => i === idx ? { ...c, qty: c.qty + 1 } : c)
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }]
    })
  }

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const idx = prev.findIndex((c) => c.id === id)
      if (idx < 0) return prev
      if (prev[idx].qty === 1) return prev.filter((c) => c.id !== id)
      return prev.map((c, i) => i === idx ? { ...c, qty: c.qty - 1 } : c)
    })
  }

  const getCartQty = (id: string) => cart.find((c) => c.id === id)?.qty || 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-rodem-text-sub text-lg">메뉴 불러오는 중...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Category tabs */}
      <div className="flex gap-1 px-4 py-3 border-b border-rodem-border-light overflow-x-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              'px-4 py-2 rounded-rodem-sm text-sm font-semibold whitespace-nowrap cursor-pointer border',
              category === cat
                ? 'bg-rodem-gold text-white border-rodem-gold'
                : 'bg-rodem-card text-rodem-text-sub border-rodem-border-light'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((item) => {
            const qty = getCartQty(item.id)
            const emoji = EMOJI_MAP[item.category] || '📦'
            return (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className={cn(
                  'relative p-4 rounded-rodem-sm border text-left cursor-pointer transition-all duration-200',
                  'bg-gradient-to-br from-[#fefcf9] to-[#f8f4ec]',
                  qty > 0 ? 'border-rodem-gold shadow-[0_0_0_2px_rgba(201,162,39,0.2)]' : 'border-rodem-border-light',
                  'hover:-translate-y-[2px] hover:shadow-md'
                )}
              >
                {qty > 0 && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rodem-gold text-white text-xs font-bold flex items-center justify-center shadow-md">
                    {qty}
                  </div>
                )}
                <div className="text-2xl mb-1">{emoji}</div>
                <div className="font-bold text-sm text-rodem-text">{item.name}</div>
                <div className="text-xs text-rodem-text-sub mt-1">{formatPrice(item.price)}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Cart bar */}
      {cart.length > 0 && (
        <div className="border-t border-rodem-border-light bg-white p-4 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
          <div className="flex flex-wrap gap-2 mb-3">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-1.5 bg-rodem-gold-light px-3 py-1.5 rounded-full text-sm"
              >
                <span className="font-semibold text-rodem-text">{item.name} ×{item.qty}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFromCart(item.id) }}
                  className="text-rodem-text-sub hover:text-rodem-red text-xs cursor-pointer bg-transparent border-none"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold text-rodem-text">
              합계 {formatPrice(cartTotal)}
            </div>
            <div className="flex gap-2">
              <button
                onClick={onBack}
                className="px-4 py-2.5 rounded-rodem-sm border border-rodem-border-light bg-white text-rodem-text-sub font-semibold cursor-pointer text-sm"
              >
                ← 이전
              </button>
              <button
                onClick={onNext}
                className="px-6 py-2.5 rounded-rodem-sm bg-gradient-to-br from-[#f2d76a] via-[#dbb44a] to-[#c9a020] text-white font-bold cursor-pointer text-sm shadow-[0_4px_16px_rgba(201,162,39,0.2)]"
              >
                다음 →
              </button>
            </div>
          </div>
        </div>
      )}

      {cart.length === 0 && (
        <div className="border-t border-rodem-border-light bg-white p-4">
          <button
            onClick={onBack}
            className="px-4 py-2.5 rounded-rodem-sm border border-rodem-border-light bg-white text-rodem-text-sub font-semibold cursor-pointer text-sm"
          >
            ← 이전
          </button>
        </div>
      )}
    </div>
  )
}
