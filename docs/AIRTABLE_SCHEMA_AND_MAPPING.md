# Airtable Base 스키마 및 React Payload 매핑

Base ID: `appNDMLyj5VngPHdU`  
Meta API로 조회한 4개 테이블 스키마 및 React 코드와의 1:1 매핑·불일치 정리.

---

## 1. 테이블별 스키마

### 1.1 mini (mini_responses) — `tblyZs4j4JY11Sfg8`

| 필드명 | 필드 타입 | 비고 |
|--------|-----------|------|
| score | **Number** (precision 0) | |
| created_at | **Date and time** (ISO, UTC) | |
| email | **Single line text** | |
| level | **Single select** | 옵션: `양호`, `보통`, `주의` |
| answers_json | **Long text** (multilineText) | |
| source | **Single select** | 옵션: `web`, `app` |
| utm | **Single line text** | |

---

### 1.2 employee (Employee_Wellness_Market_Survey) — `tblGRjbxzVL6E4wUc`

| 필드명 | 필드 타입 | Single/Multi Select 옵션 |
|--------|-----------|---------------------------|
| response_id | **Formula** (read-only) | RECORD_ID() |
| Email | **Single line text** | |
| company_size | **Single select** | `10명 미만`, `10~49명`, `50~200명`, `200명 이상` |
| job_type | **Single select** | `사무직`, `연구/개발`, `영업/마케팅`, `생산/현장직`, `기타` |
| work_style | **Single select** | `전일 출근`, `재택 근무`, `혼합형(출근+재택)` |
| physical_discomfort_level | **Single select** | `5 (매우 그렇다)` ~ `1 (전혀 아니다)` |
| mental_stress_level | **Single select** | `5 (매우 그렇다)` ~ `1 (전혀 아니다)` |
| burnout_experience | **Single select** | `5 (매우 그렇다)` ~ `1 (전혀 아니다)` |
| need_for_wellness_service | **Single select** | `5 (매우 그렇다)` ~ `1 (전혀 아니다)` |
| interest_in_short_program | **Single select** | `5 (매우 그렇다)` ~ `1 (전혀 아니다)` |
| willingness_to_use_service | **Single select** | `1 (매우 아니다)` ~ `5 (매우 그렇다)` |
| preferred_program_type | **Multiple select** | `근골격계 스트레칭`, `명상/호흡`, `번아웃 관리`, `수면/회복`, `감정 관리`, `기타` |
| company_support_expectation | **Single select** | `5 (매우 그렇다)` ~ `1 (전혀 아니다)` |
| open_feedback | **Long text** | (기대우려 등 자유 텍스트) |
| overall_wellness_need_score | **Formula** (read-only) | AVERAGE of 4 likert fields |
| payment_amount | **Multiple select** | `1만원 미만`, `1만원~3만원`, `3만원~5만원`, `5만원 이상`, `가격에 따라 결정` |
| created_time | **Created time** (read-only) | |
| source | **Single select** | `웹 사이트`, `이메일 캠페인`, `직접 방문`, `기타` |
| AI_Feedback_Summary | **AI Text** (read-only) | |
| AI_Need_Category | **AI Text** (read-only) | |
| Agreement | **Single select** | `예, 동의합니다.` |
| Created time | **Created time** (read-only) | |

---

### 1.3 manager (Wellness Survey Company Responses) — `tbl35QbAamOCRvaPk`

