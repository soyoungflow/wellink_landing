/**
 * WCWI Full 진단 → Assessments 테이블 필드 매핑
 * questions.js 구조와 Airtable Assessments 스키마를 명시적으로 연결
 * 자동 추론 금지. 사람이 읽을 수 있는 MAP 객체로 선언.
 */

import { WCWI_QUESTIONS } from "../src/constants/questions.js";

/** WCWI 문항 ID → Airtable fieldId */
export const WCWI_ANSWER_FIELD_IDS = {
  // WHO-5
  m1: "fldne4LTzXtyY3dPP",
  m2: "fldRiFiDH7HDHRkAT",
  m3: "fldRkpUeeBUbt3omL",
  m4: "fldv1C1IfJCRTP1RT",
  m5: "fldnCQji2UEvwzYWs",
  // RYFF
  p1: "fldfawDMss0ouL0bk",
  p2: "fldn8gzwzNPH3eWCn",
  p3: "fldusWlRYkgodcORe",
  p4: "fldWseIPvBu2XBADR",
  p5: "fldxM93hZ2QPlxN5S",
  p6: "fldWSshu8ec2neWI9",
  // CBI
  b1: "fldG44pdDaaslsRB6",
  b2: "fld84SCv0kouPShB9",
  b3: "fldtUHnZALxxZdMmn",
  b4: "fldPTvWbPa6ST4JCW",
  b5: "fldBxhEpgKWXvyWhu",
  // NMQ
  ph1: "fldVOdE6txdzrKIMU",
  ph2: "fldCng6JgSFrcmN9U",
  ph3: "fldJ73z3VNr6GY8uk",
  // SWLS
  s1: "fld1uE40P09pgEicf",
  s2: "fldu6zQNbM8EriUnT",
  s3: "fld9oPsqCaAJPj1wP",
  s4: "fld6QJJudbBHaqGaR",
  s5: "fldkCklZa50K68VOm",
};

/** 한국어 부위명 → Airtable NMQ17 choices (영문) */
export const BODY_PART_TO_NMQ = {
  목: "Neck",
  어깨: "Shoulder",
  팔꿈치: "Other",
  "손목/손": "WristHand",
  "상부 등": "UpperBack",
  "하부 등(허리)": "LowerBack",
  "엉덩이/허벅지": "Hip",
  무릎: "KneeLeg",
  "발목/발": "FootAnkle",
};

/** WHO-5 / 일반 5점 스케일: 숫자 → Airtable choice 문자열 */
export const SCALE_5_TO_CHOICE = {
  1: "1: 전혀 아니다",
  2: "2: 아니다",
  3: "3: 보통이다",
  4: "4: 그렇다",
  5: "5: 매우 그렇다",
};

/** RYFF / SWLS 7점 스케일: 숫자 → Airtable choice 문자열 */
export const SCALE_7_TO_CHOICE = {
  1: "1: 전혀 동의하지 않음",
  2: "2: 동의하지 않음",
  3: "3: 약간 동의하지 않음",
  4: "4: 중립",
  5: "5: 약간 동의함",
  6: "6: 동의함",
  7: "7: 매우 동의함",
};

/** CBI 5점 역스케일: 폼 값 1(전혀) → 0, 5(항상) → 4 */
export const CBI_SCALE_5_REVERSED = {
  1: "0: 전혀 아니다",
  2: "1: 거의 아니다",
  3: "2: 보통이다",
  4: "3: 그렇다",
  5: "4: 항상 그렇다",
};

/** 0~100 clamp */
export function clamp0to100(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return NaN;
  return Math.max(0, Math.min(100, num));
}

/** 정수 변환 */
export function toInt(n) {
  return Math.round(n);
}

export const WCWI_COMMON_FIELD_IDS = {
  email: "flddCKoLMZxYnVxym",
  tier: "fldPQs5ojYryn9bEU",
  primaryIssue: "fldxwe1RuRLeRnOex",
  consentAgreed: "Consent_Agreed",
  consentVersion: "Consent_Version",
  nmqRiskTier: "NMQ_RiskTier",
};

/** 점수 필드 resolver (정책: burnout은 risk score, 높을수록 위험) */
export const WCWI_SCORE_RESOLVERS = {
  S_WHO5_0_100: (scores) => scores?.mental,
  S_Ryff_0_100: (scores) => scores?.psychological,
  S_CBI_0_100: (scores) => scores?.burnout,
  S_CBI_Health_0_100: (scores) => 100 - scores?.burnout,
  S_NMQ_Risk_0_100: (scores) => 100 - scores?.physical,
  S_NMQ_Health_0_100: (scores) => scores?.physical,
  S_SWLS_0_100: (scores) => scores?.satisfaction,
  WCWI_Total_0_100: (scores) => scores?.total,
};

