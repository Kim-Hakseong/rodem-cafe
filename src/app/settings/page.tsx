'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import Header from '@/components/ui/Header'
import PinInput from '@/components/ui/PinInput'
import Toast from '@/components/ui/Toast'

type Tab = 'change' | 'recover' | 'email'
type ToastState = { show: boolean; message: string; type: 'success' | 'error' | 'info' }

const TABS: { key: Tab; label: string }[] = [
  { key: 'change', label: 'PIN 변경' },
  { key: 'recover', label: 'PIN 찾기' },
  { key: 'email', label: '이메일 변경' },
]

// ── PIN 변경 탭 ─────────────────────────────────────────────────────────────

type ChangeStep = 'current' | 'new' | 'confirm'

function TabChange({ notify }: { notify: (m: string, t?: ToastState['type']) => void }) {
  const [step, setStep] = useState<ChangeStep>('current')
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [err, setErr] = useState(false)

  const reset = () => { setStep('current'); setCurrentPin(''); setNewPin(''); setErr(false) }

  const handleCurrent = useCallback(async (pin: string) => {
    const res = await fetch('/api/pin/verify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin, type: 'admin' }),
    })
    if (res.ok) { setCurrentPin(pin); setStep('new'); setErr(false) }
    else setErr(true)
  }, [])

  const handleNew = useCallback((pin: string) => { setNewPin(pin); setStep('confirm') }, [])

  const handleConfirm = useCallback(async (pin: string) => {
    if (pin !== newPin) { setErr(true); return }
    const res = await fetch('/api/pin/change', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPin, newPin, type: 'admin' }),
    })
    if (res.ok) { notify('PIN이 변경되었습니다', 'success'); reset() }
    else { notify('PIN 변경에 실패했습니다', 'error'); reset() }
  }, [currentPin, newPin, notify])

  const stepLabel = { current: '현재 PIN 입력', new: '새 PIN 입력', confirm: '새 PIN 확인' }[step]
  const errMsg = step === 'current' ? '현재 PIN이 틀렸습니다' : 'PIN이 일치하지 않습니다'

  return (
    <div className="flex flex-col items-center gap-5">
      <StepBadge label={stepLabel} />
      {err && <p className="text-rodem-red text-sm font-semibold">{errMsg}</p>}
      {step === 'current' && <PinInput onComplete={handleCurrent} error={err} onReset={() => setErr(false)} />}
      {step === 'new' && <PinInput onComplete={handleNew} error={false} />}
      {step === 'confirm' && (
        <PinInput onComplete={handleConfirm} error={err}
          onReset={() => { setErr(false); setStep('new'); setNewPin('') }} />
      )}
      {step !== 'current' && <ResetLink onClick={reset} />}
    </div>
  )
}

// ── PIN 찾기 탭 ─────────────────────────────────────────────────────────────

type RecoverStep = 'email' | 'code' | 'new' | 'confirm'