| 필드명 | 필드 타입 | Single/Multi Select 옵션 |
|--------|-----------|---------------------------|
| Email | **Email** | |
| Company | **Link to another record** | (read-only 링크) |
| Company_size | **Single select** | `10명 이하`, `10-50명`, `50-200명`, `200명 이상` |
| Current_programs | **Long text** | |
| Wellness_importance | **Multiple select** | `5 매우그렇다` ~ `1 전혀 아니다` (5단계) |
| Needed_services | **Long text** | |
| Pain_points | **Long text** | |
| Adoption_interest | **Single select** | `있음`, `없음` |
| Required_features | **Multiple select** | `정신건강 콘텐츠`, `요가, 필라테스 등`, `번아웃 평가 및 리포트`, `분석 대시보드`, `기타` |
| Other_features | **Long text** | |
| Cheap_price_range | **Single select** | `인당 5천원 ~1만원`, `인당 1~2만원`, `인당 2~3만원` |
| Reasonable_price | **Long text** | |
| Additional_comments | **Long text** | |
| Created_time | **Created time** (read-only) | |
| Agreement | **Single select** | (동의 문구) |
| Service_Demand | **Single select** | (서비스 수요) |
| Attachments | **Attachment** | |

---

### 1.4 wcwi (Assessments) — `tbl8skWY7TdWU0de8`

| 필드명 | 필드 타입 | 비고 |
|--------|-----------|------|
| Assessment_ID | **Autonumber** (read-only) | |
| Participant_ID | **Link to another record** | |
| Program_ID | **Link to another record** | |
| WHO1_PositiveMood ~ 기타 WHO/심리 문항 | **Single select** | 1~5 또는 1~7 리커트 (한글 라벨) |
| … (전체 WCWI 문항 필드 다수) | **Single select** 등 | 미니 체크와 필드 구조 상이 |

**참고:** 이 테이블은 전체 WCWI 진단용(WHO-5 등) 구조라, 현재 React에서 미니 체크 완료 시 보내는 한글 필드명(`정신적 웰빙`, `종합점수`, `진단유형`, `진단일시` 등)과 **필드명·구조가 맞지 않음**.

---

## 2. React Payload ↔ Airtable 1:1 매핑 및 불일치

### 2.1 LeadCaptureView.jsx → mini (mini_responses)

| React 필드 (payload) | Airtable 필드 | 타입 일치 | 비고 |
|----------------------|---------------|-----------|------|
| created_at | created_at | ✅ | Date and time |
| source | source | ✅ | Single select: **옵션 일치** (`app` 사용 중) |
| answers_json | answers_json | ✅ | Long text (JSON 문자열) |
| *(미전송)* | email | ⚠️ | 테이블에 `email` 필드 있음. 현재는 answers_json 내부에만 저장 → 필요 시 최상위 `email` 도 전송 권장 |

**불일치:** 없음 (현재 source=`app`로 사용 중이며, level/score는 LeadCapture에서는 미전송이 맞음).

---

### 2.2 MiniAssessmentView.jsx (handleLeadClick) → mini (mini_responses)

| React 필드 (payload) | Airtable 필드 | 타입 일치 | 비고 |
|----------------------|---------------|-----------|------|
| score | score | ✅ | Number |
| level | level | ✅ | Single select: **옵션 일치** (`양호` \| `보통` \| `주의`) |
| answers_json | answers_json | ✅ | Long text |
| created_at | created_at | ✅ | Date and time |

**불일치:** 없음.

---

### 2.3 App.jsx (미니 완료 시 자동 저장) → wcwi (Assessments)

| React 필드 (miniFields) | Airtable 테이블 | 타입/필드명 | 비고 |
|-------------------------|------------------|-------------|------|
| 정신적 웰빙, 심리적 웰빙, 번아웃, 신체 건강, 삶의 만족도 | Assessments | ❌ | 테이블에는 WHO1_PositiveMood 등 **영문 필드명**만 존재. 한글 area명과 1:1 컬럼 없음 |
| 종합점수 | Assessments | ❌ | 해당 이름의 필드 없음 |
| 진단유형 | Assessments | ❌ | 해당 이름의 필드 없음 |
| 진단일시 | Assessments | ❌ | 해당 이름의 필드 없음 |