/** 하위호환 alias: 기존 이름 유지 */
export const WCWI_SCORE_FIELDS = WCWI_SCORE_RESOLVERS;

/** WCWI 점수 필드명 → Airtable fieldId */
export const WCWI_SCORE_FIELD_IDS = {
  S_WHO5_0_100: "flddMf0nbipPDrZv9",
  S_Ryff_0_100: "fldYEHeouS37B8Eur",
  S_CBI_0_100: "fldPcdZGahYBhmp3C",
  S_CBI_Health_0_100: "fldNdTvdKC6CwRADh",
  S_NMQ_Risk_0_100: "fldN10hC4GlVWOxu8",
  S_NMQ_Health_0_100: "fld7Dq7Z0RWHQU7n9",
  S_SWLS_0_100: "fldGH1kZ0r0fCMJ4s",
  WCWI_Total_0_100: "fld0zB2jboYOo9jgu",
};

/** single/multiple select choices (fieldId 기준) */
export const WCWI_SELECT_CHOICES = {
  [WCWI_COMMON_FIELD_IDS.tier]: ["Excellent", "Good", "Watch", "At Risk"],
  [WCWI_COMMON_FIELD_IDS.primaryIssue]: [
    "Burnout/Fatigue",
    "Musculoskeletal",
    "Mood/Well-being",
    "Psychological Well-being",
    "Life Satisfaction",
  ],
  [WCWI_COMMON_FIELD_IDS.nmqRiskTier]: ["Low", "Moderate", "High"],
  [WCWI_ANSWER_FIELD_IDS.m1]: Object.values(SCALE_5_TO_CHOICE),
  [WCWI_ANSWER_FIELD_IDS.m2]: Object.values(SCALE_5_TO_CHOICE),
  [WCWI_ANSWER_FIELD_IDS.m3]: Object.values(SCALE_5_TO_CHOICE),
  [WCWI_ANSWER_FIELD_IDS.m4]: Object.values(SCALE_5_TO_CHOICE),
  [WCWI_ANSWER_FIELD_IDS.m5]: Object.values(SCALE_5_TO_CHOICE),
  [WCWI_ANSWER_FIELD_IDS.p1]: Object.values(SCALE_7_TO_CHOICE),
  [WCWI_ANSWER_FIELD_IDS.p2]: Object.values(SCALE_7_TO_CHOICE),
  [WCWI_ANSWER_FIELD_IDS.p3]: Object.values(SCALE_7_TO_CHOICE),
  [WCWI_ANSWER_FIELD_IDS.p4]: Object.values(SCALE_7_TO_CHOICE),
  [WCWI_ANSWER_FIELD_IDS.p5]: Object.values(SCALE_7_TO_CHOICE),
  [WCWI_ANSWER_FIELD_IDS.p6]: Object.values(SCALE_7_TO_CHOICE),
  [WCWI_ANSWER_FIELD_IDS.b1]: Object.values(CBI_SCALE_5_REVERSED),
  [WCWI_ANSWER_FIELD_IDS.b2]: Object.values(CBI_SCALE_5_REVERSED),
  [WCWI_ANSWER_FIELD_IDS.b3]: Object.values(CBI_SCALE_5_REVERSED),
  [WCWI_ANSWER_FIELD_IDS.b4]: Object.values(CBI_SCALE_5_REVERSED),
  [WCWI_ANSWER_FIELD_IDS.b5]: Object.values(CBI_SCALE_5_REVERSED),
  [WCWI_ANSWER_FIELD_IDS.s1]: Object.values(SCALE_7_TO_CHOICE),
  [WCWI_ANSWER_FIELD_IDS.s2]: Object.values(SCALE_7_TO_CHOICE),
  [WCWI_ANSWER_FIELD_IDS.s3]: Object.values(SCALE_7_TO_CHOICE),
  [WCWI_ANSWER_FIELD_IDS.s4]: Object.values(SCALE_7_TO_CHOICE),
  [WCWI_ANSWER_FIELD_IDS.s5]: Object.values(SCALE_7_TO_CHOICE),
  [WCWI_ANSWER_FIELD_IDS.ph1]: ["Neck", "Shoulder", "UpperBack", "LowerBack", "WristHand", "Hip", "KneeLeg", "FootAnkle", "Other"],
};

