# Airtable ↔ 프론트엔드 전수 매핑 문서

> **생성일**: 2026-02-15  
> **Base**: WELLINK (`appNDMLyj5VngPHdU`)  
> **프로젝트**: React (Vite) + Vercel Serverless → Airtable REST API  
> **typecast**: 사용하지 않음 — 모든 select/multipleSelect 값은 Airtable choices와 **정확히** 일치해야 함

---

## 목차

1. [폼 인벤토리](#1-폼-인벤토리)
2. [파이프라인 개요](#2-파이프라인-개요)
3. [Employee 설문 매핑](#3-employee-설문-매핑)
4. [Manager 설문 매핑](#4-manager-설문-매핑)
5. [Mini Assessment 매핑](#5-mini-assessment-매핑)
6. [WCWI Full Assessment 매핑](#6-wcwi-full-assessment-매핑)
7. [Lead Capture 매핑](#7-lead-capture-매핑)
8. [에러 리스크 Top 10](#8-에러-리스크-top-10)
9. [검증 방법](#9-검증-방법)
10. [환경변수](#10-환경변수)

---

## 1. 폼 인벤토리

| # | 폼 이름 | 진입 경로 | 소스 파일 | Airtable 테이블 | tableId |
|---|---------|----------|-----------|----------------|---------|
| 1 | Employee 수요조사 | 랜딩 → "재직자/직원" | `src/views/EmployeeSurveyView.jsx` | Employee_Wellness_Market_Survey | `tblGRjbxzVL6E4wUc` |
| 2 | Manager 수요조사 | 랜딩 → "기업 관리자/HR" | `src/views/ManagerSurveyView.jsx` | Wellness Survey Company Responses | `tbl35QbAamOCRvaPk` |
| 3 | Mini Assessment | 랜딩 → "60초 웰니스 체크" | `src/views/MiniAssessmentView.jsx` | mini_responses | `tblyZs4j4JY11Sfg8` |
| 4 | WCWI Full Assessment | 랜딩 → "전체 WCWI 진단" | `src/views/FullAssessmentView.jsx` | Assessments | `tbl8skWY7TdWU0de8` |
| 5 | Lead Capture | 미니 결과 → "기업 문의" 등 | `src/views/LeadCaptureView.jsx` | mini / employee / manager (source별) | — |

**랜딩페이지** (`src/views/LandingView.jsx`)는 데이터를 제출하지 않음. 내비게이션 역할만 수행:
- `transition("mini")` → Mini Assessment
- `transition("full")` → WCWI Full
- `onSelectRole("employee")` → Employee 수요조사
- `onSelectRole("manager")` → Manager 수요조사

---

## 2. 파이프라인 개요

```
[프론트 폼]
    ↓ state (Korean keys)
[App.jsx submit handler]
    ↓ fieldMapping 변환 + 값 변환 (LIKERT, normalizer)
[src/api/airtableNormalize.js]   ← 클라이언트 정규화 (mini/emp/mgr만)
    ↓ normalizePayload(table, raw) → validatePayload(table, fields)
[src/api/airtable.js]
    ↓ POST /api/airtable  {table, fields}
[api/airtable.js]                ← Vercel Serverless
    ↓ getTableSchema() → normalizePayloadWithSchema() → schema 기반 검증
[Airtable REST API]
    ↓ POST /v0/{baseId}/{tableId}  {records: [{fields}]}
    (typecast 미사용)
```

**WCWI 예외**: `buildAssessmentFields()` (contracts/wcwiFieldMap.js)에서 직접 `fieldsById` (fldXXX 키) 생성 → 서버에서 `normalizedTable === "wcwi"` 분기로 바로 전달.

---

## 3. Employee 설문 매핑

**Airtable 테이블**: `Employee_Wellness_Market_Survey` (`tblGRjbxzVL6E4wUc`)  
**정의 파일**: `src/constants/surveys.js` → `EMP_PAGES`  
**제출 핸들러**: `src/App.jsx` lines 218–325  
**API**: `POST /api/airtable` body `{table: "employee", fields: {...}}`

### 3.1 필드 매핑 표

| # | Landing Question Text | Front Key | Required | API Payload Key | Airtable Field | fieldId | Field Type | Transform Rules | Notes / Risk |
|---|----------------------|-----------|----------|----------------|---------------|---------|------------|----------------|--------------|
| 1 | 회사 규모 | `회사규모` | Y | `company_size` | `company_size` | `fld5XMIaEcmBrAMFU` | singleSelect | 문자열 그대로 전달 | choices 일치: `["10명 미만","10~49명","50~200명","200명 이상"]` |
| 2 | 직종 | `직종` | Y | `job_type` | `job_type` | `fldnhhgCtR13eYztS` | singleSelect | 문자열 그대로 전달 | choices 일치: `["사무직","연구/개발","영업/마케팅","생산/현장직","기타"]` |
| 3 | 업무 스타일 | `업무스타일` | Y | `work_style` | `work_style` | `fldPTUW9gy1L2WLxY` | singleSelect | 문자열 그대로 전달. normalizer: `"혼합형"→"혼합형(출근+재택)"` | choices 일치 |
| 4 | 업무로 인해 신체적 불편함을 느낀다. | `신체불편` | Y | `physical_discomfort_level` | `physical_discomfort_level` | `fldNtoGzGNI71qAHK` | singleSelect | `int(1–5) → LIKERT_5[n]` 예: `4 → "4 (그렇다)"` | choices 일치 |
| 5 | 정신적 스트레스를 자주 느낀다. | `정신스트레스` | Y | `mental_stress_level` | `mental_stress_level` | `fldSQkfUcepciBCRl` | singleSelect | `int(1–5) → LIKERT_5[n]` | choices 일치 |
| 6 | 최근 6개월 내 번아웃을 경험했다. | `번아웃경험` | Y | `burnout_experience` | `burnout_experience` | `fldYG3LdqFLsEHQXV` | singleSelect | `int(1–5) → LIKERT_5[n]` | choices 일치 |
| 7 | 웰니스 프로그램 참여 의향이 있다. | `참여의향` | Y | `need_for_wellness_service` | `need_for_wellness_service` | `fldHOb9Dy9E3BuSgX` | singleSelect | `int(1–5) → LIKERT_5[n]` | choices 일치. 의미 불일치: "참여의향"→"need_for_wellness_service" |
| 8 | 관심 있는 프로그램 (복수 선택) | `관심프로그램` | Y | `preferred_program_type` | `preferred_program_type` | `fld0YburJmcDlUFKO` | multipleSelects | 배열 그대로 전달 | choices 일치: `["근골격계 스트레칭","명상/호흡","번아웃 관리","수면/회복","감정 관리","기타"]` |
| 9 | 유료 시 비용 지불 의향 | `유료지불의향` | Y | `interest_in_short_program` | `interest_in_short_program` | `fld8WdQcHrNtkxPcd` | singleSelect | `int(1–5) → LIKERT_5[n]` | choices 일치. 의미 불일치: "유료지불의향"→"interest_in_short_program" |
| 10 | 월 지불 가능 금액 | `월지불금액` | Y | `payment_amount` | `payment_amount` | `fldAobZto4HShKELJ` | **multipleSelects** | **chip(단일선택) → 문자열 → normalizer가 `[val]` 배열로 래핑** | ⚠️ Airtable은 multipleSelects이지만 프론트 UI는 chip(단일선택). normalizer의 `normalizePaymentAmount()`에서 `[val]`로 래핑하므로 동작은 함. |
| 11 | 회사에서 디지털 웰니스 서비스를 제공하면 사용하겠다. | `서비스사용의향` | Y | `willingness_to_use_service` | `willingness_to_use_service` | `fldd1qMIuZf5lwEIF` | singleSelect | `int(1–5) → LIKERT_5_WILLINGNESS[n]` 예: `1→"1 (매우있다)"` | **역방향 스케일**: 1=긍정, 5=부정. choices 일치 |
| 12 | 회사가 직원 웰니스에 비용을 투자해야 한다. | `기업투자필요` | Y | `company_support_expectation` | `company_support_expectation` | `fldCFN182M9EBopg6` | singleSelect | `int(1–5) → LIKERT_5[n]` | choices 일치 |
| 13 | 기대하는 점이나 우려되는 점 (선택) | `기대우려` | N | `open_feedback` | `open_feedback` | `fldA6O1OlgCTbgWV1` | multilineText | 문자열 그대로 | — |
| 14 | 이메일 (placeholder: example@company.com) | `empEmail` | Y | `Email` | `Email` | `fld9YPwyEUNwouwMy` | singleLineText | regex 검증 후 그대로 전달 | — |
| — | *(자동 주입)* | — | — | `source` | `source` | `fldotPAGfsAFkXDmD` | singleSelect | 하드코딩 `"기타"` | choices: `["내부 링크","외부 캠페인","직접 방문","기타"]` |
| — | *(자동 주입)* | — | — | `created_time` | `created_time` | `fldR0JYXilQmDAOuF` | createdTime (readOnly) | `new Date().toISOString()` | ⚠️ readOnly 필드에 쓰기 → Airtable이 무시. 데드 코드. |

### 3.2 LIKERT 변환 상수

```
LIKERT_5 = { 1: "1 (전혀 아니다)", 2: "2 (아니다)", 3: "3 (보통이다)", 4: "4 (그렇다)", 5: "5 (매우 그렇다)" }
LIKERT_5_WILLINGNESS = { 1: "1 (매우있다)", 2: "2 (있다)", 3: "3 (보통이다)", 4: "4 (별로없다)", 5: "5 (전혀없다)" }
LIKERT_KEYS = ["신체불편","정신스트레스","번아웃경험","참여의향","유료지불의향","기업투자필요"]
```

### 3.3 Airtable에만 있고 코드에서 안 쓰는 필드

| fieldName | fieldId | type | 비고 |
|-----------|---------|------|------|
| `Agreement` | `fldUghbQIEgJzoRMY` | singleSelect `["네, 동의합니다."]` | ❌ **empConsent가 매핑되지 않음** — 항상 비어있음 |
| `response_id` | `fldCZwQ0D0OrXxHdd` | formula (readOnly) | 자동 생성 |
| `overall_wellness_need_score` | `fldykEGAeCejUWZwF` | formula (readOnly) | 자동 계산 |
| `AI_Feedback_Summary` | `fldayRaTo9pUYkb4Q` | aiText (readOnly) | AI 생성 |
| `AI_Need_Category` | `fldeNUN5uAAKJeZwA` | aiText (readOnly) | AI 생성 |
| `Created time` | `fldTq5sfiEyr8uDWZ` | createdTime (readOnly) | 자동 |

---

## 4. Manager 설문 매핑

**Airtable 테이블**: `Wellness Survey Company Responses` (`tbl35QbAamOCRvaPk`)  
**정의 파일**: `src/constants/surveys.js` → `MGR_PAGES`  
**제출 핸들러**: `src/App.jsx` lines 327–410  
**API**: `POST /api/airtable` body `{table: "manager", fields: {...}}`

### 4.1 필드 매핑 표

| # | Landing Question Text | Front Key | Required | API Payload Key | Airtable Field | fieldId | Field Type | Transform Rules | Notes / Risk |
|---|----------------------|-----------|----------|----------------|---------------|---------|------------|----------------|--------------|
| 1 | 현재 기업 인원 | `기업인원` | Y | `Company_size` | `Company_size` | `fldyJwqjFsqVgUQPN` | singleSelect | `companySizeToAirtable()`: `"10~50명"→"10-50명"` (UI opts는 이미 하이픈 사용) | choices 일치. 변환 함수는 중복(안전장치). |
| 2 | 현재 운영 중인 직원 웰빙 프로그램 | `현재프로그램` | Y | `Current_programs` | `Current_programs` | `fldPka9AJFk4J8osa` | multilineText | 그대로 전달 | — |
| 3 | 직원 건강이 기업 성과에 중요하다고 생각한다. | `건강중요도` | Y | `Wellness_importance` | `Wellness_importance` | `fldYHgiPj50BcSyde` | **multipleSelects** | `int(1–5) → normalizeWellnessImportance() → ["4 그렇다"]` 단일원소 배열 | ⚠️ 리커트 단일선택이지만 Airtable은 multipleSelects — 항상 1-element array 전송. 동작은 함. |
| 4 | 성과 향상과 복지를 위해 가장 필요한 서비스가 무엇이라고 생각하시나요? | `필요서비스` | Y | `Needed_services` | `Needed_services` | `fldA550dWEG1ThiuH` | multilineText | 그대로 전달 | — |
| 5 | 직원 복지 서비스 개선의 애로 사항이 있다면, 무엇인가요? | `애로사항` | Y | `Pain_points` | `Pain_points` | `fldN02HQpcgxy1oI0` | multilineText | 그대로 전달 | — |
| 6 | 디지털 기반 웰니스 서비스에 관심이 있나요? | `디지털웰니스관심` | Y | `Adoption_interest` | `Adoption_interest` | `fldXWrduSw1Xrqv5G` | singleSelect | 그대로 전달 | choices 일치: `["있음","없음"]` |
| 7 | 제공 되길 원하는 서비스 기능이 무엇인가요?(복수 선택) | `필요기능` | Y | `Required_features` | `Required_features` | `fld7MJL75o9wlHaHR` | multipleSelects | normalizer: 약칭→정칙 매핑 | 🔴 **BUG**: SCHEMA allowlist에 `"정신건강 콘텐츠"`(공백 없음), UI/Airtable은 `"정신 건강 콘텐츠"`(공백 있음) — 이 선택지 **항상 누락** |
| 8 | 전문성이 의심될 정도로 저렴한 서비스 비용은 어느 정도인가요? | `저렴의심가격` | Y | `Cheap_price_range` | `Cheap_price_range` | `fldkyJMTU1iknAUx4` | singleSelect | normalizer: 틸드→하이픈 | choices 일치 |
| 9 | 가장 합리적인 서비스 비용은 어느 정도 인가요? | `합리적가격` | Y | `Reasonable_price` | `Reasonable_price` | `fldRn89yzO4Rerd1S` | multilineText | 그대로 전달 | — |
| 10 | 추가 바라는 점이나 우려사항 | `추가의견` | N | `Additional_comments` | `Additional_comments` | `fldCU0eH26UGHaMfx` | multilineText | 그대로 전달 | — |
| 11 | 이메일 (placeholder: example@company.com) | `mgrEmail` | Y | `Email` | `Email` | `fldhtBwLt62iOF2nM` | email | regex 검증 후 전달 | — |

### 4.2 Airtable에만 있고 코드에서 안 쓰는 필드

| fieldName | fieldId | type | 비고 |
|-----------|---------|------|------|
| `Agreement` | `fldadpR5XZQtavfBR` | singleSelect `["네,동의합니다."]` | ❌ **mgrConsent가 매핑되지 않음** — 항상 비어있음 |
| `Other_features` | `fldVUrjnEMzV5wx07` | multilineText | ❌ "기타" 선택 시 상세 내용 입력 불가 — 항상 비어있음 |
| `Service_Demand` | `fldic1nV9mSlrGvwc` | singleSelect `["의향이 있다.","의향이 없다. "]` | 매핑 없음 (trailing space 주의) |
| `Company` | `fld7wkPlkf785F1q3` | multipleRecordLinks | Airtable 자동화 또는 수동 |
| `Created_time` | `fldQjaLRrlrbqPQTF` | createdTime (readOnly) | 자동 |
| `Attachments` | `fldoxPG8BLCdf0Cai` | multipleAttachments | 미사용 |

---

## 5. Mini Assessment 매핑

**Airtable 테이블**: `mini_responses` (`tblyZs4j4JY11Sfg8`)  
**질문 정의**: `src/constants/questions.js` → `MINI_QUESTIONS`  
**결과 계산**: `MiniAssessmentView.jsx` 내부 `getScore()`  
**제출 핸들러**: `MiniAssessmentView.jsx` → `handleLeadClick()`  
**API**: `POST /api/airtable` body `{table: "mini", fields: {...}}`

### 5.1 질문 목록 (저장 아님 — answers_json에 직렬화)

| # | Question ID | Question Text | 영역 | 응답 형식 | Reversed |
|---|------------|--------------|------|----------|----------|
| 1 | `mini1` | 최근 2주간 기분이 밝고 활기차다고 느꼈습니까? | 정신적 웰빙 | 5점 리커트 (전혀 아님–항상) | N |
| 2 | `mini2` | 내 삶에 목적과 방향이 있다고 느낀다 | 심리적 웰빙 | 7점 리커트 | N |
| 3 | `mini3` | 육체적으로 지쳐있다고 느끼는 빈도는? | 번아웃 | 5점 리커트 | **Y** |
| 4 | `mini4` | 최근 7일 내에 신체 통증이나 불편감이 있었습니까? | 신체 건강 | yes/no | N |
| 5 | `mini5` | 나는 내 삶에 만족한다 | 삶의 만족도 | 7점 리커트 | N |

### 5.2 필드 매핑 표

| # | API Payload Key | Airtable Field | fieldId | Field Type | Transform Rules | Notes / Risk |
|---|----------------|---------------|---------|------------|----------------|--------------|
| 1 | `score` | `score` | `fldxhpjb5uxaWEEtA` | number | `Math.round(getScore())` 0–100 | — |
| 2 | `level` | `level` | `fld2cMPErFKbKvI1Q` | singleSelect | score→한글: `≥75→"양호"`, `≥50→"보통"`, else→`"주의"` | choices: `["양호","보통","주의"]` |
| 3 | `answers_json` | `answers_json` | `fldDxNOqOONZigtpw` | multilineText | `JSON.stringify(miniAnswers)` | 개별 응답은 이 JSON blob 안에만 존재 |
| 4 | `created_at` | `created_at` | `fldZ2VkVQibgvcFAP` | dateTime | `new Date().toISOString()` | — |
| — | *(없음)* | `email` | `fld5AdBN1G69JgENn` | singleLineText | — | ⚠️ handleLeadClick에서 email 미전송. LeadCapture 경로에서만 전송됨 |
| — | *(없음 → 기본값)* | `source` | `fld5sosIYxFU2Jy3s` | singleSelect | normalizer 기본값 `"app"` | choices: `["web","app"]` |
| — | *(없음)* | `utm` | `fld1kVqqIRvDr2str` | singleLineText | — | 항상 비어있음 |

---

## 6. WCWI Full Assessment 매핑

**Airtable 테이블**: `Assessments` (`tbl8skWY7TdWU0de8`)  
**질문 정의**: `src/constants/questions.js` → `WCWI_QUESTIONS`  
**fieldId 매핑**: `contracts/wcwiFieldMap.js`  
**점수 계산**: `src/utils/scoreUtils.js` → `calculateFullScores()`  
**payload 빌더**: `contracts/wcwiFieldMap.js` → `buildAssessmentFields()`  
**제출 핸들러**: `FullAssessmentView.jsx` → `FullConsentForm.handleSubmit()`  
**API**: `POST /api/airtable` body `{table: "wcwi", fields: fieldsById}` — **fieldId 키 사용**

### 6.1 답변 필드 매핑 (24문항)

#### 6.1.1 WHO-5 정신적 웰빙 (5점 스케일)

| qId | Question Text | fieldId | Airtable fieldName | Transform | Airtable Choices |
|-----|--------------|---------|-------------------|-----------|-----------------|
| `m1` | 최근 2주간 기분이 밝고 활기차다고 느꼈습니까? | `fldne4LTzXtyY3dPP` | `WHO1_PositiveMood` | `SCALE_5_TO_CHOICE[val]` | `["1: 전혀 아니다","2: 아니다","3: 보통이다","4: 그렇다","5: 매우 그렇다"]` |
| `m2` | 최근 2주간 차분하고 편안한 기분을 느꼈습니까? | `fldRiFiDH7HDHRkAT` | `WHO2_Calm` | 동일 | 동일 |
| `m3` | 아침에 개운하게 일어났다고 느꼈습니까? | `fldRkpUeeBUbt3omL` | `WHO3_Energy` | 동일 | 동일 |
| `m4` | 일상이 흥미로운 것들로 가득하다고 느꼈습니까? | `fldv1C1IfJCRTP1RT` | `WHO4_RestfulSleep` | 동일 | 동일 |
| `m5` | 전반적으로 활력이 넘친다고 느꼈습니까? | `fldnCQji2UEvwzYWs` | `WHO5_MeaningfulDays` | 동일 | 동일 |

#### 6.1.2 Ryff PWB 심리적 웰빙 (7점 스케일)

| qId | Question Text | fieldId | Airtable fieldName | Transform | Airtable Choices |
|-----|--------------|---------|-------------------|-----------|-----------------|
| `p1` | 나는 내 결정을 스스로 내리는 편이다 | `fldfawDMss0ouL0bk` | `RYF6_Autonomy` | `SCALE_7_TO_CHOICE[val]` | `["1: 전혀 동의하지 않음","2: 동의하지 않음","3: 약간 동의하지 않음","4: 중립","5: 약간 동의함","6: 동의함","7: 매우 동의함"]` |
| `p2` | 나는 일상에서의 요구사항들을 잘 관리하고 있다 | `fldn8gzwzNPH3eWCn` | `RYF7_EnvMastery` | 동일 | 동일 |
| `p3` | 나는 새로운 경험을 통해 성장하고 있다고 느낀다 | `fldusWlRYkgodcORe` | `RYF8_Growth` | 동일 | 동일 |
| `p4` | 주변 사람들과 따뜻하고 신뢰 있는 관계를 맺고 있다 | `fldWseIPvBu2XBADR` | `RYF9_Relations` | 동일 | 동일 |
| `p5` | 내 삶에 목적과 방향이 있다고 느낀다 | `fldxM93hZ2QPlxN5S` | `RYF10_Purpose` | 동일 | 동일 |
| `p6` | 전반적으로 나 자신에 대해 긍정적으로 느낀다 | `fldWSshu8ec2neWI9` | `RYF11_SelfAcceptance` | 동일 | 동일 |

#### 6.1.3 CBI 번아웃/피로 (5점 역방향 스케일)

| qId | Question Text | fieldId | Airtable fieldName | Transform | Airtable Choices |
|-----|--------------|---------|-------------------|-----------|-----------------|
| `b1` | 육체적으로 지쳐있다고 느끼는 빈도는? | `fldG44pdDaaslsRB6` | `CBI12_PhysicalFatigue` | `CBI_SCALE_5_REVERSED[val]` | `["0: 전혀 아니다","1: 거의 아니다","2: 보통이다","3: 그렇다","4: 항상 그렇다"]` |
| `b2` | 정서적으로 소진되었다고 느끼는 빈도는? | `fld84SCv0kouPShB9` | `CBI13_EmotionalExhaustion` | 동일 | 동일 |
| `b3` | 업무가 감당하기 어렵다고 느끼는 빈도는? | `fldtUHnZALxxZdMmn` | `CBI14_TiredBeforeWork` | 동일 | 동일 |
| `b4` | 하루가 끝나면 완전히 녹초가 되는 빈도는? | `fldPTvWbPa6ST4JCW` | `CBI15_WorkDrainsMe` | 동일 | 동일 |
| `b5` | 일이 나를 감정적으로 힘들게 하는 빈도는? | `fldBxhEpgKWXvyWhu` | `CBI16_InteractionDrainsMe` | 동일 | 동일 |

#### 6.1.4 NMQ 신체·근골격 (body parts + yes/no)

| qId | Question Text | fieldId | Airtable fieldName | Field Type | Transform |
|-----|--------------|---------|-------------------|-----------|-----------|
| `ph1` | 최근 12개월간 목, 어깨, 허리 등에 통증을 느꼈습니까? | `fldVOdE6txdzrKIMU` | `NMQ17_PainSites_12m` | multipleSelects | `bodyParts.map(BODY_PART_TO_NMQ)` — 한국어→영어 |
| `ph2` | 최근 7일 내에 신체 통증이나 불편감이 있었습니까? | `fldCng6JgSFrcmN9U` | `NMQ18_Pain_7d` | checkbox | `val === "yes" → true` |
| `ph3` | 신체 증상이 일상이나 업무에 영향을 미쳤습니까? | `fldJ73z3VNr6GY8uk` | `NMQ19_LimitedActivity` | checkbox | `val === "yes" → true` |

**Body Part 매핑 (한→영)**:

| 프론트 한국어 | Airtable 영어 |
|-------------|-------------|
| 목 | Neck |
| 어깨 | Shoulder |
| 팔꿈치 | Other |
| 손목/손 | WristHand |
| 상부 등 | UpperBack |
| 하부 등(허리) | LowerBack |
| 엉덩이/허벅지 | Hip |
| 무릎 | KneeLeg |
| 발목/발 | FootAnkle |

> ⚠️ "팔꿈치"→"Other"로 매핑되어 구체적 정보 손실

#### 6.1.5 SWLS 삶의 만족도 (7점 스케일)

| qId | Question Text | fieldId | Airtable fieldName | Transform | Airtable Choices |
|-----|--------------|---------|-------------------|-----------|-----------------|
| `s1` | 대체로 내 삶은 내가 이상적으로 여기는 것에 가깝다 | `fld1uE40P09pgEicf` | `SWLS20_IdealLife` | `SCALE_7_TO_CHOICE[val]` | (Ryff 7점과 동일) |
| `s2` | 내 삶의 조건은 훌륭하다 | `fldu6zQNbM8EriUnT` | `SWLS21_GoodConditions` | 동일 | 동일 |
| `s3` | 나는 내 삶에 만족한다 | `fld9oPsqCaAJPj1wP` | `SWLS22_Satisfied` | 동일 | 동일 |
| `s4` | 지금까지 삶에서 원하는 중요한 것들을 얻었다 | `fld6QJJudbBHaqGaR` | `SWLS23_AchievedImportant` | 동일 | 동일 |
| `s5` | 다시 살더라도 거의 바꾸지 않을 것이다 | `fldkCklZa50K68VOm` | `SWLS24_ChangeLittle` | 동일 | 동일 |

### 6.2 점수 필드 (계산값, 0–100 정수)

| 점수명 | Computation | fieldId | Airtable fieldName | Transform |
|--------|------------|---------|-------------------|-----------| 
| S_WHO5_0_100 | `scores.mental` | `flddMf0nbipPDrZv9` | `S_WHO5_0_100` | `Math.round(clamp(val, 0, 100))` |
| S_Ryff_0_100 | `scores.psychological` | `fldYEHeouS37B8Eur` | `S_Ryff_0_100` | 동일 |
| S_CBI_0_100 | `scores.burnout` (risk, 높을수록 나쁨) | `fldPcdZGahYBhmp3C` | `S_CBI_0_100` | 동일 |
| S_CBI_Health_0_100 | `100 - scores.burnout` | `fldNdTvdKC6CwRADh` | `S_CBI_Health_0_100` | 동일 |
| S_NMQ_Risk_0_100 | `100 - scores.physical` | `fldN10hC4GlVWOxu8` | `S_NMQ_Risk_0_100` | 동일 |
| S_NMQ_Health_0_100 | `scores.physical` | `fld7Dq7Z0RWHQU7n9` | `S_NMQ_Health_0_100` | 동일 |
| S_SWLS_0_100 | `scores.satisfaction` | `fldGH1kZ0r0fCMJ4s` | `S_SWLS_0_100` | 동일 |
| WCWI_Total_0_100 | `scores.total` | `fld0zB2jboYOo9jgu` | `WCWI_Total_0_100` | 동일 |

**무결성 규칙**:
- `S_CBI_0_100 + S_CBI_Health_0_100 ≈ 100` (±1 반올림 허용)
- `S_NMQ_Risk_0_100 + S_NMQ_Health_0_100 ≈ 100` (±1 반올림 허용)

### 6.3 공통/파생 필드

| 용도 | 코드 키 | fieldId 값 (실제 전송 키) | Airtable fieldName | Type | 계산 로직 | Choices |
|-----|---------|--------------------------|-------------------|------|----------|---------|
| 이메일 | `email` | `flddCKoLMZxYnVxym` | `이메일` | email | `String(email).trim()` | — |
| 티어 | `tier` | `fldPQs5ojYryn9bEU` | `WCWI_Tier` | singleSelect | total≥80→Excellent, ≥60→Good, ≥40→Watch, else→At Risk | `["Excellent","Good","Watch","At Risk"]` |
| 주요 이슈 | `primaryIssue` | `fldxwe1RuRLeRnOex` | `WCWI_PrimaryIssue` | singleSelect | 가장 낮은 건강 점수 영역 (±3 동점 시 우선순위: Burnout > Musculoskeletal > Mood > Psychological > Life Satisfaction) | `["Burnout/Fatigue","Musculoskeletal","Mood/Well-being","Psychological Well-being","Life Satisfaction"]` |
| 동의 여부 | `consentAgreed` | **`"Consent_Agreed"`** (문자열) | — | — | 하드코딩 `true` | — |
| 동의 버전 | `consentVersion` | **`"Consent_Version"`** (문자열) | — | — | 하드코딩 `"v1_2026-02-15"` | — |
| NMQ 위험 등급 | `nmqRiskTier` | **`"NMQ_RiskTier"`** (문자열) | — | — | nmqRisk ≤33→Low, ≤66→Moderate, else→High | — |

> 🔴 **CRITICAL**: `Consent_Agreed`, `Consent_Version`, `NMQ_RiskTier`는 **실제 Airtable fieldId/fieldName이 아닌 문자열 리터럴**. Airtable 스키마에 해당 필드가 없으므로 데이터가 저장되지 않거나 무시됨.

### 6.4 Airtable에만 있고 코드에서 안 쓰는 필드

| fieldName | fieldId | type | 비고 |
|-----------|---------|------|------|
| `Assessment_ID` | `fldOAP3WHTB6oHkoP` | autoNumber (readOnly) | 자동 |
| `Participant_ID` | `fldsuG2dFtkk0rFEz` | multipleRecordLinks | 미매핑 |
| `Program_ID` | `fldhG2h3NauFf66Db` | multipleRecordLinks | 미매핑 |
| `CBI_RiskTier` | `fldoADrBNvxOuT1au` | singleSelect `["High","Moderate","Low"]` | ❌ **코드는 `"NMQ_RiskTier"` 키로 전송 → 이 필드는 항상 비어있음** |
| `Assessment_Notes` | `fldJ8GjzdVJz9OMkZ` | aiText (readOnly) | AI 자동 |
| `Created time` | `fldEbrtc2IJ1cSDNh` | createdTime (readOnly) | 자동 |

---

## 7. Lead Capture 매핑

**소스 파일**: `src/views/LeadCaptureView.jsx`  
**라우팅**: `leadCaptureSource` prop에 따라 다른 테이블로 전송

### 7.1 사용자 입력 필드

| Label | State Key | Input Type | Required |
|-------|----------|-----------|----------|
| 이메일 | `email` | email | Y (regex 검증) |
| 회사명 | `company` | text | N |
| 직책/역할 | `role` | select | N |

**역할 선택지**: hr→"HR 담당자", ceo→"경영진/CEO", welfare→"복지 담당자", employee→"일반 직원", other→"기타"

### 7.2 Source별 라우팅 및 페이로드

| leadCaptureSource | Target Table | Source Label |
|-------------------|-------------|-------------|
| `"mini"` | mini (`tblyZs4j4JY11Sfg8`) | `"기업감사신청"` |
| `"full"` | mini (`tblyZs4j4JY11Sfg8`) | `"full_result"` |
| `"employee"` | employee (`tblGRjbxzVL6E4wUc`) | `"lead_from_employee"` |
| `"manager"` | manager (`tbl35QbAamOCRvaPk`) | `"lead_from_manager"` |

### 7.3 테이블별 페이로드

#### mini 테이블로 전송 시 (source: mini/full)

| Payload Key | Value | → Airtable Field | fieldId | Type |
|------------|-------|-----------------|---------|------|
| `email` | `email` | `email` | `fld5AdBN1G69JgENn` | singleLineText |
| `created_at` | `new Date().toISOString()` | `created_at` | `fldZ2VkVQibgvcFAP` | dateTime |
| `source` | `"app"` | `source` | `fld5sosIYxFU2Jy3s` | singleSelect |
| `answers_json` | `JSON.stringify({email, company, role, source_type})` | `answers_json` | `fldDxNOqOONZigtpw` | multilineText |

> ⚠️ score/level 없이 mini 테이블에 불완전 레코드 생성 — 실제 미니 평가 레코드와 혼재됨.

#### employee 테이블로 전송 시

| Payload Key | Value | → Airtable Field | fieldId | Type |
|------------|-------|-----------------|---------|------|
| `Email` | `email` | `Email` | `fld9YPwyEUNwouwMy` | singleLineText |
| `source` | `"기타"` | `source` | `fldotPAGfsAFkXDmD` | singleSelect |
| `open_feedback` | `"Lead capture (기업 문의)\n회사: ${company}\n..."` | `open_feedback` | `fldA6O1OlgCTbgWV1` | multilineText |

#### manager 테이블로 전송 시

| Payload Key | Value | → Airtable Field | fieldId | Type |
|------------|-------|-----------------|---------|------|
| `Email` | `email` | `Email` | `fldhtBwLt62iOF2nM` | email |
| `Additional_comments` | `"Lead capture (기업 문의)\n회사: ${company}\n..."` | `Additional_comments` | `fldCU0eH26UGHaMfx` | multilineText |

---

## 8. 에러 리스크 Top 10

아래는 "일부 항목만 저장되고 일부는 에러"가 나는 케이스를 기준으로, 가장 터지기 쉬운 불일치 Top 10입니다.

| # | 심각도 | 폼 | 필드 | 문제 | 코드 위치 | Quick Fix |
|---|--------|-----|------|------|----------|-----------|
| 1 | 🔴 HIGH | Manager | `Required_features` → `"정신 건강 콘텐츠"` | SCHEMA allowlist에 `"정신건강 콘텐츠"`(공백 없음)만 있고, UI/Airtable은 `"정신 건강 콘텐츠"`(공백 있음). 이 선택지가 **매번 무시(드롭)됨**. | `src/api/airtableNormalize.js:100` | `"정신건강 콘텐츠"` → `"정신 건강 콘텐츠"` 수정 |
| 2 | 🔴 HIGH | WCWI | `Consent_Agreed`, `Consent_Version` | `WCWI_COMMON_FIELD_IDS`에 문자열 리터럴(`"Consent_Agreed"`, `"Consent_Version"`)이 fieldId 대신 사용됨. Airtable 스키마에 해당 필드 없음 → 무시됨/에러. | `contracts/wcwiFieldMap.js:100-101` | Airtable에 필드 생성 후 실제 fieldId로 교체, 또는 해당 코드 제거 |
| 3 | 🔴 HIGH | WCWI | `NMQ_RiskTier` → `CBI_RiskTier` | 코드가 `"NMQ_RiskTier"` 키로 전송하지만 Airtable 실제 필드는 `CBI_RiskTier` (fieldId: `fldoADrBNvxOuT1au`). NMQ 위험 등급 저장 안 됨, CBI_RiskTier 항상 비어있음. | `contracts/wcwiFieldMap.js:102` | `"NMQ_RiskTier"` → `"fldoADrBNvxOuT1au"` 수정 |
| 4 | 🟡 MED | Employee | `empConsent` → `Agreement` | 동의 체크박스를 UI에서 받지만 Airtable `Agreement` 필드에 매핑하지 않음. 컴플라이언스 데이터 누락. | `src/App.jsx:218-325` (fieldMapping에 Agreement 없음) | `mappedFields["Agreement"] = "네, 동의합니다."` 추가 |
| 5 | 🟡 MED | Manager | `mgrConsent` → `Agreement` | 동일 이슈. Manager 동의 체크박스가 Airtable에 저장되지 않음. | `src/App.jsx:327-410` (fieldMapping에 Agreement 없음) | `mappedFields["Agreement"] = "네,동의합니다."` 추가 (공백 없음 주의) |
| 6 | 🟡 MED | Mini/Lead | score/level 없는 레코드 | LeadCapture가 mini 테이블에 score/level 없이 레코드 생성 → 분석 시 null score 혼재. | `src/views/LeadCaptureView.jsx:46-55` | score=0, level="주의" 기본값 추가, 또는 별도 테이블 사용 |
| 7 | 🟡 MED | Employee | `Agreement` normalizer 불일치 | 서버 normalizer synonym: `"예,동의합니다."→"네, 동의합니다."`. 만약 코드에서 `"예,동의합니다."`를 전송하면 synonym 경유 후 Airtable choice `"네, 동의합니다."`로 변환되어야 하지만, 현재 Agreement 자체가 전송되지 않아 잠재 리스크. | `api/lib/airtableNormalize.js:57` | 전송 시작 후 확인 필요. Employee Airtable choice는 `"네, 동의합니다."` |
| 8 | 🟡 MED | Manager | `Other_features` 미매핑 | "기타" 선택 시 상세 설명 입력 UI 없음. Airtable `Other_features` 필드 항상 비어있음. | `src/constants/surveys.js:68`, `src/views/ManagerSurveyView.jsx` | 조건부 textarea 추가 또는 기획 결정 필요 |
| 9 | 🟠 LOW | Employee | `payment_amount` type 불일치 | Airtable: multipleSelects, UI: chip(단일선택). normalizer가 `[val]`로 래핑하여 동작하지만 의미적 부조화. | `src/api/airtableNormalize.js:307-309` | 동작은 정상. Airtable을 singleSelect로 변경하거나 유지. |
| 10 | 🟠 LOW | WCWI | `"팔꿈치"→"Other"` 정보 손실 | "팔꿈치" 선택이 "Other"로 매핑되어 다른 "기타" 부위와 구분 불가. | `contracts/wcwiFieldMap.js` BODY_PART_TO_NMQ | Airtable에 "Elbow" choice 추가 필요 |

---

## 9. 검증 방법

### 9.1 기존 스크립트 재사용

프로젝트에 이미 검증용 스크립트가 존재합니다:

| 스크립트 | 용도 | 실행 방법 |
|---------|------|----------|
| `scripts/dump-airtable-schema.js` | Airtable 스키마를 JSON으로 덤프 | `node scripts/dump-airtable-schema.js` |
| `scripts/contract-diff.js` | form_contract vs airtable_contract 비교 | `node scripts/contract-diff.js` |
| `scripts/test-airtable-dryrun.js` | dryRun=1 API 테스트 | `node scripts/test-airtable-dryrun.js` |
| `scripts/validate-airtable-payloads.test.js` | 정규화 레이어 유닛 테스트 | `node scripts/validate-airtable-payloads.test.js` |
| `scripts/extract-form-contract.js` | 프론트 폼 계약 추출 | `node scripts/extract-form-contract.js` |

### 9.2 dryRun 검증

```bash
# Vercel dev 서버 실행 후:
curl -X POST http://localhost:3000/api/airtable?dryRun=1 \
  -H "Content-Type: application/json" \
  -d '{"table":"wcwi","fields":{"flddCKoLMZxYnVxym":"test@example.com","fld0zB2jboYOo9jgu":75}}'
```

dryRun 응답에는 `targetTable`, `normalizedFields`, `validationErrors`, `wcwiScoreFieldIdReport`가 포함됩니다.

### 9.3 스키마 확인 명령

```bash
# 특정 테이블 스키마 확인 (기존 스크립트)
node scripts/dump-airtable-schema.js
# → docs/airtable_schema.json 및 contracts/airtable_contract.json 생성

# contract diff 확인
node scripts/contract-diff.js
# → contracts/contract_diff.json 생성
```

필요한 환경변수: `.env.local`에 `AIRTABLE_PAT`, `AIRTABLE_BASE_ID`, `AIRTABLE_TABLE_*` 설정 필요.

---

## 10. 환경변수

| 변수명 | 용도 | 필수 |
|--------|------|------|
| `AIRTABLE_PAT` | Airtable Personal Access Token | Y |
| `AIRTABLE_BASE_ID` | Base ID (`appNDMLyj5VngPHdU`) | Y |
| `AIRTABLE_TABLE_EMPLOYEE` | Employee 테이블 ID (`tblGRjbxzVL6E4wUc`) | Y |
| `AIRTABLE_TABLE_MANAGER` | Manager 테이블 ID (`tbl35QbAamOCRvaPk`) | Y |
| `AIRTABLE_TABLE_WCWI` | Assessments 테이블 ID (`tbl8skWY7TdWU0de8`) | Y |
| `AIRTABLE_TABLE_MINI` | Mini 테이블 ID (`tblyZs4j4JY11Sfg8`) | Y |
| `AIRTABLE_SELECT_INVALID_HANDLING` | `ERROR` / `SYNONYM_MAP` / `OTHER_FALLBACK` (기본: `ERROR`) | N |
