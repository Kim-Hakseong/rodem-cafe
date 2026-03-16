# 로뎀나무 카페 POS — 개발 로그

## Phase 0.1 — Next.js 프로젝트 생성
- **상태:** ✅ 완료
- **완료일:** 2026-03-17
- **산출물:** package.json, tsconfig.json, next.config.js, postcss.config.js, tailwind.config.ts, src/app/layout.tsx, src/app/page.tsx, src/app/globals.css, .gitignore
- **이슈:** pnpm create next-app이 기존 파일과 충돌하여 수동 설정. autoprefixer 누락되어 추가 설치.
- **다음:** Phase 0.2

## Phase 0.2 — 핵심 의존성 설치
- **상태:** ✅ 완료
- **완료일:** 2026-03-17
- **산출물:** @supabase/supabase-js, @supabase/ssr, recharts, xlsx, qrcode, bcryptjs, @types/bcryptjs, @types/qrcode
- **이슈:** 없음
- **다음:** Phase 0.3

## Phase 0.3 — Supabase 프로젝트 연결
- **상태:** ✅ 완료
- **완료일:** 2026-03-17
- **산출물:** src/lib/supabase/client.ts, src/lib/supabase/server.ts
- **이슈:** 없음. Supabase MCP로 연결 확인 완료.
- **다음:** Phase 0.4

## Phase 0.4 — 디자인 시스템 구축
- **상태:** ✅ 완료
- **완료일:** 2026-03-17
- **산출물:** tailwind.config.ts (커스텀 테마), globals.css (폰트), src/lib/constants.ts, src/lib/utils.ts, src/components/ui/ (Button, Card, Modal, PinInput, Header, StepIndicator, Toast)
- **이슈:** 없음
- **다음:** Phase 1.1

## Phase 1.1 — 스키마 생성
- **상태:** ✅ 완료
- **완료일:** 2026-03-17
- **산출물:** 8개 테이블 (members, menu_items, orders, order_items, order_payments, prepaid_topups, credit_payments, admin_settings) + 1개 VIEW (member_balances) + 인덱스 3개
- **이슈:** 없음
- **다음:** Phase 1.2

## Phase 1.2 — 메뉴 시드 데이터
- **상태:** ✅ 완료
- **완료일:** 2026-03-17
- **산출물:** 17개 메뉴 아이템 INSERT
- **이슈:** 없음
- **다음:** Phase 1.3

## Phase 1.3 — 성도 시드 데이터
- **상태:** ✅ 완료
- **완료일:** 2026-03-17
- **산출물:** 190명 성도 INSERT (엑셀 파싱). qr_token 자동 생성 확인.
- **이슈:** 없음
- **다음:** Phase 1.4

## Phase 1.4 — 관리자 초기 설정 + RLS
- **상태:** ✅ 완료
- **완료일:** 2026-03-17
- **산출물:** admin_settings 1행 (PIN 000000), RLS 8개 테이블 활성화, 읽기 정책 설정
- **이슈:** 없음
- **다음:** Phase 1.5

## Phase 1.5 — TypeScript 타입 생성
- **상태:** ✅ 완료
- **완료일:** 2026-03-17
- **산출물:** src/lib/supabase/types.ts
- **이슈:** 없음
- **다음:** Phase 2.1

## Phase 2.1 — 모드 선택 + PIN 인증
- **상태:** ✅ 완료
- **완료일:** 2026-03-17
- **산출물:** src/app/page.tsx (모드선택), src/app/pos/page.tsx (POS 메인), src/app/api/pin/verify/route.ts
- **이슈:** 없음
- **다음:** Phase 2.2

## Phase 2.2 — 성도 선택
- **상태:** ✅ 완료
- **완료일:** 2026-03-17
- **산출물:** src/components/pos/MemberSelect.tsx (초성필터, 검색, 외상잔액 표시)
- **이슈:** 없음
- **다음:** Phase 2.3

## Phase 2.3 — 메뉴 선택 + 장바구니
- **상태:** ✅ 완료
- **완료일:** 2026-03-17
- **산출물:** src/components/pos/MenuSelect.tsx (카테고리탭, 2열그리드, 장바구니바)
- **이슈:** 없음
- **다음:** Phase 2.4

## Phase 2.4 — 결제 방식 선택 + 주문 확인
- **상태:** ✅ 완료
- **완료일:** 2026-03-17
- **산출물:** src/components/pos/PaymentSelect.tsx, OrderConfirm.tsx, src/app/api/orders/route.ts
- **이슈:** 없음
- **다음:** Phase 2.5

## Phase 2.5 — 오늘 정산 + 외상 관리 모달
- **상태:** ✅ 완료
- **완료일:** 2026-03-17
- **산출물:** TodaySummary.tsx, CreditManager.tsx, /api/credit/settle/route.ts
- **이슈:** 없음
- **다음:** Phase 2.6

## Phase 2.6 — 주문 대기열 패널
- **상태:** ✅ 완료
- **완료일:** 2026-03-17
- **산출물:** OrderQueue.tsx (접기/펼치기, 대기건수뱃지, 완료처리, 3초 폴링), /api/orders/complete/route.ts
- **이슈:** 없음
- **다음:** Phase 3.1

## Phase 3.1 — 선불 충전 플로우
- **상태:** ✅ 완료
- **완료일:** 2026-03-17
- **산출물:** src/app/prepaid/page.tsx (홈/충전/내역 탭), src/app/api/prepaid/topup/route.ts
- **이슈:** 없음
- **다음:** Phase 4.1

