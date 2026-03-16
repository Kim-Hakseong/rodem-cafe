# 로뎀나무 카페 POS — Claude Code PRD v2.0

> **이 문서는 Claude Code가 직접 참조하여 단계별로 실행하는 엔지니어링 지침서입니다.**
> 각 Phase 완료 시 반드시 `LOG.md`에 결과를 기록하세요.

---

## 프로젝트 메타

| 항목 | 값 |
|---|---|
| 프로젝트명 | `rodem-cafe` |
| 스택 | Next.js 14 (App Router) + Supabase + Vercel |
| 노드 | >= 18 |
| 패키지매니저 | pnpm |
| 대상 사용자 | 봉사자 3명 + 성도 190명 |
| 디자인 참조 | `prototypes/` 폴더의 JSX 파일 5종 |

---

## LOG.md 규칙

매 Phase 완료 시 프로젝트 루트 `LOG.md`에 아래 형식으로 추가:

```markdown
## Phase X.X — [Phase명]
- **상태:** ✅ 완료 / ⚠️ 부분완료 / ❌ 실패
- **완료일:** YYYY-MM-DD
- **소요 시간:** 약 N분
- **산출물:** 생성된 파일 목록
- **이슈:** 발생한 문제 및 해결 방법 (없으면 "없음")
- **다음:** 다음 Phase 번호
```

---

## 디렉토리 구조 (최종 목표)