const QUESTION_BY_ID = Object.fromEntries(
  Object.values(WCWI_QUESTIONS)
    .flatMap((s) => s.questions)
    .map((q) => [q.id, q])
);

const INVALID = Symbol("INVALID");

function validateSingleSelect(fieldId, value, validationErrors) {
  const choices = WCWI_SELECT_CHOICES[fieldId] || [];
  const str = String(value).trim();
  if (!choices.includes(str)) {
    validationErrors.push({
      fieldId,
      reason: `singleSelect mismatch: "${str}"`,
      allowedChoices: choices,
    });
    return INVALID;
  }
  return str;
}

function validateMultiSelect(fieldId, values, validationErrors) {
  const choices = WCWI_SELECT_CHOICES[fieldId] || [];
  const arr = (Array.isArray(values) ? values : [values])
    .map((v) => String(v).trim())
    .filter(Boolean);
  if (arr.length === 0) return [];
  const invalid = arr.filter((v) => !choices.includes(v));
  if (invalid.length) {
    validationErrors.push({
      fieldId,
      reason: `multipleSelect mismatch: ${invalid.join(", ")}`,
      allowedChoices: choices,
    });
    return INVALID;
  }
  return [...new Set(arr)];
}

function getNmqRiskTier(nmqRisk) {
  if (nmqRisk <= 33) return "Low";
  if (nmqRisk <= 66) return "Moderate";
  return "High";
}

function getPrimaryIssueFromHealthScores(fieldsById) {
  const issueRules = [
    // Priority order for tie-break within ±3:
    // Burnout/Fatigue > Musculoskeletal > Mood/Well-being > Psychological Well-being > Life Satisfaction
    { issue: "Burnout/Fatigue", score: fieldsById[WCWI_SCORE_FIELD_IDS.S_CBI_Health_0_100] },
    { issue: "Musculoskeletal", score: fieldsById[WCWI_SCORE_FIELD_IDS.S_NMQ_Health_0_100] },
    { issue: "Mood/Well-being", score: fieldsById[WCWI_SCORE_FIELD_IDS.S_WHO5_0_100] },
    { issue: "Psychological Well-being", score: fieldsById[WCWI_SCORE_FIELD_IDS.S_Ryff_0_100] },
    { issue: "Life Satisfaction", score: fieldsById[WCWI_SCORE_FIELD_IDS.S_SWLS_0_100] },
  ].filter((r) => typeof r.score === "number");

  if (issueRules.length === 0) return null;
  const minScore = Math.min(...issueRules.map((r) => r.score));
  return issueRules.find((r) => r.score <= minScore + 3)?.issue || null;
}

function setFieldValue(fieldsById, fieldId, value) {
  if (!fieldId || value === undefined || value === null) return;
  if (typeof value === "number" && !Number.isFinite(value)) return;
  if (Array.isArray(value) && value.length === 0) return;
  fieldsById[fieldId] = value;
}

export function getWcwiTier(total) {
  if (total >= 80) return "Excellent";
  if (total >= 60) return "Good";
  if (total >= 40) return "Watch";
  return "At Risk";
}

/**
 * 단일 payload 빌더 (뷰/API 공통 사용)
 * @param {{answers?: object, email?: string, scores?: object, tiers?: object, bodyParts?: string[]}} params
 * @returns {{fieldsById: Record<string, unknown>, validationErrors: Array<{fieldId: string, reason: string, allowedChoices?: string[]}>}}
 */