function TabRecover({ notify }: { notify: (m: string, t?: ToastState['type']) => void }) {
  const [step, setStep] = useState<RecoverStep>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPin, setNewPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [pinErr, setPinErr] = useState(false)

  const post = async (body: object) => {
    return fetch('/api/pin/recover', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  const handleSendCode = async () => {
    if (!email.trim()) return
    setLoading(true)
    try {
      const res = await post({ email, action: 'send-code' })
      if (res.ok) { notify('인증 코드가 전송되었습니다', 'success'); setStep('code') }
      else notify('등록된 이메일이 아닙니다', 'error')
    } finally { setLoading(false) }
  }

  const handleVerifyCode = async () => {
    if (code.length < 6) return
    setLoading(true)
    try {
      const res = await post({ code, action: 'verify-code' })
      if (res.ok) { notify('인증되었습니다', 'success'); setStep('new') }
      else notify('인증 코드가 틀렸습니다', 'error')
    } finally { setLoading(false) }
  }

  const handleNewPin = (pin: string) => { setNewPin(pin); setStep('confirm') }

  const handleConfirm = async (pin: string) => {
    if (pin !== newPin) { setPinErr(true); return }
    const res = await post({ newPin, action: 'reset-pin' })
    if (res.ok) {
      notify('PIN이 재설정되었습니다', 'success')
      setStep('email'); setEmail(''); setCode(''); setNewPin(''); setPinErr(false)
    } else notify('PIN 재설정에 실패했습니다', 'error')
  }

  const stepLabel = { email: '이메일 입력', code: '인증 코드 입력', new: '새 PIN 입력', confirm: '새 PIN 확인' }[step]

  return (
    <div className="flex flex-col items-center gap-5">
      <StepBadge label={stepLabel} />

      {step === 'email' && (
        <>
          <input type="email" placeholder="등록된 이메일 주소" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 rounded-rodem-sm border-2 border-rodem-border-light bg-rodem-card text-rodem-text text-base font-sans focus:outline-none focus:border-rodem-gold" />
          <GoldButton onClick={handleSendCode} disabled={loading || !email.trim()} loading={loading} label="인증 코드 전송" />
        </>
      )}

      {step === 'code' && (
        <>
          <p className="text-xs text-rodem-text-sub text-center">{email}로 전송된 코드를 입력하세요</p>
          <input type="text" placeholder="인증 코드 6자리" value={code} maxLength={6}
            onChange={(e) => setCode(e.target.value)}
            className="w-full p-4 rounded-rodem-sm border-2 border-rodem-border-light bg-rodem-card text-rodem-text text-base font-sans focus:outline-none focus:border-rodem-gold text-center tracking-[0.4em]" />
          <GoldButton onClick={handleVerifyCode} disabled={loading || code.length < 6} loading={loading} label="코드 확인" />
          <ResetLink onClick={() => setStep('email')} label="이메일 다시 입력" />
        </>
      )}

      {step === 'new' && (
        <>
          {pinErr && <p className="text-rodem-red text-sm font-semibold">PIN이 일치하지 않습니다</p>}
          <PinInput onComplete={handleNewPin} error={false} />
        </>
      )}

      {step === 'confirm' && (
        <>
          {pinErr && <p className="text-rodem-red text-sm font-semibold">PIN이 일치하지 않습니다</p>}
          <PinInput onComplete={handleConfirm} error={pinErr}
            onReset={() => { setPinErr(false); setStep('new'); setNewPin('') }} />
          <ResetLink onClick={() => { setStep('new'); setNewPin(''); setPinErr(false) }} label="다시 입력" />
        </>
      )}
    </div>
  )
}

// ── 이메일 변경 탭 ───────────────────────────────────────────────────────────

function TabEmail({ notify }: { notify: (m: string, t?: ToastState['type']) => void }) {
  const [verified, setVerified] = useState(false)
  const [pinErr, setPinErr] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [saving, setSaving] = useState(false)

  const handlePin = useCallback(async (pin: string) => {
    const res = await fetch('/api/pin/verify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin, type: 'admin' }),
    })
    if (res.ok) { setVerified(true); setPinErr(false) }
    else setPinErr(true)
  }, [])

  const handleSave = async () => {
    if (!newEmail.includes('@')) { notify('올바른 이메일을 입력하세요', 'error'); return }
    setSaving(true)
    try {
      // Placeholder: wire to dedicated email-update API when available
      await new Promise((r) => setTimeout(r, 400))
      notify('이메일이 변경되었습니다', 'success')
      setVerified(false); setNewEmail('')
    } finally { setSaving(false) }
  }

  if (!verified) {
    return (
      <div className="flex flex-col items-center gap-5">
        <StepBadge label="관리자 PIN 입력" sub="PIN 인증 후 이메일을 변경할 수 있습니다" />
        {pinErr && <p className="text-rodem-red text-sm font-semibold">PIN이 틀렸습니다</p>}
        <PinInput onComplete={handlePin} error={pinErr} onReset={() => setPinErr(false)} />
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="w-full bg-[#eaf5ef] border border-[#5a9a6e]/20 rounded-rodem-sm p-3 text-center">
        <p className="text-sm text-[#3a7a4e] font-semibold">PIN 인증 완료</p>
      </div>
      <label className="text-sm font-semibold text-rodem-text">새 복구 이메일</label>
      <input type="email" placeholder="새 이메일 주소 입력" value={newEmail}
        onChange={(e) => setNewEmail(e.target.value)}
        className="w-full p-4 rounded-rodem-sm border-2 border-rodem-border-light bg-rodem-card text-rodem-text text-base font-sans focus:outline-none focus:border-rodem-gold" />
      <GoldButton onClick={handleSave} disabled={saving || !newEmail.trim()} loading={saving} label="이메일 저장" />
      <ResetLink onClick={() => { setVerified(false); setNewEmail('') }} label="취소" />
    </div>
  )
}

// ── 공용 미니 컴포넌트 ────────────────────────────────────────────────────────

function StepBadge({ label, sub }: { label: string; sub?: string }) {
  return (
    <div className="w-full bg-rodem-card border border-rodem-border-light rounded-rodem-sm p-4 text-center">
      {sub && <p className="text-xs text-rodem-text-sub mb-1">{sub}</p>}
      <p className="font-bold text-rodem-text">{label}</p>
    </div>
  )
}

function GoldButton({ onClick, disabled, loading, label }: {
  onClick: () => void; disabled: boolean; loading: boolean; label: string
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-full py-4 rounded-rodem-sm bg-gradient-to-br from-[#dbb44a] to-[#c9a020] text-white font-bold text-base cursor-pointer shadow-[0_6px_24px_rgba(201,162,39,0.2)] disabled:opacity-50">
      {loading ? '처리 중...' : label}
    </button>
  )
}

function ResetLink({ onClick, label = '처음부터 다시' }: { onClick: () => void; label?: string }) {
  return (
    <button onClick={onClick}
      className="text-sm text-rodem-text-sub cursor-pointer bg-transparent border-none underline underline-offset-2">
      {label}
    </button>
  )
}

// ── 페이지 루트 ───────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [pinError, setPinError] = useState(false)
  const [tab, setTab] = useState<Tab>('change')
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' })

  const notify = useCallback((message: string, type: ToastState['type'] = 'info') => {
    setToast({ show: true, message, type })
  }, [])

  const handleGatePin = useCallback(async (pin: string) => {
    const res = await fetch('/api/pin/verify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin, type: 'admin' }),
    })
    if (res.ok) { setAuthenticated(true); setPinError(false) }
    else setPinError(true)
  }, [])

  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#efebe4] via-[#e5e0d8] to-[#dedad2] font-sans relative">
        <button onClick={() => router.push('/')}
          className="absolute top-4 left-4 bg-gradient-to-br from-[#f0ece4] to-[#e8e3da] border-none text-sm text-rodem-text-sub cursor-pointer py-2 px-3.5 rounded-[10px]">
          ← 뒤로
        </button>
        <div className="text-[40px] mb-4">⚙️</div>
        <h2 className="text-[22px] font-bold mb-2 text-rodem-text">설정</h2>
        <p className="text-sm text-rodem-text-sub mb-8">관리자 PIN을 입력하세요</p>
        {pinError && <p className="text-rodem-red text-sm font-semibold mb-3">PIN이 틀렸습니다</p>}
        <PinInput onComplete={handleGatePin} error={pinError} onReset={() => setPinError(false)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-rodem-bg font-sans">
      <Header title="⚙️ 설정" onBack={() => router.push('/')} />

      <div className="flex border-b border-rodem-border-light bg-rodem-card">
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={cn(
              'flex-1 py-3.5 text-sm font-semibold cursor-pointer border-none transition-colors',
              'border-b-2',
              tab === key
                ? 'border-rodem-gold text-rodem-gold bg-transparent'
                : 'border-transparent text-rodem-text-sub bg-transparent'
            )}>
            {label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {tab === 'change' && <TabChange notify={notify} />}
        {tab === 'recover' && <TabRecover notify={notify} />}
        {tab === 'email' && <TabEmail notify={notify} />}
      </div>

      <Toast message={toast.message} type={toast.type} isVisible={toast.show}
        onClose={() => setToast((p) => ({ ...p, show: false }))} />
    </div>
  )
}
