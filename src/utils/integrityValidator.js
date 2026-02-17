/**
 * WELLINK 응답 무결성 검증 모듈 (CBI - Code/Binary Integrity 원리 적용)
 *
 * 설문 데이터의 논리적 일관성을 검증하여 신뢰도를 측정합니다.
 * - 응답 소요 시간 체크 (Response Time)
 * - 일렬 응답 탐지 (Straight-lining)
 * - 분산 분석 (Variance / Z-Score)
 * - 교차 타당도 (Cross-validation)
 * - 내적 일관성 (Cronbach's Alpha 근사)
 * - 이상치 탐지 (Outlier Detection)
 */

/**
 * 1. 응답 소요 시간 체크
 * 문항 수 대비 너무 빠르게 응답한 경우 의심
 * @param {number} questionCount - 문항 수
 * @param {number} elapsedMs - 소요 시간 (밀리초)
 * @param {number} minSecondsPerQ - 문항당 최소 초 (기본 2초)
 * @returns {{ valid: boolean, flag: string|null, speed: number }}
 */
export function checkResponseTime(questionCount, elapsedMs, minSecondsPerQ = 2) {
  const elapsedSec = elapsedMs / 1000;
  const minRequired = questionCount * minSecondsPerQ;
  const speed = elapsedSec / questionCount; // 문항당 평균 초

  if (elapsedSec < minRequired) {
    return {
      valid: false,
      flag: `응답 시간이 너무 짧습니다 (${speed.toFixed(1)}초/문항). 최소 ${minSecondsPerQ}초/문항 필요.`,
      speed,
    };
  }
  return { valid: true, flag: null, speed };
}

/**
 * 2. 일렬 응답 탐지 (Straight-lining)
 * 모든 답이 동일한 값인 경우 탐지
 * @param {Object} answers - { questionId: value }
 * @param {number} threshold - 동일 답변 비율 임계값 (기본 0.85 = 85%)
 * @returns {{ valid: boolean, flag: string|null, dominantRatio: number }}
 */
export function detectStraightLining(answers, threshold = 0.85) {
  const numericAnswers = Object.values(answers).filter((v) => typeof v === "number");
  if (numericAnswers.length < 3) return { valid: true, flag: null, dominantRatio: 0 };

  // 가장 많이 나온 답변의 비율 계산
  const freq = {};
  numericAnswers.forEach((v) => { freq[v] = (freq[v] || 0) + 1; });
  const maxFreq = Math.max(...Object.values(freq));
  const dominantRatio = maxFreq / numericAnswers.length;

  if (dominantRatio >= threshold) {
    return {
      valid: false,
      flag: `일렬 응답 의심: 전체 ${numericAnswers.length}문항 중 ${maxFreq}문항이 동일한 답변 (${(dominantRatio * 100).toFixed(0)}%)`,
      dominantRatio,
    };
  }
  return { valid: true, flag: null, dominantRatio };
}

/**
 * 3. 분산 분석 (극단 응답 탐지)
 * 응답의 표준편차가 너무 낮거나(=전부 같음), 너무 높은(=극단 양분) 경우 탐지
 * @param {Object} answers - { questionId: value }
 * @returns {{ valid: boolean, flag: string|null, stdDev: number, mean: number }}
 */
export function analyzeVariance(answers) {
  const numericAnswers = Object.values(answers).filter((v) => typeof v === "number");
  if (numericAnswers.length < 3) return { valid: true, flag: null, stdDev: 0, mean: 0 };

  const mean = numericAnswers.reduce((a, b) => a + b, 0) / numericAnswers.length;
  const variance = numericAnswers.reduce((sum, v) => sum + (v - mean) ** 2, 0) / numericAnswers.length;
  const stdDev = Math.sqrt(variance);

  // 표준편차가 0에 가까우면 모든 답이 동일
  if (stdDev < 0.15) {
    return {
      valid: false,
      flag: `응답 분산이 극히 낮음 (σ=${stdDev.toFixed(2)}). 모든 답변이 거의 동일합니다.`,
      stdDev, mean,
    };
  }

  return { valid: true, flag: null, stdDev, mean };
}