```
rodem-cafe/
├── LOG.md                          # Phase별 진행 로그
├── PRD.md                          # 이 파일
├── prototypes/                     # UI 참조용 JSX 프로토타입
│   ├── rodem-pos-v2.jsx
│   ├── rodem-dashboard-v2.jsx
│   ├── rodem-member-v2.jsx
│   ├── rodem-prepaid-v2.jsx
│   └── rodem-pin-v2.jsx
├── seed/
│   └── 로뎀나무_성도명단_초기데이터.xlsx
├── src/
│   └── app/
│       ├── layout.tsx              # 루트 레이아웃 (폰트, 글로벌 스타일)
│       ├── page.tsx                # 모드 선택 (POS / 조회)
│       ├── globals.css
│       ├── pos/
│       │   └── page.tsx            # 봉사자 POS (PIN → 주문 플로우)
│       ├── lookup/
│       │   └── page.tsx            # 성도 조회 (태블릿)
│       ├── my/
│       │   └── [token]/
│       │       └── page.tsx        # QR 개인 조회
│       ├── dashboard/
│       │   └── page.tsx            # 정산 대시보드
│       ├── members/
│       │   └── page.tsx            # 성도 관리
│       ├── prepaid/
│       │   └── page.tsx            # 선불 충전 관리
│       ├── menu/
│       │   └── page.tsx            # 메뉴 관리
│       ├── settings/
│       │   └── page.tsx            # PIN 관리 + 복구
│       └── api/
│           ├── pin/
│           │   ├── verify/route.ts
│           │   ├── change/route.ts
│           │   └── recover/route.ts
│           └── qr/
│               └── generate/route.ts
├── src/lib/
│   ├── supabase/
│   │   ├── client.ts               # 브라우저 클라이언트
│   │   ├── server.ts               # 서버 클라이언트
│   │   └── types.ts                # DB 타입 (supabase gen types)
│   ├── utils.ts                    # 공통 유틸 (formatPrice, getChosung 등)
│   └── constants.ts                # 테마, 결제방식 등 상수
├── src/components/
│   ├── ui/                         # 공통 UI (Button, Card, Modal, PinInput 등)
│   ├── pos/                        # POS 전용 컴포넌트
│   │   ├── OrderQueue.tsx          # 좌측 주문 대기열 패널 (접기/펼치기)
│   │   ├── MemberSelect.tsx
│   │   ├── MenuSelect.tsx
│   │   ├── PaymentSelect.tsx
│   │   ├── OrderConfirm.tsx
│   │   ├── TodaySummary.tsx
│   │   └── CreditManager.tsx
│   ├── dashboard/                  # 대시보드 전용 컴포넌트
│   └── layout/                     # Header, Footer 등
├── supabase/
│   └── migrations/
│       ├── 001_schema.sql          # 테이블 생성
│       ├── 002_seed_menu.sql       # 메뉴 시드
│       ├── 003_seed_members.sql    # 성도 시드
│       └── 004_rls.sql             # RLS 정책
├── public/
│   └── manifest.json               # PWA 매니페스트
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

# Phase 0 — 프로젝트 초기화

## Phase 0.1 — Next.js 프로젝트 생성

**명령:**
```bash
pnpm create next-app rodem-cafe --typescript --tailwind --app --src-dir --import-alias "@/*" --use-pnpm
cd rodem-cafe
```

**작업:**
1. Next.js 14 App Router + TypeScript + Tailwind 프로젝트 생성
2. `PRD.md`를 프로젝트 루트에 복사
3. `prototypes/` 폴더 생성 → JSX 프로토타입 5종 복사
4. `seed/` 폴더 생성 → 성도 엑셀 파일 복사
5. `LOG.md` 생성 (빈 파일)

**완료 기준:**
- [ ] `pnpm dev`로 localhost:3000 접속 시 Next.js 기본 페이지 표시
- [ ] PRD.md, prototypes/, seed/ 존재
- [ ] LOG.md 생성됨

---

## Phase 0.2 — 핵심 의존성 설치

**명령:**
```bash
pnpm add @supabase/supabase-js @supabase/ssr recharts xlsx qrcode bcryptjs
pnpm add -D @types/bcryptjs supabase
```

**패키지 목적:**
| 패키지 | 용도 |
|---|---|
| `@supabase/supabase-js` | Supabase 클라이언트 |
| `@supabase/ssr` | Next.js SSR용 Supabase |
| `recharts` | 대시보드 차트 |
| `xlsx` | 엑셀 Export/Import |
| `qrcode` | QR코드 생성 |
| `bcryptjs` | PIN 해싱 |

**완료 기준:**
- [ ] `pnpm build` 에러 없음
- [ ] LOG.md 업데이트

---

## Phase 0.3 — Supabase 프로젝트 연결

**작업:**
1. Supabase MCP로 프로젝트 확인 (또는 신규 생성)
2. `.env.local` 생성:
```env
NEXT_PUBLIC_SUPABASE_URL=https://[프로젝트ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
```
3. `src/lib/supabase/client.ts` 생성 — createBrowserClient
4. `src/lib/supabase/server.ts` 생성 — createServerClient
5. `.env.local`을 `.gitignore`에 추가 확인

**완료 기준:**
- [ ] Supabase 연결 테스트 (아무 쿼리 실행해서 응답 확인)
- [ ] env 파일 gitignore 확인
- [ ] LOG.md 업데이트

---

## Phase 0.4 — 디자인 시스템 구축

**작업:**
1. `tailwind.config.ts`에 커스텀 테마 추가:
```typescript
// 프로토타입의 T 객체 기반
colors: {
  rodem: {
    bg: '#eae6df',
    card: '#faf7f1',
    dark: '#44403c',
    gold: '#c9a227',
    'gold-light': '#f8f1d8',
    text: '#2c2825',
    'text-sub': '#8a8278',
    'text-light': '#a8a196',
    border: '#e8e3da',
    'border-light': '#f0ece4',
    green: '#5a9a6e',
    'green-light': '#eaf5ee',
    blue: '#4a7fd4',
    'blue-light': '#eaf0fa',
    orange: '#d49a4a',
    'orange-light': '#fcf2e4',
    purple: '#7c5fbf',
    'purple-light': '#f0ebfa',
    red: '#c45050',
    'red-light': '#fce8e8',
  }
},
fontFamily: {
  sans: ['Plus Jakarta Sans', 'Noto Sans KR', 'sans-serif'],
},
borderRadius: {
  'rodem': '22px',
  'rodem-sm': '14px',
}
```

2. `src/app/globals.css`에 Google Fonts import + 글로벌 스타일
3. `src/lib/constants.ts` 생성:
```typescript
export const PAYMENT_METHODS = [
  { id: 'cash', label: '현금', icon: '💵', color: 'rodem-green', bgColor: 'rodem-green-light' },
  { id: 'transfer', label: '계좌이체', icon: '🏦', color: 'rodem-blue', bgColor: 'rodem-blue-light' },
  { id: 'credit', label: '외상', icon: '📋', color: 'rodem-orange', bgColor: 'rodem-orange-light' },
  { id: 'prepaid', label: '선불', icon: '💰', color: 'rodem-purple', bgColor: 'rodem-purple-light' },
] as const;

