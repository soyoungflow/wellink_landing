import { COLORS } from "../constants/theme";
import { EMP_PAGES } from "../constants/surveys";
import { SurveyField } from "../components/SurveyField.jsx";

const SURVEY_STYLES = `@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity:0;transform:translateY(20px);} to {opacity:1;transform:translateY(0);} }
`;

export default function EmployeeSurveyView({
  empPage,
  setEmpPage,
  empAnswers,
  setEmpAnswers,
  empEmail,
  setEmpEmail,
  empConsent,
  setEmpConsent,
  fadeIn,
  toast,
  loading,
  transition,
  onSubmit,
  onGoLeadCapture,
}) {
  const page = EMP_PAGES[empPage];
  const isLastPage = empPage === EMP_PAGES.length;
  const totalPages = EMP_PAGES.length + 1;
  const progress = (empPage / totalPages) * 100;

  const canNext = () => {
    if (isLastPage) return empEmail && empConsent;
    return page.fields.every((f) => {
      if (f.type === "textarea") return true;
      if (f.type === "multi") return true;
      return empAnswers[f.key] !== undefined && empAnswers[f.key] !== "";
    });
  };

  const handleFieldChange = (key, value) => {
    setEmpAnswers((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div style={{
      fontFamily: "'Noto Sans KR', sans-serif",
      minHeight: "100vh",
      background: `linear-gradient(135deg, ${COLORS.bg}, ${COLORS.sagePale})`,
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      padding: "clamp(24px, 5vw, 40px) clamp(12px, 2vw, 16px)", width: "100%", maxWidth: "100%",
      opacity: fadeIn ? 1 : 0,
      transition: "opacity 0.3s",
    }}>
      <style>{SURVEY_STYLES}</style>

      {toast.visible && (
        <div style={{
          position: "fixed",
          bottom: 30,
          left: "50%",
          transform: "translateX(-50%)",
          background: toast.type === "error" ? COLORS.coral : COLORS.sage,
          color: "#fff",
          padding: "14px 28px",
          borderRadius: 12,
          fontSize: "clamp(13px, 1.75vw, 14px)",
          fontWeight: 600,
          zIndex: 9999,
          boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
        }}>
          {toast.message}
        </div>
      )}

      <div style={{ width: "100%", maxWidth: "min(100%, 800px)", animation: "fadeUp .5s ease-out", padding: "0 clamp(16px, 4vw, 24px)" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ height: 6, borderRadius: 3, background: "#e0e0e0", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: COLORS.sage, borderRadius: 3, transition: "width .4s" }} />
          </div>
          <div style={{ fontSize: "clamp(11px, 1.5vw, 12px)", color: COLORS.warmGray, marginTop: 8, textAlign: "center" }}>
            👤 재직자 웰니스 수요조사 — {empPage + 1}/{totalPages}
          </div>
        </div>

        {isLastPage ? (
          <div style={{ background: COLORS.white, borderRadius: 20, padding: "clamp(24px, 4vw, 32px) clamp(16px, 3vw, 24px)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", width: "100%" }}>
            <div style={{ fontSize: "clamp(16px, 2.25vw, 18px)", fontWeight: 700, color: COLORS.charcoal, marginBottom: 20 }}>설문 완료</div>
            <div style={{
              padding: "clamp(12px, 2vw, 16px)",
              borderRadius: 12,
              background: COLORS.sagePale,
              fontSize: "clamp(12px, 1.625vw, 13px)",
              color: COLORS.charcoal,
              lineHeight: 1.7,
              marginBottom: 20,
            }}>
              <strong>개인정보 수집 안내</strong><br />
              수집 목적: 설문 보상 / 서비스 안내 | 항목: 이메일 | 보유: 6개월 | 수집자: WELLINK
            </div>
            <label style={{ display: "flex", gap: 10, alignItems: "center", fontSize: "clamp(13px, 1.75vw, 14px)", marginBottom: 20, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={empConsent}
                onChange={(e) => setEmpConsent(e.target.checked)}
                style={{ width: 20, height: 20, accentColor: COLORS.sage }}
              />
              개인정보 수집·이용에 동의합니다.
            </label>
            <input
              type="email"
              value={empEmail}
              onChange={(e) => setEmpEmail(e.target.value)}
              placeholder="example@company.com"
              style={{
                width: "100%",
                padding: 14,
                borderRadius: 12,
                border: "2px solid #eee",
                fontSize: "clamp(14px, 1.875vw, 15px)",
                outline: "none",
              }}
              onFocus={(e) => { e.target.style.borderColor = COLORS.sage; }}
              onBlur={(e) => { e.target.style.borderColor = "#eee"; }}
            />
          </div>
        ) : (
          <div style={{ background: COLORS.white, borderRadius: 20, padding: "clamp(24px, 4vw, 32px) clamp(16px, 3vw, 24px)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", width: "100%" }}>
            <div style={{ fontSize: "clamp(12px, 1.625vw, 13px)", fontWeight: 600, color: COLORS.sage, marginBottom: 4 }}>{page.icon} {page.title}</div>
            {page.fields.map((f, i) => (
              <div key={f.key} style={{ marginTop: i > 0 ? 28 : 16 }}>
                <div style={{ fontSize: "clamp(14px, 1.875vw, 15px)", fontWeight: 600, color: COLORS.charcoal, marginBottom: 4 }}>{f.q}</div>
                <SurveyField field={f} value={empAnswers[f.key]} onChange={handleFieldChange} />
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
          <button
            onClick={() => (empPage > 0 ? setEmpPage(empPage - 1) : transition("landing"))}
            style={{
              padding: "12px 24px",
              borderRadius: 12,
              border: "none",
              background: "transparent",
              color: COLORS.warmGray,
              fontSize: "clamp(13px, 1.75vw, 14px)",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ← {empPage > 0 ? "이전" : "나가기"}
          </button>
          <button
            onClick={() => (isLastPage ? onSubmit() : setEmpPage(empPage + 1))}
            disabled={!canNext() || loading}
            style={{
              padding: "clamp(10px, 1.5vw, 12px) clamp(24px, 4vw, 32px)",
              borderRadius: 12,
              border: "none",
              background: canNext() && !loading ? COLORS.sage : "#ccc",
              color: "#fff",
              fontSize: "clamp(13px, 1.75vw, 14px)",
              fontWeight: 700,
              cursor: canNext() && !loading ? "pointer" : "default",
              transition: "all .2s",
            }}
          >
            {loading ? "저장 중..." : isLastPage ? "제출하기 ✓" : "다음 →"}
          </button>
        </div>
        {onGoLeadCapture && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button
              type="button"
              onClick={onGoLeadCapture}
              style={{
                padding: 8,
                border: "none",
                background: "transparent",
                color: COLORS.sage,
                fontSize: "clamp(12px, 1.625vw, 13px)",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              무료 감사 신청하기 →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
