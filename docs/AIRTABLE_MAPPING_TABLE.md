# Airtable MCP ↔ 프로젝트 테이블 매핑

앱에서 사용하는 **테이블 식별자**와 **Airtable 베이스 내 실제 테이블** 매핑.  
옵션·필드명은 `docs/airtable_schema.json` 및 `docs/mismatch_report.md`와 일치하도록 유지한다.

---

## 1. 현재 앱 테이블 ↔ Airtable 테이블

| 앱 테이블 ID (API/코드) | Airtable 테이블 이름           | Airtable 테이블 ID       | 환경변수                      | 비고 |
|-------------------------|-------------------------------|--------------------------|-------------------------------|------|
| `employee`              | Employee_Wellness_Market_Survey | tblGRjbxzVL6E4wUc       | AIRTABLE_TABLE_EMPLOYEE       | 직원 수요조사 |
| `manager`               | Wellness Survey Company Responses | tbl35QbAamOCRvaPk   | AIRTABLE_TABLE_MANAGER        | 관리자/경영자 설문 |
| `mini`                  | mini_responses               | tblyZs4j4JY11Sfg8       | AIRTABLE_TABLE_MINI           | 미니 진단 결과 |
| `wcwi`                  | Assessments                  | tbl8skWY7TdWU0de8       | AIRTABLE_TABLE_WCWI           | 전체 WCWI 진단 (현재 앱에서 제출 미사용) |

- **베이스**: WELLINK (`appNDMLyj5VngPHdU`) — 환경변수 `AIRTABLE_BASE_ID`

---

## 2. 프로젝트에서 새 테이블 추가 시 Airtable 매핑 가이드

앱에 **새로운 폼/데이터 타입**을 추가하고 Airtable에 저장하려면:

1. **Airtable 베이스에 새 테이블 생성**  
   - 테이블 이름(영문 권장)과 필드 타입을 아래 스펙에 맞춘다.

2. **환경변수 추가**  
   - Vercel(또는 로컬): `AIRTABLE_TABLE_<NEWTABLE>=tblxxxxxxxxxxxxxx`  
   - `api/airtable.js`의 `ALLOWED_TABLES` 배열에 새 테이블 ID(소문자) 추가.

3. **프로젝트 내 매핑 추가**  
   - `src/api/airtableNormalize.js`: `SCHEMA.<newtable>` 추가 (singleSelect/multipleSelects 옵션, readOnly 등).  
   - `normalizePayload()` switch에 `case "<newtable>": return normalizeXxx(raw);` 추가.  
   - `docs/airtable_schema.json`: `tables.<newtable>` 블록 추가 (스키마 덤프 스크립트 재실행 후 수동 병합 가능).  
   - `docs/payload_spec.json`: 새 flow 추가.  
   - `docs/PAYLOAD_MAPPING_TABLE.md`: 화면/버튼 → 새 테이블 행 추가.

4. **이 문서 업데이트**  
   - 위 "현재 앱 테이블 ↔ Airtable 테이블" 표에 새 행 추가.

### 새 테이블 스펙 예시 (Airtable에 만들 필드)

| 필드명 (Airtable) | 타입        | 비고 |
|-------------------|-------------|------|
| Email             | Email 또는 Single line text | |
| created_at        | Date / DateTime | ISO8601 문자열 전송 가능 |
| source            | Single select | 옵션: web, app 등 앱에서 보낼 값과 동일하게 |
| (기타)            | Single select 시 **옵션 문자열을 앱과 완전 일치**시키기 | mismatch_report 참고 |

Single select 옵션은 **앱에서 전송할 문자열과 1:1 일치**해야 하며, 불일치 시 "Insufficient permissions to create new select option" 오류가 발생할 수 있다.
