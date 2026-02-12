# Airtable 정합화 작업 — 커밋 메시지 제안

변경사항을 아래 순서대로 커밋 단위로 나누었습니다.

---

## 1) 스키마 덤프

**커밋 메시지:**
```
feat(docs): add Airtable schema dump and script

- Add docs/airtable_schema.json (employee/manager/mini/wcwi 테이블 필드·옵션)
- Add scripts/dump-airtable-schema.js (env 기반, PAT 미하드코딩)
- npm run dump-airtable-schema 로 갱신 가능
```

**포함 파일:** `docs/airtable_schema.json`, `scripts/dump-airtable-schema.js`

---

## 2) Payload 스펙 및 불일치 리포트

**커밋 메시지:**
```
docs: add payload spec and Airtable mismatch report

- docs/payload_spec.json: 테이블별 전송 payload 스펙
- docs/PAYLOAD_MAPPING_TABLE.md: 화면/버튼 → 테이블·필드 맵핑 표
- docs/mismatch_report.md: 스키마 vs payload 불일치 (select 옵션, 타입, 빈값 등)
```

**포함 파일:** `docs/payload_spec.json`, `docs/PAYLOAD_MAPPING_TABLE.md`, `docs/mismatch_report.md`

---

## 3) 정규화/검증 레이어 구현

**커밋 메시지:**
```
feat(airtable): schema-aligned normalize and validate layer

- employee: source fallback "기타" (웹 사이트 미지원), payment_amount 프론트→Airtable 매핑
- manager: Required_features 정확 옵션 (요가, 필라테스 등 운동 콘텐츠 / 데이터 분석 및 대시보드)
- work_style 재택 공백 통일, Agreement 옵션 "예,동의합니다." 일치
- willingness_to_use_service 옵션 1(매우있다)~5(전혀없다) 반영
- validatePayload(table, payload) 추가 및 export
```

**포함 파일:** `src/api/airtableNormalize.js`

---

## 4) 제출 플로우 적용 및 테스트

**커밋 메시지:**
```
feat(airtable): apply validation before save and add test script

- App.jsx (employee/manager): normalize → validate → saveToAirtable, 검증 실패 시 토스트 + console.error
- LeadCaptureView, MiniAssessmentView: 동일 검증 적용
- scripts/validate-airtable-payloads.test.js 추가 (npm run test:airtable)
- package.json scripts: dump-airtable-schema, test:airtable
```

**포함 파일:** `src/App.jsx`, `src/views/LeadCaptureView.jsx`, `src/views/MiniAssessmentView.jsx`, `scripts/validate-airtable-payloads.test.js`, `package.json`

---

## 한 번에 커밋할 때 (선택)

**커밋 메시지:**
```
feat(airtable): align form payload with Airtable schema and add validation

- Add docs/airtable_schema.json, payload_spec.json, mismatch_report.md
- Normalize select options (source→기타, payment_amount, Required_features) to prevent "new select option" API errors
- validatePayload() before save; toast and console.error on failure
- Add dump-airtable-schema and test:airtable scripts
```