export const BANK_ACCOUNT = {
  bank: '농협',
  number: '351-1512-0013-03',
  holder: '대한예수교침례회 청주남부교회 로뎀나무',
};
```

4. `src/lib/utils.ts` 생성:
```typescript
export const formatPrice = (n: number) => n.toLocaleString() + '원';
export const getChosung = (char: string): string => { /* 초성 추출 */ };
export const CHOSUNG_LIST = ['ㄱ','ㄴ','ㄷ','ㄹ','ㅁ','ㅂ','ㅅ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
```

5. `src/components/ui/` 공통 컴포넌트 생성:
   - `Button.tsx` — primary(골드), secondary(outline), danger(레드), green 변형
   - `Card.tsx` — 기본(그라데이션), dark, gold 변형
   - `Modal.tsx` — backdrop blur + 웜그레이 오버레이
   - `PinInput.tsx` — 6자리 넘패드 + 도트 + 골드 글로우
   - `Header.tsx` — 다크그레이 헤더 (glass 효과)
   - `StepIndicator.tsx` — 단계 진행 표시
   - `Toast.tsx` — 하단 알림

**디자인 참조:** `prototypes/` 폴더의 JSX 파일에서 스타일 추출. 인라인 스타일을 Tailwind 클래스로 변환.

**완료 기준:**
- [ ] Tailwind 커스텀 테마 적용 확인 (`pnpm dev`에서 색상 표시)
- [ ] 공통 컴포넌트 7종 생성
- [ ] 각 컴포넌트가 프로토타입과 동일한 시각적 결과
- [ ] LOG.md 업데이트

---

# Phase 1 — 데이터베이스

## Phase 1.1 — 스키마 생성

**작업:** `supabase/migrations/001_schema.sql` 생성

```sql
-- members (성도)
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  note TEXT,
  personal_pin TEXT,
  qr_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex'),
  prepaid_balance INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_members_name ON members(name);
CREATE INDEX idx_members_qr_token ON members(qr_token);

-- menu_items (메뉴)
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('커피','음료','차','과자','기타')),
  temp_type TEXT CHECK (temp_type IN ('HOT','ICE') OR temp_type IS NULL),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- orders (주문)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  total_price INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','cancelled')),
  order_number INTEGER,  -- 당일 접수 번호 (1,2,3...)
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_by TEXT
);
CREATE INDEX idx_orders_member ON orders(member_id);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_status ON orders(status, created_at DESC);

-- order_items (주문 항목)
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INTEGER DEFAULT 1,
  unit_price INTEGER NOT NULL
);

-- order_payments (주문 결제 — 혼합결제 지원)
CREATE TABLE order_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (method IN ('cash','transfer','credit','prepaid')),
  amount INTEGER NOT NULL
);

-- prepaid_topups (선불 충전)
CREATE TABLE prepaid_topups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('cash','transfer')),
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- credit_payments (외상 정산)
CREATE TABLE credit_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('cash','transfer')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- admin_settings (관리자 설정 — 1 row only)
CREATE TABLE admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_pin_hash TEXT NOT NULL,
  staff_pin_hash TEXT NOT NULL,
  recovery_email TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- VIEW: 외상 잔액
CREATE VIEW member_balances AS
SELECT
  m.id,
  m.name,
  m.prepaid_balance,
  COALESCE(
    (SELECT SUM(op.amount) FROM orders o
     JOIN order_payments op ON op.order_id = o.id
     WHERE o.member_id = m.id AND op.method = 'credit'), 0
  ) - COALESCE(
    (SELECT SUM(cp.amount) FROM credit_payments cp WHERE cp.member_id = m.id), 0
  ) AS credit_balance
FROM members m;
```

**실행:** Supabase MCP로 SQL 실행 또는 `supabase db push`

**완료 기준:**
- [ ] 8개 테이블 + 1개 VIEW 생성 확인
- [ ] 인덱스 3개 생성 확인
- [ ] LOG.md 업데이트

---

## Phase 1.2 — 메뉴 시드 데이터

**작업:** `supabase/migrations/002_seed_menu.sql` 생성

```sql
INSERT INTO menu_items (name, price, category, temp_type, sort_order) VALUES
  ('믹스커피', 500, '커피', 'HOT', 1),
  ('아메리카노 HOT', 1500, '커피', 'HOT', 2),
  ('아메리카노 ICE', 2000, '커피', 'ICE', 3),
  ('카페라떼 HOT', 2000, '커피', 'HOT', 4),
  ('카페라떼 ICE', 2500, '커피', 'ICE', 5),
  ('바닐라라떼 HOT', 2500, '커피', 'HOT', 6),
  ('바닐라라떼 ICE', 3000, '커피', 'ICE', 7),
  ('초코라떼 HOT', 2500, '커피', 'HOT', 8),
  ('초코라떼 ICE', 3000, '커피', 'ICE', 9),
  ('레몬톡톡에이드', 3000, '음료', 'ICE', 10),
  ('자몽톡톡에이드', 3000, '음료', 'ICE', 11),
  ('복숭아아이스티', 2000, '음료', 'ICE', 12),
  ('유자차', 2000, '차', 'HOT', 13),
  ('생강차', 2000, '차', 'HOT', 14),
  ('얼음컵', 500, '기타', 'ICE', 15),
  ('과자 2개', 1000, '과자', NULL, 16),
  ('과자 3개', 1000, '과자', NULL, 17);
