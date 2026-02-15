/**
 * Airtable 스키마 기반 폼 payload → Airtable fields 변환
 * - Validation + Normalization
 * - Select 옵션: choices에 없는 값 처리 (config: ERROR | SYNONYM_MAP | OTHER_FALLBACK)
 */

/** @typedef { { fieldName: string, fieldId: string, fieldType: string, readOnly?: boolean, choices?: string[], linkedTableId?: string } } FieldSpec */
/** @typedef { { tableId: string, tableName: string, fields: FieldSpec[], byName: Record<string, FieldSpec> } } TableSchema */

/**
 * @typedef {'ERROR'|'SYNONYM_MAP'|'OTHER_FALLBACK'} SelectInvalidHandling
 * - ERROR: choices에 없으면 validation 에러로 중단 (기본)
 * - SYNONYM_MAP: SYNONYM_MAP으로 치환
 * - OTHER_FALLBACK: "기타"/"Other" 등이 choices에 있으면 그걸로 치환
 */

/**
 * @typedef {Object} NormalizeConfig
 * @property {SelectInvalidHandling} [selectInvalidHandling='ERROR']
 * @property {Record<string, Record<string, string>>} [synonymMap] - { fieldName: { "입력값": "choices값" } }
 * @property {string[]} [otherOptionNames] - "기타"/"Other" 등 (OTHER_FALLBACK일 때 사용)
 */

const DEFAULT_CONFIG = {
  selectInvalidHandling: "ERROR",
  synonymMap: {},
  otherOptionNames: ["기타", "Other", "기타/Other"],
};

/** 기존 프론트 매핑과 동일한 synonym (SYNONYM_MAP 모드 시 사용) */
export const DEFAULT_SYNONYM_MAP = {
  work_style: { 혼합형: "혼합형(출근+재택)", "재택 근무": "재택근무" },
  company_size: { "10~49명": "10~49명", "10~50명": "10-50명", "50~200명": "50-200명" },
  Company_size: { "10~50명": "10-50명", "50~200명": "50-200명" },
  payment_amount: {
    "1만원 미만": "10,000원 미만",
    "1만원~3만원": "10,000~30,000원",
    "3만원~5만원": "30,000~50,000원",
    "5만원 이상": "50,000원 이상",
    "가격에 따라 결정": "가격에 따라 결정할 의향이 있습니다",
  },
  Required_features: {
    "정신건강 콘텐츠": "정신 건강 콘텐츠",
    "요가/필라테스": "요가, 필라테스 등 운동 콘텐츠",
    "분석 대시보드": "데이터 분석 및 대시보드",
  },
  Cheap_price_range: {
    "인당 5천원~1만원": "인당 5천원 ~1만원",
    "인당 1만원~2만원": "인당 1~2만원",
    "인당 2만원~3만원": "인당 2~3만원",
  },
};

/** 테이블별 synonym override (같은 필드명이라도 테이블마다 Airtable choice가 다름) */
export const TABLE_SYNONYM_OVERRIDE = {
  employee: {
    Agreement: { "예,동의합니다.": "네, 동의합니다." },
  },
  manager: {
    Agreement: { "예,동의합니다.": "네,동의합니다." },
    Wellness_importance: {
      "1": "1 전혀 아니다",
      "2": "2 아니다",
      "3": "3 보통이다",
      "4": "4 그렇다",
      "5": "5 매우그렇다",
    },
  },
};

const REC_ID_PATTERN = /^rec[A-Za-z0-9]{14}$/;

/**
 * 날짜/시간 → ISO8601
 */
