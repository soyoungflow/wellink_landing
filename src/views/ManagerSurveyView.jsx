import { COLORS } from "../constants/theme";
import { MGR_PAGES } from "../constants/surveys";
import { SurveyField } from "../components/SurveyField.jsx";

const SURVEY_STYLES = `@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity:0;transform:translateY(20px);} to {opacity:1;transform:translateY(0);} }
`;

export default function ManagerSurveyView({
  mgrPage,
  setMgrPage,
  mgrAnswers,
  setMgrAnswers,
  mgrEmail,
  setMgrEmail,
  mgrConsent,
  setMgrConsent,
  fadeIn,
  toast,
  loading,
  transition,
  onSubmit,
}) {
  const page = MGR_PAGES[mgrPage];
  const isLastPage = mgrPage === MGR_PAGES.length;
  const totalPages = MGR_PAGES.length + 1;
  const progress = (mgrPage / totalPages) * 100;

  const canNext = () => {
    if (isLastPage) return mgrEmail && mgrConsent;
    return page.fields.every((f) => {
      if (f.type === "textarea" || f.type === "multi") return true;
      return mgrAnswers[f.key] !== undefined && mgrAnswers[f.key] !== "";
    });
  };

  const handleFieldChange = (key, value) => {
    setMgrAnswers((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div style={{
      fontFamily: "'Noto Sans KR', sans-serif",
      minHeight: "100vh",
      background: `linear-gradient(135deg, ${COLORS.bg}, ${COLORS.sagePale})`,
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      padding: "40px 16px",
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
          fontSize: 14,
          fontWeight: 600,
          zIndex: 9999,
          boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
        }}>
          {toast.message}
        </div>
      )}

      <div style={{ maxWidth: 560, width: "100%", animation: "fadeUp .5s ease-out" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ height: 6, borderRadius: 3, background: "#e0e0e0", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: COLORS.sage, borderRadius: 3, transition: "width .4s" }} />
          </div>
          <div style={{ fontSize: 12, color: COLORS.warmGray, marginTop: 8, textAlign: "center" }}>
            🏢 기업 웰니스 인식 및 수요 조사 — {mgrPage + 1}/{totalPages}
          </div>
        </div>

        {isLastPage ? (
          <div style={{ background: COLORS.white, borderRadius: 20, padding: "32px 24px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.charcoal, marginBottom: 20 }}>설문 완료</div>
            <div style={{
              padding: 16,
              borderRadius: 12,
              background: COLORS.sagePale,
              fontSize: 13,
              color: COLORS.charcoal,
              lineHeight: 1.7,
              marginBottom: 20,
            }}>
              <strong>개인정보 수집 안내</strong><br />
              수집 목적: 설문 보상 / 서비스 안내 | 항목: 이메일 | 보유: 6개월 | 수집자: WELLINK
            </div>
            <label style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14, marginBottom: 20, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={mgrConsent}
                onChange={(e) => setMgrConsent(e.target.checked)}
                style={{ width: 20, height: 20, accentColor: COLORS.sage }}
              />
              개인정보 수집·이용에 동의합니다.
            </label>
            <input
              type="email"
              value={mgrEmail}
              onChange={(e) => setMgrEmail(e.target.value)}
              placeholder="example@company.com"
              style={{
                width: "100%",
                padding: 14,
                borderRadius: 12,
                border: "2px solid #eee",
                fontSize: 15,
                outline: "none",
              }}
              onFocus={(e) => { e.target.style.borderColor = COLORS.sage; }}
              onBlur={(e) => { e.target.style.borderColor = "#eee"; }}
            />
          </div>
        ) : (
          <div style={{ background: COLORS.white, borderRadius: 20, padding: "32px 24px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.sage, marginBottom: 4 }}>{page.icon} {page.title}</div>
            {page.fields.map((f, i) => (
              <div key={f.key} style={{ marginTop: i > 0 ? 28 : 16 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.charcoal, marginBottom: 4 }}>{f.q}</div>
                <SurveyField field={f} value={mgrAnswers[f.key]} onChange={handleFieldChange} />
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
          <button
            onClick={() => (mgrPage > 0 ? setMgrPage(mgrPage - 1) : transition("landing"))}
            style={{
              padding: "12px 24px",
              borderRadius: 12,
              border: "none",
              background: "transparent",
              color: COLORS.warmGray,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ← {mgrPage > 0 ? "이전" : "나가기"}
          </button>
          <button
            onClick={() => (isLastPage ? onSubmit() : setMgrPage(mgrPage + 1))}
            disabled={!canNext() || loading}
            style={{
              padding: "12px 32px",
              borderRadius: 12,
              border: "none",
              background: canNext() && !loading ? COLORS.sage : "#ccc",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              cursor: canNext() && !loading ? "pointer" : "default",
              transition: "all .2s",
            }}
          >
            {loading ? "저장 중..." : isLastPage ? "제출하기 ✓" : "다음 →"}
          </button>
        </div>
      </div>
    </div>
  );
}