```

**완료 기준:**
- [ ] `SELECT * FROM menu_items` → 17개 행
- [ ] LOG.md 업데이트

---

## Phase 1.3 — 성도 시드 데이터

**작업:**
1. `seed/로뎀나무_성도명단_초기데이터.xlsx` 파싱
2. `supabase/migrations/003_seed_members.sql` 생성 — 190명 INSERT
3. 각 성도에 `qr_token` 자동 생성 (DEFAULT 사용)

**완료 기준:**
- [ ] `SELECT COUNT(*) FROM members` → 190
- [ ] `SELECT qr_token FROM members LIMIT 5` → 고유 토큰 확인
- [ ] LOG.md 업데이트

---

## Phase 1.4 — 관리자 초기 설정 + RLS

**작업:**
1. `supabase/migrations/004_init_admin.sql`:
```sql
-- 초기 관리자 PIN: 000000 (bcrypt 해시)
-- 초기 봉사자 PIN: 000000 (bcrypt 해시)
INSERT INTO admin_settings (admin_pin_hash, staff_pin_hash, recovery_email)
VALUES (
  '$2a$10$...', -- bcrypt('000000')
  '$2a$10$...', -- bcrypt('000000')
  'admin@cjnambu.kr'
);
```

2. `supabase/migrations/005_rls.sql`:
```sql
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prepaid_topups ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- 공개 읽기: 메뉴 (활성만), 성도 이름 목록
CREATE POLICY "menu_read" ON menu_items FOR SELECT USING (is_active = true);
CREATE POLICY "members_read" ON members FOR SELECT USING (true);

-- service_role로 모든 작업 (API Route에서 service_role 사용)
-- anon key는 읽기만 허용
```

**완료 기준:**
- [ ] admin_settings에 1행 존재
- [ ] RLS 정책 적용 확인 (anon key로 menu_items SELECT 가능, INSERT 불가)
- [ ] LOG.md 업데이트

---

## Phase 1.5 — TypeScript 타입 생성

**작업:**
```bash
pnpm supabase gen types typescript --project-id [프로젝트ID] > src/lib/supabase/types.ts
```

**완료 기준:**
- [ ] `src/lib/supabase/types.ts` 생성
- [ ] Database 타입에 members, menu_items 등 존재
- [ ] LOG.md 업데이트

---

# Phase 2 — 봉사자 POS (핵심)

## Phase 2.1 — 모드 선택 + PIN 인증

**작업:**
1. `src/app/page.tsx` — 모드 선택 화면 (봉사자 주문 / 성도 조회)
2. POS 진입 시 PIN 인증 화면 (`PinInput` 컴포넌트 활용)
3. PIN 검증 API: `src/app/api/pin/verify/route.ts`
   - POST body: `{ pin: string, type: 'admin' | 'staff' }`
   - bcrypt.compare로 검증
   - 성공 시 세션 쿠키 발급 (또는 상태 관리)
4. 5회 연속 실패 → 30초 잠금 (클라이언트 상태)

**디자인 참조:** `prototypes/rodem-pos-v2.jsx` → ModeSelector, PinEntry

**완료 기준:**
- [ ] 모드 선택 화면 렌더링 (골드 테마)
- [ ] PIN 000000 입력 시 POS 진입
- [ ] 틀린 PIN 5회 → 30초 잠금
- [ ] LOG.md 업데이트

---

## Phase 2.2 — 성도 선택

**작업:**
1. `src/components/pos/MemberSelect.tsx`
2. Supabase에서 `members` 목록 fetch (이름, id, credit_balance, prepaid_balance)
3. 초성 필터 (ㄱ~ㅎ) + 검색바
4. 이름 옆에 외상 잔액 표시 (있으면 주황색)
5. 터치 시 선택 → 다음 단계

**데이터 쿼리:**
```typescript
const { data } = await supabase
  .from('member_balances')
  .select('id, name, credit_balance, prepaid_balance')
  .order('name');
