import { useState, useEffect } from "react";
import { WCWI_QUESTIONS, BODY_PARTS } from "../constants/questions";
import { COLORS } from "../constants/theme";
import { AnimatedNumber, RadarChart, GaugeBar } from "../components";
import { saveToAirtable } from "../api/airtable";
import { buildAssessmentFields, clamp0to100, toInt } from "../../contracts/wcwiFieldMap.js";
import { CHARACTER_INTERACTIONS, INDICATOR_ORDER, INDICATOR_LABELS } from "../constants/characters";

const FULL_STYLES = `@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;900&family=Playfair+Display:wght@400;700&display=swap');
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
`;

const LABELS_5 = ["전혀 아님", "드물게", "가끔", "자주", "항상"];
const LABELS_7 = ["매우 동의하지 않음", "동의하지 않음", "약간 동의하지 않음", "보통", "약간 동의", "동의", "매우 동의"];

/** 링크 공유 팝업 */
function ShareLinkModal({ onClose }) {
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: COLORS.white, borderRadius: 24, padding: "clamp(24px, 4vw, 32px)",
          width: "100%", maxWidth: 440, boxShadow: "0 24px 80px rgba(0,0,0,0.15)",
        }}
      >
        <h3 style={{ fontSize: "clamp(16px, 2vw, 18px)", fontWeight: 700, color: COLORS.charcoal, marginBottom: 16 }}>친구에게 공유하기</h3>
        <p style={{ fontSize: "clamp(12px, 1.5vw, 13px)", color: COLORS.warmGray, marginBottom: 12 }}>아래 링크를 복사해서 공유하세요.</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <input
            readOnly
            value={shareUrl}
            style={{
              flex: 1, padding: "12px 14px", borderRadius: 12, border: `2px solid #E8E5DE`,
              fontSize: "clamp(12px, 1.5vw, 13px)", color: COLORS.charcoal, background: COLORS.cream,
            }}
          />
          <button
            onClick={handleCopy}
            style={{
              padding: "12px 20px", borderRadius: 12, border: "none",
              background: copied ? COLORS.sage : `linear-gradient(135deg, ${COLORS.sage}, ${COLORS.sageDark})`,
              color: "#fff", fontSize: "clamp(13px, 1.75vw, 14px)", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
            }}
          >
            {copied ? "복사됨 ✓" : "복사하기"}
          </button>
        </div>
        <button
          onClick={onClose}
          style={{
            width: "100%", padding: "14px", borderRadius: 16, border: `2px solid ${COLORS.warmGray}40`,
            background: "transparent", color: COLORS.warmGray, fontSize: "clamp(13px, 1.75vw, 14px)", fontWeight: 600, cursor: "pointer",
          }}
        >
          닫기
        </button>
      </div>
    </div>
  );
}

