# wellink-mvp (1).jsx 리팩터/머지 계획

**기준**: wellink-mvp 프로젝트 (기존 구조·테마·API 유지)

---

## 1. 외부 파일(wellink-mvp (1).jsx) 구조 정리

외부 파일은 **단일 2166줄 JSX**로 다음이 한 파일에 포함되어 있음:

| 블록 | 라인 대략 | 호환 시 배치 | 비고 |
|------|-----------|--------------|------|
| COLORS | 3–19 | 사용 안 함 | 프로젝트 `theme.js` 유지 |
| WCWI_QUESTIONS, BODY_PARTS, MINI_QUESTIONS | 20–92 | 사용 안 함 | 프로젝트 `constants/questions.js`와 동일 |
| AnimatedNumber, RadarChart, GaugeBar | 93–206 | 사용 안 함 | 프로젝트 `components/`에 이미 존재 |
| WellinkMVP (state, AT, saveToAirtable, …) | 208–2166 | 사용 안 함 | **Airtable PAT 하드코딩** → 프로젝트는 env + server API 사용 |
| Landing 인라인 (섹션 1~11 + FAQ, Disclaimer, Footer) | 330~904 | **LandingView.jsx로 콘텐츠만 머지** | 아래 섹션별 반영 |
| Mini/Full/Lead/Employee/Manager/ThankYou 뷰 | 1045~2165 | 사용 안 함 | 프로젝트는 이미 분리된 뷰·플로우 사용 |

---

## 2. 머지 원칙

- **기준 코드**: wellink-mvp의 `LandingView.jsx`, `theme.js`, `App.jsx`, 뷰/API 구조.
- **가져올 것**: 외부 파일의 **랜딩 페이지 콘텐츠**(문구, 섹션 구성, ROI·FAQ·3단계·비전·가치·추천·자주 묻는 질문·Disclaimer).
- **가져오지 않을 것**:
  - Airtable PAT/BASE/테이블 ID (보안)
  - 단일 파일 내 state/뷰 로직 (프로젝트는 이미 분리됨)
  - 중복 상수·컴포넌트 (COLORS, questions, AnimatedNumber 등)

---

## 3. LandingView.jsx에 반영한 섹션

| 순서 | 섹션 | 처리 |
|------|------|------|
| 1 | Nav, Hero | 프로젝트 유지 (이미 동일 톤) |
| 2 | ROI / Proven results | 외부 4개 항목($2.71, 25%, 20%, 33%) + 출처로 **WHY_ITEMS 확장 또는 대체** |
| 3 | WCWI 5가지 도구 | 기존 WCWI_ITEMS 유지, **detail** 필드만 추가 (선택) |
| 4 | FAQ “혹시 이런 걱정이 있으신가요?” | **신규 섹션** 추가 |
| 5 | 3단계 프로세스 | **신규 섹션** 추가 |
| 6 | HR 대시보드 미리보기 | 프로젝트 유지 |
| 7 | 비전 (WELLINK이 믿는 것, 다크) | **신규 섹션** 추가 |
| 8 | 구체적 가치 5가지 | **신규 섹션** 추가 |
| 9 | 추천 대상 | **신규 섹션** 추가 |
| 10 | 수요조사(역할 선택) | 프로젝트 유지 (roleRef, onSelectRole) |
| 11 | 자주 묻는 질문 | **신규 섹션** 추가 |
| 12 | 안내사항(Disclaimer) | **신규 섹션** 추가 |
| 13 | CTA, Footer | 프로젝트 유지, Footer에 문의 이메일 추가 가능 |

---

## 4. 완료 후 상태

- 랜딩은 **프로젝트의 LandingView.jsx 한 파일**에서 유지.
- 스타일·색상은 `COLORS`(theme) 및 기존 GLOBAL_STYLES 사용.
- 네비게이션(수요조사, 60초 체크, transition, scrollToRole, onSelectRole, roleRef)은 **기존 App.jsx·LandingView 계약 유지**.
