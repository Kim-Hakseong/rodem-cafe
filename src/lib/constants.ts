export const PAYMENT_METHODS = [
  { id: 'cash', label: '현금', icon: '💵', color: 'rodem-green', bgColor: 'rodem-green-light' },
  { id: 'transfer', label: '계좌이체', icon: '🏦', color: 'rodem-blue', bgColor: 'rodem-blue-light' },
  { id: 'credit', label: '외상', icon: '📋', color: 'rodem-orange', bgColor: 'rodem-orange-light' },
  { id: 'prepaid', label: '선불', icon: '💰', color: 'rodem-purple', bgColor: 'rodem-purple-light' },
] as const

export const BANK_ACCOUNT = {
  bank: '농협',
  number: '351-1512-0013-03',
  holder: '대한예수교침례회 청주남부교회 로뎀나무',
}

export const CATEGORIES = ['전체', '커피', '음료', '차', '과자', '기타'] as const

export const CHOSUNG_LIST = ['ㄱ','ㄴ','ㄷ','ㄹ','ㅁ','ㅂ','ㅅ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'] as const