/** 설문 마지막: 개인정보 동의 + 이메일 + 제출 (점수 확인 전 게이트) */
export function FullConsentForm({ scores, fullAnswers, bodyParts, onSubmitDone }) {
  const [wcwiEmail, setWcwiEmail] = useState("");
  const [wcwiConsent, setWcwiConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(wcwiEmail);
  const canSubmit = wcwiConsent && validEmail && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (!validEmail) {
      setSubmitError("이메일 형식이 올바르지 않습니다.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      const { fieldsById, validationErrors } = buildAssessmentFields({
        answers: fullAnswers,
        bodyParts,
        scores,
        email: wcwiEmail,
      });
      if (validationErrors.length > 0) {
        const first = validationErrors[0];
        throw new Error(first?.reason || "제출 데이터 검증에 실패했습니다.");
      }
      await saveToAirtable("wcwi", fieldsById);
      onSubmitDone();
    } catch (err) {
      console.error("[WCWI submit error]", err);
      setSubmitError(err?.message || "제출에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      fontFamily: "'Noto Sans KR', sans-serif", minHeight: "100vh",
      background: `linear-gradient(135deg, ${COLORS.bg}, ${COLORS.cream})`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "clamp(16px, 4vw, 24px)", width: "100%",
    }}>
      <style>{FULL_STYLES}</style>
      <div style={{ width: "100%", maxWidth: "min(100%, 600px)", animation: "fadeUp 0.5s ease-out" }}>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: "clamp(32px, 6vw, 48px)", marginBottom: 12 }}>✅</div>
          <h2 style={{ fontSize: "clamp(18px, 2.5vw, 22px)", fontWeight: 700, color: COLORS.charcoal, marginBottom: 8 }}>
            설문이 완료되었습니다!
          </h2>
          <p style={{ fontSize: "clamp(13px, 1.75vw, 14px)", color: COLORS.warmGray, lineHeight: 1.6 }}>
            결과를 확인하려면 아래 개인정보 동의 후 이메일을 제출해주세요.
          </p>
        </div>

        <div style={{
          background: COLORS.white, borderRadius: 24, padding: "clamp(24px, 4vw, 32px)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
        }}>
          <h3 style={{ fontSize: "clamp(14px, 2vw, 16px)", fontWeight: 700, color: COLORS.charcoal, marginBottom: 16 }}>개인정보</h3>
          <div style={{ fontSize: "clamp(12px, 1.625vw, 13px)", color: COLORS.warmGray, lineHeight: 1.8, marginBottom: 20, whiteSpace: "pre-line" }}>
{`설문 참여 보상과 관련하여, 이메일 수집 이용에 관한 동의를 받고자 합니다. 동의하지 않을 경우 설문 보상 참여에서 제외됨을 알려드립니다.

개인정보 수집 및 이용목적: 설문 참여 보상 / 서비스 안내

개인 정보 및 이용기간: 6개월

수집하는 자 : WELLINK`}
          </div>

          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={wcwiConsent}
              onChange={(e) => setWcwiConsent(e.target.checked)}
              style={{ marginTop: 3, width: 18, height: 18, accentColor: COLORS.sage, cursor: "pointer" }}
            />
            <span style={{ fontSize: "clamp(13px, 1.75vw, 14px)", color: COLORS.charcoal, fontWeight: 500 }}>
              개인정보 수집 및 이용에 동의합니다. <span style={{ color: COLORS.coral }}>(필수)</span>
            </span>
          </label>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: "clamp(12px, 1.625vw, 13px)", color: COLORS.warmGray, marginBottom: 6, display: "block" }}>이메일</label>
            <input
              type="email"
              placeholder="example@email.com"
              value={wcwiEmail}
              onChange={(e) => setWcwiEmail(e.target.value)}
              style={{
                width: "100%", padding: "14px 16px", borderRadius: 14,
                border: `2px solid ${wcwiEmail && !validEmail ? COLORS.coral : "#E8E5DE"}`,
                fontSize: "clamp(13px, 1.75vw, 14px)", color: COLORS.charcoal, background: COLORS.cream,
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          {submitError && (
            <div style={{ padding: 12, background: "#FFF5F3", borderRadius: 12, marginBottom: 12, fontSize: "clamp(12px, 1.625vw, 13px)", color: COLORS.coral }}>
              {submitError}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              width: "100%", padding: "16px", borderRadius: 16, border: "none",
              background: canSubmit
                ? `linear-gradient(135deg, ${COLORS.sage}, ${COLORS.sageDark})`
                : "#ccc",
              color: "#fff", fontSize: "clamp(14px, 1.875vw, 15px)", fontWeight: 700,
              cursor: canSubmit ? "pointer" : "not-allowed",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "제출 중..." : "제출하고 결과 확인하기"}
          </button>
          {/* TODO: Airtable Assessments 테이블에 consent 체크박스 필드 추가 후 fieldId 매핑.
              현재 스키마에 동의용 필드가 없으므로, 동의는 UI에서만 필수 체크하고 저장하지 않음. */}
        </div>
      </div>
    </div>
  );
}

/** 전체 WCWI 결과 화면 (제출 완료 후에만 표시) */
export function FullResult({ scores, analysis, transition, onGoHome }) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [interactionIdx, setInteractionIdx] = useState(0);
  const burnoutRisk = toInt(clamp0to100(scores?.burnout ?? 0));
  const burnoutHealth = toInt(clamp0to100(100 - burnoutRisk));
  if (import.meta.env.DEV) {
    const burnoutSum = burnoutRisk + burnoutHealth;
    if (Math.abs(burnoutSum - 100) > 1) {
      console.warn("[WCWI chart burnout inversion mismatch]", { burnoutRisk, burnoutHealth, burnoutSum });
    }
  }
  const chartScores = {
    ...scores,
    burnout: burnoutHealth,
  };

  // 캐릭터 & 분석 데이터
  const character = analysis?.character;
  const integrity = analysis?.integrity;
  const advanced = analysis?.advanced;
  const interactions = character ? (CHARACTER_INTERACTIONS[character.code] || []) : [];
  const programs = advanced?.programs || [];
  const careTarget = advanced?.careTarget;
  const interactionEffect = advanced?.interactionEffect;

  // 캐릭터 클릭 시 다음 상호작용 메시지
  const handleCharacterClick = () => {
    if (interactions.length > 0) {
      setInteractionIdx((prev) => (prev + 1) % interactions.length);
    }
  };

  return (
    <div style={{
      fontFamily: "'Noto Sans KR', sans-serif", minHeight: "100vh",
      background: COLORS.bg, padding: "clamp(16px, 4vw, 24px)", width: "100%", maxWidth: "100%",
    }}>
      <style>{FULL_STYLES}</style>
      <div style={{ width: "100%", maxWidth: "min(100%, 800px)", margin: "0 auto", padding: "0 clamp(16px, 4vw, 24px)" }}>

        {/* ===== 캐릭터 카드 (가장 먼저 보여줌) ===== */}
        {character && (
          <div
            onClick={handleCharacterClick}
            style={{
              background: `linear-gradient(135deg, ${character.tier.bgColor}, ${COLORS.white})`,
              borderRadius: 28, padding: "clamp(28px, 5vw, 40px)", marginBottom: 24,
              boxShadow: "0 12px 40px rgba(0,0,0,0.08)", cursor: "pointer",
              animation: "fadeUp 0.6s ease-out", textAlign: "center",
              border: `2px solid ${character.tier.color}20`,
              position: "relative", overflow: "hidden",
            }}
          >
            {/* 신뢰도 배지 */}
            {integrity && (
              <div style={{
                position: "absolute", top: 16, right: 16,
                padding: "4px 10px", borderRadius: 20,
                background: integrity.reliable ? "#E8F5E9" : "#FFF3E0",
                fontSize: "clamp(10px, 1.25vw, 11px)", fontWeight: 600,
                color: integrity.reliable ? "#4CAF50" : "#FF9800",
              }}>
                신뢰도 {integrity.overallReliability}%
              </div>
            )}

            <div style={{ fontSize: "clamp(60px, 12vw, 90px)", marginBottom: 12 }}>{character.icon}</div>
            <div style={{
              display: "inline-block", padding: "6px 16px", borderRadius: 20,
              background: `${character.tier.color}15`, color: character.tier.color,
              fontSize: "clamp(11px, 1.5vw, 12px)", fontWeight: 700, marginBottom: 12,
              letterSpacing: 2,
            }}>
              {character.code}
            </div>
            <h2 style={{
              fontSize: "clamp(22px, 3.5vw, 28px)", fontWeight: 900,
              color: COLORS.charcoal, marginBottom: 8, lineHeight: 1.3,
            }}>
              {character.name}
            </h2>
            <p style={{
              fontSize: "clamp(14px, 2vw, 16px)", color: COLORS.warmGray,
              lineHeight: 1.6, marginBottom: 16,
            }}>
              {character.description}
            </p>

            {/* 캐릭터 상호작용 말풍선 */}
            {interactions.length > 0 && (
              <div style={{
                background: COLORS.white, borderRadius: 16, padding: "14px 20px",
                fontSize: "clamp(13px, 1.75vw, 14px)", color: COLORS.charcoal,
                lineHeight: 1.6, boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                transition: "all 0.3s ease",
              }}>
                "{interactions[interactionIdx]}"
                <div style={{
                  fontSize: "clamp(10px, 1.25vw, 11px)", color: COLORS.warmGray,
                  marginTop: 6,
                }}>
                  클릭하여 다음 메시지 ({interactionIdx + 1}/{interactions.length})
                </div>
              </div>
            )}

            {/* 위험 등급 뱃지 */}
            <div style={{
              marginTop: 16, display: "inline-block", padding: "8px 20px", borderRadius: 20,
              background: character.tier.color, color: "#fff",
              fontSize: "clamp(12px, 1.625vw, 13px)", fontWeight: 700,
            }}>
              {character.tier.label}
            </div>
          </div>
        )}

        {/* ===== 5개 지표 코드 시각화 ===== */}
        {character && (
          <div style={{
            background: COLORS.white, borderRadius: 24, padding: "clamp(20px, 3.5vw, 28px)",
            marginBottom: 24, boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
            animation: "fadeUp 0.5s ease-out 0.05s both",
          }}>
            <h3 style={{ fontSize: "clamp(14px, 2vw, 16px)", fontWeight: 700, color: COLORS.charcoal, marginBottom: 16 }}>5대 지표 분석</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {INDICATOR_ORDER.map((key, i) => {
                const ind = INDICATOR_LABELS[key];
                const code = character.code[i];
                const isHigh = code === ind.high;
                const healthScore = key === "burnout" ? (100 - (scores[key] ?? 0)) : (scores[key] ?? 0);
                return (
                  <div key={key} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                    borderRadius: 14, background: isHigh ? "#E8F5E9" : "#FFF3E0",
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%", display: "flex",
                      alignItems: "center", justifyContent: "center", fontWeight: 900,
                      fontSize: 16, color: "#fff",
                      background: isHigh ? "#4CAF50" : "#FF9800",
                    }}>
                      {code}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "clamp(13px, 1.75vw, 14px)", fontWeight: 600, color: COLORS.charcoal }}>
                        {ind.label}: {isHigh ? ind.highName : ind.lowName}
                      </div>
                      <div style={{ fontSize: "clamp(11px, 1.375vw, 12px)", color: COLORS.warmGray }}>
                        {healthScore}점
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== WCWI 종합 점수 ===== */}
        <div style={{ textAlign: "center", marginBottom: 32, animation: "fadeUp 0.5s ease-out 0.1s both" }}>
          <div style={{ fontSize: "clamp(12px, 1.625vw, 13px)", color: COLORS.warmGray, marginBottom: 8 }}>WCWI 종합 점수 (웰니스 기준)</div>
          <div style={{
            fontSize: "clamp(56px, 10vw, 80px)", fontWeight: 900, color: COLORS.sage,
            fontFamily: "'Playfair Display', serif", lineHeight: 1,
          }}>
            <AnimatedNumber value={scores.total} />
          </div>
          <div style={{ fontSize: "clamp(13px, 1.75vw, 14px)", color: COLORS.warmGray, marginTop: 8 }}>/ 100점</div>
        </div>

        {/* ===== 레이더 차트 ===== */}
        <div style={{
          background: COLORS.white, borderRadius: 24, padding: "clamp(24px, 4vw, 32px)",
          marginBottom: 24, display: "flex", justifyContent: "center", width: "100%",
          boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
          animation: "fadeUp 0.5s ease-out 0.15s both",
        }}>
          <RadarChart scores={chartScores} />
        </div>

        {/* ===== 영역별 상세 ===== */}
        <div style={{
          background: COLORS.white, borderRadius: 24, padding: 28,
          marginBottom: 24, boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
          animation: "fadeUp 0.5s ease-out 0.2s both",
        }}>
          <h3 style={{ fontSize: "clamp(14px, 2vw, 16px)", fontWeight: 700, color: COLORS.charcoal, marginBottom: 20 }}>영역별 상세</h3>
          <div style={{ fontSize: "clamp(11px, 1.5vw, 12px)", color: COLORS.warmGray, marginBottom: 10 }}>
            번아웃(위험)은 원점수로 표시되며, 차트는 역표시(100-위험)됩니다.
          </div>
          <div style={{ fontSize: "clamp(12px, 1.625vw, 13px)", color: COLORS.coral, fontWeight: 600, marginBottom: 10 }}>
            번아웃 위험 {burnoutRisk}점
          </div>
          <GaugeBar value={scores.mental} color="#7B9E87" label="🧠 정신적 웰빙" delay={300} />
          <GaugeBar value={scores.psychological} color="#9B7EC8" label="💜 심리적 웰빙" delay={500} />
          <GaugeBar value={burnoutHealth} color="#E8725C" label="🔥 번아웃(건강지표)" delay={700} />
          <GaugeBar value={scores.physical} color="#5BAEB7" label="🏃 신체 건강" delay={900} />
          <GaugeBar value={scores.satisfaction} color="#C4A265" label="⭐ 삶의 만족도" delay={1100} />
        </div>

        {/* ===== 복합 위험 분석 (Interaction Effect) ===== */}
        {interactionEffect && interactionEffect.compoundRisks.length > 0 && (
          <div style={{
            background: COLORS.white, borderRadius: 24, padding: 28,
            marginBottom: 24, boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
            animation: "fadeUp 0.5s ease-out 0.25s both",
            border: `2px solid ${COLORS.coral}20`,
          }}>
            <h3 style={{ fontSize: "clamp(14px, 2vw, 16px)", fontWeight: 700, color: COLORS.coral, marginBottom: 16 }}>
              복합 위험 분석
            </h3>
            <div style={{
              fontSize: "clamp(12px, 1.625vw, 13px)", color: COLORS.warmGray, marginBottom: 16,
            }}>
              위험 가중치: x{interactionEffect.riskMultiplier.toFixed(1)} | 복합 위험도: {interactionEffect.interactionScore}점
            </div>
            {interactionEffect.compoundRisks.map((risk, i) => (
              <div key={i} style={{
                padding: 14, background: "#FFF5F3", borderRadius: 14, marginBottom: 8,
                borderLeft: `4px solid ${COLORS.coral}`,
              }}>
                <div style={{ fontSize: "clamp(13px, 1.75vw, 14px)", fontWeight: 600, color: COLORS.coral, marginBottom: 4 }}>
                  {risk.label} (x{risk.multiplier})
                </div>
                <div style={{ fontSize: "clamp(12px, 1.625vw, 13px)", color: COLORS.warmGray }}>
                  {risk.description}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== 케어 레벨 & 프로그램 추천 ===== */}
        {careTarget && (
          <div style={{
            background: COLORS.white, borderRadius: 24, padding: 28,
            marginBottom: 24, boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
            animation: "fadeUp 0.5s ease-out 0.3s both",
          }}>
            <h3 style={{ fontSize: "clamp(14px, 2vw, 16px)", fontWeight: 700, color: COLORS.charcoal, marginBottom: 16 }}>
              케어 레벨
            </h3>
            <div style={{
              display: "inline-block", padding: "8px 20px", borderRadius: 20,
              background: careTarget.careLevelInfo.color, color: "#fff",
              fontSize: "clamp(13px, 1.75vw, 14px)", fontWeight: 700, marginBottom: 12,
            }}>
              {careTarget.careLevelInfo.label}
            </div>
            <p style={{ fontSize: "clamp(12px, 1.625vw, 13px)", color: COLORS.warmGray, marginBottom: 16 }}>
              {careTarget.careLevelInfo.description}
            </p>

            {careTarget.carePriority.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: "clamp(12px, 1.625vw, 13px)", fontWeight: 600, color: COLORS.charcoal, marginBottom: 8 }}>
                  우선 관리 영역:
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {careTarget.carePriority.map((p, i) => (
                    <span key={i} style={{
                      padding: "4px 12px", borderRadius: 12,
                      background: `${careTarget.careLevelInfo.color}15`,
                      color: careTarget.careLevelInfo.color,
                      fontSize: "clamp(11px, 1.5vw, 12px)", fontWeight: 600,
                    }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== 맞춤 웰니스 프로그램 추천 ===== */}
        {programs.length > 0 && (
          <div style={{
            background: COLORS.white, borderRadius: 24, padding: 28,
            marginBottom: 24, boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
            animation: "fadeUp 0.5s ease-out 0.35s both",
          }}>
            <h3 style={{ fontSize: "clamp(14px, 2vw, 16px)", fontWeight: 700, color: COLORS.charcoal, marginBottom: 16 }}>
              맞춤 웰니스 프로그램
            </h3>
            {programs.map((prog, i) => {
              const priorityColors = { 1: COLORS.coral, 2: "#FF9800", 3: COLORS.sage };
              const pColor = priorityColors[prog.priority] || COLORS.warmGray;
              return (
                <div key={i} style={{
                  padding: 14, borderRadius: 14, marginBottom: 8,
                  background: `${pColor}08`, borderLeft: `4px solid ${pColor}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{
                      padding: "2px 8px", borderRadius: 8, fontSize: "clamp(10px, 1.25vw, 11px)",
                      fontWeight: 700, background: `${pColor}20`, color: pColor,
                    }}>
                      {prog.category}
                    </span>
                    <span style={{ fontSize: "clamp(13px, 1.75vw, 14px)", fontWeight: 600, color: COLORS.charcoal }}>
                      {prog.name}
                    </span>
                  </div>
                  <div style={{ fontSize: "clamp(12px, 1.625vw, 13px)", color: COLORS.warmGray }}>
                    {prog.reason}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ===== 신뢰도 경고 (낮을 때만) ===== */}
        {integrity && !integrity.reliable && (
          <div style={{
            background: "#FFF8E1", borderRadius: 24, padding: 28,
            marginBottom: 24, boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
            animation: "fadeUp 0.5s ease-out 0.4s both",
            border: "2px solid #FFE082",
          }}>
            <h3 style={{ fontSize: "clamp(14px, 2vw, 16px)", fontWeight: 700, color: "#F57F17", marginBottom: 12 }}>
              응답 신뢰도 알림
            </h3>
            <p style={{ fontSize: "clamp(12px, 1.625vw, 13px)", color: COLORS.warmGray, marginBottom: 12 }}>
              {integrity.recommendation}
            </p>
            {integrity.flags.length > 0 && (
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {integrity.flags.map((f, i) => (
                  <li key={i} style={{ fontSize: "clamp(11px, 1.5vw, 12px)", color: "#F57F17", marginBottom: 4 }}>
                    {f}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* ===== 하단 버튼 ===== */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            onClick={() => transition("lead", { leadCaptureSource: "full" })}
            style={{
              padding: "16px", borderRadius: 16, border: "none",
              background: `linear-gradient(135deg, ${COLORS.sage}, ${COLORS.sageDark})`,
              color: "#fff", fontSize: "clamp(14px, 1.875vw, 15px)", fontWeight: 700, cursor: "pointer",
            }}
          >
            이 결과를 HR팀에 공유하기 →
          </button>
          <button
            onClick={() => setShowShareModal(true)}
            style={{
              padding: "16px", borderRadius: 16,
              border: `2px solid ${COLORS.gold}30`,
              background: "transparent", color: COLORS.gold,
              fontSize: "clamp(13px, 1.75vw, 14px)", fontWeight: 600, cursor: "pointer",
            }}
          >
            친구에게 공유하기
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
      {showShareModal && <ShareLinkModal onClose={() => setShowShareModal(false)} />}
    </div>
  );
}

/** 전체 WCWI 문항 화면 */
export function FullQuestions({
  sectionKeys,
  fullSection,
  fullStep,
  fullAnswers,
  bodyParts,
  totalQuestions,
  currentSection,
  currentQ,
  setFullAnswers,
  setFullStep,
  setFullSection,
  setBodyParts,
  setShowResults,
  onStartAssessment,
  transition,
}) {
  // 첫 문항 진입 시 타이머 시작
  useEffect(() => {
    if (fullSection === 0 && fullStep === 0 && onStartAssessment) {
      onStartAssessment();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const currentQuestionNumber = sectionKeys
    .slice(0, fullSection)
    .reduce((sum, key) => sum + WCWI_QUESTIONS[key].questions.length, 0) + fullStep + 1;

  const handleFullAnswer = (val) => {
    const newAnswers = { ...fullAnswers, [currentQ.id]: val };
    setFullAnswers(newAnswers);
    setTimeout(() => {
      if (fullStep < currentSection.questions.length - 1) {
        setFullStep(fullStep + 1);
      } else if (fullSection < sectionKeys.length - 1) {
        setFullSection(fullSection + 1);
        setFullStep(0);
      } else {
        setShowResults(true);
      }
    }, 400);
  };

  return (
    <div style={{
      fontFamily: "'Noto Sans KR', sans-serif", minHeight: "100vh",
      background: `linear-gradient(135deg, ${COLORS.bg}, ${COLORS.cream})`,
      display: "flex", flexDirection: "column", width: "100%", maxWidth: "100%",
    }}>
      <style>{FULL_STYLES}</style>

      <div style={{ padding: "clamp(16px, 3vw, 20px) clamp(16px, 4vw, 24px) 0", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <button
            onClick={() => {
              if (fullStep > 0) setFullStep(fullStep - 1);
              else if (fullSection > 0) {
                setFullSection(fullSection - 1);
                setFullStep(WCWI_QUESTIONS[sectionKeys[fullSection - 1]].questions.length - 1);
              } else transition("landing");
            }}
            style={{ border: "none", background: "none", fontSize: "clamp(13px, 1.75vw, 14px)", color: COLORS.warmGray, cursor: "pointer" }}
          >
            ← 뒤로
          </button>
          <span style={{ fontSize: "clamp(12px, 1.625vw, 13px)", color: COLORS.warmGray }}>{currentQuestionNumber} / {totalQuestions}</span>
        </div>
        <div style={{ height: 4, background: "#E8E5DE", borderRadius: 2, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${(currentQuestionNumber / totalQuestions) * 100}%`,
            background: `linear-gradient(90deg, ${currentSection.color}88, ${currentSection.color})`,
            borderRadius: 2, transition: "width 0.5s ease",
          }} />
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(16px, 4vw, 24px)", width: "100%" }}>
        <div key={`${fullSection}-${fullStep}`} style={{ width: "100%", maxWidth: "min(100%, 700px)", animation: "fadeUp 0.4s ease-out" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: "clamp(18px, 2.5vw, 20px)" }}>{currentSection.icon}</span>
            <span style={{
              padding: "4px clamp(10px, 1.5vw, 12px)", borderRadius: 12, fontSize: "clamp(11px, 1.5vw, 12px)", fontWeight: 600,
              background: `${currentSection.color}15`, color: currentSection.color,
            }}>{currentSection.title}</span>
          </div>

          <h2 style={{ fontSize: "clamp(18px, 2.5vw, 20px)", fontWeight: 700, color: COLORS.charcoal, lineHeight: 1.5, marginBottom: 28 }}>
            {currentQ.text}
          </h2>

          {currentQ.type === "body" ? (
            <div>
              <p style={{ fontSize: "clamp(12px, 1.625vw, 13px)", color: COLORS.warmGray, marginBottom: 16 }}>통증이 있는 부위를 모두 선택하세요:</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                {BODY_PARTS.map((part) => (
                  <button
                    key={part}
                    onClick={() => {
                      setBodyParts(bodyParts.includes(part) ? bodyParts.filter((p) => p !== part) : [...bodyParts, part]);
                    }}
                    style={{
                      padding: "10px 16px", borderRadius: 12,
                      border: `2px solid ${bodyParts.includes(part) ? currentSection.color : "#E8E5DE"}`,
                      background: bodyParts.includes(part) ? `${currentSection.color}10` : COLORS.white,
                      color: bodyParts.includes(part) ? currentSection.color : COLORS.charcoal,
                      fontSize: "clamp(12px, 1.625vw, 13px)", fontWeight: bodyParts.includes(part) ? 600 : 400,
                      cursor: "pointer", transition: "all 0.2s",
                    }}
                  >
                    {part}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handleFullAnswer(bodyParts.length > 0 ? "yes" : "no")}
                style={{
                  width: "100%", padding: "clamp(14px, 2vw, 16px)", borderRadius: 14,
                  border: "none", background: currentSection.color,
                  color: "#fff", fontSize: "clamp(14px, 1.875vw, 15px)", fontWeight: 600, cursor: "pointer",
                }}
              >
                다음 →
              </button>
            </div>
          ) : currentQ.type === "yesno" ? (
            <div style={{ display: "flex", gap: 12 }}>
              {[{ val: "yes", label: "예" }, { val: "no", label: "아니오" }].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => handleFullAnswer(opt.val)}
                  style={{
                    flex: 1, padding: "clamp(16px, 2.5vw, 20px)", borderRadius: 16,
                    border: `2px solid ${fullAnswers[currentQ.id] === opt.val ? currentSection.color : "#E8E5DE"}`,
                    background: fullAnswers[currentQ.id] === opt.val ? `${currentSection.color}10` : COLORS.white,
                    fontSize: "clamp(14px, 2vw, 16px)", fontWeight: 600, cursor: "pointer",
                    color: fullAnswers[currentQ.id] === opt.val ? currentSection.color : COLORS.charcoal,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {Array.from({ length: currentQ.scale }, (_, i) => i + 1).map((val) => {
                const label = currentQ.scale === 5 ? LABELS_5[val - 1] : LABELS_7[val - 1];
                const isSelected = fullAnswers[currentQ.id] === val;
                return (
                  <button
                    key={val}
                    onClick={() => handleFullAnswer(val)}
                    style={{
                      padding: "clamp(12px, 1.75vw, 14px) clamp(16px, 2.25vw, 18px)", borderRadius: 14,
                      border: `2px solid ${isSelected ? currentSection.color : "#E8E5DE"}`,
                      background: isSelected ? `${currentSection.color}10` : COLORS.white,
                      textAlign: "left", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "clamp(10px, 1.5vw, 12px)",
                      transition: "all 0.2s", width: "100%",
                    }}
                  >
                    <div style={{
                      width: 26, height: 26, borderRadius: "50%",
                      border: `2px solid ${isSelected ? currentSection.color : "#D0CDC5"}`,
                      background: isSelected ? currentSection.color : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontSize: "clamp(10px, 1.375vw, 11px)", fontWeight: 700, flexShrink: 0,
                    }}>
                      {isSelected && "✓"}
                    </div>
                    <span style={{ fontSize: "clamp(13px, 1.75vw, 14px)", color: isSelected ? currentSection.color : COLORS.charcoal, fontWeight: isSelected ? 600 : 400 }}>
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