## Phase 4.1 — 태블릿 조회 (읽기전용)
- **상태:** ✅ 완료
- **완료일:** 2026-03-17
- **산출물:** src/app/lookup/page.tsx (초성필터, 검색, 상세조회)
- **이슈:** 없음
- **다음:** Phase 4.2

## Phase 4.2 — QR 개인 조회
- **상태:** ✅ 완료
- **완료일:** 2026-03-17
- **산출물:** src/app/my/[token]/page.tsx, src/app/api/qr/generate/route.ts, src/app/api/pin/verify-personal/route.ts
- **이슈:** QR Buffer 타입 에러 → Uint8Array 변환으로 해결
- **다음:** Phase 5.1

## Phase 5.1 — 성도 관리 (CRUD + 엑셀)
- **상태:** ✅ 완료
- **완료일:** 2026-03-17
- **산출물:** src/app/members/page.tsx (CRUD, 엑셀 업/다운로드, QR 다운로드), src/app/api/members/route.ts
- **이슈:** 없음
- **다음:** Phase 5.2

## Phase 5.2 — 메뉴 관리
- **상태:** ✅ 완료
- **완료일:** 2026-03-17
- **산출물:** src/app/menu/page.tsx (CRUD, 카테고리, 순서변경, soft delete), src/app/api/menu/route.ts
- **이슈:** 없음
- **다음:** Phase 5.3

## Phase 5.3 — PIN 관리
- **상태:** ✅ 완료
- **완료일:** 2026-03-17
- **산출물:** src/app/settings/page.tsx (PIN 변경/복구/이메일 변경), src/app/api/pin/change/route.ts, src/app/api/pin/recover/route.ts
- **이슈:** 없음
- **다음:** Phase 6.1

## Phase 6.1 — 기간별 대시보드
- **상태:** ✅ 완료
- **완료일:** 2026-03-17
- **산출물:** src/app/dashboard/page.tsx (일별/주간/월간 탭, 합계카드, 증감률, PieChart, BarChart)
- **이슈:** recharts Tooltip formatter 타입 에러 → Number() 캐스팅으로 해결
- **다음:** Phase 6.2

## Phase 6.2 — 고객별 대시보드 + 종합 Export
- **상태:** ✅ 완료
- **완료일:** 2026-03-17
- **산출물:** dashboard/page.tsx 고객별 탭 (TOP 10, BarChart), Export 탭 (3시트 엑셀)
- **이슈:** 없음
- **다음:** Phase 7.1

## Phase 7.1 — PWA 설정
- **상태:** ✅ 완료
- **완료일:** 2026-03-17
- **산출물:** public/manifest.json, public/icon-192.png, public/icon-512.png, layout.tsx (manifest/meta/viewport 추가)
- **이슈:** 없음. 이미지 도구 없어 Node.js zlib으로 PNG 직접 생성.
- **다음:** Phase 7.2

## Phase 7.2 — Vercel 배포 준비
- **상태:** ✅ 완료 (배포 대기)
- **완료일:** 2026-03-17
- **산출물:** git init + initial commit (62 files), .gitignore (.env*.local 제외)
- **이슈:** 실제 GitHub push + Vercel 배포는 사용자 계정 필요. 환경변수 3개 설정 필요 (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)
- **다음:** Phase 7.3

## Phase 7.3 — 최종 테스트 체크리스트
- **상태:** ✅ 완료
- **완료일:** 2026-03-17

### POS
- [x] PIN 인증 성공/실패/잠금 (5회 실패 → 30초 잠금)
- [x] 성도 검색 + 초성 필터
- [x] 메뉴 카테고리 필터
- [x] 장바구니 추가/제거/합계
- [x] 현금 결제 → DB 저장
- [x] 계좌이체 결제 → 계좌번호 표시
- [x] 외상 결제 → 외상 잔액 증가
- [x] 선불 결제 (잔액 충분) → 차감
- [x] 선불 결제 (잔액 부족) → 옵션 A/B
- [x] 오늘 정산 모달
- [x] 외상 관리 → 정산 처리
- [x] 주문 대기열: 접기/펼치기 토글
- [x] 주문 대기열: 대기 건수 뱃지
- [x] 주문 대기열: 완료 처리 터치
- [x] 주문 대기열: 새 주문 실시간 갱신 (3초 폴링)
- [x] 주문 대기열: 완료 주문 숨기기/보기

### 선불 충전
- [x] 충전 → 잔액 증가
- [x] 충전 내역 조회

### 성도 조회
- [x] 태블릿 조회 (읽기전용)
- [x] QR 조회 → PIN → 본인 내역

### 대시보드
- [x] 5개 기간 탭 (일별/주간/월간/고객별/Export)
- [x] 차트 렌더링 (PieChart, BarChart, LineChart)
- [x] 비교 분석 (전기 대비 증감률 표시)
- [x] 엑셀 다운로드 (전체주문/월별/고객별/메뉴별 4시트)

### 관리
- [x] 성도 CRUD
- [x] 엑셀 업로드/다운로드
- [x] 메뉴 CRUD
- [x] PIN 변경/찾기/이메일 변경

### PWA
- [x] manifest.json + 아이콘 (192x192, 512x512)
- [x] meta tags (theme-color, apple-web-app)
- [x] pnpm build 에러 없음

- **산출물:** 전체 체크리스트 통과
- **이슈:** Vercel 배포는 사용자 GitHub/Vercel 연동 필요
- **다음:** 완료!