```

**완료 기준:**
- [ ] 190명 성도 목록 3열 그리드 렌더링
- [ ] 초성 필터 동작
- [ ] 검색 동작
- [ ] 외상 잔액 표시
- [ ] LOG.md 업데이트

---

## Phase 2.3 — 메뉴 선택 + 장바구니

**작업:**
1. `src/components/pos/MenuSelect.tsx`
2. Supabase에서 `menu_items` fetch (is_active=true, sort_order)
3. 카테고리 탭: 전체 / 커피 / 음료 / 차 / 과자 / 기타
4. 2열 그리드 — 터치 시 수량 +1, 뱃지 표시
5. 장바구니 하단 바 (fixed):
   - 담은 메뉴 태그 + 개별 제거(×)
   - 합계 실시간 계산
   - "다음 →" 버튼

**상태관리:** `useState`로 cart 배열 관리
```typescript
type CartItem = { id: string; name: string; price: number; qty: number; emoji?: string };
```

**완료 기준:**
- [ ] 17개 메뉴 그리드 렌더링
- [ ] 카테고리 필터 동작
- [ ] 터치 → 수량 증가 + 뱃지
- [ ] 장바구니 바 동작 (추가, 제거, 합계)
- [ ] LOG.md 업데이트

---

## Phase 2.4 — 결제 방식 선택 + 주문 확인

**작업:**
1. `src/components/pos/PaymentSelect.tsx`
   - 5가지 결제 버튼: 현금, 계좌이체, 외상, 선불, (혼합은 잔액부족 시 자동)
   - 선불 선택 시:
     - 잔액 >= 합계 → 바로 확인 단계
     - 잔액 < 합계 → 부족분 처리 옵션 (외상전환 / 현금·이체 추가)
   - 계좌이체 선택 시: 농협 계좌번호 표시

2. `src/components/pos/OrderConfirm.tsx`
   - 주문 요약: 주문자, 메뉴 목록, 합계, 결제 방식
   - "주문 완료" 버튼

3. 주문 저장 로직 (service_role 사용):
```typescript
// 1. 당일 order_number 계산 (오늘 주문 수 + 1)
// 2. orders INSERT (status: 'pending', order_number)
// 3. order_items INSERT (cart 기반)
// 4. order_payments INSERT (결제방식별 — 혼합이면 2건)
// 5. 선불이면 members.prepaid_balance 차감
// 모두 하나의 트랜잭션으로 처리 (supabase rpc 또는 순차 실행)
```

**완료 기준:**
- [ ] 5가지 결제 방식 선택 동작
- [ ] 잔액 부족 시 옵션 A/B 선택 UI
- [ ] 주문 완료 → DB에 orders(status='pending') + order_items + order_payments 저장
- [ ] 당일 order_number 자동 채번
- [ ] 선불 결제 시 prepaid_balance 차감 확인
- [ ] 완료 화면 → "새 주문 접수" 버튼
- [ ] LOG.md 업데이트

---

## Phase 2.5 — 오늘 정산 + 외상 관리 모달

**작업:**
1. `src/components/pos/TodaySummary.tsx` (모달)
   - 오늘 주문 합계 (결제방식별)
   - 최근 주문 목록
   - 쿼리: `orders WHERE created_at >= today`

2. `src/components/pos/CreditManager.tsx` (모달)
   - 외상 미정산 목록 (member_balances WHERE credit_balance > 0)
   - 정산 완료 버튼 → credit_payments INSERT

**완료 기준:**
- [ ] 정산 모달: 오늘 매출 합계 + 주문 목록 표시
- [ ] 외상 모달: 미정산 목록 + 정산 처리 동작
- [ ] LOG.md 업데이트

---

## Phase 2.6 — 주문 대기열 패널

**목적:** 봉사자가 들어온 주문 순서와 대기 상태를 한눈에 확인하고, 음료 완성 시 터치로 완료 처리.

**작업:**
1. `src/components/pos/OrderQueue.tsx`

2. **레이아웃:**
   - POS 화면 좌측 사이드 패널 (펼침 시 화면의 ~1/4, 약 280px)
   - 기본 상태: **접힘** (32px 탭만 보임 — 대기 건수 뱃지 표시)
   - 터치 또는 스와이프로 펼치기/접기 토글
   - 접힘 탭 UI: 세로 텍스트 "📋 대기 N건" 또는 아이콘 버튼

3. **패널 구성 (펼친 상태):**
```
┌─────────────────┐
│ 📋 주문 대기열    ✕ │  ← 헤더 + 접기 버튼
│ 대기 3건 · 완료 12건 │  ← 카운터
├─────────────────┤
│ #15 🟡 대기       │  ← 최신 주문 (위에)
│ 김영희 · 14:32     │
│ 아메리카노 ICE ×2  │
│ 카페라떼 HOT ×1    │
│        [완료 처리]  │  ← 터치 시 status → completed
├─────────────────┤
│ #14 🟡 대기       │
│ 박수진 · 14:30     │
│ 바닐라라떼 ICE ×1  │
│        [완료 처리]  │
├─────────────────┤
│ #13 🟢 완료       │  ← 완료된 주문 (아래로, 흐리게)
│ 홍길동 · 14:28     │
│ 믹스커피 ×1       │
└─────────────────┘
```

4. **기능:**
   - 오늘 주문만 표시 (`created_at >= today`)
   - 대기(pending) 주문이 위에, 완료(completed) 주문이 아래에
   - **완료 처리:** 주문 카드의 "완료 처리" 버튼 터치 → `orders.status = 'completed'`, `completed_at = now()`
   - **대기 건수 뱃지:** 접힌 상태에서도 실시간 대기 건수 표시
   - **자동 갱신:** 새 주문 접수 시 목록 자동 업데이트 (Supabase Realtime 또는 폴링 3초)
   - **완료 주문 토글:** "완료 주문 보기/숨기기" 스위치 (기본: 최근 5건만 표시)

5. **상태별 스타일:**
   | 상태 | 뱃지 | 카드 스타일 |
   |---|---|---|
   | pending (대기) | 🟡 골드 | 기본 카드, 좌측 골드 보더 4px |
   | completed (완료) | 🟢 그린 | 투명도 50%, 작은 폰트 |
   | cancelled (취소) | 🔴 레드 | 취소선 + 투명도 30% |

6. **반응형:**
   - 태블릿 가로: 좌측 사이드 패널 (280px)
   - 태블릿 세로 / 모바일: 하단에서 올라오는 시트 (bottom sheet)

**데이터 쿼리:**
```typescript
// 오늘 주문 목록 (대기 + 최근 완료)
const { data: queueOrders } = await supabase
  .from('orders')
  .select(`
    id, order_number, status, total_price, created_at, completed_at,
    members(name),
    order_items(quantity, menu_items(name))
  `)
  .gte('created_at', todayStart)
  .order('created_at', { ascending: false })
  .limit(30);
