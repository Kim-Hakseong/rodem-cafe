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
- **다음:** Phase 8 (베타 운영 피드백 반영)

---

## Phase 8.1 — 고객 셀프주문 모드 + 계좌이체 플로우
- **상태:** ✅ 완료
- **완료일:** 2026-03-19
- **산출물:**
  - `/pos?mode=customer` 고객 셀프주문 모드 (PIN 없이 접근, 외상/정산 버튼 숨김)
  - 계좌이체 결제 플로우: 봉사자 "입금 확인" / "미납(외상)" 처리
  - `src/app/api/orders/transfer-confirm/route.ts` 신규
  - 전체 UI 폰트 크기 상향 (60대 사용성 개선)
  - OrderQueue 확장 (340px, 이체 상태 표시)
- **이슈:** 없음
- **다음:** Phase 8.2

## Phase 8.2 — 부서별 초성 검색 + POS 단계 순서 변경
- **상태:** ✅ 완료
- **완료일:** 2026-03-19
- **산출물:**
  - 명칭 변경: "봉사자 주문" → "봉사자 페이지"
  - POS 단계 순서 변경: 메뉴 선택 → 성도 선택 → 결제 → 확인
  - MemberSelect 전면 개편: 부서 선택 → 초성 실시간 검색
  - 5개 부서 (은장회, 봉사회, 어머니회, 청년회, 교회학교) + "전체" 옵션
  - DB: `members.department` 컬럼 추가, `member_balances` 뷰 재생성
  - `getAllChosungs()` 유틸 함수, `DEPARTMENTS` 상수 추가
  - 성도관리 페이지에 부서 드롭다운 추가
- **이슈:** VIEW 컬럼 순서 변경 불가 → DROP + CREATE로 해결
- **다음:** Phase 8.3

## Phase 8.3 — 성도 부서 데이터 정비 + 단체 계정
- **상태:** ✅ 완료
- **완료일:** 2026-03-19
- **산출물:**
  - 사용자 엑셀 기반 부서 데이터 전면 재배정 (190명)
  - 미지정 3명 삭제 (민금덕, 정해영, 황정현)
  - 신규 5명 추가 (배명훈, 김예원, 안예슬, 손희지, 이다연 — 청년회)
  - 단체 계정 8개 추가 (은장회, 봉사회, 어머니회, 청년회, 11구역, 21구역, 31구역, 41구역)
  - 이름 수정: 박영소→박영순, 채용일→채웅일
  - 최종 인원: 교회학교 38, 봉사회 29, 어머니회 56, 은장회 33, 청년회 36, 단체 8
- **이슈:** 없음
- **다음:** Phase 8.4

## Phase 8.4 — Vercel 베타 배포
- **상태:** ✅ 완료
- **완료일:** 2026-03-20
- **산출물:**
  - GitHub 리포지토리: https://github.com/Kim-Hakseong/rodem-cafe
  - Vercel 배포 완료 (Next.js preset, pnpm install)
  - 환경변수 3개 설정 (SUPABASE URL, ANON KEY, SERVICE ROLE KEY)
- **이슈:** WSL 환경에서 GitHub 인증 필요 → Personal Access Token으로 해결
- **다음:** Phase 8.5

## Phase 8.5 — 베타 운영 피드백 반영 (1차)
- **상태:** ✅ 완료
- **완료일:** 2026-03-21
- **산출물:**
  - **반응형 개선**: Z Fold 4 대응 — 홈 `max-w` 확장, PinInput/OrderQueue 반응형 폭
  - **주문 반려**: pending 주문 취소 + 선불 자동 환불 (`/api/orders/cancel`)
  - **선불잔액 수정**: POS에서 충전/차감 모달 (`PrepaidAdjust`, `/api/prepaid/adjust`)
  - **마스터 관리자 페이지** (`/admin`): PIN 인증 후 3탭
    - 주문관리: 일별/기간/전체 조회, 날짜별 그룹핑, 반려/삭제
    - 결제수정: 일별/기간/전체 조회, 결제 수단/금액 변경/삭제
    - 선불관리: 초성 검색, 잔액 충전/차감
  - 홈에 "🔐 관리자" 링크 추가 (PIN 설정 옆, 동일 스타일)
  - DB: `prepaid_topups.method` CHECK에 `'adjustment'` 추가
