# Airtable MCP 스키마 ↔ 프로젝트 정합 검토

`docs/airtable_schema.json`(Airtable MCP 기준)과 프로젝트 내 연결 파일을 비교한 결과.

---

## 1. employee (Employee_Wellness_Market_Survey)

| 항목 | airtable_schema.json | 프로젝트 (airtableNormalize.js, surveys.js, App.jsx) | 일치 |
|------|----------------------|-----------------------------------------------------|------|
| 필드명 | company_size, job_type, work_style, ... Email, open_feedback, source, created_time 등 | fieldMapping 한글→영문 동일 필드명 사용 | ✅ |
| company_size 옵션 | 10명 미만, 10~49명, 50~200명, 200명 이상 | surveys.js opts 동일 | ✅ |
| job_type 옵션 | 사무직, 연구/개발, 영업/마케팅, 생산/현장직, 기타 | surveys.js opts 동일 | ✅ |
| work_style 옵션 | 전일 출근, 재택근무, 혼합형(출근+재택) | surveys.js opts 동일 | ✅ |
| Likert 5 (일반) | 5 (매우 그렇다) … 1 (전혀 아니다) | LIKERT_5 상수 동일 | ✅ |
| willingness_to_use_service | 1 (매우있다) … 5 (전혀없다) | LIKERT_5_WILLINGNESS 동일 | ✅ |
| source 옵션 | 내부 링크, 외부 캠페인, 직접 방문, 기타 | SCHEMA.source 옵션 동일. 전송값 "기타"로 통일 (App.jsx, LeadCaptureView) | ✅ |
| payment_amount 옵션 | 10,000원 미만, 10,000~30,000원, … 가격에 따라 결정할 의향이 있습니다 | surveys.js, SCHEMA 동일 | ✅ |
| preferred_program_type | 근골격계 스트레칭, 명상/호흡, … 기타 | surveys.js, SCHEMA 동일 | ✅ |
| Agreement | 예,동의합니다. | SCHEMA 동일 | ✅ |
| readOnly (미전송) | response_id, overall_wellness_need_score, created_time, Created time, AI_*, Agreement | cleanPayload에서 제거 | ✅ |

---

## 2. manager (Wellness Survey Company Responses)

| 항목 | airtable_schema.json | 프로젝트 | 일치 |
|------|----------------------|----------|------|
| 필드명 | Company_size, Current_programs, Wellness_importance, … Email, Additional_comments | fieldMapping 동일 | ✅ |
| Company_size 옵션 | 10명 이하, 10-50명, 50-200명, 200명 이상 | surveys.js, SCHEMA 동일 | ✅ |
| Adoption_interest | 있음, 없음 | surveys.js, SCHEMA 동일 | ✅ |
| Cheap_price_range | 인당 5천원 ~1만원, 인당 1~2만원, 인당 2~3만원 | surveys.js, SCHEMA 동일 | ✅ |
| Required_features | 정신건강 콘텐츠, 요가, 필라테스 등 운동 콘텐츠, 번아웃 평가 및 리포트, 데이터 분석 및 대시보드, 기타 | surveys.js, SCHEMA 동일 | ✅ |
| Wellness_importance | 5 매우그렇다, 4 그렇다, 3 보통이다, 2 아니다, 1 전혀 아니다 | SCHEMA (순서만 상이, 집합 동일), 숫자→문자 변환 로직 적용 | ✅ |
| readOnly (미전송) | Company, Created_time, Attachments | cleanPayload에서 제거 | ✅ |

---

## 3. mini (mini_responses)

| 항목 | airtable_schema.json | 프로젝트 | 일치 |
|------|----------------------|----------|------|
| 필드명 | score, created_at, email, level, answers_json, source, utm | MiniResult payload: score, level, answers_json, created_at. LeadCapture: created_at, source, email, answers_json | ✅ |
| level 옵션 | 양호, 보통, 주의 | MINI_LEVEL_FOR_AIRTABLE, SCHEMA 동일 | ✅ |
| source 옵션 | web, app | SCHEMA 동일. LeadCapture "app", MiniResult 미전송 시 default "app" | ✅ |
| score / created_at | number, dateTime | 정규화에서 number·ISO 문자열 처리 | ✅ |

---

## 4. wcwi (Assessments)

- 현재 앱에서 `saveToAirtable("wcwi", ...)` 호출 없음. 스키마만 문서화, 전송 로직 없음. ✅

---

## 5. 수정 사항 (이번 검토에서 반영)

1. **employee source**: Airtable에 "웹 사이트" 옵션 없음 → App.jsx, LeadCaptureView에서 전송값을 **"기타"**로 통일 (정규화 fallback만 의존하지 않도록).
2. 그 외 필드명·타입·select 옵션은 `airtable_schema.json`과 `airtableNormalize.js` SCHEMA, `surveys.js` opts와 일치 확인됨.

---

## 6. API 오류 방지 요약

- **필드명**: App.jsx fieldMapping 및 LeadCaptureView/MiniResult payload 키가 Airtable 필드명과 동일.
- **Single/Multiple select**: 모든 전송 옵션은 스키마 옵션과 일치하거나, 정규화에서 허용 옵션으로 변환/fallback.
- **readOnly**: created_time, response_id, AI_* 등은 정규화 단계에서 제거되어 전송하지 않음.
- **타입**: number(score), dateTime(created_at) 정규화 처리, linked record(Company 등) 미전송.

이 상태로 Airtable API 호출 시 "Insufficient permissions to create new select option" 등 select 불일치 오류는 발생하지 않도록 정합되어 있음.
