/**
 * 미결제(외상) 신규 발생 허용 여부.
 * 2026-08 카페 봉사자 요청으로 신규 미결제 중단.
 * 롤백: 이 값을 true 로 바꾸면 즉시 원복된다.
 * (기존 미결제 내역의 조회·정산 기능은 이 플래그와 무관하게 항상 동작)
 */
export const CREDIT_ORDER_ENABLED = false

export const PAYMENT_METHODS = [
  { id: 'cash', label: '현금', icon: '💵', color: 'rodem-green', bgColor: 'rodem-green-light' },
  { id: 'transfer', label: '계좌이체', icon: '🏦', color: 'rodem-blue', bgColor: 'rodem-blue-light' },
  { id: 'credit', label: '미결제', icon: '📋', color: 'rodem-orange', bgColor: 'rodem-orange-light' },
  { id: 'prepaid', label: '선불', icon: '💰', color: 'rodem-purple', bgColor: 'rodem-purple-light' },
] as const

export const BANK_ACCOUNT = {
  bank: '농협',
  number: '351-1512-0013-03',
  holder: '대한예수교침례회 청주남부교회 로뎀나무',
}

export const CATEGORIES = ['전체', '커피', '음료', '차', '과자', '기타'] as const

export const CHOSUNG_LIST = ['ㄱ','ㄴ','ㄷ','ㄹ','ㅁ','ㅂ','ㅅ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'] as const

export const DEPARTMENTS = ['은장회','봉사회','어머니회','청년회','교회학교'] as const