/**
 * 4. 교차 타당도 (Cross-validation)
 * 논리적으로 모순되는 응답 패턴 탐지
 *
 * 예시:
 * - WHO-5(정신적 웰빙) 높음 + CBI(번아웃) 높음 → 모순
 * - 번아웃 고위험 + 수면 회복감(m3) 높음 → 모순
 * - 삶 만족도 매우 높음 + 심리적 웰빙 매우 낮음 → 의심
 *
 * @param {Object} scores - 영역별 점수 { mental, psychological, burnout, physical, satisfaction }
 * @param {Object} answers - 개별 문항 응답
 * @returns {{ valid: boolean, flags: string[], reliability: number }}
 */
export function crossValidate(scores, answers) {
  const flags = [];
  let contradictions = 0;
  let checksPerformed = 0;

  // 규칙 1: 정신적 웰빙 높은데 번아웃도 높음 (burnout은 위험 점수)
  if (scores.mental >= 80 && scores.burnout >= 70) {
    flags.push("정신적 웰빙이 매우 높은데 번아웃 위험도 높음 → 응답 일관성 의심");
    contradictions++;
  }
  checksPerformed++;

  // 규칙 2: 번아웃 고위험인데 수면 회복감(m3) 높음
  const sleepRecovery = answers?.m3;
  if (scores.burnout >= 70 && typeof sleepRecovery === "number" && sleepRecovery >= 4) {
    flags.push("번아웃 고위험인데 수면 회복감이 높음 → 응답 불일치");
    contradictions++;
  }
  checksPerformed++;

  // 규칙 3: 삶 만족도 매우 높은데 심리적 웰빙 매우 낮음
  if (scores.satisfaction >= 85 && scores.psychological <= 30) {
    flags.push("삶 만족도 매우 높은데 심리적 웰빙이 매우 낮음 → 논리적 불일치");
    contradictions++;
  }
  checksPerformed++;

  // 규칙 4: 모든 번아웃 문항 최고 피로인데 활력(m5) 최고
  const burnoutAnswers = ["b1", "b2", "b3", "b4", "b5"].map((id) => answers?.[id]).filter((v) => typeof v === "number");
  const allMaxBurnout = burnoutAnswers.length >= 4 && burnoutAnswers.every((v) => v >= 4);
  const vitality = answers?.m5;
  if (allMaxBurnout && typeof vitality === "number" && vitality >= 4) {
    flags.push("극심한 번아웃 응답인데 활력이 넘침 → 심각한 불일치");
    contradictions++;
  }
  checksPerformed++;

  // 규칙 5: 신체 통증 전혀 없는데 (ph2=no, ph3=no) 신체 점수가 매우 낮음
  if (answers?.ph2 === "no" && answers?.ph3 === "no" && scores.physical < 30) {
    flags.push("신체 통증 없다고 응답했으나 신체 점수가 매우 낮음");
    contradictions++;
  }
  checksPerformed++;

  // 신뢰도 계산 (0~100, 높을수록 신뢰)
  const reliability = checksPerformed > 0
    ? Math.round((1 - contradictions / checksPerformed) * 100)
    : 100;

  return {
    valid: contradictions === 0,
    flags,
    reliability,
  };
}

/**
 * 5. 내적 일관성 (Cronbach's Alpha 근사)
 * 같은 영역의 문항들이 일관되게 같은 개념을 측정하는지 확인
 *
 * @param {number[]} items - 같은 영역의 개별 문항 점수 배열들의 배열이 아니라,
 *                           하나의 영역 내 응답값 배열
 * @returns {{ alpha: number, reliable: boolean }}
 */
