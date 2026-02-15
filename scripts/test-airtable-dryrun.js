/**
 * Airtable API dryRun 모드 테스트
 *
 * 사용법 (vercel dev 또는 로컬 API 서버 실행 후):
 *   npm run test:dryrun              # 모든 테이블 테스트
 *   node scripts/test-airtable-dryrun.js mini     # mini만
 *   node scripts/test-airtable-dryrun.js employee # employee만
 *   node scripts/test-airtable-dryrun.js manager  # manager만
 *   node scripts/test-airtable-dryrun.js wcwi     # wcwi만
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// .env.local 로드
try {
  const envPath = path.join(root, ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    content.split("\n").forEach((line) => {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) {
        const key = m[1].trim();
        let val = m[2].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
          val = val.slice(1, -1);
        process.env[key] = val;
      }
    });
  }
} catch (_) {}

const BASE_URL = process.env.VITE_API_BASE_URL || "http://localhost:3000";

/** MiniAssessmentView + LeadCapture(mini) 형식 */
const MINI_PAYLOADS = [
  {
    name: "MiniAssessmentView - 정상",
    table: "mini",
    fields: {
      score: 75,
      level: "양호",
      source: "app",
      created_at: new Date().toISOString(),
      answers_json: JSON.stringify({ m1: 4, m2: 5, mini3: 2 }),
    },
  },
  {
    name: "LeadCapture(mini) - 기업감사신청",
    table: "mini",
    fields: {
      created_at: new Date().toISOString(),
      source: "app",
      email: "test@company.com",
      answers_json: JSON.stringify({
        email: "test@company.com",
        company: "테스트회사",
        role: "HR 담당자",
        source_type: "기업감사신청",
      }),
    },
  },
  {
    name: "mini - invalid level (에러 검증)",
    table: "mini",
    fields: {
      score: 60,
      level: "invalid_level",
      source: "app",
      created_at: new Date().toISOString(),
    },
  },
];

/** EmployeeSurveyView + LeadCapture(employee) 형식 */
const EMPLOYEE_PAYLOADS = [
  {
    name: "EmployeeSurveyView - 전체 폼",
    table: "employee",
    fields: {
      company_size: "10~49명",
      job_type: "사무직",
      work_style: "전일 출근",
      physical_discomfort_level: "3 (보통이다)",
      mental_stress_level: "4 (그렇다)",
      burnout_experience: "3 (보통이다)",
      need_for_wellness_service: "4 (그렇다)",
      preferred_program_type: ["근골격계 스트레칭", "명상/호흡"],
      interest_in_short_program: "3 (보통이다)",
      payment_amount: ["10,000~30,000원"],
      willingness_to_use_service: "4 (그렇다)",
      company_support_expectation: "4 (그렇다)",
      open_feedback: "웰니스 프로그램에 관심이 많습니다.",
      created_time: new Date().toISOString(),
      source: "기타",
      Email: "employee@test.com",
    },
  },
  {
    name: "LeadCapture(employee) - 기업 문의",
    table: "employee",
    fields: {
      Email: "lead@company.com",
      source: "기타",
      open_feedback: "Lead capture (기업 문의)\n회사: ABC주식회사\n직책/역할: HR 담당자\n진입경로: lead_from_employee",
    },
  },
];

/** ManagerSurveyView + LeadCapture(manager) 형식 */
const MANAGER_PAYLOADS = [
  {
    name: "ManagerSurveyView - 전체 폼",
    table: "manager",
    fields: {
      Company_size: "10-50명",
      Current_programs: "사내 요가, EAP 상담",
      Wellness_importance: ["4 그렇다"],
      Needed_services: "번아웃 예방 프로그램",
      Pain_points: "예산 부족",
      Adoption_interest: "있음",
      Required_features: ["정신건강 콘텐츠", "데이터 분석 및 대시보드"],
      Cheap_price_range: "인당 1~2만원",
      Reasonable_price: "인당 2만원/월",
      Additional_comments: "직원 만족도 개선이 목표입니다.",
      Email: "manager@test.com",
    },
  },
  {
    name: "LeadCapture(manager) - 기업 문의",
    table: "manager",
    fields: {
      Email: "ceo@company.com",
      Additional_comments:
        "Lead capture (기업 문의)\n회사: XYZ기업\n직책/역할: 경영진/CEO\n진입경로: lead_from_manager",
    },
  },
];

/** WCWI Full 진단 (airtableFields 기반) */
const WCWI_PAYLOADS = [
  {
    name: "WCWI Full 진단",
    table: "wcwi",
    fields: {
      "정신적 웰빙": 75,
      "심리적 웰빙": 70,
      번아웃: 65,
      "신체 건강": 80,
      "삶의 만족도": 72,
      종합점수: 72,
      진단유형: "full",
      진단일시: new Date().toISOString(),
    },
  },
];

const ALL_PAYLOADS = {
  mini: MINI_PAYLOADS,
  employee: EMPLOYEE_PAYLOADS,
  manager: MANAGER_PAYLOADS,
  wcwi: WCWI_PAYLOADS,
};

async function runDryRun(body) {
  const r = await fetch(`${BASE_URL}/api/airtable?dryRun=1`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ table: body.table, fields: body.fields }),
  });
  const json = await r.json();
  return { status: r.status, json };
}

async function testDryRun() {
  const filter = process.argv[2]?.toLowerCase();
  const tables = filter && filter !== "all" ? [filter] : ["mini", "employee", "manager", "wcwi"];

  if (filter && !["mini", "employee", "manager", "wcwi", "all"].includes(filter)) {
    console.error("사용법: node scripts/test-airtable-dryrun.js [mini|employee|manager|wcwi|all]");
    process.exit(1);
  }

  console.log("=== Airtable dryRun 테스트 ===");
  console.log("BASE_URL:", BASE_URL);
  console.log("테이블:", tables.join(", "));
  console.log("");

  let hasError = false;
  for (const table of tables) {
    const payloads = ALL_PAYLOADS[table];
    if (!payloads) {
      console.warn(`[${table}] 정의된 payload 없음, 건너뜀`);
      continue;
    }

    console.log(`\n--- ${table.toUpperCase()} ---`);
    for (const p of payloads) {
      console.log(`\n  [${p.name}]`);
      try {
        const { status, json } = await runDryRun(p);
        const ok = status === 200 && (json.valid !== false || json.validationErrors?.length > 0);
        console.log(`    status: ${status}`);
        if (json.dryRun) {
          console.log(`    valid: ${json.valid}`);
          if (json.validationErrors?.length) {
            console.log(`    validationErrors:`, JSON.stringify(json.validationErrors, null, 4).split("\n").map((l) => `      ${l}`).join("\n"));
          }
          if (json.fields && Object.keys(json.fields).length > 0) {
            console.log(`    fields:`, Object.keys(json.fields).join(", "));
          }
        } else if (json.error) {
          console.log(`    error:`, json.error?.message);
          if (json.errorId) console.log(`    errorId:`, json.errorId);
        }
        if (!ok && status >= 400) hasError = true;
      } catch (e) {
        console.error(`    fetch 실패:`, e.message);
        hasError = true;
      }
    }
  }

  console.log("\n=== 테스트 완료 ===");
  if (hasError) {
    console.log("→ 일부 테스트 실패. vercel dev 또는 로컬 API 서버가 실행 중인지 확인하세요.");
    console.log("→ 환경변수 AIRTABLE_* 가 .env.local에 설정되어 있는지 확인하세요.");
  }
}

testDryRun();
