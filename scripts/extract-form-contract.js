/**
 * 폼 옵션 전수 추출 → contracts/form_contract.json
 *
 * surveys.js opts, App.jsx LIKERT maps, airtableNormalize SCHEMA, questions.js 등에서 추출
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const formContract = {
  generatedAt: new Date().toISOString(),
  tables: {},
  fieldMapping: {},
};

// surveys.js EMP_PAGES, MGR_PAGES
const { EMP_PAGES, MGR_PAGES } = await import("../src/constants/surveys.js");
const empFields = EMP_PAGES.flatMap((p) => p.fields);
const mgrFields = MGR_PAGES.flatMap((p) => p.fields);

formContract.tables.employee = empFields.map((f) => ({
  formKey: f.key,
  airtableField: null,
  values: f.opts || [],
  valueType: f.type,
  sourcePath: "src/constants/surveys.js EMP_PAGES",
}));

formContract.tables.manager = mgrFields.map((f) => ({
  formKey: f.key,
  airtableField: null,
  values: f.opts || [],
  valueType: f.type,
  sourcePath: "src/constants/surveys.js MGR_PAGES",
}));

// App.jsx fieldMapping
const empMapping = {
  회사규모: "company_size",
  직종: "job_type",
  업무스타일: "work_style",
  신체불편: "physical_discomfort_level",
  정신스트레스: "mental_stress_level",
  번아웃경험: "burnout_experience",
  참여의향: "need_for_wellness_service",
  관심프로그램: "preferred_program_type",
  유료지불의향: "interest_in_short_program",
  월지불금액: "payment_amount",
  서비스사용의향: "willingness_to_use_service",
  기업투자필요: "company_support_expectation",
  기대우려: "open_feedback",
};
const mgrMapping = {
  기업인원: "Company_size",
  현재프로그램: "Current_programs",
  건강중요도: "Wellness_importance",
  필요서비스: "Needed_services",
  애로사항: "Pain_points",
  디지털웰니스관심: "Adoption_interest",
  필요기능: "Required_features",
  저렴의심가격: "Cheap_price_range",
  합리적가격: "Reasonable_price",
  추가의견: "Additional_comments",
};

formContract.fieldMapping.employee = empMapping;
formContract.fieldMapping.manager = mgrMapping;

// Merge airtableField into employee/manager
for (const row of formContract.tables.employee) {
  row.airtableField = empMapping[row.formKey] || row.formKey;
}
for (const row of formContract.tables.manager) {
  row.airtableField = mgrMapping[row.formKey] || row.formKey;
}

// App.jsx LIKERT maps (숫자→문자열 변환)
formContract.tables.employee.push({
  formKey: "LIKERT_5",
  airtableField: "physical_discomfort_level, mental_stress_level, burnout_experience, need_for_wellness_service, interest_in_short_program, company_support_expectation",
  values: ["1 (전혀 아니다)", "2 (아니다)", "3 (보통이다)", "4 (그렇다)", "5 (매우 그렇다)"],
  valueType: "likert_map",
  sourcePath: "src/App.jsx LIKERT_5",
});
formContract.tables.employee.push({
  formKey: "LIKERT_5_WILLINGNESS",
  airtableField: "willingness_to_use_service",
  values: ["1 (매우있다)", "2 (있다)", "3 (보통이다)", "4 (별로없다)", "5 (전혀없다)"],
  valueType: "likert_map",
  sourcePath: "src/App.jsx LIKERT_5_WILLINGNESS, src/api/airtableNormalize.js",
  note: "Airtable choices와 동일 (역스케일 1=매우있다 ~ 5=전혀없다)",
});

// airtableNormalize SCHEMA (기존 정규화용)
const airtableNormSchema = {
  employee: {
    singleSelect: {
      company_size: ["10명 미만", "10~49명", "50~200명", "200명 이상"],
      job_type: ["사무직", "연구/개발", "영업/마케팅", "생산/현장직", "기타"],
      work_style: ["전일 출근", "재택근무", "혼합형(출근+재택)"],
      physical_discomfort_level: ["1 (전혀 아니다)", "2 (아니다)", "3 (보통이다)", "4 (그렇다)", "5 (매우 그렇다)"],
      willingness_to_use_service: ["1 (매우있다)", "2 (있다)", "3 (보통이다)", "4 (별로없다)", "5 (전혀없다)"],
      source: ["내부 링크", "외부 캠페인", "직접 방문", "기타"],
    },
    multipleSelects: {
      preferred_program_type: ["근골격계 스트레칭", "명상/호흡", "번아웃 관리", "수면/회복", "감정 관리", "기타"],
      payment_amount: ["10,000원 미만", "10,000~30,000원", "30,000~50,000원", "50,000원 이상", "가격에 따라 결정할 의향이 있습니다"],
    },
  },
  manager: {
    singleSelect: {
      Company_size: ["10명 이하", "10-50명", "50-200명", "200명 이상"],
      Adoption_interest: ["있음", "없음"],
      Cheap_price_range: ["인당 5천원 ~1만원", "인당 1~2만원", "인당 2~3만원"],
    },
    multipleSelects: {
      Required_features: ["정신건강 콘텐츠", "요가, 필라테스 등 운동 콘텐츠", "번아웃 평가 및 리포트", "데이터 분석 및 대시보드", "기타"],
      Wellness_importance: ["1 전혀 아니다", "2 아니다", "3 보통이다", "4 그렇다", "5 매우그렇다"],
    },
  },
};
formContract.airtableNormalizeSchema = airtableNormSchema;

// mini
formContract.tables.mini = [
  { formKey: "level", airtableField: "level", values: ["양호", "보통", "주의"], sourcePath: "src/api/airtableNormalize.js SCHEMA.mini" },
  { formKey: "source", airtableField: "source", values: ["web", "app"], sourcePath: "src/api/airtableNormalize.js SCHEMA.mini" },
  { formKey: "score", airtableField: "score", values: [], valueType: "number", sourcePath: "MiniAssessmentView" },
  { formKey: "created_at", airtableField: "created_at", values: [], valueType: "datetime", sourcePath: "LeadCaptureView" },
  { formKey: "answers_json", airtableField: "answers_json", values: [], valueType: "json", sourcePath: "MiniAssessmentView" },
  { formKey: "email", airtableField: "email", values: [], valueType: "string", sourcePath: "LeadCaptureView" },
];

// Synonym maps (프론트 변환용)
formContract.synonymMaps = {
  work_style: { 혼합형: "혼합형(출근+재택)", "재택 근무": "재택근무" },
  Company_size: { "10~50명": "10-50명", "50~200명": "50-200명" },
  payment_amount: { "1만원 미만": "10,000원 미만", "1만원~3만원": "10,000~30,000원", "3만원~5만원": "30,000~50,000원", "5만원 이상": "50,000원 이상", "가격에 따라 결정": "가격에 따라 결정할 의향이 있습니다" },
  Required_features: { "요가/필라테스": "요가, 필라테스 등 운동 콘텐츠", "분석 대시보드": "데이터 분석 및 대시보드" },
  Cheap_price_range: { "인당 5천원~1만원": "인당 5천원 ~1만원", "인당 1만원~2만원": "인당 1~2만원", "인당 2만원~3만원": "인당 2~3만원" },
  Wellness_importance: { 1: "1 전혀 아니다", 2: "2 아니다", 3: "3 보통이다", 4: "4 그렇다", 5: "5 매우그렇다" },
};

// wcwi - airtableFields 기준 (실제 Assessments와 불일치)
formContract.tables.wcwi = [
  { formKey: "정신적 웰빙", airtableField: null, values: [], valueType: "number", sourcePath: "airtableFields.js", note: "Assessments 테이블에 해당 필드 없음" },
  { formKey: "심리적 웰빙", airtableField: null, values: [], valueType: "number", sourcePath: "airtableFields.js", note: "Assessments 테이블에 해당 필드 없음" },
  { formKey: "번아웃", airtableField: null, values: [], valueType: "number", sourcePath: "airtableFields.js", note: "Assessments 테이블에 해당 필드 없음" },
  { formKey: "신체 건강", airtableField: null, values: [], valueType: "number", sourcePath: "airtableFields.js", note: "Assessments 테이블에 해당 필드 없음" },
  { formKey: "삶의 만족도", airtableField: null, values: [], valueType: "number", sourcePath: "airtableFields.js", note: "Assessments 테이블에 해당 필드 없음" },
  { formKey: "종합점수", airtableField: null, values: [], valueType: "number", sourcePath: "airtableFields.js", note: "Assessments 테이블에 해당 필드 없음" },
  { formKey: "진단유형", airtableField: null, values: ["full"], valueType: "string", sourcePath: "test-airtable-dryrun.js", note: "Assessments 테이블에 해당 필드 없음" },
  { formKey: "진단일시", airtableField: null, values: [], valueType: "datetime", sourcePath: "airtableFields.js", note: "Assessments 테이블에 해당 필드 없음" },
];

const outPath = path.join(root, "contracts", "form_contract.json");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(formContract, null, 2), "utf8");
console.log("저장됨:", outPath);
