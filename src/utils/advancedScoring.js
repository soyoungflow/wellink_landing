/**
 * WELLINK 고급 스코어링 모듈
 *
 * - Z점수 기반 분포 분석 (모집단 대비 위치)
 * - 번아웃 가속도 탐지 (Trend Analysis)
 * - 위험 가중치 연쇄 반응 (Interaction Effect)
 * - 정규화 → 가중치 부여 → 컷오프 설정 (집중 케어 대상 분석)
 * - 웰니스 프로그램 추천 엔진
 */

/**
 * 1. Z점수 기반 분포 분석
 * 개인 점수가 모집단 내 어디에 위치하는지 표준화
 *
 * @param {number} score - 개인 점수 (0~100)
 * @param {number} populationMean - 모집단 평균
 * @param {number} populationStdDev - 모집단 표준편차
 * @returns {{ zScore: number, percentile: number, position: string }}
 */
export function calculateZScore(score, populationMean, populationStdDev) {
  if (populationStdDev === 0) {
    return { zScore: 0, percentile: 50, position: "평균" };
  }

  const zScore = (score - populationMean) / populationStdDev;

  // 표준정규분포 CDF 근사 (Abramowitz & Stegun 근사식)
  const percentile = Math.round(normalCDF(zScore) * 100);

  let position;
  if (zScore >= 2) position = "상위 2% (매우 우수)";
  else if (zScore >= 1) position = "상위 16% (우수)";
  else if (zScore >= 0) position = "상위 50% (평균 이상)";
  else if (zScore >= -1) position = "하위 50% (평균 이하)";
  else if (zScore >= -2) position = "하위 16% (주의)";
  else position = "하위 2% (위험)";

  return {
    zScore: Math.round(zScore * 100) / 100,
    percentile,
    position,
  };
}

/** 표준정규분포 CDF 근사 */
function normalCDF(z) {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.sqrt(2);
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1 + sign * y);
}

/**
 * 전체 영역별 Z점수 분석
 * MVP 초기에는 기본 모집단 통계 사용 (추후 실데이터로 교체)
 */
export const DEFAULT_POPULATION_STATS = {
  mental:        { mean: 55, stdDev: 18 },
  psychological: { mean: 58, stdDev: 16 },
  burnout:       { mean: 45, stdDev: 20 }, // 위험 점수 (높을수록 나쁨)
  physical:      { mean: 60, stdDev: 22 },
  satisfaction:  { mean: 52, stdDev: 19 },
  total:         { mean: 56, stdDev: 14 },
};

export function calculateAllZScores(scores, populationStats = DEFAULT_POPULATION_STATS) {
  const result = {};
  Object.keys(scores).forEach((key) => {
    const stats = populationStats[key];
    if (stats) {
      result[key] = calculateZScore(scores[key], stats.mean, stats.stdDev);
    }
  });
  return result;
}

/**
 * 2. 번아웃 가속도 탐지 (Trend Analysis)
 * 이전 검사 대비 급격한 점수 변화 감지
 *
 * @param {Object} currentScores - 현재 점수
 * @param {Object} previousScores - 이전 점수
 * @param {number} daysBetween - 두 검사 사이 일수
 * @param {number} dropThreshold - 하락 임계값 (기본 15점)
 * @returns {{ alerts: Array, hasBurnoutAcceleration: boolean }}
 */
export function detectBurnoutAcceleration(currentScores, previousScores, daysBetween = 30, dropThreshold = 15) {
  if (!previousScores) return { alerts: [], hasBurnoutAcceleration: false };

  const alerts = [];
  const domains = ["mental", "psychological", "physical", "satisfaction"];

  // 건강 점수 하락 감지
  domains.forEach((key) => {
    const current = currentScores[key] ?? 0;
    const previous = previousScores[key] ?? 0;
    const drop = previous - current;

    if (drop >= dropThreshold) {
      const velocity = daysBetween > 0 ? (drop / daysBetween).toFixed(1) : "N/A";
      alerts.push({
        domain: key,
        type: "rapid_decline",
        severity: drop >= 25 ? "critical" : "warning",
        message: `${getDomainLabel(key)}: ${previous}점 → ${current}점 (${drop}점 하락, ${velocity}점/일)`,
        drop,
        velocity: parseFloat(velocity),
      });
    }
  });

  // 번아웃 위험 점수 상승 감지 (높을수록 나쁨)
  const burnoutCurrent = currentScores.burnout ?? 0;
  const burnoutPrevious = previousScores.burnout ?? 0;
  const burnoutRise = burnoutCurrent - burnoutPrevious;

  if (burnoutRise >= dropThreshold) {
    alerts.push({
      domain: "burnout",
      type: "burnout_acceleration",
      severity: burnoutRise >= 25 ? "critical" : "warning",
      message: `번아웃 위험: ${burnoutPrevious}점 → ${burnoutCurrent}점 (${burnoutRise}점 상승)`,
      drop: burnoutRise,
    });
  }

  // 현재 점수가 정상이어도 급격한 하락이면 경보
  const hasAcceleration = alerts.some((a) => a.type === "burnout_acceleration" || a.severity === "critical");

  return { alerts, hasBurnoutAcceleration: hasAcceleration };
}