- **확인 사항:**
  - 정산 대시보드 전기 대비 비교: 이미 구현 완료 (일별/주간/월간 모두)
  - QR코드: 정상 작동 중 (생성/스캔/잔액 조회/PIN 보호)
- **이슈:** Modal `isOpen` prop 누락 → 빌드 에러 수정
- **다음:** Phase 8.6

## Phase 8.6 — 베타 운영 피드백 반영 (2차)
- **상태:** ✅ 완료
- **완료일:** 2026-03-21
- **산출물:**
  - **메뉴 그리드 대폭 개선**: 이모지 52px, 메뉴명 28px, 가격 xl (기존 대비 2배)
  - **메뉴 이미지 지원**: `menu_items.image_url` 컬럼 추가, 이미지 있으면 이모지 대신 표시
  - **메뉴관리 이미지 URL 입력**: 폼에 URL 입력 필드 + 미리보기 추가
  - **메뉴 카드 수량 조절 UI**: 첫 클릭→1개 추가, 이후 `- 수량 +` 인라인 버튼
  - **카트바 확대**: 패딩 p-5, 버튼 py-3.5, 합계 text-2xl
  - **뒤로가기→이전 단계**: step>0이면 `setStep(step-1)`, step=0일 때만 홈/PIN
  - **봉사자 '고객' 버튼**: 헤더에 추가, `/lookup?from=staff`로 잔액 바로 표시
  - **고객 QR 표시 모드**: 메인에서 접근 시 이름 클릭→QR 이미지 표시 (다운로드 아님)
  - **관리자 QR 토글**: 설정 탭 추가, `admin_settings.qr_enabled` ON/OFF
  - **QR 잠금 체크**: `/my/[token]` 페이지에서 비활성화 시 차단 메시지
  - **대시보드 파이차트 백분율**: `이체 42%` 형태 표시
  - **대시보드 Y축 만원 표기**: BarChart/LineChart `3만원` 형태
  - DB 마이그레이션 2건: `menu_items.image_url`, `admin_settings.qr_enabled`
  - 신규 API: `/api/admin/settings` (GET/PUT)
- **이슈:** recharts `PieLabelRenderProps` 타입 호환 → 명시적 타입 import로 해결
- **다음:** Phase 8.7

## Phase 8.7 — PWA 아이콘 리디자인
- **상태:** ✅ 완료
- **완료일:** 2026-03-21
- **산출물:**
  - PWA 아이콘 전면 교체 (192x192, 512x512): 크림 배경 + 골드 테두리 원 + 나뭇잎 나무 + "CAFE"
  - 메인화면 로고: 🌿 이모지 → 실제 아이콘 이미지(icon-512.png) 교체
  - 파비콘 추가: favicon.png (32x32 미니 나무 아이콘)
  - `layout.tsx`에 `<link rel="icon">` 추가
  - sharp 패키지로 SVG→PNG 변환 후 devDependency 제거
- **이슈:** SVG 렌더러에 한글 폰트 없음 → 영문 "CAFE" 텍스트로 대체
- **다음:** Phase 8.8

