/**
 * Airtable 테이블별 필드 매핑
 * - surveys.js의 field.key / questions.js의 area·id가 이 필드명으로 전송됩니다.
 * - Airtable 베이스의 컬럼명이 아래와 동일해야 합니다.
 */

import { EMP_PAGES, MGR_PAGES } from "../constants/surveys";
import { MINI_QUESTIONS } from "../constants/questions";

/**
 * 재직자 수요조사 (employee 테이블)
 * surveys.js EMP_PAGES의 각 field.key + 아래 고정 필드
 */
export function getEmployeeAirtableFieldNames() {
  const fromPages = EMP_PAGES.flatMap((p) => p.fields.map((f) => f.key));
  return [...new Set([...fromPages, "이메일", "응답일시"])];
}

/**
 * 관리자 수요조사 (manager 테이블)
 * surveys.js MGR_PAGES의 각 field.key + 아래 고정 필드
 */
export function getManagerAirtableFieldNames() {
  const fromPages = MGR_PAGES.flatMap((p) => p.fields.map((f) => f.key));
  return [...new Set([...fromPages, "이메일", "응답일시"])];
}

/**
 * WCWI 미니 체크 (wcwi 테이블)
 * questions.js MINI_QUESTIONS의 area + 아래 고정 필드
 */
export function getWcwiMiniAirtableFieldNames() {
  const areas = MINI_QUESTIONS.map((q) => q.area);
  return [...areas, "종합점수", "진단유형", "진단일시"];
}
