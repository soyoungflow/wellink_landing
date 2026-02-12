import { MINI_QUESTIONS } from "../constants/questions";
import { COLORS } from "../constants/theme";
import { AnimatedNumber } from "../components";
import { saveToAirtable } from "../api/airtable";
import { normalizePayload } from "../api/airtableNormalize";

const MINI_STYLES = `@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;900&family=Playfair+Display:wght@400;700&display=swap');
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
`;

const LABELS_5 = ["전혀 아님", "드물게", "가끔", "자주", "항상"];
const LABELS_7 = ["매우 동의하지 않음", "동의하지 않음", "약간 동의하지 않음", "보통", "약간 동의", "동의", "매우 동의"];

/** Airtable mini 테이블 level 필드에 매핑되는 값 (singleSelect 옵션과 동일) */
const MINI_LEVEL_FOR_AIRTABLE = Object.freeze({
  GOOD: "양호",
  NORMAL: "보통",
  CAUTION: "주의",
});

/** 미니 체크 결과 화면 */
export function MiniResult({ score, miniAnswers, transition, onGoFull, onGoLead, onGoSurvey, onGoHome }) {
  const level = score >= 75
    ? { text: MINI_LEVEL_FOR_AIRTABLE.GOOD, color: COLORS.sage, emoji: "🌿", desc: "전반적으로 건강한 상태입니다. 지속적인 관리로 유지하세요." }
    : score >= 50
      ? { text: MINI_LEVEL_FOR_AIRTABLE.NORMAL, color: COLORS.gold, emoji: "⚡", desc: "일부 영역에서 개선이 필요합니다. 맞춤형 프로그램을 확인해보세요." }
      : { text: MINI_LEVEL_FOR_AIRTABLE.CAUTION, color: COLORS.coral, emoji: "🔴", desc: "여러 영역에서 관리가 필요합니다. 전체 진단을 통해 정확한 분석을 받아보세요." };

  const handleLeadClick = async () => {
    const payload = {
      score,
      level: level.text, // Airtable mini table level 필드와 1:1 매핑 (양호 | 보통 | 주의)
      answers_json: JSON.stringify(miniAnswers ?? {}),
      created_at: new Date().toISOString(),
    };
    try {
      const normalized = normalizePayload("mini", payload);
      console.log("[MINI SAVE]", normalized);
      await saveToAirtable("mini", normalized);
    } catch (e) {
      console.error("mini save failed", e);
    }
    transition("lead");
  };

  return (
    <div style={{
      fontFamily: "'Noto Sans KR', sans-serif", minHeight: "100vh",
      background: `linear-gradient(135deg, ${COLORS.bg}, ${COLORS.sagePale})`,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <style>{MINI_STYLES}</style>
      <div style={{
        background: COLORS.white, borderRadius: 28, padding: "clamp(32px, 6vw, 48px) clamp(24px, 4vw, 36px)",
        width: "100%", maxWidth: "min(100%, 600px)", textAlign: "center",
        boxShadow: "0 24px 80px rgba(0,0,0,0.08)",
        animation: "scaleIn 0.5s ease-out",
      }}>
        <div style={{ fontSize: "clamp(36px, 6vw, 48px)", marginBottom: 16 }}>{level.emoji}</div>
        <div style={{ fontSize: "clamp(12px, 1.625vw, 13px)", color: COLORS.warmGray, marginBottom: 8 }}>당신의 웰니스 점수</div>
        <div style={{
          fontSize: "clamp(56px, 9vw, 72px)", fontWeight: 900, color: level.color,
          fontFamily: "'Playfair Display', serif", lineHeight: 1,
        }}>
          <AnimatedNumber value={score} />
        </div>
        <div style={{
          display: "inline-block", padding: "6px 20px", borderRadius: 20,
          background: `${level.color}15`, color: level.color,
          fontSize: "clamp(13px, 1.75vw, 14px)", fontWeight: 700, margin: "12px 0 20px",
        }}>{level.text}</div>
        <p style={{ fontSize: "clamp(13px, 1.75vw, 14px)", color: COLORS.warmGray, lineHeight: 1.7, marginBottom: 32 }}>{level.desc}</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            onClick={onGoFull}
            style={{
              padding: "16px", borderRadius: 16, border: "none",
              background: `linear-gradient(135deg, ${COLORS.sage}, ${COLORS.sageDark})`,
              color: "#fff", fontSize: "clamp(14px, 1.875vw, 15px)", fontWeight: 700, cursor: "pointer",
            }}
          >
            전체 WCWI 진단 받기  →
          </button>
          <button
            onClick={handleLeadClick}
            style={{
              padding: "16px", borderRadius: 16,
              border: `2px solid ${COLORS.sage}30`,
              background: "transparent", color: COLORS.sage,
              fontSize: "clamp(13px, 1.75vw, 14px)", fontWeight: 600, cursor: "pointer",
            }}
          >
            기업용 웰니스 감사 문의하기
          </button>
          <button
            onClick={onGoSurvey}
            style={{
              padding: "14px", borderRadius: 16,
              border: `2px solid ${COLORS.gold}30`,
              background: "transparent", color: COLORS.gold,
              fontSize: "clamp(13px, 1.75vw, 14px)", fontWeight: 600, cursor: "pointer",
            }}
          >
            📋 수요조사 참여하기
          </button>
          <button
            onClick={onGoHome}
            style={{
              padding: "12px", border: "none", background: "transparent",
              color: COLORS.warmGray, fontSize: "clamp(12px, 1.625vw, 13px)", cursor: "pointer",
            }}
          >
            ← 메인으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

/** 미니 체크 문항 화면 */
export function MiniQuestions({
  miniStep,
  miniAnswers,
  setMiniAnswers,
  setMiniStep,
  transition,
}) {
  const q = MINI_QUESTIONS[miniStep];
  const progress = (miniStep / MINI_QUESTIONS.length) * 100;

  return (
    <div style={{
      fontFamily: "'Noto Sans KR', sans-serif", minHeight: "100vh",
      background: `linear-gradient(135deg, ${COLORS.bg}, ${COLORS.cream})`,
      display: "flex", flexDirection: "column", width: "100%", maxWidth: "100%",
    }}>
      <style>{MINI_STYLES}</style>
      <div style={{ padding: "clamp(16px, 2.5vw, 20px) clamp(16px, 3vw, 24px) 0", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <button
            onClick={() => { if (miniStep > 0) setMiniStep(miniStep - 1); else transition("landing"); }}
            style={{ border: "none", background: "none", fontSize: "clamp(13px, 1.75vw, 14px)", color: COLORS.warmGray, cursor: "pointer" }}
          >
            ← 뒤로
          </button>
          <span style={{ fontSize: 13, color: COLORS.warmGray }}>{miniStep + 1} / {MINI_QUESTIONS.length}</span>
        </div>
        <div style={{ height: 4, background: "#E8E5DE", borderRadius: 2, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${progress}%`,
            background: `linear-gradient(90deg, ${COLORS.sage}, ${COLORS.sageLight})`,
            borderRadius: 2, transition: "width 0.5s ease",
          }} />
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(16px, 4vw, 24px)", width: "100%" }}>
        <div key={miniStep} style={{ width: "100%", maxWidth: "min(100%, 700px)", animation: "fadeUp 0.4s ease-out" }}>
          <div style={{
            display: "inline-block", padding: "4px clamp(12px, 1.75vw, 14px)", borderRadius: 12,
            background: `${q.color}15`, fontSize: "clamp(11px, 1.5vw, 12px)", fontWeight: 600,
            color: q.color, marginBottom: 16,
          }}>{q.area}</div>
          <h2 style={{ fontSize: "clamp(18px, 2.75vw, 22px)", fontWeight: 700, color: COLORS.charcoal, lineHeight: 1.5, marginBottom: 32 }}>
            {q.text}
          </h2>

          {q.type === "yesno" ? (
            <div style={{ display: "flex", gap: 12 }}>
              {[{ val: "yes", label: "예" }, { val: "no", label: "아니오" }].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => {
                    setMiniAnswers({ ...miniAnswers, [q.id]: opt.val });
                    setTimeout(() => setMiniStep(miniStep + 1), 300);
                  }}
                  style={{
                    flex: 1, padding: "clamp(16px, 2.5vw, 20px)", borderRadius: 16,
                    border: `2px solid ${miniAnswers[q.id] === opt.val ? q.color : "#E8E5DE"}`,
                    background: miniAnswers[q.id] === opt.val ? `${q.color}10` : COLORS.white,
                    fontSize: "clamp(14px, 2vw, 16px)", fontWeight: 600, cursor: "pointer",
                    color: miniAnswers[q.id] === opt.val ? q.color : COLORS.charcoal,
                    transition: "all 0.2s", width: "100%",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {Array.from({ length: q.scale }, (_, i) => i + 1).map((val) => {
                const label = q.scale === 5 ? LABELS_5[val - 1] : LABELS_7[val - 1];
                const isSelected = miniAnswers[q.id] === val;
                return (
                  <button
                    key={val}
                    onClick={() => {
                      setMiniAnswers({ ...miniAnswers, [q.id]: val });
                      setTimeout(() => setMiniStep(miniStep + 1), 400);
                    }}
                    style={{
                      padding: "clamp(14px, 2vw, 16px) clamp(16px, 2.5vw, 20px)", borderRadius: 14,
                      border: `2px solid ${isSelected ? q.color : "#E8E5DE"}`,
                      background: isSelected ? `${q.color}10` : COLORS.white,
                      textAlign: "left", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "clamp(10px, 1.5vw, 12px)",
                      transition: "all 0.2s", width: "100%",
                    }}
                  >
                    <div style={{
                      width: "clamp(24px, 3.5vw, 28px)", height: "clamp(24px, 3.5vw, 28px)", borderRadius: "50%",
                      border: `2px solid ${isSelected ? q.color : "#D0CDC5"}`,
                      background: isSelected ? q.color : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontSize: "clamp(10px, 1.5vw, 12px)", fontWeight: 700, flexShrink: 0,
                    }}>
                      {isSelected && "✓"}
                    </div>
                    <span style={{ fontSize: "clamp(13px, 1.75vw, 14px)", color: isSelected ? q.color : COLORS.charcoal, fontWeight: isSelected ? 600 : 400 }}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
