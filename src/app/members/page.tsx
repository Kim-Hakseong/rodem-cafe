'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { CHOSUNG_LIST, DEPARTMENTS } from '@/lib/constants'
import { getFirstChosung, cn, formatPrice } from '@/lib/utils'
import Header from '@/components/ui/Header'
import Modal from '@/components/ui/Modal'
import PinInput from '@/components/ui/PinInput'
import Toast from '@/components/ui/Toast'

// ─── Types ────────────────────────────────────────────────────────────────────

type Member = { id: string; name: string; phone: string | null; note: string | null; department: string | null; prepaid_balance: number; qr_token: string | null }
type MemberForm = { name: string; phone: string; note: string; department: string }
type UploadRow = { name: string; phone: string; note: string }
type ToastState = { show: boolean; message: string; type: 'success' | 'error' | 'info' }

const EMPTY_FORM: MemberForm = { name: '', phone: '', note: '', department: '' }
const INPUT_CLASS = 'w-full p-3 rounded-rodem-sm border-2 border-rodem-border-light bg-rodem-card text-rodem-text text-lg font-sans focus:outline-none focus:border-rodem-gold'
const GOLD_BTN = 'w-full py-3.5 rounded-rodem-sm font-bold text-base cursor-pointer border-none bg-gradient-to-r from-[#f2d76a] via-[#dbb44a] to-[#c9a020] text-[#4a3800] disabled:opacity-50'

// ─── Member Form ──────────────────────────────────────────────────────────────