## Phase 8.8 — 음성 알림(TTS) + 계좌이체 QR 코드
- **상태:** ✅ 완료
- **완료일:** 2026-03-25
- **산출물:**
  - **TTS 음성 알림**: Web Speech API 기반 `speak()` 유틸 함수 추가
    - 주문 접수 시: "{이름}님 {메뉴} {수량}잔 주문이 접수되었습니다"
    - 완료 처리 시: "{이름}님 {메뉴} {수량}잔 음료 나왔습니다"
    - 한국어(ko-KR), rate 0.95, pitch 1
  - **CartItem temp_type 추가**: TTS에서 "아메리카노 Hot" 처럼 온도 정보 포함
  - **계좌이체 QR 코드**: 결제 팝업에 QR 코드 표시 (200x200px)
    - `qrcode` 패키지 toDataURL 사용 (클라이언트 생성)
    - QR 내용: "농협 351-1512-0013-03" (스캔 시 텍스트 복사)
    - 계좌정보 박스 아래, 입금금액 위에 배치
- **변경 파일:**
  - `src/lib/utils.ts` — speak() 함수 추가
  - `src/app/pos/page.tsx` — CartItem에 temp_type 추가
  - `src/components/pos/MenuSelect.tsx` — addToCart 시 temp_type 포함
  - `src/components/pos/OrderConfirm.tsx` — 주문 접수 TTS
  - `src/components/pos/OrderQueue.tsx` — 완료 처리 TTS
  - `src/components/pos/PaymentSelect.tsx` — 계좌이체 QR 코드
- **이슈:** 없음. 신규 패키지 불필요 (Web Speech API 브라우저 내장, qrcode 이미 설치)
- **다음:** Phase 8.9

## Phase 8.9 — 계좌이체 QR URL 방식 변경
- **상태:** ✅ 완료
- **완료일:** 2026-03-25
- **산출물:**
  - QR 내용을 텍스트에서 URL 방식으로 변경 (스캔 → 계좌번호 복사 전용 페이지)
  - `src/app/transfer/page.tsx` 신규: 계좌정보 표시 + 복사 버튼 + 금액 표시
  - 계좌번호 복사 시 은행명 포함 ("농협 351-1512-0013-03")
- **이슈:** 없음
- **다음:** Phase 8.10

## Phase 8.10 — 베타 피드백 3차 (지출관리 + Export 확장)
- **상태:** ✅ 완료
- **완료일:** 2026-03-27
- **산출물:**
  - **지출관리 시스템**: 대시보드에 '지출' 탭 추가
    - 재료 품목 등록/수정/비활성화 (expense_items 테이블)
    - 지출 기록 (품목 선택 → 수량/금액 자동 계산, 메모, 날짜)
    - `/api/expenses`, `/api/expenses/items` API 신규
  - **Export 8시트 확장**: 전체주문, 월별, 고객별, 메뉴별, 회계보고, 주간수입상세, 미결제현황, 선불잔액현황
  - **TTS 음성 알림 분리**: 접수 알림은 봉사자 페이지에서만, 완료 알림은 고객 페이지에서만
  - DB 마이그레이션 2건: expense_items, expenses 테이블
- **이슈:** 없음
- **다음:** Phase 8.11

## Phase 8.11 — 용어 변경 + UI 확대 + 정렬 수정
- **상태:** ✅ 완료
- **완료일:** 2026-03-28
- **산출물:**
  - **외상→미결제 용어 전면 변경**: 봉사자 페이지, 대시보드, 관리자, 고객 조회 등 전체
  - **대기열/장바구니 UI 확대**: 메뉴명 22→28px, 수량/가격 확대
  - **대기열 정렬 수정**: 오래된 주문이 위로 (ascending)
  - **대시보드 오전/오후 정산 필터**: 12시 기준 필터 버튼 추가
- **이슈:** 없음
- **다음:** Phase 8.12