export function buildAssessmentFields({ answers = {}, email, scores = {}, tiers = {}, bodyParts = [] } = {}) {
  const fieldsById = {};
  const validationErrors = [];

  if (email) {
    setFieldValue(fieldsById, WCWI_COMMON_FIELD_IDS.email, String(email).trim());
  }

  for (const [qId, fieldId] of Object.entries(WCWI_ANSWER_FIELD_IDS)) {
    const val = answers?.[qId];
    const q = QUESTION_BY_ID[qId];
    if (!q || val === undefined) continue;

    if (q.type === "body") {
      const mapped = (Array.isArray(bodyParts) ? bodyParts : [])
        .map((p) => BODY_PART_TO_NMQ[p])
        .filter(Boolean);
      const validated = validateMultiSelect(fieldId, mapped, validationErrors);
      if (validated !== INVALID) setFieldValue(fieldsById, fieldId, validated);
      continue;
    }

    if (q.type === "yesno") {
      setFieldValue(fieldsById, fieldId, val === "yes");
      continue;
    }

    if (q.scale === 5 && q.reversed) {
      const choice = CBI_SCALE_5_REVERSED[val];
      const validated = validateSingleSelect(fieldId, choice, validationErrors);
      if (validated !== INVALID) setFieldValue(fieldsById, fieldId, validated);
      continue;
    }

    if (q.scale === 5) {
      const choice = SCALE_5_TO_CHOICE[val];
      const validated = validateSingleSelect(fieldId, choice, validationErrors);
      if (validated !== INVALID) setFieldValue(fieldsById, fieldId, validated);
      continue;
    }

    if (q.scale === 7) {
      const choice = SCALE_7_TO_CHOICE[val];
      const validated = validateSingleSelect(fieldId, choice, validationErrors);
      if (validated !== INVALID) setFieldValue(fieldsById, fieldId, validated);
    }
  }

  for (const [fieldName, resolver] of Object.entries(WCWI_SCORE_RESOLVERS)) {
    const fieldId = WCWI_SCORE_FIELD_IDS[fieldName];
    const raw = resolver(scores || {});
    const normalized = toInt(clamp0to100(raw));
    if (Number.isFinite(normalized)) setFieldValue(fieldsById, fieldId, normalized);
  }

  // WCWI_PrimaryIssue: pick lowest health-domain score with ±3 tie tolerance and fixed priority order.
  const primaryIssue = getPrimaryIssueFromHealthScores(fieldsById);
  if (primaryIssue) {
    const validatedIssue = validateSingleSelect(WCWI_COMMON_FIELD_IDS.primaryIssue, primaryIssue, validationErrors);
    if (validatedIssue !== INVALID) {
      setFieldValue(fieldsById, WCWI_COMMON_FIELD_IDS.primaryIssue, validatedIssue);
    }
  }

  // NMQ_RiskTier: derive from existing NMQ risk score only.
  const nmqRisk = fieldsById[WCWI_SCORE_FIELD_IDS.S_NMQ_Risk_0_100];
  if (typeof nmqRisk === "number") {
    const nmqRiskTier = getNmqRiskTier(nmqRisk);
    const validatedNmqRiskTier = validateSingleSelect(WCWI_COMMON_FIELD_IDS.nmqRiskTier, nmqRiskTier, validationErrors);
    if (validatedNmqRiskTier !== INVALID) {
      setFieldValue(fieldsById, WCWI_COMMON_FIELD_IDS.nmqRiskTier, validatedNmqRiskTier);
    }
  }

  const tierValue = tiers?.WCWI_Tier || getWcwiTier(scores?.total ?? 0);
  const validatedTier = validateSingleSelect(WCWI_COMMON_FIELD_IDS.tier, tierValue, validationErrors);
  if (validatedTier !== INVALID) setFieldValue(fieldsById, WCWI_COMMON_FIELD_IDS.tier, validatedTier);

  // Consent fields (submission-time defaults)
  setFieldValue(fieldsById, WCWI_COMMON_FIELD_IDS.consentAgreed, true);
  setFieldValue(fieldsById, WCWI_COMMON_FIELD_IDS.consentVersion, "v1_2026-02-15");

  // Developer-safety check:
  // If both CBI Risk/Health are present, they must sum to 100 (allow ±1 for rounding).
  const cbiRiskId = WCWI_SCORE_FIELD_IDS.S_CBI_0_100;
  const cbiHealthId = WCWI_SCORE_FIELD_IDS.S_CBI_Health_0_100;
  const cbiRisk = fieldsById[cbiRiskId];
  const cbiHealth = fieldsById[cbiHealthId];
  if (typeof cbiRisk === "number" && typeof cbiHealth === "number") {
    const cbiSum = cbiRisk + cbiHealth;
    if (Math.abs(cbiSum - 100) > 1) {
      console.error("[WCWI CBI integrity validation failed]", {
        [cbiRiskId]: cbiRisk,
        [cbiHealthId]: cbiHealth,
        sum: cbiSum,
      });
      validationErrors.push({
        fieldId: cbiHealthId,
        reason: "CBI risk/health integrity check failed",
      });
    }
  }

  return { fieldsById, validationErrors };
}

/**
 * Legacy helper (기존 호출부 호환)
 * @deprecated buildAssessmentFields 사용 권장
 */
export function wcwiPayloadToAssessmentsFields(fullAnswers, bodyParts, scores, email) {
  const { fieldsById } = buildAssessmentFields({
    answers: fullAnswers,
    bodyParts,
    scores,
    email,
  });
  return fieldsById;
}
