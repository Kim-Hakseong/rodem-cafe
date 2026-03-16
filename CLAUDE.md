# CLAUDE.md — 로뎀나무 카페 POS 시스템

## 프로젝트 개요
청주남부교회 로뎀나무 카페의 주문·정산 시스템. 태블릿 PWA 기반.

## 기술 스택
- **프레임워크:** Next.js 14 (App Router, TypeScript)
- **DB:** Supabase (PostgreSQL, Seoul 리전)
- **호스팅:** Vercel
- **패키지매니저:** pnpm
- **스타일:** Tailwind CSS (커스텀 테마)
- **차트:** recharts
- **엑셀:** xlsx (SheetJS)
- **QR:** qrcode
- **해싱:** bcryptjs

## 핵심 규칙

### 개발 프로세스
- PRD.md를 Phase 단위로 순차 실행할 것
- 매 Phase 완료 시 반드시 LOG.md에 결과 기록
- LOG.md 형식: 상태, 완료일, 산출물, 이슈, 다음 Phase

### 코드 컨벤션
- 언어: TypeScript strict
- 컴포넌트: React 함수형 + hooks
- 스타일: Tailwind CSS (인라인 스타일 금지, globals.css 최소화)
- 파일 구조: src/app/ (페이지), src/components/ (컴포넌트), src/lib/ (유틸)
- import alias: @/* (src/ 기준)

### Supabase 규칙
- 읽기: @supabase/ssr의 createBrowserClient (anon key)
- 쓰기/관리: createClient with service_role key (API Route에서만)
- 절대 클라이언트 컴포넌트에서 service_role key 사용 금지
- RLS 활성화 필수

### 디자인 시스템
- 테마: 크림/골드/웜다크그레이 (prototypes/ JSX 참조)
- 다크 포인트: #4a4541 (순흑 아님, 웜그레이)
- 골드 액센트: #c9a227
- border-radius: 카드 22px, 버튼 14px
- 폰트: Plus Jakarta Sans + Noto Sans KR
- 호버: translateY(-3px), cubic-bezier(.2,.8,.2,1)
- 모달: backdrop-filter blur(10px)

### 결제 색상 체계
- 현금: #5a9a6e (초록)
- 계좌이체: #4a7fd4 (파랑)
- 외상: #d49a4a (주황)
- 선불: #7c5fbf (보라)

## 파일 참조
- `PRD.md` — Phase별 상세 개발 지침서 (이것을 따라 개발)
- `prototypes/` — UI 디자인 참조 JSX 5종
- `seed/` — 성도 190명 초기 데이터 엑셀

## 대상 사용자
- 봉사자 3명 (60대 포함) — 터치 타겟 48px 이상
- 성도 190명 (60~70대 다수) — 큰 폰트, 간단한 UI
- 관리자 — 정산 대시보드, 엑셀 Export

## 주의사항
- 교회 카페라 상업적 규모가 작음 → 과도한 최적화 불필요
- Supabase/Vercel 무료 티어 내에서 운영
- 태블릿(10인치) 최적화 우선, 모바일 반응형 지원
- 한국어 UI (코드 주석은 영어 가능)