## Phase 8.12 — 베타 피드백 종합 (6개 기능)
- **상태:** ✅ 완료
- **완료일:** 2026-03-31
- **산출물:**
  - **아메리카노 샷 옵션**: HOT/ICE 주문 시 보통/연하게/진하게 선택 모달
    - `order_items.options` jsonb 컬럼 추가, 대기열/주문확인에 옵션 표시
    - 같은 메뉴라도 옵션이 다르면 별도 장바구니 항목
  - **선불 잔액 자동 차감 수정**: null 안전 처리 (`?? 0`) + 음수 방지 (`Math.max(0, ...)`)
    - 유장열 님 수동 차감 실행 (30,000 → 26,500원)
  - **MemberSelect 1-phase 통합**: 부서 버튼 + 초성 키보드 한 화면, 그리드는 초성 입력 후만 표시
  - **예약 주문 기능**: 주문 확인 단계에서 예약 토글 → 시간 선택 (5분 단위)
    - `orders.scheduled_for` timestamptz 컬럼 추가, 대기열에서 시간 도래 시 표시
  - **마감시간 설정**: 설정 시간 동안 고객 주문 페이지 차단 (기본 10:35~12:30)
    - `admin_settings.open_time`, `close_time` 컬럼 추가
    - 관리자 설정 탭에 마감시간 UI, 30초마다 자동 체크
  - **엑셀 셀 색상**: exceljs 패키지로 교체 (xlsx 제거)
    - 오후 행 회색 배경, 이체 셀 노란색 배경, 헤더 볼드+배경색
  - **정산에서 선불 제외**: 실 매출 = 총 매출 - 선불
    - TodaySummary, 대시보드 오늘/월간 탭, 엑셀 월별/주간수입/회계보고 시트 모두 적용
  - **대시보드 탭 개편**: '전체' 탭 추가 (주문+반려 전체 내역), '주간' → '오늘' 명칭 변경
  - **정산 팝업 개선**: 주문번호순 정렬, 결제수단 태그(색상별), 메뉴 표시, 폰트 대폭 확대
  - **미결제 팝업 개선**: 전체 기간 조회, '인별 잔액'/'전체 내역' 탭 전환, 이름/날짜/금액/메뉴 표시
- **DB 마이그레이션 3건:** order_items.options, orders.scheduled_for, admin_settings.open_time/close_time
- **패키지 변경:** +exceljs, -xlsx
- **버그 수정:** 외상→미결제 누락 1건 (OrderQueue), 마감시간 로직 반전 (설정 시간=차단 시간)
- **이슈:** WSL Git 인증 설정 (`credential.helper` → Windows Git Credential Manager 연동)
- **다음:** Phase 8.13

## Phase 8.13 — UX 대개편 (봉사자/관리자 통합)
- **상태:** ✅ 완료
- **완료일:** 2026-04-02
- **산출물:**
  - **봉사자+관리자 완전 통합**: `/pos` 하단 탭바 (주문|정산|미결제|관리)
    - 정산/미결제: 모달 → 인라인 탭 콘텐츠 (`TodaySummaryInline`, `CreditManagerInline`)
    - 관리: `AdminPanel` → `SettingsPanel` (PIN/QR/마감시간 등)
    - 정산 탭 날짜 필터 (일별/기간/전체) + 날짜별 그룹핑
  - **홈 대폭 단순화**: 9버튼 → 3버튼 (주문하기, 봉사자, 관리) + 고객 내역확인 링크
  - **세션 기반 인증**: PIN 1회 입력 후 sessionStorage 유지 (4시간 타임아웃)
    - `src/lib/auth-context.tsx` 신규 (AuthProvider + useAuth hook)
  - **관리 허브 신규**: `/manage` 페이지 (정산/성도/메뉴/PIN 설정 링크)
  - **삭제**: `/admin`, `/prepaid`, `PrepaidAdjust` (통합으로 흡수)
  - **기타**: 대시보드 고객별 목록 잘림 수정, 지출 탭 50/50 영역 분배
- **변경 파일:** 18개 (신규 7개, 삭제 3개, 수정 8개)
- **이슈:** 없음
- **다음:** Phase 8.14