**불일치:**  
- **필드명:** React는 한글(정신적 웰빙, 종합점수, 진단유형, 진단일시), Airtable Assessments는 영문·다른 구조.  
- **타입/구조:** Assessments는 참가자/프로그램 링크·WHO 문항 단위 구조라, 미니 요약 레코드 1건 넣는 형태와 맞지 않음.  
- **권장:** 미니 결과만 저장할 목적이면 **mini (mini_responses)** 테이블에만 저장하고, wcwi(Assessments) 전송은 제거하거나, 별도 “미니 요약” 테이블이 있으면 그쪽으로 매핑 재설계.

---

### 2.4 App.jsx (submitEmp) → employee (Employee_Wellness_Market_Survey)

| React 한글 key → Airtable 필드 | Airtable 타입 | 옵션/값 불일치 |
|----------------------------------|---------------|-----------------|
| 회사규모 → company_size | Single select | ✅ 옵션 동일 (10명 미만, 10~49명, …) |
| 직종 → job_type | Single select | ✅ 옵션 동일 |
| 업무스타일 → work_style | Single select | ✅ 옵션 동일 (혼합형 문구만 Airtable은 `혼합형(출근+재택)` 등일 수 있음) |
| 신체불편 → physical_discomfort_level | Single select | ⚠️ React likert 값(숫자/문자)과 Airtable 옵션 **문자열**(`5 (매우 그렇다)` 등) 일치 필요 |
| 정신스트레스 → mental_stress_level | Single select | ⚠️ 위와 동일 |
| 번아웃경험 → burnout_experience | Single select | ⚠️ 위와 동일 |
| 참여의향 → need_for_wellness_service | Single select | ⚠️ 위와 동일 |
| 관심프로그램 → preferred_program_type | Multiple select | ⚠️ 배열 전송 시 Airtable은 **문자열 배열** 기대. 한글 라벨이 테이블 옵션과 정확히 일치해야 함 |
| 유료지불의향 → interest_in_short_program | Single select | ⚠️ likert → 옵션 문자열 매핑 필요 |
| **월지불금액 → willingness_to_use_service** | **Single select** | ❌ **필드 오매핑.** 월지불금액은 **payment_amount**로 보내야 함. willingness_to_use_service는 “서비스 사용 의향” 문항용 |
| **서비스사용의향 → willingness_to_use_service** | **Single select** | ✅ 의도상 올바른 필드 (서비스 사용 의향) |
| 기업투자필요 → company_support_expectation | Single select | ⚠️ likert → 옵션 문자열 매핑 필요 |
| **기대우려 → overall_wellness_need_score** | **Formula (read-only)** | ❌ **타입 불일치.** 기대우려(자유 텍스트)는 **open_feedback**로 보내야 함. overall_wellness_need_score는 수식 필드로 쓰기 불가 |
| created_time | Created time | ❌ **read-only.** API로 생성 시 자동 설정되므로 전송 불필요(전송해도 무시될 수 있음) |
| **source → "employee_survey"** | **Single select** | ❌ **옵션 불일치.** 허용 옵션: `웹 사이트`, `이메일 캠페인`, `직접 방문`, `기타`. `employee_survey` 없음 → 401/옵션 오류 가능 |
| Email → Email | Single line text | ✅ |

**요약 불일치 (employee):**  
1. **필드명:** 기대우려 → `open_feedback` (not overall_wellness_need_score).  
2. **필드명:** 월지불금액 → `payment_amount` (not willingness_to_use_service).  
3. **타입:** overall_wellness_need_score는 Formula(read-only) → 쓰기 불가.  
4. **옵션:** source에 `employee_survey` 없음 → 기존 옵션 중 하나로 보내거나, Airtable에서 옵션 추가 필요.  
5. **옵션:** likert/금액 등은 프론트에서 “Airtable 옵션 문자열”로 변환해 전송해야 함.

---

### 2.5 App.jsx (submitMgr) → manager (Wellness Survey Company Responses)

