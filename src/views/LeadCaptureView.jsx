import { COLORS } from "../constants/theme";
import { saveToAirtable } from "../api/airtable";

const LEAD_STYLES = `@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;900&display=swap');
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
`;

export default function LeadCaptureView({ email, setEmail, company, setCompany, role, setRole, transition }) {
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const fields = {
      이메일: email || "",
      회사명: company || "",
      직책역할: role || "",
      응답일시: new Date().toISOString(),
      진단유형: "기업감사신청",
    };
    const payload = { table: "mini", fields };
    console.log("SUBMIT", payload);
    try {
      await saveToAirtable("mini", fields);
      alert("감사합니다! 입력하신 정보로 곧 연락드리겠습니다. 🌿");
      transition("landing");
    } catch (err) {
      alert(err.message || "제출에 실패했습니다.");
    }
  };

  return (
    <div style={{
      fontFamily: "'Noto Sans KR', sans-serif", minHeight: "100vh",
      background: `linear-gradient(135deg, ${COLORS.bg}, ${COLORS.sagePale})`,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(16px, 4vw, 24px)", width: "100%", maxWidth: "100%",
    }}>
      <style>{LEAD_STYLES}</style>
      <div style={{
        background: COLORS.white, borderRadius: 28, padding: "clamp(32px, 6vw, 48px) clamp(24px, 4vw, 36px)",
        width: "100%", maxWidth: "min(100%, 600px)",
        boxShadow: "0 24px 80px rgba(0,0,0,0.08)",
        animation: "fadeUp 0.5s ease-out",
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: "clamp(28px, 4.5vw, 36px)", marginBottom: 12 }}>🏢</div>
          <h2 style={{ fontSize: "clamp(20px, 3vw, 24px)", fontWeight: 800, color: COLORS.charcoal, marginBottom: 8 }}>
            기업용 무료 웰니스 감사
          </h2>
          <p style={{ fontSize: "clamp(13px, 1.75vw, 14px)", color: COLORS.warmGray, lineHeight: 1.6 }}>
            귀사 직원 대상 WCWI 진단과 분석 리포트를
            <br />무료로 제공합니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: "clamp(12px, 1.625vw, 13px)", fontWeight: 600, color: COLORS.charcoal, marginBottom: 6, display: "block" }}>이메일 *</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="work@company.com"
              style={{
                width: "100%", padding: "14px 16px", borderRadius: 12,
                border: "2px solid #E8E5DE", fontSize: "clamp(13px, 1.75vw, 14px)", outline: "none",
                transition: "border 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = COLORS.sage)}
              onBlur={(e) => (e.target.style.borderColor = "#E8E5DE")}
            />
          </div>
          <div>
            <label style={{ fontSize: "clamp(12px, 1.625vw, 13px)", fontWeight: 600, color: COLORS.charcoal, marginBottom: 6, display: "block" }}>회사명</label>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="회사명을 입력하세요"
              style={{
                width: "100%", padding: "14px 16px", borderRadius: 12,
                border: "2px solid #E8E5DE", fontSize: "clamp(13px, 1.75vw, 14px)", outline: "none",
                transition: "border 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = COLORS.sage)}
              onBlur={(e) => (e.target.style.borderColor = "#E8E5DE")}
            />
          </div>
          <div>
            <label style={{ fontSize: "clamp(12px, 1.625vw, 13px)", fontWeight: 600, color: COLORS.charcoal, marginBottom: 6, display: "block" }}>직책/역할</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: "100%", padding: "14px 16px", borderRadius: 12,
                border: "2px solid #E8E5DE", fontSize: "clamp(13px, 1.75vw, 14px)", outline: "none",
                background: COLORS.white, color: role ? COLORS.charcoal : COLORS.warmGray,
              }}
            >
              <option value="">선택하세요</option>
              <option value="hr">HR 담당자</option>
              <option value="ceo">경영진/CEO</option>
              <option value="welfare">복지 담당자</option>
              <option value="employee">일반 직원</option>
              <option value="other">기타</option>
            </select>
          </div>

          <button
            type="submit"
            style={{
              padding: "16px", borderRadius: 16, border: "none",
              background: `linear-gradient(135deg, ${COLORS.sage}, ${COLORS.sageDark})`,
              color: "#fff", fontSize: "clamp(14px, 1.875vw, 15px)", fontWeight: 700, cursor: "pointer",
              marginTop: 8, boxShadow: `0 8px 24px ${COLORS.sage}30`,
            }}
          >
            무료 감사 신청하기
          </button>

          <div style={{ textAlign: "center" }}>
            <button
              type="button"
              onClick={() => transition("landing")}
              style={{
                padding: "12px", border: "none", background: "transparent",
                color: COLORS.warmGray, fontSize: "clamp(12px, 1.625vw, 13px)", cursor: "pointer",
              }}
            >
              ← 메인으로 돌아가기
            </button>
          </div>
        </form>

        <div style={{
          marginTop: 24, padding: "16px", borderRadius: 12,
          background: COLORS.sagePale, fontSize: "clamp(11px, 1.5vw, 12px)", color: COLORS.warmGray,
          lineHeight: 1.6, textAlign: "center",
        }}>
          🔒 입력하신 정보는 서비스 안내 목적으로만 사용되며,
          <br />제3자에게 제공되지 않습니다.
        </div>
      </div>
    </div>
  );
}