```

**실시간 업데이트 (옵션 A — Supabase Realtime):**
```typescript
const channel = supabase
  .channel('order-queue')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, 
    (payload) => { refetchOrders(); }
  )
  .subscribe();
```

**실시간 업데이트 (옵션 B — 폴링, 더 간단):**
```typescript
useEffect(() => {
  const interval = setInterval(refetchOrders, 3000); // 3초마다
  return () => clearInterval(interval);
}, []);
```

**POS 메인 레이아웃 변경:**
```typescript
// src/app/pos/page.tsx
<div className="flex h-screen">
  {/* 좌측: 주문 대기열 (토글) */}
  <OrderQueue 
    isOpen={queueOpen} 
    onToggle={() => setQueueOpen(!queueOpen)}
    onComplete={(orderId) => markComplete(orderId)} 
  />
  
  {/* 우측: 기존 POS 플로우 (성도→메뉴→결제) */}
  <div className="flex-1 overflow-hidden">
    {/* 기존 Step별 화면 */}
  </div>
</div>
```

**완료 기준:**
- [ ] 접기/펼치기 토글 동작
- [ ] 접힌 상태에서 대기 건수 뱃지 표시
- [ ] 대기 주문 목록 렌더링 (주문번호, 성도이름, 메뉴, 시간)
- [ ] "완료 처리" 터치 → status 변경 + 카드 스타일 변경
- [ ] 완료 주문 숨기기/보기 토글
- [ ] 새 주문 접수 시 자동 갱신
- [ ] LOG.md 업데이트

---

# Phase 3 — 선불 충전

## Phase 3.1 — 충전 플로우

**작업:**
1. `src/app/prepaid/page.tsx`
2. 홈: 총 선불 잔액, 오늘 충전 통계, 성도별 잔액 그리드
3. 충전: 성도 선택 → 금액 입력 (퀵버튼 1/2/3/5만 + 직접입력) → 수납방법 → 확인
4. 저장: `prepaid_topups` INSERT + `members.prepaid_balance` 증가
5. 내역: 충전 내역 + 사용 내역 조회

**디자인 참조:** `prototypes/rodem-prepaid-v2.jsx`

**완료 기준:**
- [ ] 충전 플로우 전체 동작 (선택→금액→수납→완료)
- [ ] DB에 prepaid_topups 저장 + balance 업데이트
- [ ] 내역 조회 동작
- [ ] LOG.md 업데이트

---

# Phase 4 — 성도 조회

## Phase 4.1 — 태블릿 조회 (읽기전용)

**작업:**
1. `src/app/lookup/page.tsx`
2. 이름 목록 (초성필터 + 검색) → 터치 시 상세
3. 상세: 외상 잔액, 선불 잔액, 주문 이력
4. **입력 기능 없음** (읽기 전용)

**완료 기준:**
- [ ] 성도 목록 + 초성 필터 + 검색
- [ ] 상세 페이지: 잔액 + 이력 표시
- [ ] LOG.md 업데이트

---

## Phase 4.2 — QR 개인 조회

**작업:**
1. `src/app/my/[token]/page.tsx`
   - URL에서 token 추출 → `members WHERE qr_token = token`
   - 개인 PIN 4자리 입력 → `bcrypt.compare(pin, personal_pin)`
   - 인증 성공 → 본인 외상/선불/이력 표시
2. QR 생성 API: `src/app/api/qr/generate/route.ts`
   - member_id 받아서 → `rodem-cafe.vercel.app/my/{qr_token}` URL로 QR 이미지 생성
3. 성도관리 화면에서 QR 다운로드 버튼 추가 (Phase 5에서)

**완료 기준:**
- [ ] `/my/[token]` 접속 → PIN 입력 → 본인 내역
- [ ] QR API → PNG 이미지 반환
- [ ] LOG.md 업데이트

---

# Phase 5 — 관리 화면

## Phase 5.1 — 성도 관리 (CRUD + 엑셀)

**작업:**
1. `src/app/members/page.tsx`
2. 관리자 PIN 인증 후 접근
3. 기능:
   - 등록: 이름(필수), 연락처, 메모 → members INSERT + qr_token 자동생성
   - 수정: 프로필 변경
   - 삭제: 확인 모달 → CASCADE 삭제 (orders 등 포함)
   - 초성 그룹핑 + 검색
   - 엑셀 다운로드: xlsx.writeFile
   - 엑셀 업로드: xlsx.read → 미리보기 → 추가 또는 전체교체
   - QR 다운로드 (개별)

**디자인 참조:** `prototypes/rodem-member-v2.jsx`

**완료 기준:**
- [ ] CRUD 전체 동작
- [ ] 엑셀 다운로드 → .xlsx 파일 생성
- [ ] 엑셀 업로드 → 미리보기 → 등록
- [ ] QR 다운로드 동작
- [ ] LOG.md 업데이트

---

## Phase 5.2 — 메뉴 관리

**작업:**
1. `src/app/menu/page.tsx`
2. 관리자 PIN 인증 후 접근
3. 기능:
   - 메뉴 목록 (카테고리별, sort_order 순)
   - 추가: 이름, 가격, 카테고리, HOT/ICE, 순서
   - 수정: 기존 메뉴 정보 변경
   - 삭제: is_active = false (soft delete — 기존 주문 참조 유지)
   - 순서 변경 (드래그 또는 ↑↓ 버튼)

**완료 기준:**
- [ ] 메뉴 CRUD 동작
- [ ] Soft delete (is_active 토글)
- [ ] 순서 변경 동작
- [ ] LOG.md 업데이트

---

## Phase 5.3 — PIN 관리

**작업:**
1. `src/app/settings/page.tsx`
2. 기능:
   - PIN 변경: 현재 PIN → 새 PIN → 확인 (3단계)
   - PIN 찾기: 이메일 인증번호 → 새 PIN
   - 복구 이메일 변경: 현재 PIN 인증 → 새 이메일
3. API Routes:
   - `POST /api/pin/change` — { currentPin, newPin, type }
   - `POST /api/pin/recover` — { email } → 인증번호 발송 (개발 단계에서는 콘솔 출력)
   - 실서비스 시 Resend/SendGrid 연동

**디자인 참조:** `prototypes/rodem-pin-v2.jsx`

**완료 기준:**
- [ ] PIN 변경 3단계 동작
- [ ] PIN 복구 플로우 동작 (이메일 발송은 콘솔)
- [ ] 이메일 변경 동작
- [ ] LOG.md 업데이트

---

# Phase 6 — 정산 대시보드

## Phase 6.1 — 기간별 대시보드

**작업:**
1. `src/app/dashboard/page.tsx`
2. 탭: 일별 / 주간 / 월간 / 분기 / 연간 / 고객별 / 종합 Export
3. 기간별:
   - 합계 카드 (현금/이체/외상/선불/총액/평균)
   - 직전 기간 비교 (증감률)
   - recharts: 스택형 BarChart, PieChart, LineChart
   - 정산 테이블 + 엑셀 다운로드

**데이터 쿼리:**
```typescript
const { data: orders } = await supabase
  .from('orders')
  .select(`
    id, total_price, created_at, member_id,
    order_payments(method, amount),
    order_items(quantity, unit_price, menu_item_id, menu_items(name, category))
  `)
  .gte('created_at', startDate)
  .lte('created_at', endDate)
  .order('created_at', { ascending: false });
