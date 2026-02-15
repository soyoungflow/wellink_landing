/* global process */
/**
 * Airtable 정규화/검증 레이어 단위 검증
 * 실행: node scripts/validate-airtable-payloads.test.js (프로젝트 루트에서)
 *
 * - select 옵션 불일치 시 fallback 적용되는지
 * - validatePayload가 정규화된 payload를 통과시키는지
 */

import { normalizePayload, validatePayload } from "../src/api/airtableNormalize.js";

const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

// 1) employee: source "웹 사이트" → Airtable에 없으므로 fallback "기타"
const rawEmployee = {
  source: "웹 사이트",
  Email: "test@example.com",
  company_size: "10~49명",
  work_style: "전일 출근",
};
const normEmployee = normalizePayload("employee", rawEmployee);
assert(normEmployee.source === "기타", `employee.source fallback: expected "기타", got ${normEmployee.source}`);
const valEmployee = validatePayload("employee", normEmployee);
assert(valEmployee.valid === true, `employee validation: ${JSON.stringify(valEmployee.errors)}`);
console.log("✓ employee source fallback & validation");

// 2) employee: payment_amount 프론트 값 → Airtable 옵션 매핑
const rawEmployee2 = {
  Email: "a@b.com",
  payment_amount: ["1만원 미만", "가격에 따라 결정"],
};
const normEmployee2 = normalizePayload("employee", rawEmployee2);
assert(
  normEmployee2.payment_amount?.includes("10,000원 미만") && normEmployee2.payment_amount?.includes("가격에 따라 결정할 의향이 있습니다"),
  `employee.payment_amount mapping: got ${JSON.stringify(normEmployee2.payment_amount)}`
);
console.log("✓ employee payment_amount mapping");

// 3) manager: Required_features "요가/필라테스" → "요가, 필라테스 등 운동 콘텐츠"
const rawManager = {
  Email: "m@b.com",
  Required_features: ["요가/필라테스", "분석 대시보드"],
};
const normManager = normalizePayload("manager", rawManager);
assert(
  normManager.Required_features?.includes("요가, 필라테스 등 운동 콘텐츠") && normManager.Required_features?.includes("데이터 분석 및 대시보드"),
  `manager.Required_features mapping: got ${JSON.stringify(normManager.Required_features)}`
);
const valManager = validatePayload("manager", normManager);
assert(valManager.valid === true, `manager validation: ${JSON.stringify(valManager.errors)}`);
console.log("✓ manager Required_features mapping & validation");

// 4) mini: level/source fallback
const rawMini = {
  score: 60,
  level: "invalid_level",
  source: "invalid_source",
  created_at: new Date().toISOString(),
  answers_json: "{}",
};
const normMini = normalizePayload("mini", rawMini);
assert(normMini.level === "보통", `mini.level fallback: expected "보통", got ${normMini.level}`);
assert(normMini.source === "app", `mini.source fallback: expected "app", got ${normMini.source}`);
const valMini = validatePayload("mini", normMini);
assert(valMini.valid === true, `mini validation: ${JSON.stringify(valMini.errors)}`);
console.log("✓ mini level/source fallback & validation");

console.log("\n모든 검증 통과.");
process.exit(0);