function MemberFormFields({ form, onChange }: { form: MemberForm; onChange: (f: keyof MemberForm, v: string) => void }) {
  return (
    <div className="flex flex-col gap-3">
      {(['name', 'phone', 'note'] as const).map((f) => (
        <div key={f}>
          <label className="block text-sm font-semibold text-rodem-text-sub mb-1">
            {f === 'name' ? '이름 *' : f === 'phone' ? '연락처' : '메모'}
          </label>
          <input
            className={INPUT_CLASS}
            placeholder={f === 'name' ? '성도 이름' : f === 'phone' ? '010-0000-0000' : '비고 (선택)'}
            value={form[f]}
            onChange={(e) => onChange(f, e.target.value)}
          />
        </div>
      ))}
      <div>
        <label className="block text-sm font-semibold text-rodem-text-sub mb-1">부서</label>
        <select
          className={INPUT_CLASS}
          value={form.department}
          onChange={(e) => onChange('department', e.target.value)}
        >
          <option value="">미지정</option>
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MembersPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [authenticated, setAuthenticated] = useState(false)
  const [pinError, setPinError] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [chosung, setChosung] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Member | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [addForm, setAddForm] = useState<MemberForm>(EMPTY_FORM)
  const [editForm, setEditForm] = useState<MemberForm>(EMPTY_FORM)
  const [uploadRows, setUploadRows] = useState<UploadRow[]>([])
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' })

  const showToast = (message: string, type: ToastState['type'] = 'info') =>
    setToast({ show: true, message, type })

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    const sb = createSupabaseBrowser()
    const { data } = await sb.from('members').select('id,name,phone,note,department,prepaid_balance,qr_token').order('name')
    if (data) setMembers(data as Member[])
    setLoading(false)
  }, [])

  useEffect(() => { if (authenticated) fetchMembers() }, [authenticated, fetchMembers])

  const handlePin = useCallback(async (pin: string) => {
    const res = await fetch('/api/pin/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin, type: 'admin' }) })
    if (res.ok) { setAuthenticated(true); setPinError(false) } else setPinError(true)
  }, [])

  const filtered = useMemo(() => members.filter((m) => {
    if (search) return m.name.includes(search)
    if (chosung) return getFirstChosung(m.name) === chosung
    return true
  }), [members, search, chosung])

  const callApi = async (method: string, body: object) => {
    const res = await fetch('/api/members', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    return res.ok
  }

  const handleAdd = async () => {
    if (!addForm.name.trim() || submitting) return
    setSubmitting(true)
    const ok = await callApi('POST', { name: addForm.name.trim(), phone: addForm.phone.trim(), note: addForm.note.trim(), department: addForm.department || null })
    ok ? (showToast(`${addForm.name} 님 추가 완료`, 'success'), setAddForm(EMPTY_FORM), setAddOpen(false), fetchMembers())
       : showToast('추가 실패', 'error')
    setSubmitting(false)
  }

  const handleEdit = async () => {
    if (!editTarget || !editForm.name.trim() || submitting) return
    setSubmitting(true)
    const ok = await callApi('PUT', { id: editTarget.id, name: editForm.name.trim(), phone: editForm.phone.trim(), note: editForm.note.trim(), department: editForm.department || null })
    ok ? (showToast('수정 완료', 'success'), setEditTarget(null), fetchMembers())
       : showToast('수정 실패', 'error')
    setSubmitting(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget || submitting) return
    setSubmitting(true)
    const ok = await callApi('DELETE', { id: deleteTarget.id })
    ok ? (showToast(`${deleteTarget.name} 님 삭제 완료`, 'success'), setDeleteTarget(null), fetchMembers())
       : showToast('삭제 실패', 'error')
    setSubmitting(false)
  }

  const handleQrDownload = async (m: Member) => {
    const res = await fetch(`/api/qr/generate?memberId=${m.id}`)
    if (!res.ok) { showToast('QR 생성 실패', 'error'); return }
    const url = URL.createObjectURL(await res.blob())
    Object.assign(document.createElement('a'), { href: url, download: `QR_${m.name}.png` }).click()
    URL.revokeObjectURL(url)
    showToast(`${m.name} QR 다운로드`, 'success')
  }

  const handleExcelDownload = () => {
    const ws = XLSX.utils.json_to_sheet(members.map((m) => ({ 이름: m.name, 연락처: m.phone ?? '', 메모: m.note ?? '', 선불잔액: m.prepaid_balance ?? 0 })))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '성도목록')
    XLSX.writeFile(wb, `로뎀카페_성도목록_${new Date().toLocaleDateString('ko-KR').replace(/\. /g, '-').replace('.', '')}.xlsx`)
    showToast('엑셀 다운로드 완료', 'success')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const wb = XLSX.read(new Uint8Array(ev.target?.result as ArrayBuffer), { type: 'array' })
      const rows: UploadRow[] = (XLSX.utils.sheet_to_json<Record<string, string>>(wb.Sheets[wb.SheetNames[0]]))
        .map((r) => ({ name: String(r['이름'] ?? r['name'] ?? '').trim(), phone: String(r['연락처'] ?? r['phone'] ?? '').trim(), note: String(r['메모'] ?? r['note'] ?? '').trim() }))
        .filter((r) => r.name)
      setUploadRows(rows); setUploadOpen(true)
    }
    reader.readAsArrayBuffer(file)
    e.target.value = ''
  }

  const handleBulkInsert = async () => {
    if (!uploadRows.length || submitting) return
    setSubmitting(true)
    let success = 0
    for (const row of uploadRows) { if (await callApi('POST', row)) success++ }
    setSubmitting(false); setUploadOpen(false); setUploadRows([])
    showToast(`${success}/${uploadRows.length}명 추가 완료`, 'success')
    fetchMembers()
  }

  // ── PIN screen ────────────────────────────────────────────────────────────

  if (!authenticated) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#efebe4] via-[#e5e0d8] to-[#dedad2] font-sans relative">
      <button onClick={() => router.push('/')} className="absolute top-4 left-4 bg-gradient-to-br from-[#f0ece4] to-[#e8e3da] border-none text-base text-rodem-text-sub cursor-pointer py-2 px-3.5 rounded-[10px]">← 뒤로</button>
      <div className="text-[42px] mb-4">👥</div>
      <h2 className="text-[24px] font-bold mb-2 text-rodem-text">성도 관리</h2>
      <p className="text-base text-rodem-text-sub mb-8">관리자 PIN을 입력하세요</p>
      {pinError && <p className="text-rodem-red text-base font-semibold mb-3">PIN이 틀렸습니다</p>}
      <PinInput onComplete={handlePin} error={pinError} onReset={() => setPinError(false)} />
    </div>
  )

  // ── Header right ──────────────────────────────────────────────────────────

  const hBtn = 'py-1.5 px-3 rounded-rodem-sm text-sm font-semibold cursor-pointer border-none text-white'
  const headerRight = (
    <div className="flex gap-1.5">
      <button onClick={() => { setAddForm(EMPTY_FORM); setAddOpen(true) }} className={`${hBtn} bg-gradient-to-br from-[#f2d76a] via-[#dbb44a] to-[#c9a020] text-[#4a3800]`}>+ 추가</button>
      <button onClick={handleExcelDownload} className={`${hBtn} bg-white/20`}>엑셀 다운</button>
      <button onClick={() => fileRef.current?.click()} className={`${hBtn} bg-white/20`}>엑셀 업로드</button>
      <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
    </div>
  )

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-rodem-bg font-sans">
      <Header title="👥 성도 관리" onBack={() => router.push('/')} right={headerRight} />

      <div className="p-4">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-4 rounded-rodem bg-gradient-to-br from-[#4a4541] to-[#3a3632] text-white">
            <div className="text-sm opacity-70 mb-1">전체 성도</div>
            <div className="text-[26px] font-bold">{members.length}명</div>
          </div>
          <div className="p-4 rounded-rodem bg-gradient-to-br from-[#c9a227] to-[#a8881e] text-white">
            <div className="text-sm opacity-70 mb-1">선불 보유</div>
            <div className="text-[26px] font-bold">{members.filter((m) => (m.prepaid_balance ?? 0) > 0).length}명</div>
          </div>
        </div>

        {/* Search */}
        <input type="text" placeholder="이름 검색..." value={search}
          onChange={(e) => { setSearch(e.target.value); setChosung(null) }}
          className="w-full p-3.5 rounded-rodem-sm border-2 border-rodem-border-light bg-rodem-card text-rodem-text text-lg font-sans focus:outline-none focus:border-rodem-gold mb-3"
        />

        {/* Chosung filter */}
        <div className="flex flex-wrap gap-1 mb-4">
          {(['전체', ...CHOSUNG_LIST] as const).map((ch) => {
            const active = ch === '전체' ? !chosung : chosung === ch
            return (
              <button key={ch} onClick={() => { setChosung(ch === '전체' ? null : ch); setSearch('') }}
                className={cn('px-3 py-1.5 rounded-[10px] text-sm font-semibold cursor-pointer border', active ? 'bg-rodem-gold text-white border-rodem-gold' : 'bg-rodem-card text-rodem-text-sub border-rodem-border-light')}
              >{ch}</button>
            )
          })}
        </div>

        {/* Member list */}
        {loading ? (
          <div className="text-center py-12 text-rodem-text-sub text-base">불러오는 중...</div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {filtered.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-3.5 rounded-rodem-sm bg-rodem-card border border-rodem-border-light">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f2d76a] to-[#c9a020] flex items-center justify-center text-[#4a3800] font-bold text-base shrink-0">
                  {m.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-base text-rodem-text">{m.name}</div>
                  <div className="text-sm text-rodem-text-sub truncate">{m.department ?? '미지정'} · {m.phone ?? '연락처 없음'}{m.note ? ` · ${m.note}` : ''}</div>
                  {(m.prepaid_balance ?? 0) > 0 && <div className="text-[13px] text-rodem-purple font-semibold mt-0.5">선불 {formatPrice(m.prepaid_balance)}</div>}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {[
                    { label: 'QR', fn: () => handleQrDownload(m), cls: 'bg-rodem-border-light text-rodem-text-sub hover:bg-rodem-border' },
                    { label: '수정', fn: () => { setEditTarget(m); setEditForm({ name: m.name, phone: m.phone ?? '', note: m.note ?? '', department: m.department ?? '' }) }, cls: 'bg-rodem-border-light text-rodem-text-sub hover:bg-rodem-border' },
                    { label: '삭제', fn: () => setDeleteTarget(m), cls: 'bg-rodem-red/10 text-rodem-red hover:bg-rodem-red/20' },
                  ].map(({ label, fn, cls }) => (
                    <button key={label} onClick={fn} aria-label={`${m.name} ${label}`}
                      className={`w-9 h-8 rounded-[8px] text-sm flex items-center justify-center transition-colors ${cls}`}>{label}</button>
                  ))}
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="text-center py-12 text-rodem-text-sub text-base">검색 결과가 없습니다</div>}
          </div>
        )}
      </div>

      {/* ── Add Modal ── */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="성도 추가">
        <MemberFormFields form={addForm} onChange={(f, v) => setAddForm((p) => ({ ...p, [f]: v }))} />
        <button onClick={handleAdd} disabled={!addForm.name.trim() || submitting} className={`mt-4 ${GOLD_BTN}`}>
          {submitting ? '저장 중...' : '추가하기'}
        </button>
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="성도 정보 수정">
        <MemberFormFields form={editForm} onChange={(f, v) => setEditForm((p) => ({ ...p, [f]: v }))} />
        <button onClick={handleEdit} disabled={!editForm.name.trim() || submitting} className={`mt-4 ${GOLD_BTN}`}>
          {submitting ? '저장 중...' : '수정 완료'}
        </button>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="성도 삭제" maxWidth="max-w-sm">
        <p className="text-base text-rodem-text mb-1"><span className="font-bold">{deleteTarget?.name}</span> 님을 삭제하시겠습니까?</p>
        <p className="text-sm text-rodem-text-sub mb-5">이 작업은 되돌릴 수 없습니다.</p>
        <div className="flex gap-2">
          <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 rounded-rodem-sm text-base font-semibold cursor-pointer bg-rodem-border-light border-none text-rodem-text">취소</button>
          <button onClick={handleDelete} disabled={submitting} className="flex-1 py-3 rounded-rodem-sm text-base font-semibold cursor-pointer bg-rodem-red border-none text-white disabled:opacity-50">
            {submitting ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </Modal>

      {/* ── Excel Upload Preview Modal ── */}
      <Modal isOpen={uploadOpen} onClose={() => { setUploadOpen(false); setUploadRows([]) }} title="엑셀 업로드 미리보기" maxWidth="max-w-xl">
        <p className="text-sm text-rodem-text-sub mb-3">{uploadRows.length}명의 성도 데이터가 감지되었습니다.</p>
        <div className="max-h-60 overflow-y-auto border border-rodem-border-light rounded-rodem-sm mb-4">
          <table className="w-full text-sm text-rodem-text">
            <thead className="bg-rodem-bg sticky top-0">
              <tr>{['이름', '연락처', '메모'].map((h) => <th key={h} className="p-2 text-left font-semibold text-rodem-text-sub">{h}</th>)}</tr>
            </thead>
            <tbody>
              {uploadRows.map((row, i) => (
                <tr key={i} className="border-t border-rodem-border-light">
                  <td className="p-2 font-semibold">{row.name}</td>
                  <td className="p-2 text-rodem-text-sub">{row.phone || '-'}</td>
                  <td className="p-2 text-rodem-text-sub">{row.note || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setUploadOpen(false); setUploadRows([]) }} className="flex-1 py-3 rounded-rodem-sm text-base font-semibold cursor-pointer bg-rodem-border-light border-none text-rodem-text">취소</button>
          <button onClick={handleBulkInsert} disabled={submitting} className={`flex-1 py-3 rounded-rodem-sm text-base font-semibold cursor-pointer border-none bg-gradient-to-r from-[#f2d76a] via-[#dbb44a] to-[#c9a020] text-[#4a3800] disabled:opacity-50`}>
            {submitting ? '추가 중...' : `${uploadRows.length}명 일괄 추가`}
          </button>
        </div>
      </Modal>

      <Toast message={toast.message} type={toast.type} isVisible={toast.show} onClose={() => setToast((p) => ({ ...p, show: false }))} />
    </div>
  )
}
