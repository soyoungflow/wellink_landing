# Airtable API 연결 가이드

## 1. 현재 연결 상태

프로젝트는 **이미 Airtable API와 연결**되어 있습니다.

| 테이블 | 사용처 | 데이터 출처 |
|--------|--------|-------------|
| **wcwi** | 미니 웰니스 체크 완료 시 | `constants/questions.js` → MINI_QUESTIONS (area별 점수, 종합점수, 진단유형, 진단일시) |
| **employee** | 재직자 수요조사 제출 시 | `constants/surveys.js` → EMP_PAGES의 각 `field.key` + 이메일, 응답일시 |
| **manager** | 관리자 수요조사 제출 시 | `constants/surveys.js` → MGR_PAGES의 각 `field.key` + 이메일, 응답일시 |

- **프론트엔드**: `src/api/airtable.js`는 **PAT/Base ID를 포함하지 않고** `fetch("/api/airtable")`만 호출합니다.
- **서버**: `api/airtable.js` (Vercel Serverless Function)에서 `process.env.AIRTABLE_PAT`, `process.env.AIRTABLE_BASE_ID` 등으로 설정을 읽습니다.
- 호출 위치: `src/App.jsx` (saveToAirtable 호출 3곳)

---

## 2. surveys.js ↔ Airtable (employee / manager)

### 연결 방식

- **surveys.js**의 각 문항 `key`가 그대로 **Airtable 컬럼명**으로 전송됩니다.
- 폼에서 선택/입력한 값이 `empAnswers`, `mgrAnswers`에 `key` 이름으로 저장되고, 제출 시 `saveToAirtable("employee", fields)` / `saveToAirtable("manager", fields)`로 보냅니다.

### Airtable에 필요한 컬럼명 (한글 그대로 사용 시)

**employee 테이블:**

- surveys.js EMP_PAGES에 있는 모든 `key`:  
  `회사규모`, `직종`, `업무스타일`, `신체불편`, `정신스트레스`, `번아웃경험`, `참여의향`, `관심프로그램`, `유료지불의향`, `월지불금액`, `서비스사용의향`, `기업투자필요`, `기대우려`
- 고정 필드: `이메일`, `응답일시`

**manager 테이블:**

- surveys.js MGR_PAGES에 있는 모든 `key`:  
  `기업인원`, `현재프로그램`, `건강중요도`, `필요서비스`, `애로사항`, `디지털웰니스관심`, `필요기능`, `저렴의심가격`, `합리적가격`, `추가의견`
- 고정 필드: `이메일`, `응답일시`

### 연결이 안 될 때 확인할 것

1. **Airtable 컬럼명과 `key` 일치**
   - Airtable에서 컬럼명을 **surveys.js의 `key`와 똑같이** 만드세요 (띄어쓰기, 특수문자 포함).
   - 또는 코드에서 매핑을 두고 싶다면, 제출 전에 `key` → Airtable 컬럼명으로 변환하는 객체를 두고 `fields`를 변환한 뒤 `saveToAirtable`에 넘기면 됩니다.

2. **필드 타입**
   - Airtable 필드 타입(단일 선택, 다중 선택, 숫자, 긴 텍스트 등)이 실제로 보내는 값 형태와 맞는지 확인하세요.

3. **필드 목록 참고**
   - `src/api/airtableFields.js`에  
     `getEmployeeAirtableFieldNames()`, `getManagerAirtableFieldNames()`  
     로 “어떤 이름들이 전송되는지” 정리해 두었습니다.  
     Airtable 테이블 컬럼과 이 목록을 비교하면 누락/오타를 찾기 쉽습니다.

---

## 3. questions.js ↔ Airtable (wcwi)

### 연결 방식

- **미니 체크**: `constants/questions.js`의 **MINI_QUESTIONS**가 사용됩니다.
  - 각 문항의 `area`가 Airtable **wcwi** 테이블의 컬럼명으로 전송됩니다.
  - 전송 필드: `정신적 웰빙`, `심리적 웰빙`, `번아웃`, `신체 건강`, `삶의 만족도`, `종합점수`, `진단유형`, `진단일시`.

### wcwi 테이블에 필요한 컬럼명 (한글 그대로 사용 시)

- `정신적 웰빙`, `심리적 웰빙`, `번아웃`, `신체 건강`, `삶의 만족도` (숫자 권장)
- `종합점수` (숫자)
- `진단유형` (단일 선택 또는 텍스트, 예: "미니체크")
- `진단일시` (날짜/시간 또는 텍스트, ISO 문자열 전송됨)

### 전체 WCWI(24문항) 저장

- 현재는 **전체 WCWI 결과는 Airtable에 저장되지 않습니다** (미니 체크만 저장).
- 전체 진단도 저장하려면:
  - **questions.js**의 WCWI_QUESTIONS 구조(섹션별 문항 id)를 이용해
  - `fullAnswers`, `bodyParts`, `calculateFullScores()` 결과를 조합해
  - wcwi 테이블(또는 별도 테이블)에 넣을 필드 객체를 만들고
  - 결과 화면에서 한 번만 `saveToAirtable("wcwi", fullWcwiFields)`를 호출하면 됩니다.

---

## 4. 요약: 연결이 안 되어 있을 때 체크리스트

1. **환경변수 (Vercel 또는 로컬 서버)**
   - `AIRTABLE_PAT`, `AIRTABLE_BASE_ID`, `AIRTABLE_TABLE_EMPLOYEE`, `AIRTABLE_TABLE_MANAGER`, `AIRTABLE_TABLE_WCWI`가 설정되어 있는지 확인.
   - 프론트엔드(`/src`)에는 이 값들이 포함되지 않습니다.

2. **surveys.js**
   - employee/manager 테이블 컬럼명을 **EMP_PAGES / MGR_PAGES의 `key`와 동일하게** 만들거나,  
     반대로 코드에 `key` → Airtable 컬럼명 매핑을 추가.

3. **questions.js**
   - wcwi 테이블 컬럼명을 **MINI_QUESTIONS의 `area` + `종합점수`, `진단유형`, `진단일시`**와 동일하게 만들거나,  
     코드에서 이 이름들을 Airtable 컬럼명으로 매핑.

4. **필드 목록**
   - `src/api/airtableFields.js`의 함수들로 “실제로 전송되는 필드 이름 목록”을 확인한 뒤, Airtable과 1:1로 맞추면 surveys.js와 questions.js가 Airtable과 정확히 연결된 상태가 됩니다.