function getDomainLabel(key) {
  const labels = {
    mental: "정신적 웰빙",
    psychological: "심리적 웰빙",
    burnout: "번아웃",
    physical: "신체 건강",
    satisfaction: "삶의 만족도",
  };
  return labels[key] || key;
}

/**
 * 3. 위험 가중치 연쇄 반응 (Interaction Effect)
 * 복수 영역이 동시에 낮으면 위험도를 곱절로 높임
 *
 * @param {Object} scores - 영역별 점수
 * @param {number} lowThreshold - 저점 기준 (기본 40)
 * @returns {{ interactionScore: number, compoundRisks: Array, riskMultiplier: number }}
 */
export function calculateInteractionEffect(scores, lowThreshold = 40) {
  const compoundRisks = [];

  // burnout은 위험 점수이므로 건강 점수로 변환
  const healthScores = {
    mental: scores.mental ?? 50,
    psychological: scores.psychological ?? 50,
    burnout: 100 - (scores.burnout ?? 50), // 건강 점수로 변환
    physical: scores.physical ?? 50,
    satisfaction: scores.satisfaction ?? 50,
  };

  const lowDomains = Object.entries(healthScores)
    .filter(([, v]) => v < lowThreshold)
    .map(([k]) => k);

  // 연쇄 반응 규칙
  const interactions = [
    {
      domains: ["mental", "psychological"],
      label: "정신-심리 복합 위험",
      multiplier: 1.5,
      description: "정신 건강과 심리적 웰빙이 동시에 낮으면 우울 위험이 급격히 증가합니다.",
    },
    {
      domains: ["burnout", "mental"],
      label: "번아웃-정신 복합 위험",
      multiplier: 1.4,
      description: "번아웃과 정신 건강이 동시에 악화되면 직무 기능이 크게 저하됩니다.",
    },
    {
      domains: ["physical", "burnout"],
      label: "신체-번아웃 복합 위험",
      multiplier: 1.3,
      description: "신체 통증과 번아웃이 겹치면 회복이 매우 어려워집니다.",
    },
    {
      domains: ["mental", "satisfaction"],
      label: "정신-만족도 복합 위험",
      multiplier: 1.3,
      description: "정신 건강과 삶의 만족도가 동시에 낮으면 동기 부여가 사라집니다.",
    },
    {
      domains: ["mental", "psychological", "burnout"],
      label: "3중 복합 위험",
      multiplier: 2.0,
      description: "정신, 심리, 번아웃 3개 영역이 모두 위험합니다. 즉각적인 개입이 필요합니다.",
    },
  ];

  let maxMultiplier = 1;

  interactions.forEach((rule) => {
    const allLow = rule.domains.every((d) => lowDomains.includes(d));
    if (allLow) {
      compoundRisks.push(rule);
      maxMultiplier = Math.max(maxMultiplier, rule.multiplier);
    }
  });

  // 전체 저점 개수에 따른 추가 가중
  if (lowDomains.length >= 4) maxMultiplier = Math.max(maxMultiplier, 2.5);

  // 상호작용 점수: 기본 위험도 * 곱배
  const baseRisk = lowDomains.length * 20;
  const interactionScore = Math.min(100, Math.round(baseRisk * maxMultiplier));

  return {
    interactionScore,
    compoundRisks,
    riskMultiplier: maxMultiplier,
    lowDomains,
    lowDomainCount: lowDomains.length,
  };
}

/**
 * 4. 정규화 → 가중치 부여 → 컷오프 기반 집중 케어 대상 분석
 *
 * @param {Object} scores - 영역별 점수
 * @returns {{ careLevel: string, carePriority: string[], totalWeightedRisk: number, cutoffResult: Object }}
 */