## Phase 8.14 — 음성 안내 + TTS 안정화
- **상태:** ✅ 완료
- **완료일:** 2026-04-03
- **산출물:**
  - **주문 플로우 전체 음성 안내**: `src/lib/voice-guide.ts` 모듈
    - MenuSelect: 메뉴 담기 + 다음 단계 안내
    - MemberSelect: 성도 선택 안내
    - PaymentSelect: 결제방식 선택 안내
    - OrderConfirm: 주문 완료/실패 안내
    - `VOICE_ENABLED` 플래그로 즉시 비활성화 가능
  - **TTS 안정화 (Samsung Browser 29.0 대응)**:
    - `speak()` 개선: `cancel()` 후 `setTimeout(50ms)` 우회 (Chrome 버그)
    - `voiceschanged` 이벤트 리스너: 비동기 음성 목록 로딩 대응
    - 한국어 음성 명시 선택 (`_koVoice` 캐싱)
    - `primeSpeech()`: 첫 사용자 제스처(click/touchstart)에서 음성 합성 잠금 해제
  - **알림음 이중 보장**: `playNotificationBeep()` (AudioContext 880Hz+1100Hz 2단 비프)
    - 봉사자: 새 주문 접수 시 비프 + TTS
    - 고객: 음료 완료 시 비프 + TTS
- **변경 파일:** `utils.ts`, `voice-guide.ts`, `pos/page.tsx`, `OrderQueue.tsx`, `MemberSelect.tsx`, `MenuSelect.tsx`, `OrderConfirm.tsx`, `PaymentSelect.tsx`
- **이슈:** Samsung Internet Browser 음성 목록 지연 로딩 → voiceschanged + primeSpeech로 해결
- **다음:** Phase 8.15

## Phase 8.15 — 성도선택 개선 + 대기열 확대 + 고객별 주문 요약
- **상태:** ✅ 완료
- **완료일:** 2026-04-11
- **산출물:**
  - **MemberSelect 그리드 항상 표시**: 초성 입력 전에도 전체/부서별 성도 그리드 노출
    - 초성 입력 시 실시간 필터링 (기존 "초성을 입력하여 검색하세요" 플레이스홀더 제거)
  - **OrderQueue 이름 확대**: `text-base` → `text-[2rem]` (2배 확대), 검정+볼드
  - **주문관리 고객별 요약 카드**: 관리 탭 > 주문관리에서 성도명 검색 시 상단 요약 표시
    - 총 주문 건수 + 합계 금액
    - 결제수단별 금액 (현금/이체/미결제/선불 — 색상 구분)
    - 상태별 건수 (대기/완료/반려 — 뱃지)
    - 기존 날짜 필터(일별/기간/전체)와 조합 가능
- **변경 파일:** `MemberSelect.tsx`, `OrderQueue.tsx`, `OrderManager.tsx`
- **이슈:** 없음
- **다음:** Phase 8.16

## Phase 8.16 — 대기열 결제수단 표기 + 샷 옵션 정리
- **상태:** ✅ 완료
- **완료일:** 2026-05-17
- **산출물:**
  - **OrderQueue 결제수단 뱃지**: 주문 대기열 카드에 결제수단(현금/이체/외상/**선불**) 색상 칩 표시
    - `PaymentBadges` 컴포넌트 신규 — `order_payments` 배열을 색상별 라벨로 매핑
    - 색상 체계 통일: 현금(초록) / 이체(파랑) / 외상(주황) / 선불(보라)
    - 대기 + 완료 카드 모두 노출 → 봉사자가 결제수단을 즉시 식별 가능
    - (배경: 선불 결제 완료 후 대기열에서 "선불" 표기가 없어 혼동된다는 피드백 반영)
  - **샷 옵션 축소**: 아메리카노 샷 농도 선택지에서 "진하게" 제거
    - `보통`/`연하게` 2가지로 단순화 (운영 단순화 — 진하게 옵션 사용 빈도 낮음)
    - `SHOT_OPTIONS` 상수 및 모달 UI 동기화
- **변경 파일:** `OrderQueue.tsx`, `MenuSelect.tsx`
- **이슈:** 없음
- **다음:** 베타 운영 계속