function toISO8601(value) {
  if (value == null) return null;
  if (typeof value === "number") {
    if (value > 1e12) return new Date(value).toISOString();
    return new Date(value * 1000).toISOString();
  }
  const s = String(value).trim();
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * 숫자 파싱 ("10명", "10,000" 등)
 */
function parseNumber(value) {
  if (value == null) return NaN;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const s = String(value).replace(/[^\d.-]/g, "").replace(/,/g, "");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : NaN;
}

/**
 * 폼 키 → Airtable 필드명 매핑 (한 곳에서 관리)
 * 프론트와 동기화 필요
 */
export const FORM_TO_AIRTABLE_MAP = {
  employee: {
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
  },
  manager: {
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
  },
  wcwi: {
    WHO1_PositiveMood: "WHO1_PositiveMood",
    Participant_ID: "Participant_ID",
    Program_ID: "Program_ID",
  },
};

/**
 * 입력 객체의 키를 Airtable 필드명으로 매핑
 * @param {string} tableKey
 * @param {object} raw
 */
export function mapFormKeysToAirtable(tableKey, raw) {
  const map = FORM_TO_AIRTABLE_MAP[tableKey];
  if (!map || !raw || typeof raw !== "object") return { ...raw };
  const out = {};
  for (const [k, v] of Object.entries(raw)) {
    const airtableKey = map[k] || k;
    out[airtableKey] = v;
  }
  return out;
}

/**
 * 단일 필드 변환
 * @param {string} fieldName
 * @param {unknown} value
 * @param {FieldSpec} spec
 * @param {NormalizeConfig} config
 * @returns {{ value?: unknown, error?: { fieldName: string, expectedType: string, receivedValue: unknown, reason: string } }}
 */
function normalizeField(fieldName, value, spec, config) {
  const err = (reason) => ({
    error: { fieldName, expectedType: spec.fieldType, receivedValue: value, reason },
  });

  if (spec.readOnly) {
    return {}; // read-only는 출력에서 제외
  }

  if (value === null || value === undefined || value === "") {
    return {}; // 빈값은 필드 제외 (Airtable에 보내지 않음)
  }

  switch (spec.fieldType) {
    case "singleSelect": {
      const choices = spec.choices || [];
      const str = String(value).trim();
      if (choices.includes(str)) return { value: str };

      // config 처리
      if (config.synonymMap?.[fieldName]?.[str]) {
        return { value: config.synonymMap[fieldName][str] };
      }
      if (config.selectInvalidHandling === "OTHER_FALLBACK") {
        const other = (config.otherOptionNames || []).find((o) => choices.includes(o));
        if (other) return { value: other };
      }
      if (config.selectInvalidHandling === "SYNONYM_MAP" && config.synonymMap?.[fieldName]) {
        // SYNONYM_MAP에 없으면 에러
      }
      return err(`singleSelect: "${str}"가 choices에 없습니다. 허용: ${choices.join(", ")}`);
    }

    case "multipleSelects": {
      const choices = spec.choices || [];
      const arr = Array.isArray(value) ? value : [value];
      const normalized = arr.map((v) => String(v).trim()).filter(Boolean);
      const valid = [];
      const invalid = [];
      for (const v of normalized) {
        if (choices.includes(v)) {
          valid.push(v);
        } else if (config.synonymMap?.[fieldName]?.[v]) {
          valid.push(config.synonymMap[fieldName][v]);
        } else if (config.selectInvalidHandling === "OTHER_FALLBACK") {
          const other = (config.otherOptionNames || []).find((o) => choices.includes(o));
          if (other) valid.push(other);
          else invalid.push(v);
        } else {
          invalid.push(v);
        }
      }
      if (invalid.length > 0 && config.selectInvalidHandling === "ERROR") {
        return err(`multipleSelects: 허용되지 않은 값: ${invalid.join(", ")}. 허용: ${choices.join(", ")}`);
      }
      const unique = [...new Set(valid)];
      return unique.length ? { value: unique } : {};
    }

    case "multipleRecordLinks":
    case "linkedRecord": {
      const ids = Array.isArray(value) ? value : [value];
      const recIds = ids.filter((v) => typeof v === "string" && REC_ID_PATTERN.test(v));
      if (recIds.length === 0 && ids.length > 0) {
        return err(`linkedRecord: rec id 형식이어야 합니다. (예: recXXXXXXXXXXXXXX)`);
      }
      return recIds.length ? { value: spec.fieldType === "multipleRecordLinks" ? recIds : recIds[0] } : {};
    }

    case "date":
    case "dateTime": {
      const iso = toISO8601(value);
      if (!iso) return err(`${spec.fieldType}: 유효한 날짜 형식이 아닙니다.`);
      return { value: spec.fieldType === "date" ? iso.slice(0, 10) : iso };
    }

    case "number":
    case "currency": {
      const n = parseNumber(value);
      if (Number.isNaN(n)) return err(`${spec.fieldType}: 숫자로 변환할 수 없습니다.`);
      return { value: n };
    }

    case "checkbox": {
      if (typeof value === "boolean") return { value };
      const s = String(value).toLowerCase();
      return { value: ["true", "1", "yes", "예", "y"].includes(s) };
    }

    case "email": {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(value))) return err("email: 유효한 이메일 형식이 아닙니다.");
      return { value: String(value).trim() };
    }

    case "url": {
      try {
        new URL(String(value));
        return { value: String(value).trim() };
      } catch {
        return err("url: 유효한 URL 형식이 아닙니다.");
      }
    }

    case "phoneNumber": {
      const phone = String(value).replace(/\s/g, "");
      if (phone.length < 9) return err("phoneNumber: 올바른 전화번호 형식이 아닙니다.");
      return { value: String(value).trim() };
    }

    case "multipleAttachments":
    case "attachment": {
      if (typeof value === "string") return { value: [{ url: value }] };
      if (Array.isArray(value)) {
        const arr = value.map((v) => (typeof v === "string" ? { url: v } : v)).filter((a) => a?.url);
        return arr.length ? { value: arr } : {};
      }
      return {};
    }

    default:
      // singleLineText, multilineText, richText, duration, percent, rating, barcode, etc.
      return { value: typeof value === "string" ? value : String(value) };
  }
}

/**
 * payload → Airtable fields 변환 (스키마 기반)
 * @param {TableSchema} schema
 * @param {object} payload
 * @param {NormalizeConfig} [config]
 * @returns {{ fields: object, fieldsById: object, errors: Array<{ fieldName: string, fieldId?: string, expectedType: string, receivedValue: unknown, reason: string }> }}
 */
export function normalizePayloadWithSchema(schema, payload, config = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  if (cfg.selectInvalidHandling === "SYNONYM_MAP" && Object.keys(cfg.synonymMap || {}).length === 0) {
    cfg.synonymMap = { ...DEFAULT_SYNONYM_MAP };
  }
  const errors = [];
  const fields = {};
  const fieldsById = {};

  const keys = Object.keys(payload || {});
  for (const key of keys) {
    const spec = schema.byName[key];
    const value = payload[key];

    if (!spec) {
      continue;
    }

    const result = normalizeField(key, value, spec, cfg);
    if (result.error) {
      errors.push({ ...result.error, fieldId: spec.fieldId });
    } else if (result.value !== undefined) {
      fields[key] = result.value;
      if (spec.fieldId) fieldsById[spec.fieldId] = result.value;
    }
  }

  return { fields, fieldsById, errors };
}
