/**
 * WCWI Full 진단 → Assessments 테이블 필드 매핑
 * questions.js 구조와 Airtable Assessments 스키마를 명시적으로 연결
 * 자동 추론 금지. 사람이 읽을 수 있는 MAP 객체로 선언.
 */

// eslint-disable-next-line import/no-relative-packages
import { WCWI_QUESTIONS } from "../src/constants/questions.js";

/** WCWI 문항 ID → Airtable 필드명 */
export const WCWI_QUESTION_TO_FIELD = {
  // WHO-5 (mental, scale 5)
  m1: "WHO1_PositiveMood",
  m2: "WHO2_Calm",
  m3: "WHO3_Energy",
  m4: "WHO4_RestfulSleep",
  m5: "WHO5_MeaningfulDays",
  // RYFF (psychological, scale 7)
  p1: "RYF6_Autonomy",
  p2: "RYF7_EnvMastery",
  p3: "RYF8_Growth",
  p4: "RYF9_Relations",
  p5: "RYF10_Purpose",
  p6: "RYF11_SelfAcceptance",
  // CBI (burnout, scale 5 reversed)
  b1: "CBI12_PhysicalFatigue",
  b2: "CBI13_EmotionalExhaustion",
  b3: "CBI14_TiredBeforeWork",
  b4: "CBI15_WorkDrainsMe",
  b5: "CBI16_InteractionDrainsMe",
  // NMQ (physical)
  ph1: "NMQ17_PainSites_12m",
  ph2: "NMQ18_Pain_7d",
  ph3: "NMQ19_LimitedActivity",
  // SWLS (satisfaction, scale 7)
  s1: "SWLS20_IdealLife",
  s2: "SWLS21_GoodConditions",
  s3: "SWLS22_Satisfied",
  s4: "SWLS23_AchievedImportant",
  s5: "SWLS24_ChangeLittle",
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

/** 점수 필드 (0–100, formula로 계산될 수 있음) */
export const WCWI_SCORE_FIELDS = {
  S_WHO5_0_100: "mental",
  S_Ryff_0_100: "psychological",
  S_CBI_0_100: "burnout",
  S_CBI_Health_0_100: "burnout",
  S_NMQ_Risk_0_100: "physical",
  S_NMQ_Health_0_100: "physical",
  S_SWLS_0_100: "satisfaction",
  WCWI_Total_0_100: "total",
};

/**
 * fullAnswers + bodyParts + scores → Assessments fields 객체
 * @param {object} fullAnswers - { m1: 4, m2: 5, ... }
 * @param {string[]} bodyParts - ["목", "어깨"]
 * @param {object} scores - { mental: 75, psychological: 70, ... }
 * @param {string} [email]
 */
export function wcwiPayloadToAssessmentsFields(fullAnswers, bodyParts, scores, email) {
  const fields = {};
  if (email) fields["이메일"] = email;

  for (const [qId, airtableField] of Object.entries(WCWI_QUESTION_TO_FIELD)) {
    const val = fullAnswers?.[qId];
    if (val === undefined) continue;

    const q = Object.values(WCWI_QUESTIONS)
      .flatMap((s) => s.questions)
      .find((x) => x.id === qId);
    if (!q) continue;

    if (q.type === "body") {
      const mapped = (bodyParts || [])
        .map((p) => BODY_PART_TO_NMQ[p])
        .filter(Boolean);
      if (mapped.length) fields[airtableField] = mapped;
    } else if (q.type === "yesno") {
      fields[airtableField] = val === "yes";
    } else if (q.scale === 5 && q.reversed) {
      fields[airtableField] = CBI_SCALE_5_REVERSED[val];
    } else if (q.scale === 5) {
      fields[airtableField] = SCALE_5_TO_CHOICE[val];
    } else if (q.scale === 7) {
      fields[airtableField] = SCALE_7_TO_CHOICE[val];
    }
  }

  if (scores) {
    if (typeof scores.mental === "number") fields.S_WHO5_0_100 = scores.mental;
    if (typeof scores.psychological === "number") fields.S_Ryff_0_100 = scores.psychological;
    if (typeof scores.burnout === "number") fields.S_CBI_0_100 = scores.burnout;
    if (typeof scores.physical === "number") fields.S_NMQ_Health_0_100 = scores.physical;
    if (typeof scores.satisfaction === "number") fields.S_SWLS_0_100 = scores.satisfaction;
    if (typeof scores.total === "number") fields.WCWI_Total_0_100 = scores.total;
  }

  return fields;
}
