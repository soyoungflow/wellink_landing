# 뷰 ↔ Airtable 테이블/필드/값 매핑 검증 결과

`ManagerSurveyView`, `EmployeeSurveyView`, `MiniAssessmentView`, `FullAssessmentView`에서 사용하는 테이블·필드타입·필드값이 Airtable 스키마 및 `airtableNormalize`와 일치하는지 하나씩 검증한 결과입니다.  
기준: `docs/AIRTABLE_SCHEMA_AND_MAPPING.md`, `src/api/airtableNormalize.js`, `src/App.jsx`, `src/constants/surveys.js`, `src/constants/questions.js`.

---

## 1. ManagerSurveyView.jsx ↔ manager 테이블

### 1.1 데이터 소스

- **페이지/필드 정의:** `src/constants/surveys.js` → `MGR_PAGES`
- **제출 시 매핑:** `src/App.jsx` 내 `submitMgr`의 `fieldMapping` + `normalizePayload("manager", ...)`

### 1.2 테이블

| 구분 | 값 | Airtable | 일치 |
|------|-----|----------|------|
| 테이블 | `manager` | Wellness Survey Company Responses (`tbl35QbAamOCRvaPk`) | ✅ |

### 1.3 필드·타입·값 매핑 (한글 key → Airtable 필드)

| surveys.js key | Airtable 필드 | Airtable 타입 | App.jsx 매핑 | 전송 여부 | 옵션/문구 일치 |
|----------------|----------------|---------------|--------------|-----------|----------------|
| 기업인원 | Company_size | Single select | ✅ Company_size | ✅ | ✅ (10~50명→10-50명 변환 적용) |
| 현재프로그램 | Current_programs | Long text | ❌ 없음 | ❌ 미전송 | - |
| 건강중요도 | Wellness_importance | Multiple select | ❌ 없음 | ❌ 미전송 | - |
| 필요서비스 | Needed_services | Long text | ❌ 없음 | ❌ 미전송 | - |
| 애로사항 | Pain_points | Long text | ❌ 없음 | ❌ 미전송 | - |
| 디지털웰니스관심 | Adoption_interest | Single select | ✅ Adoption_interest | ✅ | ✅ 있음/없음 |
| 필요기능 | Required_features | Multiple select | ✅ Required_features | ✅ | ✅ (요가/필라테스→요가, 필라테스 등 정규화) |
| 저렴의심가격 | Cheap_price_range | Single select | ❌ 없음 | ❌ 미전송 | ⚠️ 문구 상이 (아래 참고) |
| 합리적가격 | Reasonable_price | Long text | ✅ Reasonable_price | ✅ | ✅ |
| 추가의견 | Additional_comments | Long text | ❌ 없음 | ❌ 미전송 | - |
| (이메일) | Email | Email | mgrEmail → Email | ✅ | ✅ |

**저렴의심가격 옵션 문구 비교 (매핑 추가 시 참고):**

- **surveys.js:** `인당 5천원~1만원`, `인당 1만원~2만원`, `인당 2만원~3만원`
- **Airtable (문서 기준):** `인당 5천원 ~1만원`, `인당 1~2만원`, `인당 2~3만원`
- 공백·“만원” 유무 차이 있음 → 매핑 추가 시 Airtable 옵션 문자열과 동일하게 보내거나, `airtableNormalize`에 변환 추가 필요.

**Required_features 옵션:**

- **surveys.js:** `요가/필라테스`
- **Airtable:** `요가, 필라테스 등`
- `airtableNormalize.js`의 `MANAGER_REQUIRED_FEATURES_MAP`로 변환됨 ✅

### 1.4 요약 (Manager)

- **맵핑됨·일치:** 기업인원, 디지털웰니스관심, 필요기능, 합리적가격, Email.
- **미매핑(미전송):** 현재프로그램, 건강중요도, 필요서비스, 애로사항, 저렴의심가격, 추가의견.
- **필드타입/필드값:** 매핑된 항목은 Airtable 타입·옵션과 일치. Company_size 물결→하이픈 변환 적용됨.

---

## 2. EmployeeSurveyView.jsx ↔ employee 테이블

### 2.1 데이터 소스

- **페이지/필드 정의:** `src/constants/surveys.js` → `EMP_PAGES`
- **제출 시 매핑:** `src/App.jsx` 내 `submitEmp`의 `fieldMapping` + `normalizePayload("employee", ...)`

### 2.2 테이블

| 구분 | 값 | Airtable | 일치 |
|------|-----|----------|------|
| 테이블 | `employee` | Employee_Wellness_Market_Survey (`tblGRjbxzVL6E4wUc`) | ✅ |

### 2.3 필드·타입·값 매핑 (한글 key → Airtable 필드)

