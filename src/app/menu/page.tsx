'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { CATEGORIES } from '@/lib/constants'
import { cn, formatPrice } from '@/lib/utils'
import Header from '@/components/ui/Header'
import Modal from '@/components/ui/Modal'
import PinInput from '@/components/ui/PinInput'
import Toast from '@/components/ui/Toast'

type TempType = 'HOT' | 'ICE' | null
type Category = Exclude<typeof CATEGORIES[number], '전체'>
type MenuItem = { id: string; name: string; price: number; category: Category; temp_type: TempType; sort_order: number; is_active: boolean; image_url: string | null }
type FormState = { name: string; price: string; category: Category; temp_type: TempType; sort_order: string; image_url: string }

const MENU_CATS = CATEGORIES.filter((c) => c !== '전체') as Category[]
const DEFAULT_FORM: FormState = { name: '', price: '', category: '커피', temp_type: null, sort_order: '0', image_url: '' }
const TEMP_BADGE: Record<NonNullable<TempType>, string> = { HOT: 'bg-red-100 text-red-600', ICE: 'bg-blue-100 text-blue-600' }

export default function MenuPage() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [pinError, setPinError] = useState(false)
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<Category>('커피')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<MenuItem | null>(null)
  const [form, setForm] = useState<FormState>(DEFAULT_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' as 'success' | 'error' | 'info' })

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ show: true, message, type })
  }, [])

  const fetchItems = useCallback(async () => {
    const { data } = await createSupabaseBrowser()
      .from('menu_items')
      .select('id, name, price, category, temp_type, sort_order, is_active, image_url')
      .order('category').order('sort_order')
    if (data) setItems(data as MenuItem[])
    setLoading(false)
  }, [])

  useEffect(() => { if (authenticated) fetchItems() }, [authenticated, fetchItems])

  const handlePinComplete = useCallback(async (pin: string) => {
    const res = await fetch('/api/pin/verify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin, type: 'admin' }),
    })
    if (res.ok) { setAuthenticated(true); setPinError(false) }
    else setPinError(true)
  }, [])

  const openAdd = () => { setEditTarget(null); setForm({ ...DEFAULT_FORM, category: activeCategory }); setModalOpen(true) }
  const openEdit = (item: MenuItem) => {
    setEditTarget(item)
    setForm({ name: item.name, price: String(item.price), category: item.category, temp_type: item.temp_type, sort_order: String(item.sort_order), image_url: item.image_url || '' })
    setModalOpen(true)
  }
  const closeModal = () => { setModalOpen(false); setEditTarget(null); setForm(DEFAULT_FORM) }

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.price) return
    setSubmitting(true)
    try {
      const payload = { name: form.name.trim(), price: Number(form.price), category: form.category, temp_type: form.temp_type, sort_order: Number(form.sort_order) || 0, image_url: form.image_url.trim() || null, ...(editTarget ? { id: editTarget.id, is_active: editTarget.is_active } : {}) }
      const res = await fetch('/api/menu', { method: editTarget ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (res.ok) { showToast(editTarget ? '메뉴가 수정되었습니다' : '메뉴가 추가되었습니다', 'success'); closeModal(); fetchItems() }
      else showToast('저장 실패', 'error')
    } catch { showToast('오류가 발생했습니다', 'error') }
    finally { setSubmitting(false) }
  }

  const toggleActive = async (item: MenuItem) => {
    const res = await fetch('/api/menu', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...item, is_active: !item.is_active }) })
    if (res.ok) setItems((prev) => prev.map((m) => m.id === item.id ? { ...m, is_active: !item.is_active } : m))
  }

  const changeOrder = async (item: MenuItem, dir: 'up' | 'down') => {
    const list = items.filter((m) => m.category === item.category).sort((a, b) => a.sort_order - b.sort_order)
    const idx = list.findIndex((m) => m.id === item.id)
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= list.length) return
    const swap = list[swapIdx]
    await Promise.all([
      fetch('/api/menu', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...item, sort_order: swap.sort_order }) }),
      fetch('/api/menu', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...swap, sort_order: item.sort_order }) }),
    ])
    fetchItems()
  }

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((p) => ({ ...p, [k]: v }))
  const categoryItems = items.filter((m) => m.category === activeCategory).sort((a, b) => a.sort_order - b.sort_order)

  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#efebe4] via-[#e5e0d8] to-[#dedad2] font-sans relative overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[280px] h-[280px] rounded-full bg-[radial-gradient(circle,rgba(201,162,39,0.05)_0%,transparent_70%)]" />
        <button onClick={() => router.push('/')} className="absolute top-4 left-4 bg-gradient-to-br from-[#f0ece4] to-[#e8e3da] border-none text-base text-rodem-text-sub cursor-pointer py-2 px-3.5 rounded-[10px] z-10">
          &larr; 뒤로
        </button>
        <div className="text-[42px] mb-4 relative z-10">☕</div>
        <h2 className="text-[24px] font-bold mb-2 text-rodem-text relative z-10">메뉴 관리</h2>
        <p className="text-base text-rodem-text-sub mb-8 relative z-10">관리자 PIN을 입력하세요</p>
        {pinError && <p className="text-rodem-red text-base font-semibold mb-3 relative z-10">PIN이 틀렸습니다</p>}
        <div className="relative z-10">
          <PinInput onComplete={handlePinComplete} error={pinError} onReset={() => setPinError(false)} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-rodem-bg font-sans">
      <Header
        title="메뉴 관리"
        onBack={() => router.push('/')}
        right={
          <button onClick={openAdd} className="bg-rodem-gold border-none text-white py-1.5 px-4 rounded-[10px] text-base font-bold cursor-pointer shadow-[0_2px_8px_rgba(201,162,39,0.3)]">
            + 추가
          </button>
        }
      />

      {/* Category tabs */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto">
        {MENU_CATS.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={cn('flex-shrink-0 py-2 px-4 rounded-[12px] text-base font-bold cursor-pointer border transition-all',
              activeCategory === cat ? 'bg-rodem-gold text-white border-rodem-gold shadow-[0_2px_8px_rgba(201,162,39,0.2)]' : 'bg-rodem-card text-rodem-text-sub border-rodem-border-light')}>
            {cat}
            <span className={cn('ml-1.5 text-[13px]', activeCategory === cat ? 'opacity-80' : 'text-rodem-text-sub')}>
              {items.filter((m) => m.category === cat).length}
            </span>
          </button>
        ))}
      </div>

      {/* Menu list */}
      <div className="px-4 pb-6">
        {loading ? (
          <div className="text-center py-12 text-rodem-text-sub text-base">불러오는 중...</div>
        ) : categoryItems.length === 0 ? (
          <div className="text-center py-12 text-rodem-text-sub text-base">
            <div className="text-[32px] mb-3">🍽</div>
            <p>{activeCategory} 카테고리에 메뉴가 없습니다</p>
            <button onClick={openAdd} className="mt-4 py-2 px-5 rounded-[12px] bg-rodem-gold text-white font-bold text-base cursor-pointer border-none">첫 메뉴 추가하기</button>
          </div>
        ) : (
          <div className="space-y-2">
            {categoryItems.map((item, idx) => (
              <div key={item.id} className={cn('flex items-center gap-3 p-3.5 rounded-rodem-sm border transition-all',
                item.is_active ? 'bg-gradient-to-br from-[#fefcf9] to-[#f8f4ec] border-rodem-border-light' : 'bg-rodem-bg border-rodem-border-light opacity-50')}>
                {/* Sort */}
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => changeOrder(item, 'up')} disabled={idx === 0} aria-label="위로 이동"
                    className="w-7 h-6 rounded-[6px] bg-rodem-border-light text-rodem-text-sub text-[13px] flex items-center justify-center cursor-pointer border-none disabled:opacity-30">↑</button>
                  <button onClick={() => changeOrder(item, 'down')} disabled={idx === categoryItems.length - 1} aria-label="아래로 이동"
                    className="w-7 h-6 rounded-[6px] bg-rodem-border-light text-rodem-text-sub text-[13px] flex items-center justify-center cursor-pointer border-none disabled:opacity-30">↓</button>
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-rodem-text truncate">{item.name}</span>
                    {item.temp_type && (
                      <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded-[5px]', TEMP_BADGE[item.temp_type])}>{item.temp_type}</span>
                    )}
                  </div>
                  <div className="text-sm text-rodem-text-sub mt-0.5">
                    <span className="font-semibold text-rodem-gold">{formatPrice(item.price)}</span>
                    <span className="mx-1.5 opacity-40">·</span>
                    <span>순서 {item.sort_order}</span>
                  </div>
                </div>
                {/* Toggle */}
                <button onClick={() => toggleActive(item)} aria-label={item.is_active ? '비활성화' : '활성화'}
                  className={cn('w-11 h-6 rounded-full relative cursor-pointer border-none flex-shrink-0', item.is_active ? 'bg-rodem-gold' : 'bg-rodem-border')}>
                  <span className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200', item.is_active ? 'left-[22px]' : 'left-0.5')} />
                </button>
                {/* Edit */}
                <button onClick={() => openEdit(item)} aria-label="수정"
                  className="w-8 h-8 rounded-[8px] bg-rodem-border-light text-rodem-text-sub text-sm flex items-center justify-center cursor-pointer border-none flex-shrink-0">
                  ✏️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} title={editTarget ? '메뉴 수정' : '메뉴 추가'} maxWidth="max-w-md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-rodem-text-sub mb-1.5">메뉴 이름 *</label>
            <input type="text" value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="예) 아메리카노"
              className="w-full p-3 rounded-rodem-sm border-2 border-rodem-border-light bg-rodem-bg text-rodem-text text-base font-sans focus:outline-none focus:border-rodem-gold" />
          </div>
          <div>
            <label className="block text-sm font-bold text-rodem-text-sub mb-1.5">가격 (원) *</label>
            <input type="number" value={form.price} onChange={(e) => setField('price', e.target.value)} placeholder="예) 2000"
              className="w-full p-3 rounded-rodem-sm border-2 border-rodem-border-light bg-rodem-bg text-rodem-text text-base font-sans focus:outline-none focus:border-rodem-gold" />
          </div>
          <div>
            <label className="block text-sm font-bold text-rodem-text-sub mb-1.5">카테고리 *</label>
            <div className="flex flex-wrap gap-1.5">
              {MENU_CATS.map((cat) => (
                <button key={cat} onClick={() => setField('category', cat)}
                  className={cn('py-1.5 px-3 rounded-[10px] text-sm font-bold cursor-pointer border', form.category === cat ? 'bg-rodem-gold text-white border-rodem-gold' : 'bg-rodem-card text-rodem-text-sub border-rodem-border-light')}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-rodem-text-sub mb-1.5">온도 (선택)</label>
            <div className="flex gap-1.5">
              {(['HOT', 'ICE', null] as const).map((t) => (
                <button key={String(t)} onClick={() => setField('temp_type', t)}
                  className={cn('py-1.5 px-3.5 rounded-[10px] text-sm font-bold cursor-pointer border',
                    form.temp_type === t
                      ? t === 'HOT' ? 'bg-red-500 text-white border-red-500' : t === 'ICE' ? 'bg-blue-500 text-white border-blue-500' : 'bg-rodem-text text-white border-rodem-text'
                      : 'bg-rodem-card text-rodem-text-sub border-rodem-border-light')}>
                  {t === null ? '없음' : t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-rodem-text-sub mb-1.5">정렬 순서</label>
            <input type="number" value={form.sort_order} onChange={(e) => setField('sort_order', e.target.value)}
              className="w-full p-3 rounded-rodem-sm border-2 border-rodem-border-light bg-rodem-bg text-rodem-text text-base font-sans focus:outline-none focus:border-rodem-gold" />
          </div>
          <div>
            <label className="block text-sm font-bold text-rodem-text-sub mb-1.5">이미지 URL (선택)</label>
            <input type="url" value={form.image_url} onChange={(e) => setField('image_url', e.target.value)} placeholder="https://example.com/image.jpg"
              className="w-full p-3 rounded-rodem-sm border-2 border-rodem-border-light bg-rodem-bg text-rodem-text text-base font-sans focus:outline-none focus:border-rodem-gold" />
            {form.image_url && (
              <div className="mt-2 flex items-center gap-2">
                <img src={form.image_url} alt="미리보기" className="w-12 h-12 object-cover rounded-lg border border-rodem-border-light"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                <span className="text-sm text-rodem-text-sub">미리보기</span>
              </div>
            )}
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={closeModal} className="flex-1 py-3 rounded-rodem-sm border border-rodem-border-light bg-rodem-card text-rodem-text-sub font-bold text-base cursor-pointer">취소</button>
            <button onClick={handleSubmit} disabled={!form.name.trim() || !form.price || submitting}
              className="flex-1 py-3 rounded-rodem-sm bg-gradient-to-br from-rodem-gold to-[#b8911f] text-white font-bold text-base cursor-pointer border-none shadow-[0_4px_16px_rgba(201,162,39,0.25)] disabled:opacity-50">
              {submitting ? '저장 중...' : editTarget ? '수정 완료' : '추가하기'}
            </button>
          </div>
        </div>
      </Modal>

      <Toast message={toast.message} type={toast.type} isVisible={toast.show} onClose={() => setToast((p) => ({ ...p, show: false }))} />
    </div>
  )
}