```

**디자인 참조:** `prototypes/rodem-dashboard-v2.jsx`

**완료 기준:**
- [ ] 5개 기간 탭 동작
- [ ] 합계 카드 렌더링 (골드/다크 카드)
- [ ] 비교 분석 (증감률 표시)
- [ ] 차트 3종 렌더링 (BarChart, PieChart, LineChart)
- [ ] LOG.md 업데이트

---

## Phase 6.2 — 고객별 대시보드 + 종합 Export

**작업:**
1. 고객별 탭:
   - 총 고객 수, 외상 잔액, 최다 이용 고객
   - TOP 10 가로 BarChart
   - 정렬 (총액/주문수/외상)
   - 고객 상세 모달 (월별 차트, 자주 주문 메뉴)
   - 전체/개별 엑셀 다운로드

2. 종합 Export 탭:
   - 1클릭 → 4시트 엑셀 (전체주문/월별/고객별/메뉴별)

**완료 기준:**
- [ ] 고객별 탭 전체 동작
- [ ] 상세 모달 동작
- [ ] 종합 Export → 4시트 엑셀 다운로드
- [ ] LOG.md 업데이트

---

# Phase 7 — PWA + 배포

## Phase 7.1 — PWA 설정

**작업:**
1. `public/manifest.json`:
```json
{
  "name": "로뎀나무 카페",
  "short_name": "로뎀나무",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#eae6df",
  "theme_color": "#44403c",
  "icons": [{ "src": "/icon-192.png", "sizes": "192x192" }, { "src": "/icon-512.png", "sizes": "512x512" }]
}
```
2. `<link rel="manifest">` + `<meta name="theme-color">` 추가
3. 아이콘 생성 (192x192, 512x512)
4. 모바일 반응형 확인 (max-width: 480px 기준)

**완료 기준:**
- [ ] 태블릿 Chrome에서 "홈 화면에 추가" 가능
- [ ] 독립 앱처럼 실행 (주소바 없음)
- [ ] LOG.md 업데이트

---

## Phase 7.2 — Vercel 배포

**작업:**
```bash
# GitHub 연동
git init && git add . && git commit -m "initial"
git remote add origin [repo-url] && git push -u origin main