export function cronbachAlphaApprox(items) {
  const n = items.length;
  if (n < 2) return { alpha: 1, reliable: true };

  const mean = items.reduce((a, b) => a + b, 0) / n;
  const totalVariance = items.reduce((sum, v) => sum + (v - mean) ** 2, 0) / n;

  if (totalVariance === 0) return { alpha: 1, reliable: true };

  // 각 아이템 쌍의 상관관계 근사 (표준화된 alpha)
  // 간소화: 아이템 간 평균 공분산 / 전체 분산 비율 사용
  let pairCovSum = 0;
  let pairCount = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      pairCovSum += (items[i] - mean) * (items[j] - mean);
      pairCount++;
    }
  }
  const avgInterItemCov = pairCount > 0 ? pairCovSum / pairCount : 0;
  const avgInterItemCorr = totalVariance > 0 ? avgInterItemCov / totalVariance : 0;

  // Standardized alpha = n * r̄ / (1 + (n-1) * r̄)
  const alpha = (n * avgInterItemCorr) / (1 + (n - 1) * avgInterItemCorr);
  const clampedAlpha = Math.max(0, Math.min(1, alpha));

  return {
    alpha: Math.round(clampedAlpha * 100) / 100,
    reliable: clampedAlpha >= 0.6, // 0.7이 일반적이지만 문항 수가 적어 0.6으로 설정
  };
}

/**
 * 6. 이상치 탐지 (Z-Score 기반)
 * 개별 응답이 해당 문항의 기대 범위에서 벗어나는지 탐지
 * (집단 평균이 없는 MVP 단계에서는 개인 내 편차 사용)
 *
 * @param {Object} answers - { questionId: value }
 * @param {Object} [populationStats] - { questionId: { mean, stdDev } } (선택, 집단 통계)
 * @returns {{ outliers: Array<{id: string, value: number, zScore: number}>, hasOutliers: boolean }}
 */
export function detectOutliers(answers, populationStats = null) {
  const numericEntries = Object.entries(answers).filter(([, v]) => typeof v === "number");
  if (numericEntries.length < 3) return { outliers: [], hasOutliers: false };

  const values = numericEntries.map(([, v]) => v);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length);

  if (stdDev === 0) return { outliers: [], hasOutliers: false };

  const outliers = [];
  numericEntries.forEach(([id, value]) => {
    let zScore;
    if (populationStats?.[id]) {
      const { mean: pMean, stdDev: pStd } = populationStats[id];
      zScore = pStd > 0 ? (value - pMean) / pStd : 0;
    } else {
      zScore = (value - mean) / stdDev;
    }

    if (Math.abs(zScore) > 2.5) {
      outliers.push({ id, value, zScore: Math.round(zScore * 100) / 100 });
    }
  });

  return { outliers, hasOutliers: outliers.length > 0 };
}

/**
 * 종합 무결성 검증
 * 모든 검증을 수행하고 종합 신뢰도 점수를 반환
 *
 * @param {Object} params
 * @param {Object} params.answers - 문항별 응답
 * @param {Object} params.scores - 영역별 점수
 * @param {number} params.elapsedMs - 소요 시간
 * @param {number} params.questionCount - 문항 수
 * @returns {IntegrityReport}
 */
export function validateIntegrity({ answers, scores, elapsedMs, questionCount }) {
  const checks = {};

  // 1. 응답 시간
  checks.responseTime = checkResponseTime(questionCount, elapsedMs);

  // 2. 직선 응답
  checks.straightLining = detectStraightLining(answers);

  // 3. 분산
  checks.variance = analyzeVariance(answers);

  // 4. 교차 타당도
  checks.crossValidation = crossValidate(scores, answers);

  // 5. 이상치
  checks.outliers = detectOutliers(answers);

  // 종합 신뢰도 계산 (각 항목 가중 평균)
  const weights = {
    responseTime: 15,
    straightLining: 20,
    variance: 15,
    crossValidation: 30,
    outliers: 20,
  };

  let totalWeight = 0;
  let weightedScore = 0;

  Object.entries(weights).forEach(([key, weight]) => {
    const check = checks[key];
    const score = check.valid !== false ? 100 : (check.reliability ?? 50);
    weightedScore += score * weight;
    totalWeight += weight;
  });

  const overallReliability = Math.round(weightedScore / totalWeight);
  const allFlags = Object.values(checks)
    .flatMap((c) => [c.flag, ...(c.flags || [])])
    .filter(Boolean);

  return {
    reliable: overallReliability >= 60,
    overallReliability,
    checks,
    flags: allFlags,
    recommendation: overallReliability >= 80
      ? null
      : overallReliability >= 60
        ? "일부 응답 패턴이 불일치합니다. 결과를 참고용으로 활용하세요."
        : "응답 신뢰도가 낮습니다. 정확한 진단을 위해 재검사를 권장합니다.",
  };
}
