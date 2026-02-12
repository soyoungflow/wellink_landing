# Airtable 스키마 vs 앱 Payload 불일치 리포트

`docs/airtable_schema.json` vs `docs/payload_spec.json` 및 `src/api/airtableNormalize.js` 기준 비교.

---

## 1) 필드명 불일치 / Airtable에 없는 필드

| 테이블 | 앱에서 보내는 키 | Airtable 필드 | 비고 |
|--------|------------------|---------------|------|
| employee | (없음) | - | 현재 전송 필드명은 스키마와 일치 |
| manager | (없음) | - | 동일 |
| mini | (없음) | - | 동일 |

- **read-only 필드 전송 시**: `response_id`, `overall_wellness_need_score`, `created_time`, `Created time`, `AI_Feedback_Summary`, `AI_Need_Category` 등은 Airtable에서 자동 계산/생성. 앱에서 보내지 않도록 정규화에서 제거 중 ✅

---

## 2) 타입 불일치

| 테이블 | 필드 | 기대 타입 | 앱 전송 형태 | 조치 |
|--------|------|-----------|-------------|------|
| mini | score | number | number | ✅ |
| mini | created_at | dateTime (ISO) | string (ISO8601) | ✅ |
| employee | created_time | createdTime (read-only) | string 전송 시 무시 가능 | omit 권장 |
| manager | Company | multipleRecordLinks | 텍스트 미전송 | linked는 미사용 시 생략 ✅ |

- **checkbox**: 현재 앱에서 checkbox 필드 전송 없음.
- **number**: `score`는 정규화에서 `Number(value)` 처리 ✅.

---

## 3) Select 옵션 불일치 (핵심 — "Insufficient permissions to create new select option" 원인)

### employee

| 필드 | 앱/프론트 값 | Airtable 허용 옵션 | 불일치 여부 |
|------|--------------|---------------------|-------------|
| company_size | 10명 미만, 10~49명, 50~200명, 200명 이상 | 10명 미만, 10~49명, 50~200명, 200명 이상 | ✅ 일치 |
| work_style | 전일 출근, 재택 근무, 혼합형 | 전일 출근, 재택근무, 혼합형(출근+재택) | ⚠️ "혼합형" → "혼합형(출근+재택)" 매핑 필요 (현재 적용됨). "재택 근무" → "재택근무" 공백 차이 |
| **source** | **"웹 사이트"** | 내부 링크, 외부 캠페인, 직접 방문, **기타** | ❌ **"웹 사이트" 없음 → 새 옵션 생성 시도 → API 오류** → fallback "기타" 필요 |
| payment_amount | 1만원 미만, 1만원~3만원, 3만원~5만원, 5만원 이상, 가격에 따라 결정 | 10,000원 미만, 10,000~30,000원, 30,000~50,000원, 50,000원 이상, 가격에 따라 결정할 의향이 있습니다 | ❌ **문구 완전 불일치** → 정규화에서 Airtable 옵션 문자열로 매핑 필요 |

### manager

| 필드 | 앱/프론트 값 | Airtable 허용 옵션 | 불일치 여부 |
|------|--------------|---------------------|-------------|
| Company_size | 10-50명, 50-200명 (정규화 적용) | 10명 이하, 10-50명, 50-200명, 200명 이상 | ✅ 일치 |
| Wellness_importance | "1 전혀 아니다" … "5 매우그렇다" (숫자→문자 변환) | 5 매우그렇다, 4 그렇다, 3 보통이다, 2 아니다, 1 전혀 아니다 | ⚠️ 순서/공백 확인 (우리: "1 전혀 아니다", Airtable: "1 전혀 아니다" 동일 가능) |
| Required_features | 요가/필라테스, 분석 대시보드 등 | 정신건강 콘텐츠, **요가, 필라테스 등 운동 콘텐츠**, 번아웃 평가 및 리포트, **데이터 분석 및 대시보드**, 기타 | ❌ "요가/필라테스" → "요가, 필라테스 등 운동 콘텐츠" 매핑 필요. "분석 대시보드" → "데이터 분석 및 대시보드" |
| Cheap_price_range | 인당 5천원~1만원, 인당 1만원~2만원, 인당 2만원~3만원 | 인당 5천원 ~1만원, 인당 1~2만원, 인당 2~3만원 | ⚠️ 공백/문자 차이 → normalizeCheapPriceRange로 보정 중 |

### mini

| 필드 | 앱 값 | Airtable 옵션 | 불일치 여부 |
|------|-------|----------------|-------------|
| level | 양호, 보통, 주의 | 양호, 보통, 주의 | ✅ 일치 |
| source | app, web | web, app | ✅ 일치 |

---

## 4) Linked record 필드

- **manager.Company**: multipleRecordLinks (Companies 테이블). 앱에서 회사명 문자열만 보낼 수 있어 record id 배열을 보내지 않음 → **현재 전송하지 않음** (정규화에서 제거 또는 미포함). ✅
- **wcwi.Participant_ID / Program_ID**: 동일하게 record id 필요. 현재 앱에서 wcwi 제출 없음.

---

## 5) Required / 빈값 처리

- Airtable 스키마에는 required 플래그가 없음(API 메타에 없음). **빈 문자열/null**은 정규화에서 키 제거(omit) 권장 ✅.
- **read-only 필드**: 값 전송해도 Airtable이 무시할 수 있으나, 불필요한 필드는 제거해 두는 것이 안전.

---

## 요약 조치 사항 (적용 완료)

1. **employee.source**: "웹 사이트" 전송 금지 → 옵션에 없으므로 **fallback "기타"** 적용 ✅. (정규화 레이어)
2. **employee.payment_amount**: 프론트 옵션을 Airtable과 동일하게 **surveys.js**에서 "10,000원 미만" 등으로 통일 ✅. (기존 정규화 매핑은 다른 경로 대비 유지)
3. **manager.Required_features**: **surveys.js** 옵션을 "요가, 필라테스 등 운동 콘텐츠", "데이터 분석 및 대시보드"로 Airtable과 일치시킴 ✅.
4. **manager.Cheap_price_range**, **Company_size**: **surveys.js**에서 "인당 5천원 ~1만원", "10-50명" 등 Airtable 옵션과 동일하게 적용 ✅.
5. **employee.work_style**: **surveys.js**에서 "재택근무", "혼합형(출근+재택)"으로 Airtable과 일치 ✅.
6. **전송 전 정규화 레이어**: 스키마 기반 검증 + fallback 유지 (다른 진입 경로·과거 값 대비).
7. **앱↔Airtable 테이블 매핑**: `docs/AIRTABLE_MAPPING_TABLE.md`에 현재 매핑 및 신규 테이블 추가 가이드 정리 ✅.