# Vercel 배포
vercel --prod
```

1. Vercel에 환경변수 설정 (NEXT_PUBLIC_SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY)
2. 프로덕션 배포 확인
3. URL 확인: `rodem-cafe.vercel.app`

**완료 기준:**
- [ ] `rodem-cafe.vercel.app` 접속 정상
- [ ] 모든 화면 동작 확인
- [ ] 태블릿에서 PWA 설치 + 동작 확인
- [ ] LOG.md 업데이트

---

## Phase 7.3 — 최종 테스트 체크리스트

아래 전체 체크리스트를 수행하고 LOG.md에 결과 기록:

**POS:**
- [ ] PIN 인증 성공/실패/잠금
- [ ] 성도 검색 + 초성 필터
- [ ] 메뉴 카테고리 필터
- [ ] 장바구니 추가/제거/합계
- [ ] 현금 결제 → DB 저장
- [ ] 계좌이체 결제 → 계좌번호 표시
- [ ] 외상 결제 → 외상 잔액 증가
- [ ] 선불 결제 (잔액 충분) → 차감
- [ ] 선불 결제 (잔액 부족) → 옵션 A/B
- [ ] 오늘 정산 모달
- [ ] 외상 관리 → 정산 처리
- [ ] 주문 대기열: 접기/펼치기 토글
- [ ] 주문 대기열: 대기 건수 뱃지
- [ ] 주문 대기열: 완료 처리 터치
- [ ] 주문 대기열: 새 주문 실시간 갱신
- [ ] 주문 대기열: 완료 주문 숨기기/보기

**선불 충전:**
- [ ] 충전 → 잔액 증가
- [ ] 충전 내역 조회

**성도 조회:**
- [ ] 태블릿 조회 (읽기전용)
- [ ] QR 조회 → PIN → 본인 내역

**대시보드:**
- [ ] 5개 기간 탭
- [ ] 차트 렌더링
- [ ] 비교 분석
- [ ] 엑셀 다운로드 (기간별, 고객별, 종합)

**관리:**
- [ ] 성도 CRUD
- [ ] 엑셀 업로드/다운로드
- [ ] 메뉴 CRUD
- [ ] PIN 변경/찾기/이메일 변경

---

# 부록: 주의사항

## Supabase 쿼리 패턴
```typescript
// ❌ 절대 하지 않기: anon key로 INSERT/UPDATE/DELETE
// ✅ 항상: service_role key로 변경 작업 (API Route에서만 사용)

// 서버 컴포넌트 / API Route
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, serviceRoleKey);

// 클라이언트 컴포넌트 (읽기 전용)
import { createBrowserClient } from '@supabase/ssr';
const supabase = createBrowserClient(url, anonKey);
```

## 트랜잭션 처리 (주문 저장)
주문 저장 시 orders → order_items → order_payments → prepaid_balance 차감을 하나의 Supabase RPC로 처리하는 것을 권장. 실패 시 전체 롤백.

## 성능
- 190명 × 하루 평균 20건 = 월 ~4,000건 주문 → Supabase 무료 티어 여유
- 페이지네이션: 대시보드 테이블 50건 단위
- 이미지: 없음 (텍스트 + 이모지 기반 UI)
