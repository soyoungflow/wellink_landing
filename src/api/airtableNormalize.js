/**
 * Airtable 전송 전 payload 정규화
 *
 * - singleSelect: 허용 옵션이 아니면 안전한 기본값으로 fallback, 원래 의도값은 fallbackStorageField에 저장
 * - multipleSelects: 허용 옵션만 통과, 나머지는 fallback 저장
 * - read-only 필드: 제거
 * - null/undefined/빈값: 키 제거 (Airtable에 전송하지 않음)
 */

const LIKERT_5 = [
  "1 (전혀 아니다)",
  "2 (아니다)",
  "3 (보통이다)",
  "4 (그렇다)",
  "5 (매우 그렇다)",
];

const SCHEMA = {
  mini: {
    singleSelect: {
      level: { options: ["양호", "보통", "주의"], default: "보통" },
      source: { options: ["web", "app"], default: "app" },
    },
    multipleSelects: {},
    readOnly: [],
    fallbackStorageField: "answers_json",
    /** 빈값 처리: 빈 문자열은 omit (또는 유지). 여기서는 빈 문자열도 전송 허용 */
    omitEmptyString: false,
  },
  employee: {
    singleSelect: {
      company_size: {
        options: ["10명 미만", "10~49명", "50~200명", "200명 이상"],
        default: "10~49명",
      },
      job_type: {
        options: ["사무직", "연구/개발", "영업/마케팅", "생산/현장직", "기타"],
        default: "기타",
      },
      work_style: {
        options: ["전일 출근", "재택 근무", "혼합형(출근+재택)"],
        default: "전일 출근",
      },
      physical_discomfort_level: { options: LIKERT_5, default: "3 (보통이다)" },
      mental_stress_level: { options: LIKERT_5, default: "3 (보통이다)" },
      burnout_experience: { options: LIKERT_5, default: "3 (보통이다)" },
      need_for_wellness_service: { options: LIKERT_5, default: "3 (보통이다)" },
      interest_in_short_program: { options: LIKERT_5, default: "3 (보통이다)" },
      willingness_to_use_service: { options: LIKERT_5, default: "3 (보통이다)" },
      company_support_expectation: { options: LIKERT_5, default: "3 (보통이다)" },
      source: {
        options: ["웹 사이트", "이메일 캠페인", "직접 방문", "기타"],
        default: "웹 사이트",
      },
      Agreement: { options: ["예, 동의합니다."], default: "예, 동의합니다." },
    },
    multipleSelects: {
      preferred_program_type: [
        "근골격계 스트레칭",
        "명상/호흡",
        "번아웃 관리",
        "수면/회복",
        "감정 관리",
        "기타",
      ],
      payment_amount: [
        "1만원 미만",
        "1만원~3만원",
        "3만원~5만원",
        "5만원 이상",
        "가격에 따라 결정",
      ],
    },
    readOnly: ["response_id", "overall_wellness_need_score", "created_time", "Created time", "AI_Feedback_Summary", "AI_Need_Category"],
    fallbackStorageField: null,
    omitEmptyString: false,
  },
  manager: {
    singleSelect: {
      Company_size: {
        options: ["10명 이하", "10-50명", "50-200명", "200명 이상"],
        default: "10-50명",
      },
      Adoption_interest: { options: ["있음", "없음"], default: "있음" },
    },
    multipleSelects: {
      Required_features: [
        "정신건강 콘텐츠",
        "요가, 필라테스 등",
        "번아웃 평가 및 리포트",
        "분석 대시보드",
        "기타",
      ],
    },
    readOnly: ["Company", "Created_time", "Attachments"],
    fallbackStorageField: null,
    omitEmptyString: false,
  },
};

/** work_style 프론트 값 → Airtable 옵션 (혼합형 → 혼합형(출근+재택)) */
function normalizeWorkStyle(v) {
  if (v === "혼합형") return "혼합형(출근+재택)";
  return v;
}

/** Company_size 프론트 값 → Airtable 옵션 (물결 → 하이픈) */
function normalizeCompanySizeManager(v) {
  if (v === "10~50명") return "10-50명";
  if (v === "50~200명") return "50-200명";
  return v;
}

/** manager Required_features 프론트 라벨 → Airtable 옵션 */
const MANAGER_REQUIRED_FEATURES_MAP = {
  "요가/필라테스": "요가, 필라테스 등",
};
function normalizeRequiredFeature(v) {
  const s = String(v).trim();
  return MANAGER_REQUIRED_FEATURES_MAP[s] ?? s;
}

/**
 * singleSelect 값 검증 및 fallback
 * @returns { { value: string, fallbackUsed: boolean, original?: string } }
 */
function applySingleSelect(fieldName, value, schema) {
  const def = schema.singleSelect[fieldName];
  if (!def) return { value, fallbackUsed: false };
  const str = value == null ? "" : String(value).trim();
  if (str === "") return { value: def.default, fallbackUsed: true, original: null };
  const allowed = new Set(def.options);
  if (allowed.has(str)) return { value: str, fallbackUsed: false };
  return { value: def.default, fallbackUsed: true, original: str };
}

/**
 * multipleSelects 값 검증 (배열만 허용, 허용 옵션만 통과)
 * @returns { { value: string[], fallbackOriginals: string[] } }
 */
function applyMultipleSelects(fieldName, value, schema) {
  const allowedList = schema.multipleSelects[fieldName];
  if (!allowedList) return { value: Array.isArray(value) ? value : [], fallbackOriginals: [] };
  const allowed = new Set(allowedList);
  const arr = Array.isArray(value) ? value : [value].filter(Boolean);
  const valid = arr.filter((v) => allowed.has(String(v).trim()));
  const fallbackOriginals = arr.filter((v) => !allowed.has(String(v).trim()));
  return { value: valid, fallbackOriginals };
}

