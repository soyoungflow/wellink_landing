# WELLINK MVP

B2B 기업 웰니스 플랫폼 MVP (React + Vite).

## 보안 (Vercel 배포 기준)

- **`/src` 내 코드**: Airtable PAT, Base ID, 테이블 ID를 **포함하지 않습니다**.
- **프론트엔드**: `fetch("/api/airtable")` 만 호출합니다 (상대 경로).
- **서버**: 루트 `api/airtable.js` (Vercel Serverless Function)에서만 시크릿 사용:
  - `process.env.AIRTABLE_PAT`, `process.env.AIRTABLE_BASE_ID`, 테이블 ID 환경변수.

환경변수 예시: `.env.example` 참고.

## WCWI Scoring Policy (Short Note)

- 설문 응답은 내부 상태에서 숫자(`1..scale`)로 저장합니다.
- Airtable 제출 시에는 스키마 선택지 라벨 문자열로 변환해 저장합니다.
- 영역 점수 및 총점은 `0~100` 정수 스케일을 사용합니다.
- CBI/NMQ는 Health-Risk 역관계 정책을 따르며 각 쌍의 합은 약 `100`(±1)이어야 합니다.
- 점수 정책 변경 시 `calculateFullScores`와 관련 정책 문서를 반드시 함께 업데이트하세요.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