| React 한글 key → Airtable 필드 | Airtable 타입 | 옵션/값 불일치 |
|----------------------------------|---------------|-----------------|
| 기업인원 → Company_size | Single select | ⚠️ React: `10명 이하`, `10~50명`, … / Airtable: `10명 이하`, `10-50명`, `50-200명`, `200명 이상` → **10~50 vs 10-50** 문자 일치 필요 |
| 필요기능 → Required_features | Multiple select | ⚠️ 옵션 라벨 정확히 일치 필요 (정신건강 콘텐츠, 요가/필라테스, 번아웃 평가 및 리포트, 분석 대시보드, 기타) |
| 합리적가격 → Reasonable_price | Long text | ✅ |
| 디지털웰니스관심 → Adoption_interest | Single select | ✅ `있음` \| `없음` |
| Created_time | Created time | ❌ read-only, 전송 불필요 |
| *(미전송)* | Email | ⚠️ **누락.** 테이블에 Email 필드 있음. mgrEmail 전송 필요 |

**추가로 설문에 있으나 매핑 안 된 필드 (전송 시 오류는 아니나, 채우면 좋은 항목):**  
- 현재프로그램 → Current_programs (Long text)  
- 건강중요도 → Wellness_importance (Multiple select)  
- 필요서비스 → Needed_services (Long text)  
- 애로사항 → Pain_points (Long text)  
- 저렴의심가격 → Cheap_price_range (Single select)  
- 추가의견 → Additional_comments (Long text)  

**요약 불일치 (manager):**  
1. **필드명/누락:** Email 미전송 → `Email`에 mgrEmail 넣어야 함.  
2. **옵션:** Company_size 값이 `10~50명` vs `10-50명` 같이 약간 다를 수 있음 → Airtable 옵션 문자열과 동일하게 보내기.  
3. **Created_time**은 read-only이므로 제거해도 됨.

---

## 3. 불일치 요약 표

| 테이블 | 구분 | 불일치 내용 |
|--------|------|-------------|
| **mini** | LeadCaptureView | 없음. 선택 사항: 최상위 `email` 필드 전송 권장. |
| **mini** | MiniResult handleLeadClick | 없음. |
| **wcwi** | App.jsx 미니 완료 자동 저장 | 필드명·테이블 구조 전반 불일치. 한글 필드명·종합점수/진단유형/진단일시 등 Assessments 테이블에 없음. 미니는 mini 테이블만 사용 권장. |
| **employee** | submitEmp | ① 기대우려 → open_feedback (not overall_wellness_need_score). ② 월지불금액 → payment_amount (not willingness_to_use_service). ③ source 옵션에 `employee_survey` 없음. ④ likert/금액 값을 Airtable single/multi select 옵션 문자열로 변환 필요. ⑤ created_time은 read-only. |
| **manager** | submitMgr | ① Email 미전송 → Email에 mgrEmail 필요. ② Company_size 옵션 문자열 (`10~50` vs `10-50`) 일치 필요. ③ Created_time read-only. ④ 그 외 여러 필드(Current_programs, Wellness_importance 등) 미매핑. |

---

## 4. 수정 제안 (요약)

1. **wcwi(Assessments):** 미니 체크 완료 시 `saveToAirtable("wcwi", miniFields)` 제거하거나, 미니 전용 테이블이 있으면 그 테이블로 필드 재정의 후 전송.  
2. **employee:**  
   - 기대우려 → `open_feedback`.  
   - 월지불금액 → `payment_amount`.  
   - source → 테이블 옵션 중 하나(예: `웹 사이트`) 또는 Airtable에 `employee_survey` 옵션 추가.  
   - likert/chip 값은 Airtable single/multiple select 옵션 **문자열**로 변환해 전송.  
3. **manager:**  
   - `Email`에 mgrEmail 전송.  
   - Company_size 값은 Airtable 옵션과 동일 문자열로.  
   - 필요 시 Current_programs, Wellness_importance 등 나머지 필드 매핑 추가.

이 문서는 Meta API 스키마와 현재 React 코드를 기준으로 작성되었으며, Airtable 옵션 라벨(한글)은 실제 base에서 확인한 뒤 보정하는 것을 권장합니다.
