import { WCWI_QUESTIONS, BODY_PARTS } from "../constants/questions";
import { COLORS } from "../constants/theme";
import { AnimatedNumber, RadarChart, GaugeBar } from "../components";

const FULL_STYLES = `@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;900&family=Playfair+Display:wght@400;700&display=swap');
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
`;

const LABELS_5 = ["전혀 아님", "드물게", "가끔", "자주", "항상"];
const LABELS_7 = ["매우 동의하지 않음", "동의하지 않음", "약간 동의하지 않음", "보통", "약간 동의", "동의", "매우 동의"];

/** 전체 WCWI 결과 화면 */
export function FullResult({ scores, transition, onGoHome }) {
  return (
    <div style={{
      fontFamily: "'Noto Sans KR', sans-serif", minHeight: "100vh",
      background: COLORS.bg, padding: "24px",
    }}>
      <style>{FULL_STYLES}</style>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32, animation: "fadeUp 0.5s ease-out" }}>
          <div style={{ fontSize: 13, color: COLORS.warmGray, marginBottom: 8 }}>WCWI 종합 점수</div>
          <div style={{
            fontSize: 80, fontWeight: 900, color: COLORS.sage,
            fontFamily: "'Playfair Display', serif", lineHeight: 1,
          }}>
            <AnimatedNumber value={scores.total} />
          </div>
          <div style={{ fontSize: 14, color: COLORS.warmGray, marginTop: 8 }}>/ 100점</div>
        </div>

        <div style={{
          background: COLORS.white, borderRadius: 24, padding: 32,
          marginBottom: 24, display: "flex", justifyContent: "center",
          boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
          animation: "fadeUp 0.5s ease-out 0.1s both",
        }}>
          <RadarChart scores={scores} />
        </div>

        <div style={{
          background: COLORS.white, borderRadius: 24, padding: 28,
          marginBottom: 24, boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
          animation: "fadeUp 0.5s ease-out 0.2s both",
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.charcoal, marginBottom: 20 }}>영역별 상세</h3>
          <GaugeBar value={scores.mental} color="#7B9E87" label="🧠 정신적 웰빙" delay={300} />
          <GaugeBar value={scores.psychological} color="#9B7EC8" label="💜 심리적 웰빙" delay={500} />
          <GaugeBar value={scores.burnout} color="#E8725C" label="🔥 번아웃" delay={700} />
          <GaugeBar value={scores.physical} color="#5BAEB7" label="🏃 신체 건강" delay={900} />
          <GaugeBar value={scores.satisfaction} color="#C4A265" label="⭐ 삶의 만족도" delay={1100} />
        </div>

        <div style={{
          background: COLORS.white, borderRadius: 24, padding: 28,
          marginBottom: 24, boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
          animation: "fadeUp 0.5s ease-out 0.3s both",
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.charcoal, marginBottom: 16 }}>💡 맞춤 추천</h3>
          {scores.burnout < 60 && (
            <div style={{ padding: 16, background: "#FFF5F3", borderRadius: 14, marginBottom: 10, borderLeft: `4px solid ${COLORS.coral}` }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.coral, marginBottom: 4 }}>번아웃 관리 필요</div>
              <div style={{ fontSize: 13, color: COLORS.warmGray }}>2분 호흡법과 마음챙김 명상으로 정서적 에너지를 회복하세요.</div>
            </div>
          )}
          {scores.physical < 60 && (
            <div style={{ padding: 16, background: "#F0F8FA", borderRadius: 14, marginBottom: 10, borderLeft: "4px solid #5BAEB7" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#5BAEB7", marginBottom: 4 }}>근골격계 관리 권장</div>
              <div style={{ fontSize: 13, color: COLORS.warmGray }}>사무실 필라테스 5분 루틴으로 통증을 예방하세요.</div>
            </div>
          )}
          {scores.mental < 60 && (
            <div style={{ padding: 16, background: COLORS.sagePale, borderRadius: 14, marginBottom: 10, borderLeft: `4px solid ${COLORS.sage}` }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.sage, marginBottom: 4 }}>정신 건강 챙기기</div>
              <div style={{ fontSize: 13, color: COLORS.warmGray }}>수면 위생 개선과 짧은 산책으로 활력을 되찾으세요.</div>
            </div>
          )}
          {scores.total >= 70 && (
            <div style={{ padding: 16, background: COLORS.sagePale, borderRadius: 14, borderLeft: `4px solid ${COLORS.sage}` }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.sage, marginBottom: 4 }}>전반적으로 양호합니다 ✅</div>
              <div style={{ fontSize: 13, color: COLORS.warmGray }}>현재 상태를 유지하면서 정기적인 체크인을 해보세요.</div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            onClick={() => transition("lead")}
            style={{
              padding: "16px", borderRadius: 16, border: "none",
              background: `linear-gradient(135deg, ${COLORS.sage}, ${COLORS.sageDark})`,
              color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
            }}
          >
            이 결과를 HR팀에 공유하기 →
          </button>
          <button
            onClick={onGoHome}
            style={{
              padding: "12px", border: "none", background: "transparent",
              color: COLORS.warmGray, fontSize: 13, cursor: "pointer",
            }}
          >
            ← 메인으로 돌아가기
          </button>
        </div>
      </div>
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
  answeredCount,
  currentSection,
  currentQ,
  setFullAnswers,
  setFullStep,
  setFullSection,
  setBodyParts,
  setShowResults,
  transition,
}) {
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
      display: "flex", flexDirection: "column",
    }}>
      <style>{FULL_STYLES}</style>

      <div style={{ padding: "20px 24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <button
            onClick={() => {
              if (fullStep > 0) setFullStep(fullStep - 1);
              else if (fullSection > 0) {
                setFullSection(fullSection - 1);
                setFullStep(WCWI_QUESTIONS[sectionKeys[fullSection - 1]].questions.length - 1);
              } else transition("landing");
            }}
            style={{ border: "none", background: "none", fontSize: 14, color: COLORS.warmGray, cursor: "pointer" }}
          >
            ← 뒤로
          </button>
          <span style={{ fontSize: 13, color: COLORS.warmGray }}>{answeredCount} / {totalQuestions}</span>
        </div>
        <div style={{ height: 4, background: "#E8E5DE", borderRadius: 2, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${(answeredCount / totalQuestions) * 100}%`,
            background: `linear-gradient(90deg, ${currentSection.color}88, ${currentSection.color})`,
            borderRadius: 2, transition: "width 0.5s ease",
          }} />
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div key={`${fullSection}-${fullStep}`} style={{ maxWidth: 500, width: "100%", animation: "fadeUp 0.4s ease-out" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 20 }}>{currentSection.icon}</span>
            <span style={{
              padding: "4px 12px", borderRadius: 12, fontSize: 12, fontWeight: 600,
              background: `${currentSection.color}15`, color: currentSection.color,
            }}>{currentSection.title}</span>
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: COLORS.charcoal, lineHeight: 1.5, marginBottom: 28 }}>
            {currentQ.text}
          </h2>

          {currentQ.type === "body" ? (
            <div>
              <p style={{ fontSize: 13, color: COLORS.warmGray, marginBottom: 16 }}>통증이 있는 부위를 모두 선택하세요:</p>
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
                      fontSize: 13, fontWeight: bodyParts.includes(part) ? 600 : 400,
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
                  width: "100%", padding: "16px", borderRadius: 14,
                  border: "none", background: currentSection.color,
                  color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer",
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
                    flex: 1, padding: "20px", borderRadius: 16,
                    border: `2px solid ${fullAnswers[currentQ.id] === opt.val ? currentSection.color : "#E8E5DE"}`,
                    background: fullAnswers[currentQ.id] === opt.val ? `${currentSection.color}10` : COLORS.white,
                    fontSize: 16, fontWeight: 600, cursor: "pointer",
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
                      padding: "14px 18px", borderRadius: 14,
                      border: `2px solid ${isSelected ? currentSection.color : "#E8E5DE"}`,
                      background: isSelected ? `${currentSection.color}10` : COLORS.white,
                      textAlign: "left", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 12,
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{
                      width: 26, height: 26, borderRadius: "50%",
                      border: `2px solid ${isSelected ? currentSection.color : "#D0CDC5"}`,
                      background: isSelected ? currentSection.color : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0,
                    }}>
                      {isSelected && "✓"}
                    </div>
                    <span style={{ fontSize: 14, color: isSelected ? currentSection.color : COLORS.charcoal, fontWeight: isSelected ? 600 : 400 }}>
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
