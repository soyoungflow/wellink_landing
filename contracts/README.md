# Airtable Contract (SSOT)

Airtable 스키마를 기준으로 폼-API 정합성을 관리합니다.

## 파일

| 파일 | 설명 |
|------|------|
| `airtable_contract.json` | Airtable Base(WELLINK) 테이블별 필드 스키마 (fieldId, fieldName, type, choices) |
| `form_contract.json` | 프로젝트 폼에서 사용하는 옵션/값 (surveys.js, App.jsx 등에서 추출) |
| `contract_diff.json` | form vs airtable 불일치 리포트 (A/B/C/D 유형) |

## 스크립트

```bash
npm run contracts:extract   # form_contract.json 생성
npm run contracts:diff      # contract_diff.json 생성 (extract 결과와 비교)
npm run contracts:build     # extract + diff 한 번에
```

## Contract Diff 유형 (A~F)

- **A)** 폼에만 있음: Airtable choices에 없는 값 → 수정/매핑 필요
- **B)** Airtable에만 있음: 폼에 없는 옵션 → 정리 후보
- **C)** 필드 타입 불일치: singleSelect vs multiSelect 등
- **D)** 옵션 불일치: choice 문자열/포맷 차이
- **E)** 자동 수정 가능: 띄어쓰기/오타/숫자→choice 매핑 (TABLE_SYNONYM_OVERRIDE 적용됨)
- **F)** 자동 수정 금지: 역스케일/의미 충돌 → 수동 결정 필요

## 수동 수정 필요 항목 (F 유형)

`contract_diff.json`의 `F_manualOnly` / `D_semanticConflictManualRequired`를 확인하세요.

| 필드 | 테이블 | 사유 |
|------|--------|------|
| willingness_to_use_service | employee | 역스케일 (1=매우있다~5=전혀없다). LIKERT_5와 혼동 금지. App.jsx에서 LIKERT_5_WILLINGNESS 사용 중 (정합됨) |

## WCWI Full 매핑

`contracts/wcwiFieldMap.js`에 Assessments 테이블용 명시적 매핑이 정의되어 있습니다.

- `WCWI_QUESTION_TO_FIELD`: m1→WHO1_PositiveMood, p1→RYF6_Autonomy 등
- `BODY_PART_TO_NMQ`: 목→Neck, 어깨→Shoulder 등
- `SCALE_5_TO_CHOICE`, `SCALE_7_TO_CHOICE`, `CBI_SCALE_5_REVERSED`
- `wcwiPayloadToAssessmentsFields(fullAnswers, bodyParts, scores, email)` → fields 객체

Full 진단 제출 시 이 함수로 변환한 `fields`를 `table: "wcwi"`로 전송하세요.

## WCWI "유효한 필드가 없습니다" 원인

- **원인**: Assessments 테이블 스키마와 폼 필드(정신적 웰빙, 종합점수 등) 불일치
- **해결**: Full 진단 결과는 `mini` 테이블로 저장. Assessments는 WHO1_PositiveMood 등 별도 용도

## 로컬 테스트

```bash
# vercel dev 실행 후
curl -X POST "http://localhost:3000/api/airtable?dryRun=1" \
  -H "Content-Type: application/json" \
  -d '{"table":"mini","fields":{"score":75,"level":"양호","source":"app","created_at":"2025-01-15T00:00:00.000Z","answers_json":"{}"}}'
```

dryRun 응답: `valid`, `targetTable`, `fields`, `normalizedFields`(fieldId 기반), `validationErrors`, `contractDiffSummary`, `autoFixApplied`, `manualFixRequired`, `diffSummary`, `suggestedFixes`

`/api/submit?dryRun=1`도 동일하게 동작합니다.