| surveys.js key | Airtable 필드 | Airtable 타입 | App.jsx 매핑 | 전송 여부 | 옵션/문구 일치 |
|----------------|----------------|---------------|--------------|-----------|----------------|
| 회사규모 | company_size | Single select | ✅ company_size | ✅ | ✅ 10명 미만, 10~49명, 50~200명, 200명 이상 |
| 직종 | job_type | Single select | ✅ job_type | ✅ | ✅ 사무직, 연구/개발, 영업/마케팅, 생산/현장직, 기타 |
| 업무스타일 | work_style | Single select | ✅ work_style | ✅ | ✅ 전일 출근, 재택 근무, 혼합형(출근+재택) (정규화) |
| 신체불편 | physical_discomfort_level | Single select | ✅ physical_discomfort_level | ✅ | ✅ LIKERT_5 문자열로 변환 |
| 정신스트레스 | mental_stress_level | Single select | ✅ mental_stress_level | ✅ | ✅ LIKERT_5 |
| 번아웃경험 | burnout_experience | Single select | ✅ burnout_experience | ✅ | ✅ LIKERT_5 |
| 참여의향 | need_for_wellness_service | Single select | ✅ need_for_wellness_service | ✅ | ✅ LIKERT_5 |
| 관심프로그램 | preferred_program_type | Multiple select | ✅ preferred_program_type | ✅ | ✅ 문구 동일 |
| 유료지불의향 | interest_in_short_program | Single select | ✅ interest_in_short_program | ✅ | ✅ LIKERT_5 |
| 월지불금액 | payment_amount | Multiple select | ✅ payment_amount | ✅ | ✅ 문구 동일 |
| 서비스사용의향 | willingness_to_use_service | Single select | ✅ willingness_to_use_service | ✅ | ✅ LIKERT_5_WILLINGNESS |
| 기업투자필요 | company_support_expectation | Single select | ✅ company_support_expectation | ✅ | ✅ LIKERT_5 |
| 기대우려 | open_feedback | Long text | ✅ open_feedback | ✅ | ✅ |
| (이메일) | Email | Single line text | empEmail → Email | ✅ | ✅ |
| (고정) | source | Single select | "웹 사이트" | ✅ | ✅ 옵션 내 값 |
| (고정) | created_time | Created time (read-only) | ISO 문자열 전송 | ⚠️ read-only라 무시 가능 | - |

**Likert 옵션 (airtableNormalize와 App.jsx):**

- **LIKERT_5:** `1 (전혀 아니다)` ~ `5 (매우 그렇다)` — 일치 ✅
- **LIKERT_5_WILLINGNESS (유료지불의향 아님, 서비스사용의향용):** `1 (매우 아니다)` ~ `5 (매우 그렇다)` — 일치 ✅  
- **유료지불의향**은 `interest_in_short_program`으로 매핑되고 LIKERT_5 사용 ✅

### 2.4 요약 (Employee)

- **맵핑·타입·옵션:** 모든 설문 항목이 올바른 Airtable 필드로 매핑되어 있으며, Single/Multiple select 옵션 문구와 airtableNormalize 스키마와 일치.
- **필드타입:** Long text(open_feedback), Single/Multiple select, Email 모두 Airtable 스키마와 일치.

---

## 3. MiniAssessmentView.jsx ↔ mini 테이블

### 3.1 데이터 소스

- **문항 정의:** `src/constants/questions.js` → `MINI_QUESTIONS`
- **저장 시점:** `MiniResult` 내 `handleLeadClick` → `saveToAirtable("mini", normalizePayload("mini", payload))`

### 3.2 테이블

| 구분 | 값 | Airtable | 일치 |
|------|-----|----------|------|
| 테이블 | `mini` | mini_responses (`tblyZs4j4JY11Sfg8`) | ✅ |

### 3.3 전송 필드·타입·값

| MiniAssessmentView / payload | Airtable 필드 | Airtable 타입 | 전송 | 옵션/문구 일치 |
|------------------------------|----------------|---------------|------|----------------|
| score (계산값) | score | Number | ✅ | ✅ |
| level (양호/보통/주의) | level | Single select | ✅ | ✅ 옵션 동일 |
| answers_json (miniAnswers) | answers_json | Long text | ✅ | ✅ JSON 문자열 |
| created_at | created_at | Date and time | ✅ | ✅ ISO |

**level 옵션:**

- **뷰 상수 (MINI_LEVEL_FOR_AIRTABLE):** `양호`, `보통`, `주의`
- **airtableNormalize mini.singleSelect.level.options:** `["양호", "보통", "주의"]`
- **Airtable 문서:** Single select 옵션 `양호`, `보통`, `주의`  
→ 일치 ✅

### 3.4 문항/라벨 (표시용, mini는 요약만 저장)