/**
 * null/undefined 제거, read-only 제거, 빈 문자열 처리
 */
function cleanPayload(obj, schema) {
  const out = {};
  const omitEmpty = schema.omitEmptyString === true;
  const readOnly = new Set(schema.readOnly || []);
  for (const [k, v] of Object.entries(obj)) {
    if (readOnly.has(k)) continue;
    if (v === null || v === undefined) continue;
    if (omitEmpty && v === "") continue;
    out[k] = v;
  }
  return out;
}

/**
 * mini 테이블 정규화
 * - level, source singleSelect fallback
 * - 원래 의도값은 answers_json에 merge
 */
function normalizeMini(raw) {
  const schema = SCHEMA.mini;
  const fallbackOriginals = {};
  const out = {};

  for (const [key, value] of Object.entries(raw)) {
    if (value === null || value === undefined) continue;

    if (schema.singleSelect[key]) {
      const res = applySingleSelect(key, value, schema);
      out[key] = res.value;
      if (res.fallbackUsed && res.original != null) {
        fallbackOriginals[key] = res.original;
      }
      continue;
    }

    if (key === "score") {
      const n = Number(value);
      out[key] = Number.isFinite(n) ? Math.round(n) : 0;
      continue;
    }
    if (key === "created_at") {
      out[key] = typeof value === "string" ? value : new Date().toISOString();
      continue;
    }
    if (key === "answers_json") {
      out[key] = typeof value === "string" ? value : JSON.stringify(value == null ? {} : value);
      continue;
    }

    out[key] = typeof value === "string" ? value : String(value);
  }

  if (Object.keys(fallbackOriginals).length > 0) {
    try {
      const base = out.answers_json ? JSON.parse(out.answers_json) : {};
      const merged = { ...(typeof base === "object" && base !== null ? base : {}), _fallback_originals: fallbackOriginals };
      out.answers_json = JSON.stringify(merged);
    } catch {
      out.answers_json = JSON.stringify({ _fallback_originals: fallbackOriginals });
    }
  }

  return cleanPayload(out, schema);
}

/**
 * employee 테이블 정규화
 */
function normalizeEmployee(raw) {
  const schema = SCHEMA.employee;
  const fallbackOriginals = {};
  const out = {};

  for (const [key, value] of Object.entries(raw)) {
    if (value === null || value === undefined) continue;
    if (schema.readOnly.includes(key)) continue;

    if (schema.singleSelect[key]) {
      let v = value;
      if (key === "work_style" && typeof v === "string") v = normalizeWorkStyle(v);
      const res = applySingleSelect(key, v, schema);
      out[key] = res.value;
      if (res.fallbackUsed && res.original != null) {
        fallbackOriginals[key] = res.original;
      }
      continue;
    }

    if (schema.multipleSelects[key]) {
      const { value: arr, fallbackOriginals: fo } = applyMultipleSelects(key, value, schema);
      out[key] = arr;
      if (fo.length) fallbackOriginals[key] = fo;
      continue;
    }

    if (key === "created_time") {
      out[key] = typeof value === "string" ? value : new Date().toISOString();
      continue;
    }

    out[key] = value;
  }

  if (schema.fallbackStorageField && Object.keys(fallbackOriginals).length > 0) {
    out[schema.fallbackStorageField] = JSON.stringify({ _fallback_originals: fallbackOriginals });
  }
  return cleanPayload(out, schema);
}

/**
 * manager 테이블 정규화
 */
function normalizeManager(raw) {
  const schema = SCHEMA.manager;
  const fallbackOriginals = {};
  const out = {};

  for (const [key, value] of Object.entries(raw)) {
    if (value === null || value === undefined) continue;
    if (schema.readOnly.includes(key)) continue;

    if (schema.singleSelect[key]) {
      let v = value;
      if (key === "Company_size" && typeof v === "string") v = normalizeCompanySizeManager(v);
      const res = applySingleSelect(key, v, schema);
      out[key] = res.value;
      if (res.fallbackUsed && res.original != null) {
        fallbackOriginals[key] = res.original;
      }
      continue;
    }

    if (schema.multipleSelects[key]) {
      let val = value;
      if (key === "Required_features" && Array.isArray(val)) {
        val = val.map(normalizeRequiredFeature);
      }
      const { value: arr, fallbackOriginals: fo } = applyMultipleSelects(key, val, schema);
      out[key] = arr;
      if (fo.length) fallbackOriginals[key] = fo;
      continue;
    }

    out[key] = value;
  }

  if (schema.fallbackStorageField && Object.keys(fallbackOriginals).length > 0) {
    out[schema.fallbackStorageField] = JSON.stringify({ _fallback_originals: fallbackOriginals });
  }
  return cleanPayload(out, schema);
}

/**
 * table별 raw payload 정규화
 * - singleSelect: 허용 옵션 아니면 기본값 fallback, 원래 값은 fallbackStorageField(answers_json 등)에 저장
 * - multipleSelects: 허용 옵션만 유지, 나머지는 fallback 저장
 * - read-only 필드 제거
 * - null/undefined 제거, (옵션) 빈 문자열 제거
 *
 * @param {string} table - 'mini' | 'employee' | 'manager'
 * @param {object} raw - 전송 예정인 필드 객체
 * @returns {object} Airtable에 보낼 fields 객체
 */
export function normalizePayload(table, raw) {
  if (raw == null || typeof raw !== "object") return {};
  const r = { ...raw };
  switch (table) {
    case "mini":
      return normalizeMini(r);
    case "employee":
      return normalizeEmployee(r);
    case "manager":
      return normalizeManager(r);
    default:
      return cleanPayload(r, SCHEMA.mini);
  }
}
