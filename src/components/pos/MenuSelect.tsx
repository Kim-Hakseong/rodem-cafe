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
  image_url: string | null
}

const EMOJI_MAP: Record<string, string> = {
  '커피': '☕', '음료': '🧃', '차': '🍵', '과자': '🍪', '기타': '🧊',
}

const SHOT_OPTIONS = ['보통', '연하게', '진하게'] as const

function isAmericano(item: MenuItem): boolean {
  return item.name.includes('아메리카노')
}

function cartKey(id: string, shot?: string): string {
  return shot && shot !== '보통' ? `${id}__${shot}` : id
}

export default function MenuSelect({ cart, setCart, onNext, onBack, cartTotal }: MenuSelectProps) {
  const [menus, setMenus] = useState<MenuItem[]>([])
  const [category, setCategory] = useState('전체')
  const [loading, setLoading] = useState(true)
  const [shotModal, setShotModal] = useState<MenuItem | null>(null)

  useEffect(() => {
    const fetchMenus = async () => {
      const supabase = createSupabaseBrowser()
      const { data } = await supabase
        .from('menu_items')
        .select('id, name, price, category, temp_type, image_url')
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

  const addToCartWithOptions = (item: MenuItem, shot?: string) => {
    const key = cartKey(item.id, shot)
    const shotLabel = shot && shot !== '보통' ? ` (${shot})` : ''
    setCart((prev) => {
      const idx = prev.findIndex((c) => cartKey(c.id, c.options?.shot) === key)
      if (idx >= 0) {
        return prev.map((c, i) => i === idx ? { ...c, qty: c.qty + 1 } : c)
      }
      return [...prev, {
        id: item.id,
        name: item.name + shotLabel,
        price: item.price,
        qty: 1,
        temp_type: item.temp_type,
        options: shot && shot !== '보통' ? { shot } : undefined,
      }]
    })
  }

  const addToCart = (item: MenuItem) => {
    if (isAmericano(item)) {
      setShotModal(item)
      return
    }
    addToCartWithOptions(item)
  }

  const handleShotSelect = (shot: string) => {
    if (shotModal) {
      addToCartWithOptions(shotModal, shot)
      setShotModal(null)
    }
  }

  const removeFromCart = (key: string) => {
    setCart((prev) => {
      const idx = prev.findIndex((c) => cartKey(c.id, c.options?.shot) === key)
      if (idx < 0) return prev
      if (prev[idx].qty === 1) return prev.filter((_, i) => i !== idx)
      return prev.map((c, i) => i === idx ? { ...c, qty: c.qty - 1 } : c)
    })
  }

  const getCartQty = (id: string) => {
    return cart.filter((c) => c.id === id).reduce((sum, c) => sum + c.qty, 0)
  }

  const getCartItems = (id: string) => {
    return cart.filter((c) => c.id === id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-rodem-text-sub text-xl">메뉴 불러오는 중...</div>
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
              'px-4 py-2 rounded-rodem-sm text-base font-semibold whitespace-nowrap cursor-pointer border',
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
            const itemsInCart = getCartItems(item.id)
            const emoji = EMOJI_MAP[item.category] || '📦'
            return (
              <div
                key={item.id}
                onClick={() => { if (qty === 0) addToCart(item) }}
                className={cn(
                  'relative p-5 rounded-rodem-sm border text-left transition-all duration-200',
                  'bg-gradient-to-br from-[#fefcf9] to-[#f8f4ec]',
                  qty > 0 ? 'border-rodem-gold shadow-[0_0_0_2px_rgba(201,162,39,0.2)]' : 'border-rodem-border-light',
                  qty === 0 ? 'cursor-pointer hover:-translate-y-[2px] hover:shadow-md' : ''
                )}
              >
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg mb-2"
                  />
                ) : (
                  <div className="text-[52px] mb-2">{emoji}</div>
                )}

                <div className="font-bold text-[28px] text-rodem-text leading-tight">{item.name}</div>

                {qty === 0 ? (
                  <div className="text-xl text-rodem-text-sub mt-1">{formatPrice(item.price)}</div>
                ) : (
                  <div className="mt-2 space-y-1">
                    {itemsInCart.map((ci) => {
                      const key = cartKey(ci.id, ci.options?.shot)
                      return (
                        <div key={key} className="flex items-center justify-center gap-3">
                          {ci.options?.shot && (
                            <span className="text-sm text-rodem-gold font-semibold">{ci.options.shot}</span>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); removeFromCart(key) }}
                            className="w-9 h-9 rounded-full bg-rodem-border-light text-rodem-text text-lg font-bold flex items-center justify-center cursor-pointer border-none active:bg-rodem-border"
                          >
                            -
                          </button>
                          <span className="text-xl font-bold text-rodem-gold min-w-[2ch] text-center">{ci.qty}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); addToCartWithOptions(item, ci.options?.shot || '보통') }}
                            className="w-9 h-9 rounded-full bg-rodem-gold text-white text-lg font-bold flex items-center justify-center cursor-pointer border-none active:bg-rodem-gold/80"
                          >
                            +
                          </button>
                        </div>
                      )
                    })}
                    {isAmericano(item) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setShotModal(item) }}
                        className="w-full text-sm text-rodem-gold font-semibold bg-rodem-gold-light rounded-lg py-1 cursor-pointer border-none mt-1"
                      >
                        + 다른 옵션 추가
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Cart bar */}
      {cart.length > 0 && (
        <div className="border-t border-rodem-border-light bg-white p-5 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
          <div className="flex flex-wrap gap-2 mb-4">
            {cart.map((item) => {
              const key = cartKey(item.id, item.options?.shot)
              return (
                <div
                  key={key}
                  className="flex items-center gap-2 bg-rodem-gold-light px-4 py-2 rounded-full"
                >
                  <span className="font-bold text-black text-[3rem] leading-tight">{item.name} x{item.qty}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFromCart(key) }}
                    className="text-rodem-text-sub hover:text-rodem-red text-2xl cursor-pointer bg-transparent border-none"
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-between">
            <div className="text-[3rem] font-bold text-rodem-text leading-tight">
              합계 {formatPrice(cartTotal)}
            </div>
            <div className="flex gap-2">
              <button
                onClick={onBack}
                className="px-4 py-3.5 rounded-rodem-sm border border-rodem-border-light bg-white text-rodem-text-sub font-semibold cursor-pointer text-base"
              >
                ← 이전
              </button>
              <button
                onClick={onNext}
                className="px-6 py-3.5 rounded-rodem-sm bg-gradient-to-br from-[#f2d76a] via-[#dbb44a] to-[#c9a020] text-white font-bold cursor-pointer text-base shadow-[0_4px_16px_rgba(201,162,39,0.2)]"
              >
                다음 →
              </button>
            </div>
          </div>
        </div>
      )}

      {cart.length === 0 && (
        <div className="border-t border-rodem-border-light bg-white p-5">
          <button
            onClick={onBack}
            className="px-4 py-3.5 rounded-rodem-sm border border-rodem-border-light bg-white text-rodem-text-sub font-semibold cursor-pointer text-base"
          >
            ← 이전
          </button>
        </div>
      )}

      {/* Shot option modal */}
      {shotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShotModal(null)}>
          <div className="absolute inset-0 bg-[rgba(74,69,65,0.4)] backdrop-blur-[10px]" />
          <div className="relative bg-gradient-to-br from-[#fefcf9] to-[#f8f4ec] rounded-rodem p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-rodem-text mb-2">☕ {shotModal.name}</h3>
            <p className="text-base text-rodem-text-sub mb-4">샷 농도를 선택하세요</p>
            <div className="flex flex-col gap-2">
              {SHOT_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleShotSelect(opt)}
                  className={cn(
                    'w-full py-4 rounded-rodem-sm border-2 text-lg font-bold cursor-pointer transition-all',
                    opt === '보통'
                      ? 'bg-rodem-gold-light border-rodem-gold text-rodem-gold'
                      : opt === '연하게'
                        ? 'bg-blue-50 border-blue-400 text-blue-600'
                        : 'bg-red-50 border-red-400 text-red-600'
                  )}
                >
                  {opt === '보통' ? '☕ 보통' : opt === '연하게' ? '💧 연하게 (샷 적게)' : '💪 진하게 (샷 추가)'}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShotModal(null)}
              className="w-full mt-3 py-2 text-rodem-text-sub text-base cursor-pointer bg-transparent border-none"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
