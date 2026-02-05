import { WCWI_QUESTIONS } from "../constants/questions";
import { MINI_QUESTIONS } from "../constants/questions";

/**
 * 미니 체크 5문항 종합 점수 (0~100)
 */
export function calculateMiniScore(miniAnswers) {
  let total = 0;
  let count = 0;
  Object.entries(miniAnswers).forEach(([id, val]) => {
    const q = MINI_QUESTIONS.find((mq) => mq.id === id);
    if (q && q.scale) {
      const normalized = q.reversed
        ? ((q.scale - val) / (q.scale - 1)) * 100
        : ((val - 1) / (q.scale - 1)) * 100;
      total += normalized;
      count++;
    } else if (q && q.type === "yesno") {
      total += val === "no" ? 100 : 30;
      count++;
    }
  });
  return count > 0 ? Math.round(total / count) : 0;
}

/**
 * 전체 WCWI 영역별 점수 및 종합 점수
 */
export function calculateFullScores(fullAnswers, bodyParts) {
  const scores = {};
  const sections = Object.keys(WCWI_QUESTIONS);

  sections.forEach((key) => {
    const section = WCWI_QUESTIONS[key];
    let total = 0;
    let count = 0;
    section.questions.forEach((q) => {
      const val = fullAnswers[q.id];
      if (val !== undefined) {
        if (q.scale) {
          const normalized = q.reversed
            ? ((q.scale - val) / (q.scale - 1)) * 100
            : ((val - 1) / (q.scale - 1)) * 100;
          total += normalized;
          count++;
        } else if (q.type === "yesno") {
          total += val === "no" ? 100 : 30;
          count++;
        } else if (q.type === "body") {
          const painCount = bodyParts.length;
          total += Math.max(0, 100 - painCount * 12);
          count++;
        }
      }
    });
    scores[key] = count > 0 ? Math.round(total / count) : 50;
  });

  const weights = { mental: 0.25, psychological: 0.25, burnout: 0.2, physical: 0.15, satisfaction: 0.15 };
  let wcwi = 0;
  Object.keys(scores).forEach((k) => {
    wcwi += scores[k] * (weights[k] || 0.2);
  });
  scores.total = Math.round(wcwi);
  return scores;
}