export function analyzeCareTarget(scores) {
  // 가중치 (위험도 기여도)
  const riskWeights = {
    mental:        0.25,
    psychological: 0.20,
    burnout:       0.25, // 번아웃은 이미 위험 점수
    physical:      0.15,
    satisfaction:  0.15,
  };

  // 위험 점수 정규화 (0~100, 높을수록 위험)
  const riskScores = {
    mental:        100 - (scores.mental ?? 50),
    psychological: 100 - (scores.psychological ?? 50),
    burnout:       scores.burnout ?? 50, // 이미 위험 점수
    physical:      100 - (scores.physical ?? 50),
    satisfaction:  100 - (scores.satisfaction ?? 50),
  };

  // 가중 위험도 합산
  let totalWeightedRisk = 0;
  Object.entries(riskWeights).forEach(([key, weight]) => {
    totalWeightedRisk += (riskScores[key] ?? 0) * weight;
  });
  totalWeightedRisk = Math.round(totalWeightedRisk);

  // 우선순위 정렬 (위험도 높은 순)
  const carePriority = Object.entries(riskScores)
    .sort(([, a], [, b]) => b - a)
    .filter(([, v]) => v >= 40)
    .map(([k]) => getDomainLabel(k));

  // 컷오프 기반 케어 레벨
  let careLevel;
  if (totalWeightedRisk >= 70) careLevel = "INTENSIVE"; // 집중 케어
  else if (totalWeightedRisk >= 50) careLevel = "ACTIVE";    // 적극 관리
  else if (totalWeightedRisk >= 30) careLevel = "MONITOR";   // 모니터링
  else careLevel = "MAINTAIN";                                // 유지

  const careLevelLabels = {
    INTENSIVE: { label: "집중 케어 대상", color: "#D32F2F", description: "전문 상담 및 즉각적 개입이 필요합니다." },
    ACTIVE:    { label: "적극 관리 대상", color: "#FF5722", description: "정기적인 프로그램 참여를 권장합니다." },
    MONITOR:   { label: "모니터링 대상", color: "#FF9800", description: "정기 체크인으로 상태를 관찰합니다." },
    MAINTAIN:  { label: "유지 관리",     color: "#4CAF50", description: "현재 상태를 꾸준히 유지하세요." },
  };

  return {
    careLevel,
    careLevelInfo: careLevelLabels[careLevel],
    carePriority,
    totalWeightedRisk,
    riskScores,
  };
}

/**
 * 5. 웰니스 프로그램 추천 엔진
 * 5가지 지표의 점수에 따라 맞춤형 프로그램 추천
 *
 * @param {Object} scores - 영역별 점수
 * @returns {Array<{ name: string, category: string, priority: number, reason: string }>}
 */
export function recommendPrograms(scores) {
  const programs = [];

  // 번아웃 관련 (위험 점수 기준)
  if (scores.burnout >= 60) {
    programs.push(
      { name: "2분 마음챙김 호흡법", category: "번아웃", priority: 1, reason: "번아웃 고위험 상태의 즉각적 스트레스 완화" },
      { name: "점진적 근이완법 (PMR)", category: "번아웃", priority: 2, reason: "신체 긴장 이완을 통한 번아웃 완화" },
    );
  } else if (scores.burnout >= 40) {
    programs.push(
      { name: "업무 중 마이크로 휴식", category: "번아웃", priority: 3, reason: "번아웃 예방을 위한 규칙적 휴식" },
    );
  }

  // 정신적 웰빙
  if (scores.mental < 40) {
    programs.push(
      { name: "수면 위생 개선 프로그램", category: "정신건강", priority: 1, reason: "정신적 웰빙 향상의 기본인 수면 개선" },
      { name: "감사 일기 작성", category: "정신건강", priority: 2, reason: "긍정적 마인드셋 구축" },
    );
  } else if (scores.mental < 60) {
    programs.push(
      { name: "자연광 노출 & 산책 프로그램", category: "정신건강", priority: 3, reason: "활력 회복을 위한 자연 기반 활동" },
    );
  }

  // 심리적 웰빙
  if (scores.psychological < 40) {
    programs.push(
      { name: "자기 효능감 워크숍", category: "심리", priority: 1, reason: "자존감 및 내면 안정감 강화" },
      { name: "동료 멘토링 프로그램", category: "심리", priority: 2, reason: "대인관계 지지 네트워크 구축" },
    );
  } else if (scores.psychological < 60) {
    programs.push(
      { name: "목표 설정 & 회고 세션", category: "심리", priority: 3, reason: "삶의 방향성과 성장 인식 강화" },
    );
  }

  // 신체/근골격
  if (scores.physical < 40) {
    programs.push(
      { name: "사무실 필라테스 5분 루틴", category: "신체", priority: 1, reason: "근골격계 통증 완화 및 예방" },
      { name: "인체공학 작업환경 가이드", category: "신체", priority: 2, reason: "자세 교정 및 작업환경 개선" },
    );
  } else if (scores.physical < 60) {
    programs.push(
      { name: "데스크 스트레칭 알림", category: "신체", priority: 3, reason: "근골격계 예방 관리" },
    );
  }

  // 삶의 만족도
  if (scores.satisfaction < 40) {
    programs.push(
      { name: "가치관 탐색 워크숍", category: "만족도", priority: 1, reason: "삶의 의미와 만족감 재발견" },
      { name: "워라밸 설계 프로그램", category: "만족도", priority: 2, reason: "업무-생활 균형 개선" },
    );
  } else if (scores.satisfaction < 60) {
    programs.push(
      { name: "취미 발견 챌린지", category: "만족도", priority: 3, reason: "일상의 즐거움 확대" },
    );
  }

  // 우선순위 정렬
  programs.sort((a, b) => a.priority - b.priority);

  return programs;
}

/**
 * 종합 고급 분석 실행
 */
export function runAdvancedAnalysis({ scores, previousScores = null, daysBetween = 30 }) {
  return {
    zScores: calculateAllZScores(scores),
    trendAnalysis: detectBurnoutAcceleration(scores, previousScores, daysBetween),
    interactionEffect: calculateInteractionEffect(scores),
    careTarget: analyzeCareTarget(scores),
    programs: recommendPrograms(scores),
  };
}