- **MINI_QUESTIONS:** id, text, area, scale, type, color 등 — Airtable mini 테이블에는 문항별 컬럼 없음. `answers_json`에 답변만 저장됨.
- **LABELS_5 / LABELS_7:** 미니 문항의 선택지 문구는 UI 전용. Airtable에는 `answers_json` 원본으로만 저장되므로 필드타입/필드값 매핑 이슈 없음 ✅

### 3.5 요약 (Mini)

- **테이블:** mini. **필드·타입·값:** score, level, answers_json, created_at 모두 Airtable 및 airtableNormalize와 맵핑·일치함.

---

## 4. FullAssessmentView.jsx ↔ Airtable

### 4.1 데이터 소스

- **문항/섹션:** `src/constants/questions.js` → `WCWI_QUESTIONS`, `BODY_PARTS`
- **결과 화면:** `FullResult` — **Airtable 저장 없음** (버튼 "이 결과를 HR팀에 공유하기" → `transition("lead", { leadCaptureSource: "full" })`로 리드 캡처로만 이동).

### 4.2 테이블

| 구분 | 값 | Airtable | 비고 |
|------|-----|----------|------|
| 전체 WCWI 결과 저장 | - | wcwi (Assessments) | ❌ 현재 뷰에서 `saveToAirtable("wcwi", ...)` 호출 없음. 전체 진단 결과는 Airtable에 저장되지 않음. |
| 리드 캡처 경로 | full | mini (LeadCapture 시) | "HR팀에 공유" 시 mini 테이블에 리드 정보만 저장 (answers_json 등). |

### 4.3 필드·타입 (뷰 ↔ Airtable 관점)

- **FullQuestions / FullResult:** WCWI 문항 id, scale, type(body/yesno/scale), BODY_PARTS 등은 모두 **UI·점수 계산용**.  
- **wcwi (Assessments) 테이블:** 문서 기준 영문 필드(WHO1_PositiveMood 등) 구조라, 한글 area/문항 id와 1:1 컬럼이 없음.  
- 따라서 **FullAssessmentView**는 현재 “Airtable 테이블/필드타입/필드값”과 직접 매핑되는 전송 구조가 없음.  
- 리드로 넘어갈 때만 **LeadCaptureView**를 통해 mini 등에 저장되며, 그 부분은 LeadCapture 문서에서 다룸.

### 4.4 요약 (Full)

- **테이블/필드 맵핑:** 전체 WCWI 결과용 Airtable 전송은 구현되어 있지 않음. 뷰의 테이블·필드타입·필드값은 Airtable과 “저장 경로” 기준으로 맵핑할 대상이 없음.
- **문구:** LABELS_5, LABELS_7, BODY_PARTS 등은 화면 표시용이며, Airtable 저장이 없어 옵션 문구 검증 불필요.

---

## 5. 종합 체크리스트

| 뷰 | 테이블 | 필드 매핑 | 필드 타입 | 필드값(문구) | 비고 |
|----|--------|-----------|-----------|--------------|------|
| ManagerSurveyView | manager | ⚠️ 4개만 매핑, 6개 미전송 | 매핑된 항목 일치 | Company_size·Required_features 일치, Cheap_price 미전송 | 현재프로그램 등 6필드 미매핑 |
| EmployeeSurveyView | employee | ✅ 전 항목 매핑 | ✅ 일치 | ✅ Likert·chip·multi 옵션 일치 | - |
| MiniAssessmentView | mini | ✅ score, level, answers_json, created_at | ✅ 일치 | ✅ level 옵션 일치 | - |
| FullAssessmentView | - | ❌ WCWI 결과 미저장 | - | - | 전체 진단은 Airtable 미연동 |

---

## 6. 수정 권장 사항 (요약)

1. **ManagerSurveyView / submitMgr**  
   - 현재프로그램 → Current_programs  
   - 건강중요도 → Wellness_importance (옵션: Airtable 문서의 `5 매우그렇다` ~ `1 전혀 아니다`와 동일하게 변환)  
   - 필요서비스 → Needed_services  
   - 애로사항 → Pain_points  
   - 저렴의심가격 → Cheap_price_range (Airtable 옵션 문구에 맞춰 공백/문자 통일 또는 normalize 추가)  
   - 추가의견 → Additional_comments  

2. **Manager Cheap_price_range 옵션**  
   - Airtable과 문구 완전 일치시키기: `인당 5천원 ~1만원`, `인당 1~2만원`, `인당 2~3만원` 등 실제 베이스 옵션 확인 후, surveys.js 또는 airtableNormalize에서 동일 문자열로 보내기.

3. **FullAssessmentView**  
   - 전체 WCWI 결과를 Airtable에 남기려면, wcwi(Assessments) 스키마에 맞는 별도 매핑 설계가 필요함. 현재는 미구현 상태이므로 “맵핑 검증” 대상 아님.

이 검증은 코드·문서 기준이며, Airtable 베이스의 실제 Single/Multiple select 옵션 라벨은 베이스에서 한 번 더 확인하는 것을 권장합니다.
