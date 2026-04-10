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
/** employee 테이블 willingness_to_use_service 전용 (Airtable choices와 동일: 1=매우있다 ~ 5=전혀없다) */
const LIKERT_5_WILLINGNESS = [
  "1 (매우있다)",
  "2 (있다)",
  "3 (보통이다)",
  "4 (별로없다)",
  "5 (전혀없다)",
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
        options: ["전일 출근", "재택근무", "혼합형(출근+재택)"],
        default: "전일 출근",
      },
      physical_discomfort_level: { options: LIKERT_5, default: "3 (보통이다)" },
      mental_stress_level: { options: LIKERT_5, default: "3 (보통이다)" },
      burnout_experience: { options: LIKERT_5, default: "3 (보통이다)" },
      need_for_wellness_service: { options: LIKERT_5, default: "3 (보통이다)" },
      interest_in_short_program: { options: LIKERT_5, default: "3 (보통이다)" },
      willingness_to_use_service: { options: LIKERT_5_WILLINGNESS, default: "3 (보통이다)" },
      company_support_expectation: { options: LIKERT_5, default: "3 (보통이다)" },
      source: {
        options: ["내부 링크", "외부 캠페인", "직접 방문", "기타"],
        default: "기타",
      },
      Agreement: { options: ["네, 동의합니다."], default: "네, 동의합니다." },
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
        "10,000원 미만",
        "10,000~30,000원",
        "30,000~50,000원",
        "50,000원 이상",
        "가격에 따라 결정할 의향이 있습니다",
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
      Cheap_price_range: {
        options: ["인당 5천원 ~1만원", "인당 1~2만원", "인당 2~3만원"],
        default: "인당 1~2만원",
      },
      Agreement: { options: ["네,동의합니다."], default: "네,동의합니다." },
    },
    multipleSelects: {
      Required_features: [
        "정신 건강 콘텐츠",
        "요가, 필라테스 등 운동 콘텐츠",
        "번아웃 평가 및 리포트",
        "데이터 분석 및 대시보드",
        "기타",
      ],
      Wellness_importance: [
        "1 전혀 아니다",
        "2 아니다",
        "3 보통이다",
        "4 그렇다",
        "5 매우그렇다",
      ],
    },
    readOnly: ["Company", "Created_time", "Attachments"],
    fallbackStorageField: null,
    omitEmptyString: false,
  },
};

/** work_style 프론트 값 → Airtable 옵션 (혼합형 → 혼합형(출근+재택), 재택 공백 통일) */
function normalizeWorkStyle(v) {
  if (v === "혼합형") return "혼합형(출근+재택)";
  if (v === "재택 근무") return "재택근무";
  return v;
}

/** Company_size 프론트 값 → Airtable 옵션 (물결 → 하이픈) */
function normalizeCompanySizeManager(v) {
  if (v === "10~50명") return "10-50명";
  if (v === "50~200명") return "50-200명";
  return v;
}

/** manager Required_features 프론트 라벨 → Airtable 옵션 (정확 문자열 일치) */
const MANAGER_REQUIRED_FEATURES_MAP = {
  "요가/필라테스": "요가, 필라테스 등 운동 콘텐츠",
  "분석 대시보드": "데이터 분석 및 대시보드",
};
function normalizeRequiredFeature(v) {
  const s = String(v).trim();
  return MANAGER_REQUIRED_FEATURES_MAP[s] ?? s;
}

/** employee payment_amount 프론트 라벨 → Airtable 옵션 */
const EMPLOYEE_PAYMENT_AMOUNT_MAP = {
  "1만원 미만": "10,000원 미만",
  "1만원~3만원": "10,000~30,000원",
  "3만원~5만원": "30,000~50,000원",
  "5만원 이상": "50,000원 이상",
  "가격에 따라 결정": "가격에 따라 결정할 의향이 있습니다",
};
function normalizePaymentAmount(v) {
  if (v == null) return v;
  const s = String(v).trim();
  return EMPLOYEE_PAYMENT_AMOUNT_MAP[s] ?? s;
}

/** manager Cheap_price_range 프론트 값 → Airtable 옵션 (문구 정확 일치) */
const MANAGER_CHEAP_PRICE_MAP = {
  "인당 5천원~1만원": "인당 5천원 ~1만원",
  "인당 1만원~2만원": "인당 1~2만원",
  "인당 2만원~3만원": "인당 2~3만원",
};
function normalizeCheapPriceRange(v) {
  if (v == null) return v;
  const s = String(v).trim();
  return MANAGER_CHEAP_PRICE_MAP[s] ?? s;
}

/** manager Wellness_importance: 숫자 1–5 → Airtable 옵션 문자열 */
const MANAGER_WELLNESS_IMPORTANCE_OPTIONS = {
  1: "1 전혀 아니다",
  2: "2 아니다",
  3: "3 보통이다",
  4: "4 그렇다",
  5: "5 매우그렇다",
};
function normalizeWellnessImportance(value) {
  if (value == null) return [];
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1 || n > 5) return Array.isArray(value) ? value : [];
  const opt = MANAGER_WELLNESS_IMPORTANCE_OPTIONS[Math.round(n)];
  return opt ? [opt] : [];
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
      let val = value;
      if (key === "payment_amount" && (Array.isArray(val) || typeof val === "string")) {
        const arr = Array.isArray(val) ? val : [val];
        val = arr.map(normalizePaymentAmount);
      }
      const { value: arr, fallbackOriginals: fo } = applyMultipleSelects(key, val, schema);
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
      if (key === "Cheap_price_range" && v != null) v = normalizeCheapPriceRange(v);
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
      if (key === "Wellness_importance" && (typeof val === "number" || (typeof val === "string" && /^[1-5]$/.test(String(val).trim())))) {
        val = normalizeWellnessImportance(val);
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

/**
 * 정규화된 payload 검증 (전송 직전 호출)
 * - read-only 필드 포함 여부, select 값 허용 여부 등 간단 검사
 * @param {string} table - 'mini' | 'employee' | 'manager'
 * @param {object} payload - normalizePayload() 결과
 * @returns {{ valid: boolean, errors: Array<{ table: string, field: string, value: unknown, reason: string }> }}
 */
export function validatePayload(table, payload) {
  const errors = [];
  const schema = SCHEMA[table];
  if (!schema) {
    errors.push({ table, field: "", value: null, reason: "알 수 없는 테이블입니다." });
    return { valid: false, errors };
  }
  const readOnly = new Set(schema.readOnly || []);
  for (const [key, value] of Object.entries(payload)) {
    if (readOnly.has(key)) {
      errors.push({ table, field: key, value, reason: "읽기 전용 필드는 전송할 수 없습니다." });
      continue;
    }
    if (schema.singleSelect[key]) {
      const opts = schema.singleSelect[key].options;
      if (value != null && value !== "" && !opts.includes(value)) {
        errors.push({ table, field: key, value, reason: `허용 옵션이 아닙니다. 허용: ${opts.join(", ")}` });
      }
    }
    if (schema.multipleSelects[key] && Array.isArray(value)) {
      const allowed = new Set(schema.multipleSelects[key]);
      const invalid = value.filter((v) => !allowed.has(v));
      if (invalid.length) {
        errors.push({ table, field: key, value: invalid, reason: `허용 옵션이 아닌 값이 포함되어 있습니다. 허용: ${schema.multipleSelects[key].join(", ")}` });
      }
    }
  }
  return { valid: errors.length === 0, errors };
}
